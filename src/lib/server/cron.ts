/**
 * The guard on the scheduled endpoints.
 *
 * These URLs send real email to real people. Left open, anyone who guessed the
 * path could mail every sponsor on the list, so the rule here is that a request
 * either proves it is the scheduler or it gets nothing.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on every cron invocation
 * once CRON_SECRET is set in the project's environment variables. That is the
 * only credential accepted. The `x-vercel-cron` header is deliberately ignored:
 * a header anyone can type is not a credential.
 *
 * With no CRON_SECRET configured the endpoints refuse everything. Failing shut
 * is the only safe default: an unset variable would otherwise turn a mailing
 * list into a public URL.
 */
import crypto from 'node:crypto';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

function sha256(value: string): Buffer {
	return crypto.createHash('sha256').update(value, 'utf8').digest();
}

/**
 * Constant-time string comparison.
 *
 * Both sides are hashed first. timingSafeEqual throws on a length mismatch, and
 * catching that would leak the length of the secret through the shape of the
 * response, so the comparison is done over two 32 byte digests instead: always
 * the same length, always the same work.
 */
export function timingSafeEquals(a: string, b: string): boolean {
	return crypto.timingSafeEqual(sha256(a), sha256(b));
}

/** The bearer token on a request, or an empty string. */
function bearer(request: Request): string {
	const header = request.headers.get('authorization') ?? '';
	const match = /^Bearer\s+(.+)$/i.exec(header.trim());
	return match ? match[1].trim() : '';
}

/**
 * Returns a Response to send back when the request may not proceed, or null
 * when it may:
 *
 *     const denied = guardCron(request);
 *     if (denied) return denied;
 */
export function guardCron(request: Request): Response | null {
	const secret = (env.CRON_SECRET ?? '').trim();
	if (!secret) {
		console.error('cron: CRON_SECRET is not configured, so every scheduled job is refused');
		return cronJson(
			{
				ok: false,
				error:
					'CRON_SECRET is not configured on this deployment. Scheduled jobs are refused until it is set.'
			},
			503
		);
	}

	const presented = bearer(request);
	if (!presented || !timingSafeEquals(presented, secret)) {
		return cronJson({ ok: false, error: 'Unauthorized' }, 401);
	}
	return null;
}

/** JSON, never cached, never indexed. */
export function cronJson(body: unknown, status = 200): Response {
	return json(body, {
		status,
		headers: {
			'cache-control': 'no-store, max-age=0',
			'x-robots-tag': 'noindex'
		}
	});
}
