/**
 * Review, test, confirm, send.
 *
 * Every mutation here is a SvelteKit form action, so it inherits the framework's
 * same-origin check and the /admin layout's session guard. There is no open POST
 * endpoint that could send mail.
 *
 * The order is enforced by the server, not by the buttons: `start` refuses
 * without a test send, refuses anything that is not still a DRAFT, and performs
 * the transition as a conditional update so a double click cannot start two runs.
 */
import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/db.js';
import { isMissingRelation } from '$lib/server/contacts';
import {
	BATCH_SIZE,
	MAX_RECIPIENTS,
	STALE_CLAIM_MS,
	cancelCampaign,
	deleteDraft,
	deliverBatch,
	deliveryCounts,
	errorText,
	renderCampaignHtml,
	retryFailed,
	retryUnconfirmed,
	senderFor,
	sendTest,
	startCampaign,
	type BatchResult
} from '$lib/server/campaigns';
import { NOTIFY_TO } from '$lib/server/mailer';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	let campaign;
	try {
		campaign = await prisma.campaign.findUnique({ where: { id: params.id } });
	} catch (err) {
		console.error('campaign load failed:', err);
		throw error(
			500,
			isMissingRelation(err)
				? 'The Campaign tables are not in this database yet.'
				: 'That message could not be read.'
		);
	}
	if (!campaign) throw error(404, 'No such message');

	const [counts, sample, failures, unconfirmed] = await Promise.all([
		deliveryCounts(campaign.id),
		prisma.campaignDelivery.findMany({
			where: { campaignId: campaign.id },
			orderBy: { email: 'asc' },
			take: 12,
			select: { email: true, name: true, status: true }
		}),
		prisma.campaignDelivery.findMany({
			where: { campaignId: campaign.id, status: 'FAILED' },
			orderBy: { updatedAt: 'desc' },
			take: 20,
			select: { email: true, error: true }
		}),
		prisma.campaignDelivery.count({
			where: {
				campaignId: campaign.id,
				status: 'SENDING',
				claimedAt: { lt: new Date(Date.now() - STALE_CLAIM_MS) }
			}
		})
	]);

	// Rendered for a real address on the list, so the preview carries the same
	// per-recipient unsubscribe link the recipient will get.
	const previewFor = campaign.contactEmail ?? sample[0]?.email ?? NOTIFY_TO.email;

	return {
		campaign,
		counts,
		sample,
		failures,
		staleUnconfirmed: unconfirmed,
		previewHtml: renderCampaignHtml(campaign, previewFor),
		previewFor,
		sender: senderFor(campaign.fromKey),
		notifyTo: NOTIFY_TO.email,
		batchSize: BATCH_SIZE,
		maxRecipients: MAX_RECIPIENTS
	};
};

/**
 * One shape for every action's payload, so the page can read `form.error` and
 * `form.message` without narrowing a union on each access.
 */
type Feedback = { message?: string; error?: string; batch?: BatchResult };
const ok = (message?: string, batch?: BatchResult): Feedback => ({ message, batch });
const bad = (error: string): Feedback => ({ error });

export const actions: Actions = {
	test: async ({ params }) => {
		const result = await sendTest(params.id);
		return result.ok ? ok(result.message) : fail(400, bad(result.error));
	},

	start: async ({ params, request }) => {
		// The confirmation is checked on the server, not only in the browser: the
		// button that starts a bulk send must not be reachable by accident.
		const form = await request.formData();
		if (form.get('confirm') !== 'on') {
			return fail(400, bad('Confirm the recipient count before sending.'));
		}
		const result = await startCampaign(params.id);
		if (!result.ok) return fail(409, bad(result.error));
		// Send the first batch straight away so pressing Send does something
		// visible even with JavaScript off.
		try {
			const batch = await deliverBatch(params.id);
			return ok(result.message, batch);
		} catch (err) {
			console.error('first batch failed:', err);
			return fail(500, bad(`The send started but the first batch failed: ${errorText(err)}`));
		}
	},

	deliver: async ({ params }) => {
		try {
			const batch = await deliverBatch(params.id);
			return ok(undefined, batch);
		} catch (err) {
			console.error('batch failed:', err);
			return fail(500, bad(`That batch failed: ${errorText(err)}`));
		}
	},

	retryFailed: async ({ params }) => {
		const result = await retryFailed(params.id);
		return result.ok ? ok(result.message) : fail(400, bad(result.error));
	},

	retryUnconfirmed: async ({ params }) => {
		const result = await retryUnconfirmed(params.id);
		return result.ok ? ok(result.message) : fail(400, bad(result.error));
	},

	cancel: async ({ params }) => {
		const result = await cancelCampaign(params.id);
		return result.ok ? ok(result.message) : fail(400, bad(result.error));
	},

	remove: async ({ params }) => {
		const result = await deleteDraft(params.id);
		if (!result.ok) return fail(400, bad(result.error));
		throw redirect(303, '/admin/messages');
	}
};
