/**
 * Campaign sending.
 *
 * The shape of a send here is: materialise the list, test it, confirm it, then
 * grind through it in small batches.
 *
 * Why not a loop over every recipient in the request that pressed Send? Because
 * this runs on Vercel. A function that walks 2,000 addresses is killed partway
 * through with no record of where it got to, and the only way to find out who
 * received the mail is to ask them. So:
 *
 *   1. Creating the draft writes one CampaignDelivery row per recipient, QUEUED.
 *      That list is a snapshot: it cannot drift while the send is in progress.
 *   2. Starting the send is one conditional UPDATE from DRAFT to SENDING. A
 *      second click updates zero rows and is told the send already started, so a
 *      double submit cannot send anything twice.
 *   3. Each batch claims rows with a conditional UPDATE from QUEUED to SENDING
 *      before it touches the mail API. Only the invocation whose update matched
 *      owns that address, so two concurrent batches cannot both mail the same
 *      person.
 *   4. A batch stops at BATCH_SIZE or TIME_BUDGET_MS, whichever comes first, and
 *      returns what is left. The page asks for the next batch until nothing is
 *      left, and a batch that dies mid-flight leaves the rest QUEUED for the
 *      next one. The send is resumable from any point, including days later.
 *
 * A row that was claimed but never confirmed (the function died between the
 * claim and the response) stays SENDING and is surfaced as unconfirmed. It is
 * never retried automatically: we cannot know whether that person got the mail,
 * and guessing wrong means mailing them twice.
 */
import { prisma } from '$lib/db.js';
import {
	sendEmail,
	renderEmail,
	esc,
	SENDERS,
	NOTIFY_TO,
	CONTACT,
	type Addr
} from '$lib/server/mailer';
import { unsubscribeUrl } from '$lib/server/newsletter';
import { logActivity } from '$lib/server/log';
import { renderBodyHtml, renderBodyText } from '$lib/emailMarkdown';
import { EMAIL_TAGS } from '$lib/emailTags';
import {
	SEGMENTS,
	contactSources,
	countSegmentRecipients,
	getContact,
	normaliseEmail,
	resolveSegmentRecipients,
	segmentAvailable,
	segmentByKey,
	type Recipient,
	type SegmentKey
} from '$lib/server/contacts';

/** Recipients per batch invocation. Small on purpose: see the note above. */
export const BATCH_SIZE = 20;

/** How long one batch may spend before it hands back and asks to be resumed. */
export const TIME_BUDGET_MS = 8000;

/** Addresses mailed in parallel inside a batch. */
const CONCURRENCY = 4;

/**
 * Hard cap on one campaign's recipient list. The send itself is resumable and
 * has no cap, so this only bounds the snapshot written when the draft is made,
 * and gives the owner a wall to hit rather than a surprise.
 */
export const MAX_RECIPIENTS = 5000;

/** A claimed row older than this is reported as unconfirmed, never re-sent. */
export const STALE_CLAIM_MS = 5 * 60 * 1000;

export type SenderKey = keyof typeof SENDERS;

export const SENDER_OPTIONS = (Object.keys(SENDERS) as SenderKey[]).map((key) => ({
	key,
	email: SENDERS[key].email,
	name: SENDERS[key].name ?? SENDERS[key].email
}));

export function senderFor(key: string | null | undefined): Addr {
	const k = (key ?? '') as SenderKey;
	return SENDERS[k] ?? SENDERS.hq;
}

export function defaultSenderKey(): SenderKey {
	return (SENDER_OPTIONS[0]?.key ?? 'hq') as SenderKey;
}

/* ─────────────────────────────── rendering ─────────────────────────────── */

export type RenderableCampaign = {
	subject: string;
	bodyMd: string;
	segment: string;
	segmentLabel: string;
	contactEmail: string | null;
	includeUnsubscribe: boolean;
};

function footerNoteFor(campaign: RenderableCampaign): string {
	if (campaign.contactEmail) {
		return 'You received this because you have been in touch with kenTom.';
	}
	const segment = SEGMENTS.find((s) => s.key === campaign.segment);
	if (campaign.segment === 'subscribers') {
		return "You're getting this because you subscribed at kentom.co.ke.";
	}
	return segment
		? `You received this as part of the "${segment.label}" list at kentom.co.ke.`
		: 'You received this because you are connected to kenTom.';
}

/**
 * The exact HTML one recipient receives. The unsubscribe link is per-address
 * because the token is an HMAC over that address, the same signed token the
 * public /unsubscribe route already verifies. No new token scheme.
 */
