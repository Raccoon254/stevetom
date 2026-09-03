/**
 * Request guard.
 *
 * Why this exists rather than a check inside each route: SvelteKit runs a form
 * action BEFORE any load function, so `src/routes/admin/+layout.server.ts`
 * never sees a POST. It protects every GET under /admin and nothing else.
 * Proved against the running app: `GET /admin/sponsors` redirected to /login,
 * while `POST /admin/sponsors/<id>?/approve` returned 200 with no session.
 *
 * That left the approve, reject, edit and end-sponsorship actions callable by
 * anyone who knew the URL, and worse, the actions under /admin/messages, which
 * send real email to real subscribers, and /admin/reports, which can trigger a
 * monthly send.
 *
 * A hook runs before routing, for every method, so it closes the whole surface
 * at once and covers any admin route added later without that route having to
 * remember. Per-route checks remain where they already exist; belt and braces
 * is the right posture here, and this is the belt.
 */
import { redirect, type Handle } from '@sveltejs/kit';
import { isValidSession } from '$lib/server/auth';

/** Paths under /admin that must stay reachable without a session. */
const ADMIN_PUBLIC = new Set(['/admin/login']);

/**
 * Endpoints that are deliberately open to the public internet, each because
 * something other than a session authenticates or bounds it:
 *   analytics/collect  anonymous first-party beacon, writes one row
 *   verify/*           the OTP flow, which is how someone proves an address
 *   paystack-donations a visitor starting a payment has no session by definition
 *   paystack/webhook   authenticated by HMAC over the raw body
 *   webhooks/*         authenticated by provider signature
 *   cron/*             authenticated by CRON_SECRET bearer token
 * Everything else under /api already calls requireAdmin for itself.
 */
function isPublicApi(pathname: string, method: string): boolean {
	if (pathname === '/api/analytics/collect') return true;
	if (pathname.startsWith('/api/verify/')) return true;
	if (pathname === '/api/paystack-donations') return true;
	if (pathname === '/api/paystack/webhook') return true;
	if (pathname.startsWith('/api/webhooks/')) return true;
	if (pathname.startsWith('/api/cron/')) return true;
	// The public contact and quote forms post here. Listing them is admin only
	// and that handler checks for itself.
	if (pathname === '/api/service-requests' && method === 'POST') return true;
	// Public newsletter signup. GET on the same path is the admin overview and
	// is guarded in the handler.
	if (pathname === '/api/newsletter' && method === 'POST') return true;
	return false;
}

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const method = event.request.method;

	const needsSession =
		(pathname === '/admin' || pathname.startsWith('/admin/')) && !ADMIN_PUBLIC.has(pathname);

	// A debug endpoint that reports table counts. Nothing needs it in public.
	const isDebug = pathname === '/api/test';

	if (needsSession || isDebug) {
		if (!isValidSession(event.cookies.get('session'))) {
			// A browser navigation should land on the login form. Anything else,
			// a form action POST or a fetch, gets a status it can act on, because
			// redirecting a POST to an HTML page just produces a confusing 200.
			const wantsHtml =
				method === 'GET' && (event.request.headers.get('accept') ?? '').includes('text/html');
			if (wantsHtml) throw redirect(303, '/login');
			return new Response('Unauthorized', {
				status: 401,
				headers: { 'content-type': 'text/plain' }
			});
		}
	}

	return resolve(event);
};
