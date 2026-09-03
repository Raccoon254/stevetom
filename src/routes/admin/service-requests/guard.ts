/**
 * The session check the admin form actions make for themselves.
 *
 * src/routes/admin/+layout.server.ts guards every page under /admin, but it
 * guards the *render*: SvelteKit runs a form action first and the load
 * functions afterwards, so a POST straight at `?/reply` would do its work
 * before that layout load ever ran. An action with a side effect (an email, a
 * status move, an archive) therefore re-checks the session itself, and every
 * action in this folder calls this first.
 *
 * Imported only from +page.server.ts files, so $lib/server stays off the
 * client.
 */
import { redirect, type Cookies } from '@sveltejs/kit';
import { isValidSession } from '$lib/server/auth';

export function requireSession(cookies: Cookies): void {
	if (!isValidSession(cookies.get('session'))) throw redirect(303, '/login');
}