export function renderCampaignHtml(campaign: RenderableCampaign, recipientEmail: string): string {
	const body = renderBodyHtml(campaign.bodyMd);
	const text = renderBodyText(campaign.bodyMd);
	const unsub =
		campaign.includeUnsubscribe && recipientEmail
			? `<p style="margin:26px 0 0;font-family:'Google Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#999">` +
				`<a href="${unsubscribeUrl(recipientEmail)}" style="color:#999;text-decoration:underline">Unsubscribe in one click</a></p>`
			: '';

	return renderEmail({
		heading: esc(campaign.subject),
		preheader: text.slice(0, 140),
		footerNote: footerNoteFor(campaign),
		bodyHtml: body + unsub
	});
}

/**
 * The plain-text alternative. It carries the unsubscribe URL too: a reader who
 * only ever sees text/plain must still have a way out that does not depend on
 * their client honouring List-Unsubscribe.
 */
export function renderCampaignText(campaign: RenderableCampaign, recipientEmail: string): string {
	const body = renderBodyText(campaign.bodyMd);
	if (!campaign.includeUnsubscribe || !recipientEmail) return body;
	return `${body}\n\n---\nUnsubscribe: ${unsubscribeUrl(recipientEmail)}`;
}

/** RFC 8058 headers, so the mail client's own Unsubscribe button works. */
function unsubscribeHeaders(
	campaign: RenderableCampaign,
	recipientEmail: string
): Record<string, string> | undefined {
	if (!campaign.includeUnsubscribe || !recipientEmail) return undefined;
	return {
		'List-Unsubscribe': `<${unsubscribeUrl(recipientEmail)}>`,
		'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
	};
}

/** Tags every send carries, so delivery analytics can group by campaign. */
export function tagsFor(campaign: { id: string; segment: string }, extra: string[] = []): string[] {
	return ['admin-message', `segment:${campaign.segment}`, `campaign:${campaign.id}`, ...extra];
}

/* ─────────────────────────────── creation ─────────────────────────────── */

export type CreateInput = {
	subject: string;
	bodyMd: string;
	fromKey: string;
	/** Either a segment key, or 'contact' with contactEmail set. */
	target: string;
	contactEmail?: string | null;
	/** Required to mail one person who has unsubscribed from the newsletter. */
	acknowledgeOptOut?: boolean;
};

export type CreateResult =
	| { ok: true; id: string; recipients: number }
	| { ok: false; error: string };

