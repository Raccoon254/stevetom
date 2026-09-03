/**
 * Paystack webhook.
 *
 * This, not the browser redirect, is the source of truth that a payment
 * happened. A donor who pays and then closes the tab never comes back through
 * the callback URL, so a flow that only verifies on return loses real money and
 * leaves the donation stuck at PENDING forever.
 *
 * Register this URL in the Paystack dashboard under Settings -> API Keys &
 * Webhooks, as the live webhook URL:
 *
 *   https://kentom.co.ke/api/paystack/webhook
 *
 * Paystack signs every delivery with HMAC SHA512 over the RAW request body,
 * keyed by your secret key, in the x-paystack-signature header. The raw body is
 * what must be hashed: re-serialising the parsed JSON changes the bytes and the
 * signature will never match.
 */
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import { prisma } from '$lib/db.js';
import { CONVERSIONS, recordEvent } from '$lib/server/analytics';
import {
	upsertSponsorFromPayment,
	endRecurringSponsorship,
	tierIsListed
} from '$lib/server/sponsors';
import { sendSponsorThankYou, sendSponsorNotification } from '$lib/server/emails/sponsor';
import { logActivity } from '$lib/server/log';

/** Paystack retries non-2xx, so we answer 200 for anything we have handled. */
const ok = () => new Response(null, { status: 200 });

function signatureIsValid(rawBody: string, signature: string | null): boolean {
	if (!signature) return false;
	const expected = crypto
		.createHmac('sha512', PAYSTACK_SECRET_KEY)
		.update(rawBody)
		.digest('hex');
	const a = Buffer.from(expected, 'utf8');
	const b = Buffer.from(signature, 'utf8');
	// timingSafeEqual throws on a length mismatch, so guard it first
	if (a.length !== b.length) return false;
	return crypto.timingSafeEqual(a, b);
}

/** Paystack sends minor units (kobo for KES). */
const fromMinor = (v: unknown): number =>
	typeof v === 'number' && Number.isFinite(v) ? v / 100 : 0;

