/**
 * Axene Mailer delivery webhook.
 *
 * This is the only way delivery, open, click, bounce and complaint signal ever
 * reaches this site. Sending tells us a message was accepted for delivery and
 * nothing more: what actually happened to it comes back here, minutes or hours
 * later.
 *
 * Register this URL in the Axene Mailer dashboard (mail.axene.io, Webhooks ->
 * Add webhook), as:
 *
 *   https://kentom.co.ke/api/webhooks/axene-mailer
 *
 * Creating the webhook returns a signing secret exactly once. Put that value in
 * AXENE_MAILER_WEBHOOK_SECRET. Without it every delivery is rejected with 401,
 * which is the correct posture: an unauthenticated poster must never be able to
 * write rows that move a delivery rate.
 *
 * ── The contract, as implemented by the mailer service itself ──────────────
 *
 * Headers on every delivery:
 *   X-Axene-Signature    sha256=<hex>
 *   X-Axene-Timestamp    unix seconds, re-stamped on every retry attempt
 *   X-Axene-Event        the event type, duplicated from the body
 *   X-Axene-Delivery-ID  uuid, stable across all retries of one event
 *
 * The signature is HMAC-SHA256, keyed by the webhook secret, over
 *
 *   `${timestamp}.${deliveryId}.${eventType}.${rawBody}`
 *
 * so the timestamp, the delivery id and the event type are bound into the
 * signed material alongside the body. A captured delivery therefore cannot be
 * replayed under a fresh timestamp or re-pointed at a different event.
 *
 * Body, as the delivery task actually serialises it:
 *
 *   { "type": "email.delivered", "email_id": "<uuid|null>", "data": { ... } }
 *
 * Axene's own published example documents a flatter, richer envelope
 * ({ id, type, created_at, data: { email_id, to, from } }). The two disagree;
 * see readEnvelope() below, which accepts either without guessing.
 *
 * Retries: 1m, 5m, 30m, 2h, 8h, then it gives up and notifies the account
 * owner. Any 2xx is success, so this handler answers 200 for everything it has
 * finished with, including events it does not act on.
 */
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/db.js';
import type { EmailEventType } from '@prisma/client';

/** Answer 2xx fast. A retry would only replay work we have already finished. */
const ok = (body?: Record<string, unknown>) =>
	new Response(body ? JSON.stringify(body) : null, {
		status: 200,
		headers: body ? { 'Content-Type': 'application/json' } : {}
	});

/**
 * How far out of date a delivery's timestamp may be. Axene re-signs with a
 * fresh timestamp on every retry attempt, so this bounds replay of a captured
 * request without ever rejecting a genuine retry. Generous enough to absorb
 * clock skew between Vercel and the mailer host.
 */
const MAX_SKEW_SECONDS = 10 * 60;

function timingSafeEqual(a: string, b: string): boolean {
	const left = Buffer.from(a, 'utf8');
	const right = Buffer.from(b, 'utf8');
	// timingSafeEqual throws on a length mismatch, so guard it first
	if (left.length !== right.length) return false;
	return crypto.timingSafeEqual(left, right);
}

/**
 * Verify a delivery against the shared secret.
 *
 * The raw request body is hashed, never a re-serialised copy of the parsed
 * JSON: key order and whitespace would differ and the signature could never
 * match.
 */
function verify(
	raw: string,
	headers: Headers,
	secret: string
): { valid: true; deliveryId: string; eventHeader: string; timestamp: number } | { valid: false; reason: string } {
	const signature = headers.get('x-axene-signature');
	const timestampHeader = headers.get('x-axene-timestamp');
	const deliveryId = headers.get('x-axene-delivery-id');
	const eventHeader = headers.get('x-axene-event');

	if (!signature || !timestampHeader || !deliveryId || !eventHeader) {
		return { valid: false, reason: 'missing signature headers' };
	}

	const timestamp = Number(timestampHeader);
	if (!Number.isFinite(timestamp) || !Number.isInteger(timestamp)) {
		return { valid: false, reason: 'malformed timestamp' };
	}

	const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
	if (age > MAX_SKEW_SECONDS) {
		return { valid: false, reason: 'timestamp outside the accepted window' };
	}

	// Exactly the canonical string the mailer signs. Order and separators here
	// are load-bearing: any difference silently fails every delivery.
	const signedContent = `${timestampHeader}.${deliveryId}.${eventHeader}.${raw}`;
	const expected =
		'sha256=' + crypto.createHmac('sha256', secret).update(signedContent, 'utf8').digest('hex');

	if (!timingSafeEqual(expected, signature)) {
		return { valid: false, reason: 'signature mismatch' };
	}

	return { valid: true, deliveryId, eventHeader, timestamp };
}

/**
 * Axene's live payload and its published example disagree about where the
 * message id lives, so read both shapes rather than betting on one.
 *
 *   live:      { type, email_id, data }
 *   published: { id, type, created_at, data: { email_id, to, from } }
 *
 * Everything below this function works on the normalised result, so if the
 * provider settles on one shape only this function changes.
 */