export async function createCampaign(input: CreateInput): Promise<CreateResult> {
	const subject = input.subject.trim();
	const bodyMd = input.bodyMd.replace(/\r\n/g, '\n').trim();

	if (!subject) return { ok: false, error: 'A subject is required.' };
	if (!bodyMd) return { ok: false, error: 'The message body is empty.' };
	if (!renderBodyHtml(bodyMd).trim()) {
		return { ok: false, error: 'The message body renders to nothing.' };
	}

	const fromKey = (SENDER_OPTIONS.find((s) => s.key === input.fromKey)?.key ??
		defaultSenderKey()) as SenderKey;

	let recipients: Recipient[] = [];
	let segment = input.target;
	let segmentLabel = '';
	let contactEmail: string | null = null;
	let includeUnsubscribe = true;

	if (input.target === 'contact') {
		const addr = normaliseEmail(input.contactEmail);
		if (!addr) return { ok: false, error: 'No contact address was given.' };
		const contact = await getContact(addr);
		if (!contact) {
			return { ok: false, error: 'That address is not a known contact.' };
		}
		if (contact.opted_out && !input.acknowledgeOptOut) {
			return {
				ok: false,
				error:
					'This person has unsubscribed. Only a direct, one-to-one reply may go to them, and you have to confirm that.'
			};
		}
		recipients = [{ email: contact.email, name: contact.name }];
		contactEmail = contact.email;
		segment = 'contact';
		segmentLabel = 'One contact';
		// A personal note only carries the unsubscribe link if the person is on
		// the newsletter list, where it actually means something.
		includeUnsubscribe = contact.subscribed;
	} else {
		const found = segmentByKey(input.target);
		if (!found) return { ok: false, error: 'Unknown segment.' };
		if (!found.mailable) return { ok: false, error: `The "${found.label}" list is not mailable.` };

		const sources = await contactSources();
		if (!segmentAvailable(found, sources)) {
			return {
				ok: false,
				error: `The table behind "${found.label}" is not in this database yet, so that list cannot be resolved.`
			};
		}

		const total = await countSegmentRecipients(found.key as SegmentKey);
		if (total === 0) {
			return { ok: false, error: `No one is in "${found.label}" right now.` };
		}
		if (total > MAX_RECIPIENTS) {
			return {
				ok: false,
				error: `"${found.label}" has ${total} recipients, over the ${MAX_RECIPIENTS} cap for one message. Split the send or raise MAX_RECIPIENTS.`
			};
		}
		recipients = await resolveSegmentRecipients(found.key as SegmentKey, MAX_RECIPIENTS);
		segment = found.key;
		segmentLabel = found.label;
		includeUnsubscribe = true;
	}

	if (recipients.length === 0) return { ok: false, error: 'That list resolved to no recipients.' };

	const campaign = await prisma.campaign.create({
		data: {
			subject,
			bodyMd,
			fromKey,
			segment,
			segmentLabel,
			contactEmail,
			includeUnsubscribe,
			recipientCount: 0,
			sentBy: 'admin'
		}
	});

	// Chunked, and outside a transaction on purpose: a half-written list leaves a
	// DRAFT whose stored count is corrected below from the rows that actually
	// exist, which is better than losing the whole draft to one timeout.
	const CHUNK = 500;
	for (let i = 0; i < recipients.length; i += CHUNK) {
		await prisma.campaignDelivery.createMany({
			data: recipients.slice(i, i + CHUNK).map((r) => ({
				campaignId: campaign.id,
				email: normaliseEmail(r.email),
				name: r.name ?? null
			})),
			skipDuplicates: true
		});
	}

	const written = await prisma.campaignDelivery.count({ where: { campaignId: campaign.id } });
	await prisma.campaign.update({
		where: { id: campaign.id },
		data: { recipientCount: written }
	});

	await logActivity({
		action: 'message.drafted',
		entity: 'newsletter',
		entityId: campaign.id,
		actor: 'admin',
		summary: `Drafted "${subject}" for ${written} recipient${written === 1 ? '' : 's'} (${segmentLabel})`
	});

	return { ok: true, id: campaign.id, recipients: written };
}

/* ──────────────────────────────── sending ──────────────────────────────── */

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

/**
 * Send the message to the owner's own inbox. Required before a real send: the
 * only reliable preview of an email is the email.
 */
export async function sendTest(campaignId: string): Promise<ActionResult> {
	const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
	if (!campaign) return { ok: false, error: 'That message no longer exists.' };
	if (campaign.status === 'SENT' || campaign.status === 'SENDING') {
		return { ok: false, error: 'This message has already been sent.' };
	}

	try {
		await sendEmail({
			from: senderFor(campaign.fromKey),
			to: [NOTIFY_TO],
			replyTo: CONTACT,
			subject: `[TEST] ${campaign.subject}`,
			html: renderCampaignHtml(campaign, NOTIFY_TO.email),
			text: renderCampaignText(campaign, NOTIFY_TO.email),
			tags: [EMAIL_TAGS.CAMPAIGN_TEST, ...tagsFor(campaign, ['test'])]
		});
	} catch (error) {
		return { ok: false, error: `The test send failed: ${errorText(error)}` };
	}

	await prisma.campaign.update({
		where: { id: campaign.id },
		data: { testSentAt: new Date() }
	});
	await logActivity({
		action: 'message.test',
		entity: 'newsletter',
		entityId: campaign.id,
		actor: 'admin',
		summary: `Test of "${campaign.subject}" sent to ${NOTIFY_TO.email}`
	});
	return { ok: true, message: `Test sent to ${NOTIFY_TO.email}.` };
}

/**
 * DRAFT to SENDING, once. The conditional update is the idempotency guard: a
 * second click matches no rows and gets told so, rather than starting a
 * parallel run over the same list.
 */
