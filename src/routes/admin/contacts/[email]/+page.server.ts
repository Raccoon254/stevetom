/**
 * One contact: the folded summary plus everything the four source tables hold
 * about that address, newest first.
 *
 * The messaging history is read separately and defensively, because the
 * Campaign tables can legitimately not exist yet in a database that has not had
 * the migration applied. A contact page must still render in that case.
 */
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/db.js';
import {
	getContact,
	getContactTimeline,
	isMissingRelation,
	normaliseEmail
} from '$lib/server/contacts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const address = normaliseEmail(decodeURIComponent(params.email));
	if (!address) throw error(404, 'No such contact');

	let contact;
	try {
		contact = await getContact(address);
	} catch (err) {
		console.error('contact load failed:', err);
		throw error(
			500,
			isMissingRelation(err)
				? 'Some contact tables are not in this database yet.'
				: 'The contact could not be read.'
		);
	}
	if (!contact) throw error(404, 'No such contact');

	const timeline = await getContactTimeline(address);

	let messages: {
		id: string;
		subject: string;
		status: string;
		sentAt: Date | null;
		campaignId: string;
	}[] = [];
	let messagesUnavailable = false;
	try {
		const rows = await prisma.campaignDelivery.findMany({
			where: { email: address },
			orderBy: { createdAt: 'desc' },
			take: 25,
			select: {
				id: true,
				status: true,
				sentAt: true,
				campaignId: true,
				campaign: { select: { subject: true } }
			}
		});
		messages = rows.map((r) => ({
			id: r.id,
			subject: r.campaign.subject,
			status: r.status,
			sentAt: r.sentAt,
			campaignId: r.campaignId
		}));
	} catch (err) {
		messagesUnavailable = true;
		if (!isMissingRelation(err)) console.error('contact messages load failed:', err);
	}

	return { contact, timeline, messages, messagesUnavailable };
};
