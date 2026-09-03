/**
 * Dashboard data.
 *
 * Every number on this page is aggregated inside Postgres. Nothing here
 * pulls rows into this process to count them: the time series are
 * date_trunc + SUM/COUNT FILTER queries, the breakdowns are groupBy, and
 * the only findMany is the twenty most recent activity-log lines, which
 * are a list rather than a statistic.
 *
 * Two rules run through the whole file.
 *
 * Nothing is invented. Where a column is null the row is excluded from
 * the sum and counted separately so the page can say how much it left
 * out; where a table is empty the page renders an empty state rather
 * than a zeroed chart that looks like a measurement. Right now that is
 * the common case, not the edge case: this database holds a few dozen
 * donations, none of them with a USD figure recorded, no sponsors at
 * all, and a day's worth of page views.
 *
 * No percentage rides a denominator too small to carry it. The floor is
 * the same one src/routes/admin/email/+page.server.ts uses, for the same
 * reason: two sessions and one donation is not a 50% conversion rate.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '$lib/db.js';
import type { PageServerLoad } from './$types';

type Unit = 'hour' | 'day' | 'week';

const RANGES = [
	{ key: '24h', label: 'Last 24 hours', hours: 24, unit: 'hour' as Unit },
	{ key: '7d', label: 'Last 7 days', hours: 24 * 7, unit: 'day' as Unit },
	{ key: '30d', label: 'Last 30 days', hours: 24 * 30, unit: 'day' as Unit },
	{ key: '90d', label: 'Last 90 days', hours: 24 * 90, unit: 'day' as Unit },
	{ key: '12m', label: 'Last 12 months', hours: 24 * 365, unit: 'week' as Unit }
];

const HOUR_MS = 60 * 60 * 1000;

/**
 * Below this many at the top of a step, a conversion percentage is noise
 * dressed up as a fact. Under the floor the page prints the two raw
 * counts and suppresses the rate.
 */
const MIN_SAMPLE = 50;

const DONATE_PATH = '/donate%';

/** The bucket boundaries date_trunc will have produced, start to now. */
function bucketStarts(since: Date, unit: Unit): number[] {
	const step = unit === 'hour' ? HOUR_MS : unit === 'day' ? 24 * HOUR_MS : 7 * 24 * HOUR_MS;

	const start = new Date(since);
	if (unit === 'hour') start.setUTCMinutes(0, 0, 0);
	else {
		start.setUTCHours(0, 0, 0, 0);
		if (unit === 'week') {
			// date_trunc('week') is Monday-based
			const weekday = (start.getUTCDay() + 6) % 7;
			start.setUTCDate(start.getUTCDate() - weekday);
		}
	}

	const out: number[] = [];
	const end = Date.now();
	for (let t = start.getTime(); t <= end; t += step) out.push(t);
	return out;
}

/**
 * Continuous buckets, so a quiet day shows as a gap in the chart rather
 * than being skipped over and making the window look busier than it was.
 */
function align<T extends { bucket: Date }>(rows: T[], starts: number[]): (T | undefined)[] {
	const found = new Map<number, T>();
	for (const row of rows) found.set(new Date(row.bucket).getTime(), row);
	return starts.map((t) => found.get(t));
}

type RevenueRow = {
	bucket: Date;
	one_time: number;
	recurring: number;
	one_time_n: number;
	recurring_n: number;
};
type TrafficRow = { bucket: Date; views: number; visitors: number };
type NewsletterRow = { bucket: Date; joined: number };
type TierRow = { tier: string; n: number; monthly_usd: number; lifetime_usd: number };

