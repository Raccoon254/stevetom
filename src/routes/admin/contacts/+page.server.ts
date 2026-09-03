/**
 * The contact list. Behind /admin, so the layout's session guard covers it.
 *
 * All the work is one pair of SQL statements in $lib/server/contacts.ts: the
 * page of rows and the true total for the same filter. Nothing is folded in
 * Node, so search and paging tell the truth at any table size.
 */
import {
	SEGMENTS,
	contactSources,
	isMissingRelation,
	listContacts,
	missingSources,
	segmentByKey,
	segmentCounts,
	type SegmentKey
} from '$lib/server/contacts';
import type { PageServerLoad } from './$types';

const PER_PAGE = 40;

export const load: PageServerLoad = async ({ url }) => {
	const search = (url.searchParams.get('q') ?? '').slice(0, 120);
	const segment = (segmentByKey(url.searchParams.get('segment'))?.key ?? 'all') as SegmentKey;
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	try {
		const [result, counts] = await Promise.all([
			listContacts({ segment, search, page, perPage: PER_PAGE }),
			segmentCounts()
		]);
		return {
			segments: SEGMENTS,
			counts,
			segment,
			search,
			...result,
			missing: missingSources(result.sources),
			unavailable: null as string | null
		};
	} catch (error) {
		console.error('contacts load failed:', error);
		const sources = await contactSources().catch(() => ({
			subscribers: false,
			sponsors: false,
			donations: false,
			donationUsd: false,
			requests: false
		}));
		return {
			segments: SEGMENTS,
			counts: null,
			segment,
			search,
			rows: [],
			total: 0,
			page: 1,
			perPage: PER_PAGE,
			pages: 1,
			sources,
			missing: missingSources(sources),
			unavailable: isMissingRelation(error)
				? 'None of the contact tables could be read from this database. Run the migrations and reload.'
				: 'The contact list could not be read from the database.'
		};
	}
};
