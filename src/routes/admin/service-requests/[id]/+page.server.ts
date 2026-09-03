/**
 * One service request: everything it holds, what has been sent about it, and
 * the three things the owner can do to it (reply, move its status, archive it).
 *
 * Every mutation is a SvelteKit form action, so it inherits the framework's
 * same-origin check, and each one calls `requireSession` first, because an
 * action runs before any load function and so before the /admin layout's
 * guard. Nothing here is reachable as an open POST endpoint, and the reply
 * email itself is the shared `sendRequestReply` in $lib/server/requests, not a
 * second copy of it.
 *
 * `deletedAt` is a soft delete. A request that has been archived is treated
 * exactly like one that never existed: 404, never a 500 and never a page that
 * quietly resurrects an excluded record. Restoring is done from the archived
 * list.
 */
import crypto from 'node:crypto';
import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/db.js';
import { logActivity } from '$lib/server/log';
import { sendRequestReply } from '$lib/server/requests';
import { requireSession } from '../guard';
import { isStatus, statusLabel } from '../status';
import type { Actions, PageServerLoad } from './$types';

/** How long after a logged reply a second submission is read as a double-click. */
const DOUBLE_CLICK_MS = 15_000;
/** How long a page's send token is remembered before it is forgotten as stale. */
const NONCE_TTL_MS = 30 * 60 * 1000;
/** How far apart a logged reply and its queued email may be and still be the same send. */
const PAIR_WINDOW_MS = 10 * 60 * 1000;

/**
 * Send tokens that have already been spent.
 *
 * Each page load mints one token; the reply action spends it. A resubmission
 * of the very same form (the second half of a double-click, a refresh of a
 * POST, the back button) carries a token that is already spent and sends
 * nothing. The map is per process, so it cannot be the only guard: the
 * activity-log check below is what holds when a second submission lands on a
 * different instance.
 */
const spentNonces = new Map<string, number>();

function spend(nonce: string): boolean {
	const now = Date.now();
	for (const [key, at] of spentNonces) if (now - at > NONCE_TTL_MS) spentNonces.delete(key);
	// A submission with no token at all is not treated as a duplicate; the
	// activity-log window still covers it.
	if (!nonce) return true;
	if (spentNonces.has(nonce)) return false;
	spentNonces.set(nonce, now);
	return true;
}

export const load: PageServerLoad = async ({ params }) => {
	let sr;
	try {
		sr = await prisma.serviceRequest.findFirst({
			where: { id: params.id, deletedAt: null },
			include: { service: { select: { id: true, name: true, description: true } } }
		});
	} catch (err) {
		console.error('service request load failed:', err);
		throw error(500, 'That request could not be read.');
	}
	if (!sr) throw error(404, 'No such request');

	// The trail is the request's own slice of the activity log: created, every
	// status move, every reply, archive and restore.
	const trail = await prisma.activityLog.findMany({
		where: { entity: 'request', entityId: sr.id },
		orderBy: { createdAt: 'desc' },
		take: 50
	});

	// Reply history. The activity log is the authority on how many replies went
	// out and when, because it is keyed by the request id. The mail tables add
	// what happened to each of them afterwards; they are keyed by recipient and
	// subject, so they are matched by time and treated as decoration. A reply
	// with no match simply shows no delivery state.
	let messages: { messageId: string; createdAt: Date; status: string }[] = [];
	let events: { messageId: string | null; type: string; occurredAt: Date }[] = [];
	try {
		messages = await prisma.emailMessage.findMany({
			where: {
				recipient: sr.clientEmail.toLowerCase(),
				tags: { has: 'reply' },
				subject: `Re: ${sr.projectTitle}`,
				createdAt: { gte: sr.createdAt }
			},
			orderBy: { createdAt: 'desc' },
			take: 50,
			select: { messageId: true, createdAt: true, status: true }
		});
		if (messages.length) {
			events = await prisma.emailDeliveryEvent.findMany({
				where: { messageId: { in: messages.map((m) => m.messageId) } },
				orderBy: { occurredAt: 'asc' },
				select: { messageId: true, type: true, occurredAt: true }
			});
		}
	} catch (err) {
		// Delivery state is a nicety. Losing it must not lose the page.
		console.error('reply delivery lookup failed:', err);
	}

	const latestEvent = new Map<string, string>();
	for (const e of events) if (e.messageId) latestEvent.set(e.messageId, e.type);

	const taken = new Set<string>();
	const replies = trail
		.filter((entry) => entry.action === 'request.reply')
		.map((entry) => {
			const match = messages.find(
				(m) =>
					!taken.has(m.messageId) &&
					Math.abs(m.createdAt.getTime() - entry.createdAt.getTime()) <= PAIR_WINDOW_MS
			);
			if (match) taken.add(match.messageId);
			return {
				id: entry.id,
				at: entry.createdAt,
				actor: entry.actor,
				summary: entry.summary,
				delivery: match ? (latestEvent.get(match.messageId) ?? match.status.toUpperCase()) : null
			};
		});

	return { request: sr, trail, replies, nonce: crypto.randomUUID() };
};