export async function startCampaign(campaignId: string): Promise<ActionResult> {
	const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
	if (!campaign) return { ok: false, error: 'That message no longer exists.' };
	if (!campaign.testSentAt) {
		return { ok: false, error: 'Send yourself a test first. That step is not optional.' };
	}
	if (campaign.status === 'SENT') return { ok: false, error: 'This message was already sent.' };
	if (campaign.status === 'SENDING') return { ok: false, error: 'This message is already sending.' };
	if (campaign.status === 'CANCELLED') return { ok: false, error: 'This message was cancelled.' };

	const queued = await prisma.campaignDelivery.count({
		where: { campaignId, status: 'QUEUED' }
	});
	if (queued === 0) return { ok: false, error: 'There is no one left to send to.' };

	const { count } = await prisma.campaign.updateMany({
		where: { id: campaignId, status: 'DRAFT' },
		data: { status: 'SENDING', startedAt: new Date() }
	});
	if (count !== 1) return { ok: false, error: 'This message is already sending.' };

	await logActivity({
		action: 'message.send.started',
		entity: 'newsletter',
		entityId: campaignId,
		actor: 'admin',
		summary: `Started sending "${campaign.subject}" to ${queued} recipient${queued === 1 ? '' : 's'} (${campaign.segmentLabel})`
	});
	return { ok: true, message: `Sending to ${queued} recipient${queued === 1 ? '' : 's'}.` };
}

export type BatchResult = {
	sent: number;
	failed: number;
	remaining: number;
	unconfirmed: number;
	done: boolean;
	status: string;
};

/** One batch. Safe to call repeatedly; safe to have interrupted. */
export async function deliverBatch(campaignId: string): Promise<BatchResult> {
	const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
	if (!campaign) throw new Error('Campaign not found');
	if (campaign.status !== 'SENDING') {
		const remaining = await prisma.campaignDelivery.count({
			where: { campaignId, status: 'QUEUED' }
		});
		return {
			sent: 0,
			failed: 0,
			remaining,
			unconfirmed: 0,
			done: true,
			status: campaign.status
		};
	}

	const from = senderFor(campaign.fromKey);
	const tags = [EMAIL_TAGS.CAMPAIGN, ...tagsFor(campaign)];
	const startedAt = Date.now();

	let sent = 0;
	let failed = 0;
	let rounds = 0;

	while (sent + failed < BATCH_SIZE && Date.now() - startedAt < TIME_BUDGET_MS && rounds < 40) {
		rounds++;
		const candidates = await prisma.campaignDelivery.findMany({
			where: { campaignId, status: 'QUEUED' },
			orderBy: { email: 'asc' },
			take: CONCURRENCY,
			select: { id: true, email: true, name: true }
		});
		if (candidates.length === 0) break;

		// Claim first, mail second. Whoever's UPDATE matched owns the address.
		const owned: typeof candidates = [];
		for (const row of candidates) {
			const claimed = await prisma.campaignDelivery.updateMany({
				where: { id: row.id, status: 'QUEUED' },
				data: { status: 'SENDING', claimedAt: new Date() }
			});
			if (claimed.count === 1) owned.push(row);
		}
		if (owned.length === 0) continue;

		const results = await Promise.all(
			owned.map(async (row) => {
				try {
					const queuedMessage = await sendEmail({
						from,
						to: [{ email: row.email, ...(row.name ? { name: row.name } : {}) }],
						replyTo: CONTACT,
						subject: campaign.subject,
						html: renderCampaignHtml(campaign, row.email),
						text: renderCampaignText(campaign, row.email),
						tags,
						headers: unsubscribeHeaders(campaign, row.email)
					});
					await prisma.campaignDelivery.update({
						where: { id: row.id },
						data: {
							status: 'SENT',
							sentAt: new Date(),
							providerId: typeof queuedMessage?.id === 'string' ? queuedMessage.id : null,
							error: null
						}
					});
					return true;
				} catch (error) {
					await prisma.campaignDelivery.update({
						where: { id: row.id },
						data: { status: 'FAILED', error: errorText(error).slice(0, 400) }
					});
					return false;
				}
			})
		);
		sent += results.filter(Boolean).length;
		failed += results.filter((r) => !r).length;
	}

	return finalise(campaignId, sent, failed);
}

async function finalise(campaignId: string, sent: number, failed: number): Promise<BatchResult> {
	const grouped = await prisma.campaignDelivery.groupBy({
		by: ['status'],
		where: { campaignId },
		_count: { _all: true }
	});
	const count = (status: string) =>
		grouped.find((g) => g.status === status)?._count._all ?? 0;

	const remaining = count('QUEUED');
	const unconfirmed = count('SENDING');
	const sentTotal = count('SENT');
	const failedTotal = count('FAILED');

	if (remaining === 0 && unconfirmed === 0) {
		const { count: closed } = await prisma.campaign.updateMany({
			where: { id: campaignId, status: 'SENDING' },
			data: {
				status: 'SENT',
				completedAt: new Date(),
				sentCount: sentTotal,
				failedCount: failedTotal
			}
		});
		if (closed === 1) {
			const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
			await logActivity({
				action: 'message.sent',
				entity: 'newsletter',
				entityId: campaignId,
				actor: 'admin',
				summary: `Sent "${campaign?.subject ?? campaignId}" to ${sentTotal} recipient${sentTotal === 1 ? '' : 's'}${failedTotal ? `, ${failedTotal} failed` : ''}`
			});
		}
		return { sent, failed, remaining: 0, unconfirmed: 0, done: true, status: 'SENT' };
	}

	await prisma.campaign.update({
		where: { id: campaignId },
		data: { sentCount: sentTotal, failedCount: failedTotal }
	});
	return { sent, failed, remaining, unconfirmed, done: false, status: 'SENDING' };
}