function str(v: unknown): string | null {
	return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export const POST: RequestHandler = async ({ request }) => {
	// Raw text first. Do not call request.json() before this.
	const raw = await request.text();

	if (!signatureIsValid(raw, request.headers.get('x-paystack-signature'))) {
		// Unsigned or wrongly signed: never trust it, never record it.
		return new Response('Invalid signature', { status: 401 });
	}

	let payload: { event?: string; data?: Record<string, unknown> };
	try {
		payload = JSON.parse(raw);
	} catch {
		return ok(); // malformed but signed: nothing to do, do not make it retry
	}

	const event = payload.event ?? '';
	const data = payload.data ?? {};

	try {
		switch (event) {
			case 'charge.success':
				await handleChargeSuccess(data);
				break;

			// A subscription that will not renew, or has been disabled outright.
			// Both mean the sponsorship ends when the paid period does.
			case 'subscription.disable':
			case 'subscription.not_renew': {
				const code = str(data.subscription_code);
				if (code) {
					const sponsor = await endRecurringSponsorship(code);
					if (sponsor) {
						await logActivity({
							action: 'sponsor.ended',
							entity: 'donation',
							entityId: sponsor.id,
							summary: `Sponsorship ended for ${sponsor.displayName}, listing runs to ${
								sponsor.expiresAt?.toISOString().slice(0, 10) ?? 'now'
							}`,
							actor: 'system'
						});
					}
				}
				break;
			}

			case 'subscription.create':
				await handleSubscriptionCreate(data);
				break;

			case 'invoice.payment_failed': {
				const code = str((data.subscription as Record<string, unknown>)?.subscription_code);
				if (code) {
					await prisma.subscription
						.updateMany({ where: { subscriptionCode: code }, data: { status: 'PAST_DUE' } })
						.catch(() => {});
				}
				break;
			}

			default:
				// Unhandled event types are still a success: acknowledging stops
				// Paystack retrying something we will never act on.
				break;
		}
	} catch (error) {
		console.error(`paystack webhook failed for ${event}:`, error);
		// Deliberately 200. A retry would replay the same failing branch, and
		// the donation row is already safe. The error is in the logs to fix.
	}

	return ok();
};

async function handleChargeSuccess(data: Record<string, unknown>) {
	const reference = str(data.reference);
	if (!reference) return;

	const existing = await prisma.donation.findUnique({ where: { paystackReference: reference } });

	// Idempotency: Paystack can and does deliver the same event twice. Once a
	// donation is SUCCESS there is nothing further to do.
	if (existing?.status === 'SUCCESS') return;

	const amount = fromMinor(data.amount);
	const customer = (data.customer ?? {}) as Record<string, unknown>;
	const email = str(customer.email) ?? existing?.email;
	if (!email) return;

	// Sponsor details ride along in Paystack metadata, set when the transaction
	// was initialised. Absent metadata is normal for a plain donation.
	const meta = (data.metadata ?? {}) as Record<string, unknown>;
	const sponsorMeta = (meta.sponsor ?? {}) as Record<string, unknown>;

	const donation = existing
		? await prisma.donation.update({
				where: { id: existing.id },
				data: {
					status: 'SUCCESS',
					// Merge, never overwrite: the row already holds the access code
					// and authorization URL from when the charge was created.
					metadata: JSON.stringify({
						...safeParse(existing.metadata),
						verifiedAt: new Date().toISOString(),
						channel: data.channel ?? null,
						paidAt: data.paid_at ?? null
					})
				}
			})
		: // A charge we never saw initialised, for example one started elsewhere.
			await prisma.donation.create({
				data: {
					email,
					amount,
					currency: str(data.currency) ?? 'KES',
					paystackReference: reference,
					status: 'SUCCESS',
					provider: 'PAYSTACK',
					cadence: 'ONE_TIME',
					metadata: JSON.stringify({ createdFrom: 'webhook', paidAt: data.paid_at ?? null })
				}
			});

	const isRecurring = Boolean(data.plan && Object.keys(data.plan as object).length);

	const sponsor = await upsertSponsorFromPayment({
		email,
		displayName: str(sponsorMeta.displayName),
		orgName: str(sponsorMeta.orgName),
		websiteUrl: str(sponsorMeta.websiteUrl),
		logoUrl: str(sponsorMeta.logoUrl),
		blurb: str(sponsorMeta.blurb),
		visibility:
			sponsorMeta.visibility === 'PUBLIC' || sponsorMeta.visibility === 'ANONYMOUS'
				? sponsorMeta.visibility
				: null,
		cadence: isRecurring ? 'RECURRING' : 'ONE_TIME',
		usdAmount: donation.usdAmount
	});

	if (sponsor) {
		await prisma.donation
			.update({ where: { id: donation.id }, data: { sponsorId: sponsor.id } })
			.catch(() => {});

		// Both of these swallow their own errors. A mail outage must never turn a
		// payment that succeeded into a webhook we report as failed, because
		// Paystack would then retry it and the sponsor would be processed twice.
		const emailInput = {
			to: { email: sponsor.email, name: sponsor.displayName },
			displayName: sponsor.displayName,
			tier: sponsor.tier,
			cadence: sponsor.cadence,
			amount: donation.amount,
			currency: donation.currency,
			usdAmount: donation.usdAmount,
			sponsorSlug: sponsor.slug,
			isListed:
				sponsor.visibility === 'PUBLIC' &&
				sponsor.moderation === 'APPROVED' &&
				tierIsListed(sponsor.tier),
			reference
		};
		await sendSponsorThankYou(emailInput);
		await sendSponsorNotification(emailInput);
	}

	await recordEvent({
		name: CONVERSIONS.DONATION_COMPLETED,
		path: '/donate',
		value: donation.usdAmount,
		currency: 'USD',
		sessionId: donation.sessionId,
		entityId: donation.id
	});

	await logActivity({
		action: 'donation.success',
		entity: 'donation',
		entityId: donation.id,
		summary: `Donation of ${donation.currency} ${donation.amount} confirmed from ${email}`,
		actor: 'system'
	});
}

async function handleSubscriptionCreate(data: Record<string, unknown>) {
	const code = str(data.subscription_code);
	if (!code) return;

	const customer = (data.customer ?? {}) as Record<string, unknown>;
	const email = str(customer.email);
	if (!email) return;

	const sponsor = await prisma.sponsor.findUnique({ where: { email: email.toLowerCase() } });
	if (!sponsor) return;

	const plan = (data.plan ?? {}) as Record<string, unknown>;
	const nextPayment = str(data.next_payment_date);

	await prisma.subscription.upsert({
		where: { subscriptionCode: code },
		create: {
			sponsorId: sponsor.id,
			provider: 'PAYSTACK',
			subscriptionCode: code,
			planCode: str(plan.plan_code),
			emailToken: str(data.email_token),
			customerCode: str(customer.customer_code),
			amountUsd: sponsor.monthlyUsd,
			status: 'ACTIVE',
			currentPeriodEnd: nextPayment ? new Date(nextPayment) : null
		},
		update: {
			status: 'ACTIVE',
			cancelledAt: null,
			emailToken: str(data.email_token),
			currentPeriodEnd: nextPayment ? new Date(nextPayment) : null
		}
	});

	// An active subscription has no expiry: the listing stands until it ends.
	await prisma.sponsor.update({
		where: { id: sponsor.id },
		data: { cadence: 'RECURRING', expiresAt: null, cancelledAt: null }
	});
}

function safeParse(json: string | null): Record<string, unknown> {
	if (!json) return {};
	try {
		const v = JSON.parse(json);
		return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
	} catch {
		return {};
	}
}
