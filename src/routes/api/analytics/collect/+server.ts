/**
 * Analytics ingest. One small insert, then 204.
 *
 * Design notes:
 *  - it always answers 204 with an empty body, including on failure, so a
 *    client beacon never retries and never logs an error into someone's page.
 *  - it is called after the page has rendered, from sendBeacon where the
 *    browser has it, so it is off the rendering path entirely.
 *  - it stores no IP address. The IP is read once, folded into a salted daily
 *    hash for unique counting, and then dropped.
 *  - it stores no cookie and reads none.
 */
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db.js';
import {
	browserFamily,
	deviceClass,
	isBot,
	normalizeCountry,
	normalizePath,
	normalizeSessionId,
	normalizeSource,
	referrerHost,
	visitorHash
} from '$lib/server/analytics';

const noContent = () => new Response(null, { status: 204 });

export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	try {
		// Server-side honouring of the same signals the tracker checks, for
		// anything that reaches this endpoint without going through it.
		if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') {
			return noContent();
		}

		const userAgent = request.headers.get('user-agent');
		if (isBot(userAgent)) return noContent();

		const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
		if (!body) return noContent();

		const path = normalizePath(body.path);
		if (!path) return noContent();

		let ip: string | null = null;
		try {
			ip = getClientAddress();
		} catch {
			ip = null;
		}

		const country = normalizeCountry(request.headers.get('x-vercel-ip-country'));
		const device = deviceClass(userAgent);
		const sessionId = normalizeSessionId(body.sessionId);
		const visitorId = normalizeSessionId(body.visitorId);
		// hashed immediately, then the address goes out of scope unrecorded
		const visitor = visitorHash(ip, userAgent);

		const eventName = typeof body.event === 'string' ? body.event.trim().slice(0, 120) : '';

		const referrer = referrerHost(body.referrer, url.hostname);
		const source = normalizeSource(body.source);
		const browser = browserFamily(userAgent);

		// Roll the session up alongside the hit. The upsert is what makes a
		// session span pages: first hit creates it with an entry path, every
		// later hit only moves lastSeenAt and the exit path along.
		if (sessionId) {
			await prisma.session
				.upsert({
					where: { id: sessionId },
					create: {
						id: sessionId,
						visitorId,
						entryPath: path,
						exitPath: path,
						referrer,
						source,
						country,
						device,
						browser,
						pageViewCount: eventName ? 0 : 1,
						eventCount: eventName ? 1 : 0
					},
					update: {
						lastSeenAt: new Date(),
						exitPath: path,
						...(eventName
							? { eventCount: { increment: 1 } }
							: { pageViewCount: { increment: 1 } })
					}
				})
				// A session that fails to record must not cost us the hit itself.
				.catch(() => {});
		}

		if (eventName) {
			await prisma.analyticsEvent.create({
				data: { name: eventName, path, country, device, sessionId, visitorId }
			});
			return noContent();
		}

		await prisma.pageView.create({
			data: {
				path,
				referrer,
				source,
				country,
				device,
				browser,
				visitorHash: visitor,
				sessionId,
				visitorId
			}
		});
	} catch (error) {
		// swallowed on purpose: a missed hit is never worth a client-side error
		console.error('analytics collect failed:', error);
	}

	return noContent();
};
