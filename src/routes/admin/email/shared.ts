/**
 * Shared vocabulary for the two email screens: the overview (+page) and the
 * message log (messages/+page). Not a route: SvelteKit only treats files that
 * start with "+" as routes, so this sits next to them without becoming a page.
 *
 * Everything here is pure. The queries live in the loaders.
 */

export type Unit = 'hour' | 'day' | 'week';

export type Range = {
	key: string;
	label: string;
	/** Null means "everything", used only by the message log. */
	hours: number | null;
	unit: Unit;
};

export const RANGES: readonly Range[] = [
	{ key: '24h', label: 'Last 24 hours', hours: 24, unit: 'hour' },
	{ key: '7d', label: 'Last 7 days', hours: 24 * 7, unit: 'day' },
	{ key: '30d', label: 'Last 30 days', hours: 24 * 30, unit: 'day' },
	{ key: '90d', label: 'Last 90 days', hours: 24 * 90, unit: 'day' },
	{ key: '12m', label: 'Last 12 months', hours: 24 * 365, unit: 'week' }
];

/** The message log adds this one: "did this person ever get my email" has no range. */
export const ALL_TIME: Range = { key: 'all', label: 'All time', hours: null, unit: 'week' };

export const HOUR_MS = 60 * 60 * 1000;

/**
 * Below this many messages a percentage is noise dressed up as a fact: two
 * emails and one open is not a 50% open rate. Under the threshold every screen
 * shows the raw counts and suppresses the percentage entirely.
 */
export const MIN_SAMPLE = 50;

export function rangeByKey(key: string | null, list: readonly Range[]): Range {
	return list.find((r) => r.key === key) ?? list[Math.min(2, list.length - 1)];
}

/** The window start for a range, or null for all time. */
export function sinceFor(range: Range, now = new Date()): Date | null {
	return range.hours === null ? null : new Date(now.getTime() - range.hours * HOUR_MS);
}

/* ─────────────────── reading the provider's detail blob ───────────────────
   EmailDeliveryEvent.detail is whatever Axene put in the event's `data`, kept
   verbatim. Nothing below trusts its shape: every reader returns null rather
   than assuming a key is there or is a string, and nothing renders the blob
   itself. Only these named fields ever reach a page. */

function field(detail: unknown, keys: readonly string[]): string | null {
	if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return null;
	const d = detail as Record<string, unknown>;
	for (const key of keys) {
		const v = d[key];
		if (typeof v === 'string' && v.trim()) return v.trim();
	}
	return null;
}

/** Best line we can offer about why a message failed. */
export function failureReason(detail: unknown): string | null {
	const found = field(detail, ['response', 'error', 'reason', 'dsn', 'feedback_type']);
	return found ? found.slice(0, 240) : null;
}

/** The link that was clicked, when the event carries one. */
export function clickUrl(detail: unknown): string | null {
	const found = field(detail, ['url', 'link', 'target_url', 'clicked_url']);
	return found ? found.slice(0, 300) : null;
}

/** The raw user agent, when the event carries one. */
export function userAgent(detail: unknown): string | null {
	const found = field(detail, ['user_agent', 'userAgent', 'ua', 'client']);
	return found ? found.slice(0, 300) : null;
}

/**
 * A short, human name for a mail client, and the reason the open number needs
 * a caveat: Apple's proxy and Google's image cache fetch the pixel themselves,
 * so an "open" from either is a machine, not a person.
 */
const UA_HINTS: readonly [string, string][] = [
	['googleimageproxy', 'Gmail image proxy'],
	['applemailprivacy', 'Apple Mail Privacy'],
	['apple mail', 'Apple Mail'],
	['outlook', 'Outlook'],
	['thunderbird', 'Thunderbird'],
	['yahoo', 'Yahoo Mail'],
	['proton', 'Proton Mail'],
	['android', 'Android'],
	['iphone', 'iPhone'],
	['ipad', 'iPad'],
	['macintosh', 'Mac'],
	['windows', 'Windows'],
	['linux', 'Linux']
];

export function clientName(ua: string | null): string | null {
	if (!ua) return null;
	const low = ua.toLowerCase();
	for (const [needle, name] of UA_HINTS) {
		if (low.includes(needle)) return name;
	}
	return ua.length > 40 ? `${ua.slice(0, 40)}…` : ua;
}

/**
 * Mask anything that could be a one-time code. Used on the small amount of
 * free text that can reach a page for a security-sensitive message: a bounce
 * response quoting the original subject, say. Cheap, and the cost of being
 * wrong in the other direction is a code on a screen.
 */
export function redactCodes(text: string): string {
	return text.replace(/\d{4,}/g, '••••');
}

/** Trim a URL for display without hiding which host it points at. */
export function shortUrl(url: string): string {
	try {
		const u = new URL(url);
		const tail = `${u.pathname}${u.search}`.replace(/\/$/, '');
		const shown = `${u.host}${tail}`;
		return shown.length > 60 ? `${shown.slice(0, 60)}…` : shown;
	} catch {
		return url.length > 60 ? `${url.slice(0, 60)}…` : url;
	}
}

/**
 * What became of a message, from the events it collected. Failure outranks
 * engagement: a message that opened and then bounced on a second address is a
 * bounce. Below that the furthest state wins.
 */
const STATE_ORDER: readonly string[] = [
	'QUEUED',
	'SENT',
	'DELIVERED',
	'OPENED',
	'CLICKED',
	'UNSUBSCRIBED'
];

export function messageState(types: readonly string[]): string {
	if (types.includes('COMPLAINED')) return 'COMPLAINED';
	if (types.includes('BOUNCED')) return 'BOUNCED';
	if (types.includes('FAILED')) return 'FAILED';
	let best = '';
	let bestAt = -1;
	for (const t of types) {
		const at = STATE_ORDER.indexOf(t);
		if (at > bestAt) {
			bestAt = at;
			best = t;
		}
	}
	return best || 'NO_REPORT';
}

export const STATE_LABEL: Record<string, string> = {
	NO_REPORT: 'No report yet',
	QUEUED: 'Queued',
	SENT: 'Sent',
	DELIVERED: 'Delivered',
	OPENED: 'Opened',
	CLICKED: 'Clicked',
	UNSUBSCRIBED: 'Unsubscribed',
	BOUNCED: 'Bounced',
	FAILED: 'Failed',
	COMPLAINED: 'Complaint',
	UNKNOWN: 'Unknown event'
};
