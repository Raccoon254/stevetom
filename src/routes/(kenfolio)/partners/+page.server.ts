/**
 * The partners wall, from the database.
 *
 * Who counts as "currently listed" is defined once, in listedSponsorWhere, so
 * this page, the admin screens and any count can never disagree about who is
 * live. Nothing here decides eligibility on its own.
 */
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/db.js';
import { listedSponsorWhere, pastSponsorWhere, tierAllowsLogo } from '$lib/server/sponsors';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const now = new Date();

	try {
		const [current, past, anonymousCount] = await Promise.all([
			prisma.sponsor.findMany({
				where: listedSponsorWhere(now),
				// Higher tiers first, then longest-standing. New sponsors do not
				// displace people who have been carrying this for a year.
				orderBy: [{ tier: 'desc' }, { startedAt: 'asc' }],
				select: {
					slug: true,
					displayName: true,
					orgName: true,
					websiteUrl: true,
					logoUrl: true,
					blurb: true,
					tier: true
				}
			}),
			prisma.sponsor.findMany({
				where: pastSponsorWhere(now),
				orderBy: { expiresAt: 'desc' },
				take: 24,
				select: { slug: true, displayName: true, orgName: true, tier: true }
			}),
			// Counted, never named. Someone who chose anonymity still gets to be
			// part of the total.
			prisma.sponsor.count({
				where: {
					visibility: 'ANONYMOUS',
					moderation: 'APPROVED',
					OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
				}
			})
		]);

		// Short cache: the wall changes rarely, and a sponsor who just paid should
		// still see themselves quickly rather than waiting out a long TTL.
		setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=60' });

		return {
			partners: current.map((s) => ({
				...s,
				// A logo is a Workshop benefit. Enforced here as well as at write
				// time, so a tier change can never leave a logo showing that the
				// sponsor is no longer entitled to.
				logoUrl: tierAllowsLogo(s.tier) ? s.logoUrl : null
			})),
			past,
			anonymousCount
		};
	} catch (error) {
		// Before the migration runs, the table does not exist. An empty wall is a
		// far better outcome than a 500 on a public page.
		console.error('partners load failed:', error);
		return { partners: [], past: [], anonymousCount: 0 };
	}
};
