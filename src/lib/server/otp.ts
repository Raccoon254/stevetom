/**
 * Stateless OTP tokens for email verification.
 *
 * No database row is needed: when a code is issued we hand the client an
 * opaque, HMAC-signed token that carries the (hashed) code, the email, the
 * pending form payload and an expiry. On confirmation we re-verify the
 * signature and compare the hashed code. The token is signed with a server
 * secret so the client can neither read the code nor forge a token.
 */
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const TTL_MS = 10 * 60 * 1000;

function secret(): string {
	const key = env.OTP_SECRET || env.AXENE_MAILER_API_KEY;
	if (!key) throw new Error('No secret available for OTP signing');
	return key;
}

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const unb64 = (s: string) => Buffer.from(s, 'base64url').toString();

/** HMAC-sign an arbitrary value (e.g. for one-click unsubscribe links). */
export function sign(value: string): string {
	return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

/** Constant-time check of a value against its signature. */
export function verifySigned(value: string, signature: string): boolean {
	const expected = sign(value);
	const a = Buffer.from(signature);
	const b = Buffer.from(expected);
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Six-digit numeric one-time code. */
export function newCode(): string {
	return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

function hashCode(code: string, email: string): string {
	return crypto
		.createHash('sha256')
		.update(`${code}:${email.trim().toLowerCase()}`)
		.digest('hex');
}

/** Issue a signed token binding a code + email + pending payload. */
export function makeToken(email: string, code: string, payload: unknown): string {
	const body = {
		e: email.trim().toLowerCase(),
		h: hashCode(code, email),
		p: payload,
		x: Date.now() + TTL_MS
	};
	const data = b64(JSON.stringify(body));
	const sig = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
	return `${data}.${sig}`;
}

export type VerifyResult =
	| { ok: true; email: string; payload: any }
	| { ok: false; reason: string };

/** Verify a token + entered code. */
export function verifyToken(token: string, code: string): VerifyResult {
	const [data, sig] = (token || '').split('.');
	if (!data || !sig) return { ok: false, reason: 'Invalid verification token.' };

	const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
		return { ok: false, reason: 'Invalid verification token.' };
	}

	let body: { e: string; h: string; p: unknown; x: number };
	try {
		body = JSON.parse(unb64(data));
	} catch {
		return { ok: false, reason: 'Invalid verification token.' };
	}

	if (Date.now() > body.x) return { ok: false, reason: 'That code has expired. Request a new one.' };
	if (hashCode(code, body.e) !== body.h) return { ok: false, reason: 'That code is not correct.' };

	return { ok: true, email: body.e, payload: body.p };
}
