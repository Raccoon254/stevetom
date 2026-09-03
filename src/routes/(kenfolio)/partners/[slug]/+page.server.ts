/**
 * A sponsor's own page.
 *
 * The point of this route is that a sponsor has a permanent URL they can point
 * someone at, so their listing is something they can show a boss rather than a
 * name in a grid.
 *
 * Only sponsors who consented to be public are reachable here. A private or
 * anonymous sponsor 404s exactly like a slug that was never issued, so the
 * response cannot be used to confirm that a given person sponsors this site.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/db.js';
import { tierAllowsLogo } from '$lib/server/sponsors';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	let sponsor;
	try {
		sponsor = await prisma.sponsor.findUnique({
			where: { slug: params.slug },
			select: {
				slug: true,
				displayName: true,
				orgName: true,
				websiteUrl: true,
				logoUrl: true,
				blurb: true,
				tier: true,
				cadence: true,
				visibility: true,
				moderation: true,
				startedAt: true,
				expiresAt: true
			}
		});
	} catch (err) {
		// Table not migrated yet: a 404 is the honest answer, not a 500.
		console.error('sponsor load failed:', err);
		throw error(404, 'Not found');
	}

	if (!sponsor || sponsor.visibility !== 'PUBLIC' || sponsor.moderation !== 'APPROVED') {
		throw error(404, 'Not found');
	}

	const now = new Date();
	const active = !sponsor.expiresAt || sponsor.expiresAt > now;

	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=300' });

	return {
		sponsor: {
			slug: sponsor.slug,
			displayName: sponsor.displayName,
			orgName: sponsor.orgName,
			websiteUrl: sponsor.websiteUrl,
			logoUrl: tierAllowsLogo(sponsor.tier) ? sponsor.logoUrl : null,
			blurb: sponsor.blurb,
			tier: sponsor.tier,
			cadence: sponsor.cadence,
			since: sponsor.startedAt.toISOString(),
			active
		}
	};
};