function readEnvelope(payload: Record<string, unknown>): {
	type: string;
	messageId: string | null;
	data: Record<string, unknown>;
	createdAt: string | null;
} {
	const data =
		payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
			? (payload.data as Record<string, unknown>)
			: {};

	const messageId = str(payload.email_id) ?? str(data.email_id) ?? str(data.id);

	return {
		type: str(payload.type) ?? '',
		messageId,
		data,
		createdAt: str(payload.created_at) ?? str(data.created_at) ?? str(data.timestamp)
	};
}

function str(v: unknown): string | null {
	return typeof v === 'string' && v.trim() ? v.trim() : null;
}

/**
 * Event vocabulary.
 *
 * The service fires "open" and "click"; its own registration UI offers the
 * past-tense "email.opened" and "email.clicked". Both spellings are mapped so
 * the numbers are right whichever the account is subscribed to.
 */
const EVENT_TYPES: Record<string, EmailEventType> = {
	queued: 'QUEUED',
	sent: 'SENT',
	delivered: 'DELIVERED',
	open: 'OPENED',
	opened: 'OPENED',
	click: 'CLICKED',
	clicked: 'CLICKED',
	bounce: 'BOUNCED',
	bounced: 'BOUNCED',
	complaint: 'COMPLAINED',
	complained: 'COMPLAINED',
	failed: 'FAILED',
	failure: 'FAILED',
	unsubscribe: 'UNSUBSCRIBED',
	unsubscribed: 'UNSUBSCRIBED'
};

function toEventType(raw: string): EmailEventType {
	const bare = raw.toLowerCase().replace(/^email\./, '');
	return EVENT_TYPES[bare] ?? 'UNKNOWN';
}

/** The recipient, when the payload happens to carry one. */
function recipientFrom(data: Record<string, unknown>): string | null {
	const direct = str(data.recipient) ?? str(data.to) ?? str(data.email);
	if (direct) return direct.toLowerCase();
	if (Array.isArray(data.to)) {
		const first = data.to.find((v) => typeof v === 'string' && v.trim());
		if (typeof first === 'string') return first.trim().toLowerCase();
	}
	return null;
}

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.AXENE_MAILER_WEBHOOK_SECRET;
	if (!secret) {
		// Nothing to verify against, so nothing can be trusted. Refuse rather
		// than record: a misconfigured deployment must not accumulate junk.
		console.error('axene-mailer webhook: AXENE_MAILER_WEBHOOK_SECRET is not configured');
		return new Response('Webhook secret not configured', { status: 401 });
	}

	// Raw text first. Never call request.json() before this.
	const raw = await request.text();

	const check = verify(raw, request.headers, secret);
	if (!check.valid) {
		return new Response('Invalid signature', { status: 401 });
	}

	let payload: Record<string, unknown>;
	try {
		const parsed = JSON.parse(raw);
		payload = parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		// Signed but malformed. Retrying will not fix it, so acknowledge.
		return ok({ received: true, stored: false, reason: 'malformed json' });
	}

	const envelope = readEnvelope(payload);

	// The dashboard's "send a test event" button fires a sample email.delivered
	// with no message behind it. Acknowledge it so the owner sees the green
	// tick, but never let a button press move the delivery rate.
	if (envelope.data.test === true) {
		return ok({ received: true, stored: false, reason: 'test event' });
	}

	// The header type and the body type are signed together and always agree;
	// prefer the body and fall back to the header.
	const type = toEventType(envelope.type || check.eventHeader);

	try {
		// What we sent, so the event can be attributed to a recipient and a tag.
		// Absent for anything sent before this table existed, or sent from
		// somewhere other than this site, which is fine and stays uncorrelated.
		const message = envelope.messageId
			? await prisma.emailMessage.findUnique({ where: { messageId: envelope.messageId } })
			: null;

		await prisma.emailDeliveryEvent.create({
			data: {
				providerEventId: check.deliveryId,
				messageId: envelope.messageId,
				recipient: message?.recipient ?? recipientFrom(envelope.data),
				type,
				tags: message?.tags ?? [],
				occurredAt: eventTime(envelope.createdAt, check.timestamp),
				detail: (envelope.data ?? {}) as object
			}
		});
	} catch (error) {
		// A unique violation on providerEventId is the idempotency guard doing
		// its job: Axene reuses the delivery id across retries, so this is a
		// duplicate of an event already recorded. Success, not failure.
		if (isDuplicate(error)) {
			return ok({ received: true, stored: false, reason: 'duplicate' });
		}
		console.error('axene-mailer webhook: failed to record event', error);
		// Genuinely our problem. A 500 earns a retry, and the unique index means
		// the retry is safe.
		return new Response('Could not record event', { status: 500 });
	}

	return ok({ received: true, stored: true });
};

/** Prisma's unique-constraint violation. */
function isDuplicate(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as { code?: unknown }).code === 'P2002'
	);
}

/**
 * When the event happened. The signature timestamp is re-stamped on every retry
 * attempt, so it is the time of *this delivery*, not of the event: prefer a
 * created_at from the body when the provider sends one.
 */
function eventTime(createdAt: string | null, signedAt: number): Date {
	if (createdAt) {
		const parsed = new Date(createdAt);
		if (!Number.isNaN(parsed.getTime())) return parsed;
	}
	return new Date(signedAt * 1000);
}
