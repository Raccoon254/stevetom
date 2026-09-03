/**
 * The sponsor list, and the moderation queue.
 *
 * Nothing here decides who is on the public wall. The ids on the page are
 * handed straight back to `listedSponsorWhere()`, the same predicate the
 * partners page runs, so the admin screen and the wall cannot drift apart:
 * a sponsor shows as live here only if the database agrees they are live.
 *
 * Auto-approval is on, so PENDING_REVIEW is normally empty. It stops being
 * empty the moment that flag is turned off, which is why the queue is the
 * loudest thing on the page rather than a tab nobody opens.
 */
import { prisma } from '$lib/db.js';
import { isMissingRelation } from '$lib/server/contacts';
import { AUTO_APPROVE_PUBLIC_LISTINGS, listedSponsorWhere } from '$lib/server/sponsors';
import type { ModerationState, Prisma, SponsorTier } from '@prisma/client';
import type { PageServerLoad } from './$types';

const PER_PAGE = 40;

const STATES = ['PENDING_REVIEW', 'APPROVED', 'REJECTED'] as const;
const TIERS = ['SUPPORTER', 'STANDARD', 'WORKSHOP', 'CUSTOM'] as const;

const asState = (value: string | null): ModerationState | null =>
	STATES.find((s) => s === value) ?? null;
const asTier = (value: string | null): SponsorTier | null => TIERS.find((t) => t === value) ?? null;

export const load: PageServerLoad = async ({ url }) => {
	const state = asState(url.searchParams.get('state'));
	const tier = asTier(url.searchParams.get('tier'));
	const search = (url.searchParams.get('q') ?? '').trim().slice(0, 120);
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	const where: Prisma.SponsorWhereInput = {};
	if (state) where.moderation = state;
	if (tier) where.tier = tier;
	if (search) {
		where.OR = [
			{ displayName: { contains: search, mode: 'insensitive' } },
			{ orgName: { contains: search, mode: 'insensitive' } },
			{ email: { contains: search, mode: 'insensitive' } },
			{ slug: { contains: search, mode: 'insensitive' } }
		];
	}

	const now = new Date();

	try {
		const [rows, total, all, pending, listed, recurring] = await Promise.all([
			prisma.sponsor.findMany({
				where,
				// PENDING_REVIEW is the first value of the enum, so ascending puts
				// the queue at the top of whatever the admin is looking at.
				orderBy: [{ moderation: 'asc' }, { startedAt: 'desc' }],
				skip: (page - 1) * PER_PAGE,
				take: PER_PAGE,
				select: {
					id: true,
					email: true,
					slug: true,
					displayName: true,
					orgName: true,
					logoUrl: true,
					tier: true,
					cadence: true,
					visibility: true,
					moderation: true,
					monthlyUsd: true,
					lifetimeUsd: true,
					startedAt: true,
					expiresAt: true,
					cancelledAt: true
				}
			}),
			prisma.sponsor.count({ where }),
			prisma.sponsor.count(),
			prisma.sponsor.count({ where: { moderation: 'PENDING_REVIEW' } }),
			prisma.sponsor.count({ where: listedSponsorWhere(now) }),
			prisma.sponsor.aggregate({
				_sum: { monthlyUsd: true },
				where: { cadence: 'RECURRING', cancelledAt: null }
			})
		]);

		// Who is live is asked, never inferred. Same where clause as the wall.
		const liveRows = rows.length
			? await prisma.sponsor.findMany({
					where: { AND: [{ id: { in: rows.map((r) => r.id) } }, listedSponsorWhere(now)] },
					select: { id: true }
				})
			: [];
		const live = new Set(liveRows.map((r) => r.id));

		return {
			rows: rows.map((r) => ({ ...r, listed: live.has(r.id) })),
			total,
			page,
			pages: Math.max(1, Math.ceil(total / PER_PAGE)),
			counts: {
				all,
				pending,
				listed,
				monthlyUsd: recurring._sum.monthlyUsd ?? 0
			},
			state,
			tier,
			search,
			autoApprove: AUTO_APPROVE_PUBLIC_LISTINGS,
			unavailable: null as string | null
		};
	} catch (error) {
		console.error('sponsors load failed:', error);
		return {
			rows: [],
			total: 0,
			page: 1,
			pages: 1,
			counts: { all: 0, pending: 0, listed: 0, monthlyUsd: 0 },
			state,
			tier,
			search,
			autoApprove: AUTO_APPROVE_PUBLIC_LISTINGS,
			unavailable: isMissingRelation(error)
				? 'The Sponsor table is not in this database yet. Apply the sponsorship migration and reload.'
				: 'The sponsor list could not be read from the database.'
		};
	}
};
