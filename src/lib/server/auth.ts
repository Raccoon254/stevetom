/**
 * Admin session auth.
 *
 * The session cookie holds an HMAC-signed, expiring token, not a guessable
 * literal. Without the server secret a token cannot be forged, so setting
 * `session=admin` by hand no longer grants access. Stateless: no session
 * table is needed, the token carries its own expiry.
 */
import crypto from 'node:crypto';
import { json, type Cookies } from '@sveltejs/kit';
import { sign, verifySigned } from './otp';

const SESSION_COOKIE = 'session';
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 1 week

/** Cookie options shared by login (set) and logout (delete). */
export const sessionCookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'strict' as const,
	secure: process.env.NODE_ENV === 'production',
	maxAge: Math.floor(TTL_MS / 1000)
};

/** Mint a fresh signed admin session token. */
export function createSessionToken(): string {
	const payload = `admin:${Date.now() + TTL_MS}:${crypto.randomUUID()}`;
	const data = Buffer.from(payload).toString('base64url');
	return `${data}.${sign(payload)}`;
}

/** True only for a validly signed, unexpired admin session token. */
export function isValidSession(token: string | undefined | null): boolean {
	if (!token) return false;
	const [data, signature] = token.split('.');
	if (!data || !signature) return false;

	let payload: string;
	try {
		payload = Buffer.from(data, 'base64url').toString();
	} catch {
		return false;
	}
	if (!verifySigned(payload, signature)) return false;

	const [role, expiry] = payload.split(':');
	if (role !== 'admin') return false;
	const exp = Number(expiry);
	return Number.isFinite(exp) && Date.now() < exp;
}

/**
 * Guard for admin API endpoints. Returns a 401 `Response` when the request
 * is not from a valid admin session, or `null` when it may proceed:
 *
 *     const denied = requireAdmin(cookies);
 *     if (denied) return denied;
 */
export function requireAdmin(cookies: Cookies): Response | null {
	if (isValidSession(cookies.get(SESSION_COOKIE))) return null;
	return json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
