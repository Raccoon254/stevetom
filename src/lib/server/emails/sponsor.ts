/**
 * Sponsorship email: the sponsor's own confirmation, and the internal alert.
 *
 * Both entry points are called from the Paystack webhook, after the money has
 * already moved. Neither may throw. A mail-provider outage must never turn a
 * settled payment into a failed webhook, so every failure is logged and
 * swallowed here rather than handed back to the caller.
 *
 * Everything visual comes from the shared kenTom system-email style in
 * ../mailer: white ground, #111 text, Google Sans body, mono labels,
 * hairline #e2e2e0 rules, dark buttons, tables all the way down. Nothing in
 * this file declares a background colour, so a client that inverts the page
 * for dark mode keeps its contrast either way.
 */
import type { SponsorCadence, SponsorTier } from '@prisma/client';
import type { Addr } from '../mailer';
import {
	sendEmail,
	renderEmail,
	p,
	label,
	divider,
	buttonDark,
	esc,
	SENDERS,
	NOTIFY_TO,
	CONTACT,
	BODY_FONT as MAILER_BODY_FONT
} from '../mailer';

const SITE = 'https://kentom.co.ke';
import { EMAIL_TAGS } from '$lib/emailTags';

/**
 * Mirrors ONE_TIME_LISTING_MONTHS in ../sponsors. Held as a literal so the
 * email module does not drag the database client in behind it.
 */
const ONE_TIME_LISTING_MONTHS = 12;

// Imported, not redeclared: one definition of the brand stack.
const BODY_FONT = MAILER_BODY_FONT;
const MONO_FONT = "'Courier New', monospace";

const TIER_LABEL: Record<SponsorTier, string> = {
	SUPPORTER: 'Supporter',
	STANDARD: 'Standard',
	WORKSHOP: 'Workshop',
	CUSTOM: 'Custom'
};

export type SponsorEmailInput = {
	to: { email: string; name?: string };
	displayName: string;
	tier: SponsorTier;
	cadence: SponsorCadence;
	/** Charged amount, in `currency`. */
	amount: number;
	/** ISO currency code the charge settled in, e.g. 'KES'. */
	currency: string;
	/** Canonical USD figure captured at charge time. Null when not recorded. */
	usdAmount: number | null;
	/** Their page lives at /partners/<slug>. */
	sponsorSlug: string;
	/** Whether they will appear on the partners wall. */
	isListed: boolean;
	/** Paystack transaction reference, for their records. */
	reference: string;
};

/* ─────────────────────────────── formatting ─────────────────────────────── */

/**
 * `KES 1,300.00`. The code is printed rather than a symbol: a sponsor paying
 * in KES should never have to guess whether a bare "$" meant theirs or ours.
 */
function money(amount: number, currency: string): string {
	const code = String(currency ?? '').trim().toUpperCase() || 'USD';
	const n = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
	try {
		return `${code} ${n.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}`;
	} catch {
		return `${code} ${n.toFixed(2)}`;
	}
}

/** The USD figure, or an honest blank. Never estimated from the charge. */
function usdLine(usdAmount: number | null): string {
	return usdAmount === null || usdAmount === undefined ? 'Not recorded' : money(usdAmount, 'USD');
}

/** Today in UTC, e.g. `3 September 2026`. Used only to date the confirmation. */
function todayUtc(): string {
	const now = new Date();
	try {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(now);
	} catch {
		return now.toISOString().slice(0, 10);
	}
}

/** Left mono label, right body-font value, hairline between every row. */
function factTable(rows: Array<[string, string]>): string {
	const body = rows
		.map(([l, v], i) => {
			const top = i === 0 ? 'border-top:1px solid #e2e2e0;' : '';
			return (
				'<tr>' +
				`<td width="140" valign="top" style="${top}border-bottom:1px solid #e2e2e0;padding:11px 16px 11px 0;font-family:${MONO_FONT};font-size:12px;line-height:1.5;letter-spacing:.05em;color:#999;white-space:nowrap">${l}</td>` +
				`<td valign="top" style="${top}border-bottom:1px solid #e2e2e0;padding:11px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.5;color:#111;word-break:break-word">${v}</td>` +
				'</tr>'
			);
		})
		.join('');
	return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:0 0 24px 0">${body}</table>`;
}

/** Plain bulleted rows, table-built so old clients keep the hanging indent. */
function pointList(items: string[]): string {
	const body = items
		.map(
			(t) =>
				'<tr>' +
				`<td valign="top" width="14" style="padding:0 10px 10px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:#999">&bull;</td>` +
				`<td valign="top" style="padding:0 0 10px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:#111">${esc(t)}</td>` +
				'</tr>'
		)
		.join('');
	return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:0 0 20px 0">${body}</table>`;
}

/** Aligned `Label:      value` row for the plain-text alternative. */
function textRow(l: string, v: string): string {
	return `${(l + ':').padEnd(12, ' ')}${v}`;
}

