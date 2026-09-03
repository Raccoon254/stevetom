/**
 * First-party analytics: the server side.
 *
 * Everything here runs on our own origin and writes to our own database. There
 * is no third-party beacon, no cookie, and no raw IP address in storage.
 *
 * Privacy shape:
 *  - the visitor identifier is a SHA-256 of (daily salt + UTC date + IP + user
 *    agent), truncated. It is re-salted every day, so it counts uniques within
 *    a day and is worthless for following anyone across days. The IP itself is
 *    used for that one hash and then dropped: it is never written anywhere.
 *  - paths are stored without their query string, so a stray ?email= in a URL
 *    can never land in the table.
 *  - referrers are stored as a bare hostname, never the full referring URL.
 *  - country comes from Vercel's own edge header, not a geo-IP vendor.
 */
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/db.js';

export type DeviceClass = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'BOT' | 'UNKNOWN';

/** Conversion names. One place, so the dashboard and the writers cannot drift. */
export const CONVERSIONS = {
	NEWSLETTER_SIGNUP: 'newsletter.signup',
	SERVICE_REQUEST: 'service_request.submitted',
	QUOTE_REQUEST: 'quote.submitted',
	DONATION_STARTED: 'donation.started',
	DONATION_COMPLETED: 'donation.completed',
	SPONSOR_SIGNUP: 'sponsor.signup'
} as const;

export type ConversionName = (typeof CONVERSIONS)[keyof typeof CONVERSIONS];

/**
 * Salt for the visitor hash. A dedicated ANALYTICS_SALT is preferred; the
 * existing server secrets are an acceptable fallback. If nothing is set we
 * generate a random one per process, which keeps the site working and simply
 * makes unique counts less accurate rather than leaking anything.
 */
const SALT =
	env.ANALYTICS_SALT || env.OTP_SECRET || env.AXENE_MAILER_API_KEY || crypto.randomUUID();

/**
 * A visitor identifier that expires by construction. The UTC date is part of
 * the hash input, so today's hash for a person has no relationship to
 * tomorrow's. Returns null when there is nothing to hash.
 */
export function visitorHash(ip: string | null, userAgent: string | null): string | null {
	if (!ip && !userAgent) return null;
	const day = new Date().toISOString().slice(0, 10); // UTC yyyy-mm-dd
	return crypto
		.createHash('sha256')
		.update(`${SALT}|${day}|${ip ?? ''}|${userAgent ?? ''}`)
		.digest('hex')
		.slice(0, 32);
}

const BOT_PATTERN =
	/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|pingdom|lighthouse|headlesschrome|semrush|ahrefs|dataprovider|monitoring|uptime|curl|wget|python-requests|node-fetch|axios|postman|go-http-client/i;

/** True for traffic that is a machine, so it can be dropped before storage. */
export function isBot(userAgent: string | null): boolean {
	if (!userAgent) return true;
	return BOT_PATTERN.test(userAgent);
}

/** Coarse device class from the user agent. Deliberately not fingerprint-grade. */
export function deviceClass(userAgent: string | null): DeviceClass {
	if (!userAgent) return 'UNKNOWN';
	const ua = userAgent.toLowerCase();
	if (BOT_PATTERN.test(ua)) return 'BOT';
	if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) return 'TABLET';
	if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/.test(ua)) return 'MOBILE';
	return 'DESKTOP';
}

/** Coarse browser family. Five buckets, nothing version-specific. */
export function browserFamily(userAgent: string | null): string | null {
	if (!userAgent) return null;
	const ua = userAgent.toLowerCase();
	if (/edg\//.test(ua)) return 'Edge';
	if (/opr\/|opera/.test(ua)) return 'Opera';
	if (/samsungbrowser/.test(ua)) return 'Samsung';
	if (/firefox|fxios/.test(ua)) return 'Firefox';
	if (/chrome|crios|chromium/.test(ua)) return 'Chrome';
	if (/safari/.test(ua)) return 'Safari';
	return 'Other';
}

/**
 * Pathname only: no origin, no query string, no hash. A trailing slash is
 * dropped so "/work/" and "/work" are one row in the report.
 */
export function normalizePath(raw: unknown): string | null {
	if (typeof raw !== 'string' || !raw) return null;
	let path = raw.trim();
	if (path.startsWith('http://') || path.startsWith('https://')) {
		try {
			path = new URL(path).pathname;
		} catch {
			return null;
		}
	}
	path = path.split('?')[0].split('#')[0];
	if (!path.startsWith('/')) path = `/${path}`;
	if (path.length > 1) path = path.replace(/\/+$/, '') || '/';
	return path.slice(0, 512);
}

/**
 * Referring hostname, www stripped. Same-site referrers become null: an
 * internal click is a navigation, not an acquisition source.
 */
export function referrerHost(raw: unknown, selfHost: string | null): string | null {
	if (typeof raw !== 'string' || !raw.trim()) return null;
	let host: string;
	try {
		host = new URL(raw.trim()).hostname.toLowerCase();
	} catch {
		return null;
	}
	host = host.replace(/^www\./, '');
	if (!host) return null;
	if (selfHost && host === selfHost.toLowerCase().replace(/^www\./, '')) return null;
	return host.slice(0, 255);
}

/** Campaign tag, reduced to a safe slug. */
export function normalizeSource(raw: unknown): string | null {
	if (typeof raw !== 'string' || !raw.trim()) return null;
	const source = raw
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return source ? source.slice(0, 64) : null;
}

/** Two-letter country code, or null. */
export function normalizeCountry(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const code = raw.trim().toUpperCase();
	return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** Random ids only. Anything that is not one is dropped rather than stored. */
export function normalizeSessionId(raw: unknown): string | null {
	if (typeof raw !== 'string') return null;
	const id = raw.trim();
	return /^[a-z0-9-]{8,64}$/i.test(id) ? id : null;
}

export type EventInput = {
	name: string;
	path?: string | null;
	country?: string | null;
	device?: DeviceClass;
	value?: number | null;
	currency?: string | null;
	entityId?: string | null;
	sessionId?: string | null;
};

/**
 * Record a conversion. Never throws: analytics must not be able to fail a
 * signup, a request, or a payment. Callers do not need to await it, but on
 * serverless awaiting is safer than letting the function be frozen mid-write.
 */
export async function recordEvent(input: EventInput): Promise<void> {
	try {
		await prisma.analyticsEvent.create({
			data: {
				name: input.name.slice(0, 120),
				path: normalizePath(input.path ?? null),
				country: normalizeCountry(input.country ?? null),
				device: input.device ?? 'UNKNOWN',
				value: typeof input.value === 'number' && Number.isFinite(input.value) ? input.value : null,
				currency: input.currency ? input.currency.slice(0, 8) : null,
				entityId: input.entityId ? input.entityId.slice(0, 64) : null,
				sessionId: normalizeSessionId(input.sessionId ?? null)
			}
		});
	} catch (error) {
		console.error('recordEvent failed:', error);
	}
}

/**
 * Convenience for API routes: pulls country, device and session off the
 * incoming request so a caller only has to name the conversion.
 */
export async function recordEventFromRequest(
	request: Request,
	input: Omit<EventInput, 'country' | 'device'>
): Promise<void> {
	const userAgent = request.headers.get('user-agent');
	await recordEvent({
		...input,
		country: normalizeCountry(request.headers.get('x-vercel-ip-country')),
		device: deviceClass(userAgent)
	});
}