type Feedback = { message?: string; error?: string; sent?: boolean };
const ok = (message: string, sent = false): Feedback => ({ message, sent });
const bad = (error: string): Feedback => ({ error });

export const actions: Actions = {
	/**
	 * Send the reply. Guarded twice against a double-click: the page's send
	 * token, which is spent the moment this action starts, and a look back over
	 * the last few seconds of the activity log, which catches a second
	 * submission that lands on a process that never saw the token. Either way
	 * the second click sends no second email.
	 */
	reply: async ({ cookies, params, request }) => {
		requireSession(cookies);
		const form = await request.formData();
		const message = String(form.get('message') ?? '');
		const nonce = String(form.get('nonce') ?? '');

		if (!message.trim()) return fail(400, bad('Write something before sending.'));

		// The page 404s for an archived request, but a form opened before it was
		// archived could still be submitted. An excluded record stays excluded.
		const live = await prisma.serviceRequest.count({
			where: { id: params.id, deletedAt: null }
		});
		if (!live) return fail(404, bad('That request no longer exists.'));

		if (!spend(nonce)) {
			return ok('That reply had already been sent. Nothing was sent a second time.');
		}

		const justSent = await prisma.activityLog.findFirst({
			where: {
				entity: 'request',
				entityId: params.id,
				action: 'request.reply',
				createdAt: { gt: new Date(Date.now() - DOUBLE_CLICK_MS) }
			},
			select: { id: true }
		});
		if (justSent) {
			return ok(
				'A reply to this request went out seconds ago, so this one was not sent again. Give it a moment if you meant to send a second reply.'
			);
		}

		const result = await sendRequestReply(params.id, message);
		if (!result.ok) return fail(result.status, bad(result.error));
		return ok(`Reply sent to ${result.email}.`, true);
	},

	/**
	 * Move the status. The update is conditional on the status we read, so two
	 * clicks on the same button move it once and log it once, and a change made
	 * in another tab is reported rather than silently overwritten.
	 */
	status: async ({ cookies, params, request }) => {
		requireSession(cookies);
		const form = await request.formData();
		const next = form.get('status');
		if (!isStatus(next)) return fail(400, bad('That is not a status.'));

		const sr = await prisma.serviceRequest.findFirst({
			where: { id: params.id, deletedAt: null },
			select: { id: true, status: true, clientName: true }
		});
		if (!sr) return fail(404, bad('That request no longer exists.'));
		if (sr.status === next) return ok(`Already ${statusLabel(next)}.`);

		const done = await prisma.serviceRequest.updateMany({
			where: { id: sr.id, status: sr.status, deletedAt: null },
			data: { status: next }
		});
		if (done.count === 0) {
			return fail(409, bad('The status changed somewhere else. Reload the page and try again.'));
		}

		await logActivity({
			action: 'request.status',
			entity: 'request',
			entityId: sr.id,
			actor: 'admin',
			summary: `${sr.clientName}: status ${sr.status} → ${next}`
		});
		return ok(`Status is now ${statusLabel(next)}.`);
	},

	/** Archive: the soft delete. The row is kept, the page stops answering for it. */
	archive: async ({ cookies, params }) => {
		requireSession(cookies);
		const sr = await prisma.serviceRequest.findFirst({
			where: { id: params.id, deletedAt: null },
			select: { id: true, clientName: true }
		});
		if (!sr) return fail(404, bad('That request no longer exists.'));

		const done = await prisma.serviceRequest.updateMany({
			where: { id: sr.id, deletedAt: null },
			data: { deletedAt: new Date() }
		});
		if (done.count > 0) {
			await logActivity({
				action: 'request.archived',
				entity: 'request',
				entityId: sr.id,
				actor: 'admin',
				summary: `Archived the request from ${sr.clientName}`
			});
		}
		throw redirect(303, '/admin/service-requests?view=archived');
	}
};