/* ──────────────────────────── benefits by tier ───────────────────────────
   The ladder, exactly as sold. `listed` is authoritative: a sponsor who is
   not going on the wall is never promised a place on it, whatever their tier
   would otherwise buy. */

function benefitLines(tier: SponsorTier, listed: boolean): string[] {
	const lines: string[] = [];

	if (listed) {
		lines.push('Your name on the partners page, with a link to your site.');
		if (tier === 'WORKSHOP') {
			lines.push('Your logo on the partners page.');
			lines.push('A line on the homepage.');
			lines.push('A logo slide at SkillKenya sessions held during your sponsored period.');
		}
	} else if (tier === 'SUPPORTER') {
		lines.push('No public listing. Supporter sponsorships are not shown on the partners page.');
	} else {
		lines.push('No public listing: you are down as private, so nothing about you goes on the site.');
		if (tier === 'WORKSHOP') {
			lines.push(
				'Your tier covers a logo on the partners page, a line on the homepage, and a logo slide at SkillKenya sessions. Reply if you want them switched on.'
			);
		} else if (tier === 'STANDARD') {
			lines.push('Reply if you would rather be listed.');
		}
	}

	if (tier === 'CUSTOM') {
		lines.push(
			'The rest is what we arranged directly. If anything here does not match that, reply and I will correct it.'
		);
	}

	lines.push(
		'The quarterly note: a short write-up of what the money paid for, what shipped and what did not.'
	);
	return lines;
}

/* ──────────────────────────────── the sends ─────────────────────────────── */

/**
 * Sent to the sponsor: confirmation, receipt, and what their tier actually
 * buys them. Never throws.
 */
export async function sendSponsorThankYou(input: SponsorEmailInput): Promise<void> {
	try {
		if (!input?.to?.email) {
			console.error('Sponsor thank-you email skipped: no recipient address');
			return;
		}

		// A SUPPORTER never appears on the wall, whatever the flag says.
		const listed = Boolean(input.isListed) && input.tier !== 'SUPPORTER';
		const recurring = input.cadence === 'RECURRING';
		const amount = money(input.amount, input.currency);
		const name = String(input.displayName ?? '').trim() || 'there';
		const slug = encodeURIComponent(String(input.sponsorSlug ?? '').trim());
		const pageUrl = `${SITE}/partners/${slug}`;
		const pageLabel = `kentom.co.ke/partners/${decodeURIComponent(slug)}`;
		const billing = recurring ? 'Monthly, until you cancel' : 'One-time payment';
		const tierName = TIER_LABEL[input.tier] || String(input.tier);
		const reference = String(input.reference ?? '');
		const confirmed = todayUtc();
		const items = benefitLines(input.tier, listed);

		const subject = recurring
			? `Your monthly sponsorship is confirmed (${amount})`
			: `Your sponsorship is confirmed (${amount})`;

		const facts: Array<[string, string]> = [
			['Amount', esc(amount)],
			['Billing', esc(billing)],
			['Tier', esc(tierName)],
			['Reference', esc(reference)],
			['Confirmed', esc(confirmed)]
		];

		const listingHtml = listed
			? p(
					`Your sponsor page is at <a href="${pageUrl}" target="_blank" style="color:#111;text-decoration:underline">${esc(pageLabel)}</a>.` +
						(recurring
							? ''
							: ` The listing runs for ${ONE_TIME_LISTING_MONTHS} months from today.`)
				) + buttonDark('View your sponsor page', pageUrl)
			: '';

		const cancelHtml = recurring
			? p(
					'This one repeats every month until you stop it. There is no cancel screen yet, so reply to this email and I will cancel it for you.'
				)
			: '';

		const amendHtml = listed
			? p('If the name, link or logo on your listing needs changing, reply and I will change it.')
			: p('Reply to this email if anything above is wrong.');

		const html = renderEmail({
			title: 'Sponsorship confirmed',
			heading: 'Sponsorship confirmed',
			preheader: `${amount} received. Reference ${reference}.`,
			footerNote: 'You received this email because you sponsored kenTom at kentom.co.ke.',
			bodyHtml:
				p(
					`Thanks, ${esc(name)}. The payment went through. Keep this email: it doubles as your receipt.`
				) +
				factTable(facts) +
				label('What this includes') +
				pointList(items) +
				listingHtml +
				cancelHtml +
				divider() +
				amendHtml +
				p('Steve', 0)
		});

		const textParts = [
			'SPONSORSHIP CONFIRMED',
			'',
			`Thanks, ${name}. The payment went through. Keep this email: it doubles as your receipt.`,
			'',
			textRow('Amount', amount),
			textRow('Billing', billing),
			textRow('Tier', tierName),
			textRow('Reference', reference),
			textRow('Confirmed', confirmed),
			'',
			'WHAT THIS INCLUDES',
			...items.map((t) => `- ${t}`)
		];

		if (listed) {
			textParts.push(
				'',
				`Your sponsor page: ${pageUrl}`,
				...(recurring ? [] : [`The listing runs for ${ONE_TIME_LISTING_MONTHS} months from today.`])
			);
		}
		if (recurring) {
			textParts.push(
				'',
				'This one repeats every month until you stop it. There is no cancel screen yet,',
				'so reply to this email and I will cancel it for you.'
			);
		}
		textParts.push(
			'',
			listed
				? 'If the name, link or logo on your listing needs changing, reply and I will change it.'
				: 'Reply to this email if anything above is wrong.',
			'',
			'Steve',
			SITE
		);

		const to: Addr = input.to.name
			? { email: input.to.email, name: input.to.name }
			: { email: input.to.email };

		await sendEmail({
			from: SENDERS.partners,
			to: [to],
			replyTo: CONTACT,
			subject,
			tags: [EMAIL_TAGS.SPONSOR_THANK_YOU, 'sponsor', 'thank-you'],
			html,
			text: textParts.join('\n')
		});
	} catch (error) {
		console.error('Sponsor thank-you email failed:', error);
	}
}