export const load: PageServerLoad = async ({ url }) => {
	const requested = url.searchParams.get('range') ?? '30d';
	const range = RANGES.find((r) => r.key === requested) ?? RANGES[2];

	const now = new Date();
	const since = new Date(now.getTime() - range.hours * HOUR_MS);
	// The window immediately before this one, same length, for the deltas.
	const previousSince = new Date(since.getTime() - range.hours * HOUR_MS);
	const ranges = RANGES.map(({ key, label }) => ({ key, label }));
	const starts = bucketStarts(since, range.unit);

	const base = {
		ready: false,
		error: null as string | null,
		rangeKey: range.key,
		rangeLabel: range.label,
		unit: range.unit,
		since: since.toISOString(),
		ranges,
		minSample: MIN_SAMPLE,
		buckets: [] as string[],
		revenue: {
			oneTime: [] as number[],
			recurring: [] as number[],
			oneTimeCount: [] as number[],
			recurringCount: [] as number[],
			usd: 0,
			previousUsd: 0,
			donations: 0,
			previousDonations: 0,
			/** Successful donations in range with no usdAmount on the row. */
			missingUsd: 0,
			/** Successful donations in range that could be summed. */
			withUsd: 0,
			recurringDonations: 0
		},
		traffic: {
			views: [] as number[],
			visitors: [] as number[],
			totalViews: 0,
			totalVisitors: 0,
			previousViews: 0,
			previousVisitors: 0
		},
		newsletter: {
			joined: [] as number[],
			total: 0,
			active: 0,
			joinedInRange: 0,
			previousJoined: 0
		},
		funnel: {
			sessions: 0,
			donateSessions: 0,
			donateViews: 0,
			started: 0,
			completed: 0,
			pending: 0,
			abandoned: 0
		},
		sponsors: {
			tiers: [] as { tier: string; count: number; monthlyUsd: number; lifetimeUsd: number }[],
			total: 0,
			active: 0,
			newInRange: 0,
			pendingReview: 0,
			mrr: 0,
			activeSubscriptions: 0,
			pastDueSubscriptions: 0
		},
		requests: {
			byStatus: [] as { status: string; count: number }[],
			openNow: 0
		},
		activity: [] as {
			id: string;
			action: string;
			entity: string;
			summary: string;
			actor: string;
			createdAt: string;
		}[]
	};

	try {
		const unit = Prisma.raw(`'${range.unit}'`); // from the whitelist above, never user input

		const [
			revenueRows,
			revenueTotals,
			donationCounts,
			sessionTotals,
			donateViews,
			trafficRows,
			trafficTotals,
			newsletterRows,
			newsletterTotals,
			tierRows,
			sponsorTotals,
			subscriptionTotals
		] = await Promise.all([
			// Revenue over time, split by cadence. usdAmount is the canonical
			// figure; `amount` is whatever currency the donor was charged in
			// and summing across currencies would be a made-up number.
			prisma.$queryRaw<RevenueRow[]>(Prisma.sql`
				SELECT date_trunc(${unit}, "createdAt") AS bucket,
				       COALESCE(SUM("usdAmount") FILTER (WHERE "cadence" = 'ONE_TIME'), 0)::float8   AS one_time,
				       COALESCE(SUM("usdAmount") FILTER (WHERE "cadence" = 'RECURRING'), 0)::float8  AS recurring,
				       (COUNT(*) FILTER (WHERE "cadence" = 'ONE_TIME'))::int                          AS one_time_n,
				       (COUNT(*) FILTER (WHERE "cadence" = 'RECURRING'))::int                         AS recurring_n
				  FROM "Donation"
				 WHERE "status" = 'SUCCESS' AND "createdAt" >= ${since}
				 GROUP BY 1
				 ORDER BY 1
			`),
			// This window and the one before it in one pass, plus the count of
			// rows the sum had to leave out because usdAmount is null.
			prisma.$queryRaw<
				{
					usd: number;
					prev_usd: number;
					n: number;
					prev_n: number;
					missing_usd: number;
					recurring_n: number;
				}[]
			>(Prisma.sql`
				SELECT COALESCE(SUM("usdAmount") FILTER (WHERE "createdAt" >= ${since}), 0)::float8 AS usd,
				       COALESCE(SUM("usdAmount") FILTER (WHERE "createdAt" <  ${since}), 0)::float8 AS prev_usd,
				       (COUNT(*) FILTER (WHERE "createdAt" >= ${since}))::int                        AS n,
				       (COUNT(*) FILTER (WHERE "createdAt" <  ${since}))::int                        AS prev_n,
				       (COUNT(*) FILTER (WHERE "createdAt" >= ${since} AND "usdAmount" IS NULL))::int AS missing_usd,
				       (COUNT(*) FILTER (WHERE "createdAt" >= ${since} AND "cadence" = 'RECURRING'))::int AS recurring_n
				  FROM "Donation"
				 WHERE "status" = 'SUCCESS' AND "createdAt" >= ${previousSince}
			`),
			// Funnel stages three and four, and what became of the rest.
			prisma.$queryRaw<
				{ started: number; completed: number; pending: number; abandoned: number }[]
			>(Prisma.sql`
				SELECT COUNT(*)::int                                                    AS started,
				       (COUNT(*) FILTER (WHERE "status" = 'SUCCESS'))::int              AS completed,
				       (COUNT(*) FILTER (WHERE "status" = 'PENDING'))::int              AS pending,
				       (COUNT(*) FILTER (WHERE "status" IN ('FAILED','CANCELLED')))::int AS abandoned
				  FROM "Donation"
				 WHERE "createdAt" >= ${since}
			`),
			prisma.$queryRaw<{ sessions: number }[]>(Prisma.sql`
				SELECT COUNT(*)::int AS sessions
				  FROM "Session"
				 WHERE "startedAt" >= ${since}
			`),
			// Funnel stage two. Counted as distinct sessions so it is the same
			// unit as stage one; the raw hit count comes back too, because when
			// sessionId is null (storage blocked) the session count understates
			// it and the page should be able to say so.
			prisma.$queryRaw<{ views: number; sessions: number }[]>(Prisma.sql`
				SELECT COUNT(*)::int                        AS views,
				       COUNT(DISTINCT "sessionId")::int     AS sessions
				  FROM "PageView"
				 WHERE "createdAt" >= ${since} AND "path" LIKE ${DONATE_PATH}
			`),
			// Traffic over time. visitorHash is the daily rotating hash, which
			// is what /admin/analytics counts, so the two screens agree.
			prisma.$queryRaw<TrafficRow[]>(Prisma.sql`
				SELECT date_trunc(${unit}, "createdAt") AS bucket,
				       COUNT(*)::int                      AS views,
				       COUNT(DISTINCT "visitorHash")::int AS visitors
				  FROM "PageView"
				 WHERE "createdAt" >= ${since}
				 GROUP BY 1
				 ORDER BY 1
			`),
			prisma.$queryRaw<
				{ views: number; visitors: number; prev_views: number; prev_visitors: number }[]
			>(Prisma.sql`
				SELECT (COUNT(*) FILTER (WHERE "createdAt" >= ${since}))::int                        AS views,
				       (COUNT(DISTINCT "visitorHash") FILTER (WHERE "createdAt" >= ${since}))::int   AS visitors,
				       (COUNT(*) FILTER (WHERE "createdAt" <  ${since}))::int                        AS prev_views,
				       (COUNT(DISTINCT "visitorHash") FILTER (WHERE "createdAt" <  ${since}))::int   AS prev_visitors
				  FROM "PageView"
				 WHERE "createdAt" >= ${previousSince}
			`),
			// New subscribers per bucket. Deliberately not a cumulative line:
			// an unsubscribe has no timestamp on this table, so a running total
			// would keep counting people who have already left.
			prisma.$queryRaw<NewsletterRow[]>(Prisma.sql`
				SELECT date_trunc(${unit}, "createdAt") AS bucket, COUNT(*)::int AS joined
				  FROM "NewsletterSubscriber"
				 WHERE "createdAt" >= ${since}
				 GROUP BY 1
				 ORDER BY 1
			`),
			prisma.$queryRaw<
				{ total: number; active: number; joined: number; prev_joined: number }[]
			>(Prisma.sql`
				SELECT COUNT(*)::int                                          AS total,
				       (COUNT(*) FILTER (WHERE "isActive"))::int              AS active,
				       (COUNT(*) FILTER (WHERE "createdAt" >= ${since}))::int AS joined,
				       (COUNT(*) FILTER (
				          WHERE "createdAt" >= ${previousSince} AND "createdAt" < ${since}
				       ))::int                                                AS prev_joined
				  FROM "NewsletterSubscriber"
			`),
			// Sponsors by tier. A point-in-time fact, not a window: "active
			// right now" is the question, so this one ignores the range and
			// the page says so beside the chart.
			prisma.$queryRaw<TierRow[]>(Prisma.sql`
				SELECT "tier"::text                              AS tier,
				       COUNT(*)::int                             AS n,
				       COALESCE(SUM("monthlyUsd"), 0)::float8    AS monthly_usd,
				       COALESCE(SUM("lifetimeUsd"), 0)::float8   AS lifetime_usd
				  FROM "Sponsor"
				 WHERE "cancelledAt" IS NULL
				   AND ("expiresAt" IS NULL OR "expiresAt" > now())
				 GROUP BY 1
			`),
			prisma.$queryRaw<
				{ total: number; active: number; new_in_range: number; pending_review: number }[]
			>(Prisma.sql`
				SELECT COUNT(*)::int AS total,
				       (COUNT(*) FILTER (
				          WHERE "cancelledAt" IS NULL AND ("expiresAt" IS NULL OR "expiresAt" > now())
				       ))::int                                                       AS active,
				       (COUNT(*) FILTER (WHERE "createdAt" >= ${since}))::int        AS new_in_range,
				       (COUNT(*) FILTER (WHERE "moderation" = 'PENDING_REVIEW'))::int AS pending_review
				  FROM "Sponsor"
			`),
			// Monthly recurring revenue: what the live subscriptions bill,
			// rather than a projection off past donations.
			prisma.$queryRaw<{ active: number; mrr: number; past_due: number }[]>(Prisma.sql`
				SELECT (COUNT(*) FILTER (WHERE "status" = 'ACTIVE'))::int                      AS active,
				       COALESCE(SUM("amountUsd") FILTER (WHERE "status" = 'ACTIVE'), 0)::float8 AS mrr,
				       (COUNT(*) FILTER (WHERE "status" = 'PAST_DUE'))::int                    AS past_due
				  FROM "Subscription"
			`)
		]);

		const [requestGroups, openRequests, activity] = await Promise.all([
			prisma.serviceRequest.groupBy({
				by: ['status'],
				where: { createdAt: { gte: since }, deletedAt: null },
				_count: { _all: true }
			}),
			prisma.serviceRequest.count({
				where: {
					deletedAt: null,
					status: { in: ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'IN_PROGRESS'] }
				}
			}),
			// A bounded list, not an aggregate.
			prisma.activityLog.findMany({
				orderBy: { createdAt: 'desc' },
				take: 12,
				select: {
					id: true,
					action: true,
					entity: true,
					summary: true,
					actor: true,
					createdAt: true
				}
			})
		]);

		const revenueAligned = align(revenueRows, starts);
		const trafficAligned = align(trafficRows, starts);
		const newsletterAligned = align(newsletterRows, starts);

		const rev = revenueTotals[0] ?? {
			usd: 0,
			prev_usd: 0,
			n: 0,
			prev_n: 0,
			missing_usd: 0,
			recurring_n: 0
		};
		const traf = trafficTotals[0] ?? { views: 0, visitors: 0, prev_views: 0, prev_visitors: 0 };
		const news = newsletterTotals[0] ?? { total: 0, active: 0, joined: 0, prev_joined: 0 };
		const dons = donationCounts[0] ?? { started: 0, completed: 0, pending: 0, abandoned: 0 };
		const donateHits = donateViews[0] ?? { views: 0, sessions: 0 };
		const spon = sponsorTotals[0] ?? {
			total: 0,
			active: 0,
			new_in_range: 0,
			pending_review: 0
		};
		const subs = subscriptionTotals[0] ?? { active: 0, mrr: 0, past_due: 0 };

		return {
			...base,
			ready: true,
			buckets: starts.map((t) => new Date(t).toISOString()),
			revenue: {
				oneTime: revenueAligned.map((r) => r?.one_time ?? 0),
				recurring: revenueAligned.map((r) => r?.recurring ?? 0),
				oneTimeCount: revenueAligned.map((r) => r?.one_time_n ?? 0),
				recurringCount: revenueAligned.map((r) => r?.recurring_n ?? 0),
				usd: rev.usd,
				previousUsd: rev.prev_usd,
				donations: rev.n,
				previousDonations: rev.prev_n,
				missingUsd: rev.missing_usd,
				withUsd: rev.n - rev.missing_usd,
				recurringDonations: rev.recurring_n
			},
			traffic: {
				views: trafficAligned.map((r) => r?.views ?? 0),
				visitors: trafficAligned.map((r) => r?.visitors ?? 0),
				totalViews: traf.views,
				totalVisitors: traf.visitors,
				previousViews: traf.prev_views,
				previousVisitors: traf.prev_visitors
			},
			newsletter: {
				joined: newsletterAligned.map((r) => r?.joined ?? 0),
				total: news.total,
				active: news.active,
				joinedInRange: news.joined,
				previousJoined: news.prev_joined
			},
			funnel: {
				sessions: sessionTotals[0]?.sessions ?? 0,
				donateSessions: donateHits.sessions,
				donateViews: donateHits.views,
				started: dons.started,
				completed: dons.completed,
				pending: dons.pending,
				abandoned: dons.abandoned
			},
			sponsors: {
				tiers: tierRows.map((r) => ({
					tier: r.tier,
					count: r.n,
					monthlyUsd: r.monthly_usd,
					lifetimeUsd: r.lifetime_usd
				})),
				total: spon.total,
				active: spon.active,
				newInRange: spon.new_in_range,
				pendingReview: spon.pending_review,
				mrr: subs.mrr,
				activeSubscriptions: subs.active,
				pastDueSubscriptions: subs.past_due
			},
			requests: {
				byStatus: requestGroups.map((r) => ({ status: r.status, count: r._count._all })),
				openNow: openRequests
			},
			activity: activity.map((a) => ({
				id: a.id,
				action: a.action,
				entity: a.entity,
				summary: a.summary,
				actor: a.actor,
				createdAt: a.createdAt.toISOString()
			}))
		};
	} catch (error) {
		// Overwhelmingly likely to be a database that has not had the
		// migration applied. Say so, rather than throwing a 500 at the admin.
		console.error('dashboard load failed:', error);
		return {
			...base,
			ready: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
