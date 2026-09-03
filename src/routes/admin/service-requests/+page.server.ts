/**
 * The request list: active by default, archived on demand, filtered by status
 * and by a free-text search, with each row saying whether it has been answered.
 *
 * Everything is read on the server so the page renders with data in it and the
 * filters survive a reload, a bookmark and a browser with JavaScript off. The
 * two mutations here (archive, restore) are form actions, so they inherit the
 * framework's same-origin check, and each one re-checks the session, because
 * an action runs before any load function and so before the /admin layout's
 * guard.
 *
 * `deletedAt` is a soft delete. The active view asks for `deletedAt: null` and
 * the archived view for `deletedAt: { not: null }`, so an archived request can
 * never leak into the active list.
 */
import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/db.js';
import { logActivity } from '$lib/server/log';
import { requireSession } from './guard';
import { isStatus } from './status';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const view: 'active' | 'archived' =
		url.searchParams.get('view') === 'archived' ? 'archived' : 'active';
	const statusParam = url.searchParams.get('status') ?? '';
	const status = isStatus(statusParam) ? statusParam : '';
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 120);

	const requests = await prisma.serviceRequest.findMany({
		where: {
			deletedAt: view === 'archived' ? { not: null } : null,
			...(status ? { status } : {}),
			...(q
				? {
						OR: [
							{ clientName: { contains: q, mode: 'insensitive' as const } },
							{ clientEmail: { contains: q, mode: 'insensitive' as const } },
							{ company: { contains: q, mode: 'insensitive' as const } },
							{ projectTitle: { contains: q, mode: 'insensitive' as const } },
							{ description: { contains: q, mode: 'insensitive' as const } }
						]
					}
				: {})
		},
		include: { service: { select: { name: true } } },
		orderBy: { createdAt: 'desc' }
	});

	// "Answered" is read from the activity log rather than guessed from the
	// mail tables: every reply, from this page or from the older API endpoint,
	// writes exactly one request.reply row keyed by the request id.
	const answered = requests.length
		? await prisma.activityLog.findMany({
				where: {
					entity: 'request',
					action: 'request.reply',
					entityId: { in: requests.map((r) => r.id) }
				},
				select: { entityId: true },
				distinct: ['entityId']
			})
		: [];
	const answeredIds = new Set(answered.map((a) => a.entityId));

	const [activeCount, archivedCount] = await Promise.all([
		prisma.serviceRequest.count({ where: { deletedAt: null } }),
		prisma.serviceRequest.count({ where: { deletedAt: { not: null } } })
	]);

	return {
		view,
		status,
		q,
		counts: { active: activeCount, archived: archivedCount },
		requests: requests.map((r) => ({ ...r, answered: answeredIds.has(r.id) }))
	};
};

type Feedback = { message?: string; error?: string };
const ok = (message: string): Feedback => ({ message });
const bad = (error: string): Feedback => ({ error });

export const actions: Actions = {
	/**
	 * Archive: the soft delete. The row is never destroyed, and the conditional
	 * update means a second submission of the same row reports "already
	 * archived" instead of moving the timestamp and logging twice.
	 */
	archive: async ({ cookies, request }) => {
		requireSession(cookies);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, bad('No request was named.'));

		const sr = await prisma.serviceRequest.findUnique({
			where: { id },
			select: { id: true, clientName: true }
		});
		if (!sr) return fail(404, bad('That request no longer exists.'));

		const done = await prisma.serviceRequest.updateMany({
			where: { id, deletedAt: null },
			data: { deletedAt: new Date() }
		});
		if (done.count === 0) return ok(`The request from ${sr.clientName} was already archived.`);

		await logActivity({
			action: 'request.archived',
			entity: 'request',
			entityId: sr.id,
			actor: 'admin',
			summary: `Archived the request from ${sr.clientName}`
		});
		return ok(`Archived the request from ${sr.clientName}.`);
	},

	restore: async ({ cookies, request }) => {
		requireSession(cookies);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, bad('No request was named.'));

		const sr = await prisma.serviceRequest.findUnique({
			where: { id },
			select: { id: true, clientName: true }
		});
		if (!sr) return fail(404, bad('That request no longer exists.'));

		const done = await prisma.serviceRequest.updateMany({
			where: { id, deletedAt: { not: null } },
			data: { deletedAt: null }
		});
		if (done.count === 0) return ok(`The request from ${sr.clientName} is already active.`);

		await logActivity({
			action: 'request.restored',
			entity: 'request',
			entityId: sr.id,
			actor: 'admin',
			summary: `Restored the request from ${sr.clientName}`
		});
		return ok(`Restored the request from ${sr.clientName}.`);
	}
};
