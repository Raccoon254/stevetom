/**
 * The canonical vocabulary for outbound email.
 *
 * Every send this site makes carries exactly one tag from EMAIL_TAGS as the
 * first entry of its `tags` array, and the analytics screens group by that tag.
 * One list, imported by both sides, is the only way a send site and a dashboard
 * can be stopped from drifting apart: a purpose that is not in this file cannot
 * be counted, and a purpose counted here has a send site that names it.
 *
 * Nothing is imported here on purpose. This module is pure data, safe on the
 * server and in the browser, and adding an import of it to a send site can
 * never introduce a new failure path.
 *
 * ── Adding a purpose ──────────────────────────────────────────────────────
 * Add the key to EMAIL_TAGS, add its row to EMAIL_PURPOSES, then put the tag
 * first in the `tags` array at the send site. Never rename an existing value:
 * the old string is already written into EmailMessage rows and renaming it
 * silently detaches every message sent so far from its purpose.
 *
 * ── Facet tags ────────────────────────────────────────────────────────────
 * Sends may carry extra tags after the canonical one (`campaign:<id>`,
 * `segment:<key>`, and older free-form labels such as `reply`, kept because
 * other pages already query them). They are facets, not purposes, and only the
 * canonical tag decides which purpose a message is counted under.
 */

export const EMAIL_TAGS = {
	/** One-time codes for email verification on the public forms. */
	OTP: 'otp',
	/** To the owner: a quote or contact form was submitted. */
	REQUEST_NOTIFICATION: 'request.notification',
	/** To the client: their request or message arrived. */
	REQUEST_CONFIRMATION: 'request.confirmation',
	/** To the client: the owner's written reply to a service request. */
	REQUEST_REPLY: 'request.reply',
	/** To the sponsor: receipt and thanks after a sponsorship payment. */
	SPONSOR_THANK_YOU: 'sponsor.thank-you',
	/** To the owner: a sponsorship payment completed. */
	SPONSOR_NOTIFICATION: 'sponsor.notification',
	/** To a new subscriber: the welcome note. */
	NEWSLETTER_WELCOME: 'newsletter.welcome',
	/** To subscribers: one blog post, sent as an issue. */
	NEWSLETTER_ISSUE: 'newsletter.issue',
	/** A campaign written in the admin console and sent to a segment. */
	CAMPAIGN: 'campaign',
	/** A campaign test send, which only ever goes to the owner's own inbox. */
	CAMPAIGN_TEST: 'campaign.test',
	/** To the owner: the monthly nudge to publish a blog post. */
	MONTHLY_BLOG_REMINDER: 'monthly.blog-reminder',
	/** To the owner: the month's real numbers, to write the report from. */
	MONTHLY_REPORT_REMINDER: 'monthly.report-reminder',
	/** To the owner: a scheduled job saying what it did, or why it did not. */
	MONTHLY_JOB_NOTICE: 'monthly.notice'
} as const;

export type EmailTag = (typeof EMAIL_TAGS)[keyof typeof EMAIL_TAGS];

/** Where a message is aimed. Internal mail lands in the owner's own inbox. */
export type EmailAudience = 'outbound' | 'internal';

export type EmailPurpose = {
	tag: string;
	label: string;
	blurb: string;
	group: string;
	audience: EmailAudience;
	/**
	 * Security-sensitive mail. The per-message view never prints the stored
	 * subject or any provider detail for these, only the purpose label: a
	 * verification mail must not be readable over the shoulder of whoever has
	 * the admin screen open.
	 */
	sensitive: boolean;
};