/**
 * Sent to the site owner: one dense row per fact, nothing decorative.
 * Never throws.
 */
export async function sendSponsorNotification(input: SponsorEmailInput): Promise<void> {
	try {
		const listed = Boolean(input.isListed) && input.tier !== 'SUPPORTER';
		const recurring = input.cadence === 'RECURRING';
		const amount = money(input.amount, input.currency);
		const usd = usdLine(input.usdAmount);
		const name = String(input.displayName ?? '').trim() || '(no display name)';
		const slug = encodeURIComponent(String(input.sponsorSlug ?? '').trim());
		const pageUrl = `${SITE}/partners/${slug}`;
		const tierName = TIER_LABEL[input.tier] || String(input.tier);
		const cadenceWord = recurring ? 'monthly' : 'one-time';
		const reference = String(input.reference ?? '');
		const email = String(input.to?.email ?? '(no email)');

		// Opted in but below the listing threshold: worth flagging, since the
		// sponsor consented to something their tier does not grant.
		const listing = listed
			? `Yes, ${SITE}/partners/${decodeURIComponent(slug)}`
			: input.isListed
				? 'No: opted in, but SUPPORTER is not listed'
				: 'No, private';

		const subject = `New sponsorship: ${amount} ${cadenceWord} from ${name} (${tierName})`;

		const facts: Array<[string, string]> = [
			['Amount', esc(amount)],
			['USD', esc(usd)],
			['Cadence', esc(recurring ? 'Recurring, monthly' : 'One-time')],
			['Tier', esc(`${tierName} (${String(input.tier)})`)],
			['Sponsor', esc(name)],
			['Email', `<a href="mailto:${esc(email)}" style="color:#111;text-decoration:underline">${esc(email)}</a>`],
			['Slug', esc(String(input.sponsorSlug ?? ''))],
			['Listed', esc(listing)],
			['Reference', esc(reference)],
			['Received', esc(todayUtc())]
		];

		const html = renderEmail({
			title: 'New sponsorship',
			heading: 'New sponsorship',
			preheader: `${amount} ${cadenceWord} from ${name}, ${tierName}.`,
			footerNote: 'Sent to you because a sponsorship payment completed on kentom.co.ke.',
			bodyHtml:
				factTable(facts) +
				(listed ? buttonDark('Open sponsor page', pageUrl) : '') +
				(recurring
					? p(
							'Recurring. Cancellation is manual for now: they have been told to reply to the partners address.',
							0
						)
					: '')
		});

		const textParts = [
			'NEW SPONSORSHIP',
			'',
			textRow('Amount', amount),
			textRow('USD', usd),
			textRow('Cadence', recurring ? 'Recurring, monthly' : 'One-time'),
			textRow('Tier', `${tierName} (${String(input.tier)})`),
			textRow('Sponsor', name),
			textRow('Email', email),
			textRow('Slug', String(input.sponsorSlug ?? '')),
			textRow('Listed', listing),
			textRow('Reference', reference),
			textRow('Received', todayUtc())
		];
		if (listed) textParts.push('', `Sponsor page: ${pageUrl}`);
		if (recurring) {
			textParts.push(
				'',
				'Recurring. Cancellation is manual for now: they have been told to reply',
				'to the partners address.'
			);
		}

		await sendEmail({
			from: SENDERS.hq,
			to: [NOTIFY_TO],
			...(input.to?.email ? { replyTo: { email: input.to.email } } : {}),
			subject,
			tags: [EMAIL_TAGS.SPONSOR_NOTIFICATION, 'sponsor', 'notification'],
			html,
			text: textParts.join('\n')
		});
	} catch (error) {
		console.error('Sponsor notification email failed:', error);
	}
}
