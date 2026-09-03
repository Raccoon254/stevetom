/**
 * Everything that has been written, and what happened to it.
 *
 * The campaign tables are new, so a database that has not had the migration
 * applied is an expected state, not an error: the page says so and offers
 * nothing that would fail.
 */
import { prisma } from '$lib/db.js';
import { isMissingRelation } from '$lib/server/contacts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const campaigns = await prisma.campaign.findMany({
			orderBy: { createdAt: 'desc' },
			take: 60,
			select: {
				id: true,
				subject: true,
				segment: true,
				segmentLabel: true,
				contactEmail: true,
				status: true,
				recipientCount: true,
				sentCount: true,
				failedCount: true,
				testSentAt: true,
				createdAt: true,
				completedAt: true
			}
		});
		return { campaigns, unavailable: null as string | null };
	} catch (error) {
		console.error('messages load failed:', error);
		return {
			campaigns: [],
			unavailable: isMissingRelation(error)
				? 'The Campaign and CampaignDelivery tables are not in this database yet. Apply the migration for the models at the end of prisma/schema.prisma, then reload. Nothing can be sent until then.'
				: 'The message list could not be read from the database.'
		};
	}
};