/** Display order on the dashboard, most-asked-about first. */
export const EMAIL_PURPOSES: readonly EmailPurpose[] = [
	{
		tag: EMAIL_TAGS.OTP,
		label: 'Verification codes',
		blurb: 'One-time codes issued by the contact and quote forms.',
		group: 'Verification',
		audience: 'outbound',
		sensitive: true
	},
	{
		tag: EMAIL_TAGS.REQUEST_CONFIRMATION,
		label: 'Request confirmations',
		blurb: 'The "I have your message" note sent back to whoever wrote in.',
		group: 'Client work',
		audience: 'outbound',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.REQUEST_REPLY,
		label: 'Replies to clients',
		blurb: 'Replies written from the admin console to a service request.',
		group: 'Client work',
		audience: 'outbound',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.REQUEST_NOTIFICATION,
		label: 'New request alerts',
		blurb: 'Sent to your own inbox when a form is submitted.',
		group: 'Client work',
		audience: 'internal',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.SPONSOR_THANK_YOU,
		label: 'Sponsor thank-yous',
		blurb: 'The receipt and thanks a sponsor gets after paying.',
		group: 'Sponsorship',
		audience: 'outbound',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.SPONSOR_NOTIFICATION,
		label: 'New sponsorship alerts',
		blurb: 'Sent to your own inbox when a sponsorship completes.',
		group: 'Sponsorship',
		audience: 'internal',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.NEWSLETTER_WELCOME,
		label: 'Newsletter welcomes',
		blurb: 'Sent once, when someone confirms a subscription.',
		group: 'Newsletter',
		audience: 'outbound',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.NEWSLETTER_ISSUE,
		label: 'Newsletter issues',
		blurb: 'One blog post mailed to every active subscriber.',
		group: 'Newsletter',
		audience: 'outbound',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.CAMPAIGN,
		label: 'Campaign sends',
		blurb: 'Messages written in the console and sent to a segment.',
		group: 'Campaigns',
		audience: 'outbound',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.CAMPAIGN_TEST,
		label: 'Campaign tests',
		blurb: 'Test sends of a campaign, always to your own inbox.',
		group: 'Campaigns',
		audience: 'internal',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.MONTHLY_BLOG_REMINDER,
		label: 'Writing reminders',
		blurb: 'The monthly note to yourself about how long it has been since a post.',
		group: 'Scheduled',
		audience: 'internal',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.MONTHLY_REPORT_REMINDER,
		label: 'Report reminders',
		blurb: "The month's figures, sent to you so the report can be written from them.",
		group: 'Scheduled',
		audience: 'internal',
		sensitive: false
	},
	{
		tag: EMAIL_TAGS.MONTHLY_JOB_NOTICE,
		label: 'Scheduled job notices',
		blurb: 'A scheduled job reporting that it sent, skipped or failed.',
		group: 'Scheduled',
		audience: 'internal',
		sensitive: false
	}
];

/** Every canonical tag, in display order. Used as the SQL match list. */
export const PURPOSE_TAGS: readonly string[] = EMAIL_PURPOSES.map((purpose) => purpose.tag);

/** Purposes whose messages must never have their subject or detail displayed. */
export const SENSITIVE_PURPOSE_TAGS: readonly string[] = EMAIL_PURPOSES.filter(
	(purpose) => purpose.sensitive
).map((purpose) => purpose.tag);

/**
 * The bucket for mail this site sent before it was tagged, or from a code path
 * that forgot to tag. It is shown as its own row rather than hidden, because a
 * breakdown that quietly drops messages is worse than one that admits to them.
 */
export const UNCLASSIFIED = '(unclassified)';

const BY_TAG = new Map(EMAIL_PURPOSES.map((purpose) => [purpose.tag, purpose]));

/** The purpose a set of tags belongs to, or UNCLASSIFIED. */
export function purposeOf(tags: readonly string[] | null | undefined): string {
	if (!tags) return UNCLASSIFIED;
	for (const tag of tags) {
		if (BY_TAG.has(tag)) return tag;
	}
	return UNCLASSIFIED;
}

/** Metadata for a purpose tag, including the two synthetic buckets. */
export function purposeMeta(tag: string): EmailPurpose {
	const known = BY_TAG.get(tag);
	if (known) return known;
	return {
		tag,
		label: tag === UNCLASSIFIED ? 'Untagged' : tag,
		blurb:
			tag === UNCLASSIFIED
				? 'Sent without a purpose tag, or before this vocabulary existed.'
				: 'A tag this build does not recognise.',
		group: 'Other',
		audience: 'outbound',
		// Unknown means unknown: treat anything unrecognised as sensitive rather
		// than printing a subject nobody has vouched for.
		sensitive: tag !== UNCLASSIFIED
	};
}

export const purposeLabel = (tag: string): string => purposeMeta(tag).label;

export const isSensitivePurpose = (tag: string): boolean => purposeMeta(tag).sensitive;
