/**
 * Compose. Writing a message never sends it: this action only creates a DRAFT
 * with its recipient list frozen in CampaignDelivery rows. Sending is a
 * separate, confirmed step on the draft's own page, after a test send.
 *
 * A SvelteKit form action rather than a POST endpoint, so the framework's
 * same-origin check applies and the whole thing stays behind the /admin layout
 * session guard.
 */
import { fail, redirect } from '@sveltejs/kit';
import {
	SEGMENTS,
	contactSources,
	getContact,
	isMissingRelation,
	mailableSegmentCounts,
	missingSources,
	normaliseEmail,
	segmentAvailable,
	type ContactSources
} from '$lib/server/contacts';
import {
	MAX_RECIPIENTS,
	SENDER_OPTIONS,
	createCampaign,
	defaultSenderKey
} from '$lib/server/campaigns';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const to = normaliseEmail(url.searchParams.get('to'));

	const noSources: ContactSources = {
		subscribers: false,
		sponsors: false,
		donations: false,
		donationUsd: false,
		requests: false
	};
	let counts: Record<string, number> | null = null;
	let unavailable: string | null = null;
	let sources: ContactSources = noSources;
	try {
		[counts, sources] = await Promise.all([mailableSegmentCounts(), contactSources()]);
	} catch (error) {
		console.error('segment counts failed:', error);
		unavailable = isMissingRelation(error)
			? 'The contact tables could not be read, so segment sizes cannot be counted.'
			: 'Segment sizes could not be counted.';
	}

	const contact = to ? await getContact(to).catch(() => null) : null;

	return {
		// A segment whose source table is missing is shown but not selectable, so
		// the list never quietly loses an audience the owner expects to see.
		segments: SEGMENTS.filter((s) => s.mailable).map((s) => ({
			...s,
			available: segmentAvailable(s, sources)
		})),
		counts,
		missing: missingSources(sources),
		unavailable,
		senders: SENDER_OPTIONS,
		defaultSender: defaultSenderKey(),
		contact,
		requestedTo: to,
		maxRecipients: MAX_RECIPIENTS
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const subject = String(form.get('subject') ?? '');
		const bodyMd = String(form.get('body') ?? '');
		const fromKey = String(form.get('from') ?? '');
		const target = String(form.get('target') ?? '');
		const contactEmail = String(form.get('contactEmail') ?? '');
		const acknowledgeOptOut = form.get('acknowledgeOptOut') === 'on';

		const values = { subject, body: bodyMd, from: fromKey, target, contactEmail };

		let result;
		try {
			result = await createCampaign({
				subject,
				bodyMd,
				fromKey,
				target,
				contactEmail,
				acknowledgeOptOut
			});
		} catch (error) {
			console.error('createCampaign failed:', error);
			return fail(500, {
				values,
				error: isMissingRelation(error)
					? 'The Campaign tables are not in this database yet. Apply the migration for the models at the end of prisma/schema.prisma before writing anything.'
					: 'The draft could not be saved.'
			});
		}

		if (!result.ok) return fail(400, { values, error: result.error });
		throw redirect(303, `/admin/messages/${result.id}`);
	}
};