/** Put failed addresses back in the queue. Failed means nothing was accepted. */
export async function retryFailed(campaignId: string): Promise<ActionResult> {
	const { count } = await prisma.campaignDelivery.updateMany({
		where: { campaignId, status: 'FAILED' },
		data: { status: 'QUEUED', error: null, claimedAt: null }
	});
	if (count === 0) return { ok: false, error: 'Nothing failed.' };
	await prisma.campaign.updateMany({
		where: { id: campaignId, status: 'SENT' },
		data: { status: 'SENDING', completedAt: null }
	});
	return { ok: true, message: `${count} address${count === 1 ? '' : 'es'} back in the queue.` };
}

/**
 * Requeue rows that were claimed and never confirmed. This can send a second
 * copy to someone who already received one, which is why it is a separate,
 * explicit action and never happens on its own.
 */
export async function retryUnconfirmed(campaignId: string): Promise<ActionResult> {
	const cutoff = new Date(Date.now() - STALE_CLAIM_MS);
	const { count } = await prisma.campaignDelivery.updateMany({
		where: { campaignId, status: 'SENDING', claimedAt: { lt: cutoff } },
		data: { status: 'QUEUED', claimedAt: null }
	});
	if (count === 0) return { ok: false, error: 'Nothing has been unconfirmed long enough.' };
	await prisma.campaign.updateMany({
		where: { id: campaignId, status: 'SENT' },
		data: { status: 'SENDING', completedAt: null }
	});
	await logActivity({
		action: 'message.requeued',
		entity: 'newsletter',
		entityId: campaignId,
		actor: 'admin',
		summary: `Requeued ${count} unconfirmed recipient${count === 1 ? '' : 's'}, which may receive a second copy`
	});
	return { ok: true, message: `${count} unconfirmed address${count === 1 ? '' : 'es'} requeued.` };
}

/** Stop a draft, or stop a send that is part way through. */
export async function cancelCampaign(campaignId: string): Promise<ActionResult> {
	const { count } = await prisma.campaign.updateMany({
		where: { id: campaignId, status: { in: ['DRAFT', 'SENDING'] } },
		data: { status: 'CANCELLED', completedAt: new Date() }
	});
	if (count === 0) return { ok: false, error: 'This message cannot be cancelled.' };
	const skipped = await prisma.campaignDelivery.updateMany({
		where: { campaignId, status: 'QUEUED' },
		data: { status: 'SKIPPED' }
	});
	await logActivity({
		action: 'message.cancelled',
		entity: 'newsletter',
		entityId: campaignId,
		actor: 'admin',
		summary: `Cancelled a message with ${skipped.count} recipient${skipped.count === 1 ? '' : 's'} unsent`
	});
	return { ok: true, message: 'Cancelled.' };
}

/** Delete a draft that was never started. Sent history is never deletable. */
export async function deleteDraft(campaignId: string): Promise<ActionResult> {
	const { count } = await prisma.campaign.deleteMany({
		where: { id: campaignId, status: { in: ['DRAFT', 'CANCELLED'] } }
	});
	if (count === 0) return { ok: false, error: 'Only a draft or a cancelled message can be deleted.' };
	return { ok: true, message: 'Deleted.' };
}

export function errorText(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

/** Per-status counts for one campaign, straight from the delivery table. */
export async function deliveryCounts(campaignId: string): Promise<Record<string, number>> {
	const grouped = await prisma.campaignDelivery.groupBy({
		by: ['status'],
		where: { campaignId },
		_count: { _all: true }
	});
	const out: Record<string, number> = {
		QUEUED: 0,
		SENDING: 0,
		SENT: 0,
		FAILED: 0,
		SKIPPED: 0
	};
	for (const row of grouped) out[row.status] = row._count._all;
	return out;
}
