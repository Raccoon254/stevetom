/**
 * Analytics dashboard data.
 *
 * Every number on this page is aggregated inside Postgres. Nothing here does a
 * findMany over the hit table: the breakdowns are groupBy with a COUNT, and the
 * time series and the distinct-visitor counts are a date_trunc/COUNT DISTINCT
 * query, because Prisma's groupBy can only group on the raw timestamp column
 * (which would return one row per hit and defeat the point).
 *
 * If the analytics tables have not been migrated yet the page reports that
 * plainly instead of erroring, and it never invents numbers: an empty database
 * renders an empty state.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '$lib/db.js';
import { CONVERSIONS } from '$lib/server/analytics';
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

type SeriesPoint = { bucket: string; views: number; visitors: number };
type Breakdown = { label: string; count: number };

/** Continuous buckets, so a quiet day shows as a gap in the chart, not a skip. */
function fillSeries(
	rows: { bucket: Date; views: number; visitors: number }[],
	since: Date,
	unit: Unit
): SeriesPoint[] {
	const step = unit === 'hour' ? HOUR_MS : unit === 'day' ? 24 * HOUR_MS : 7 * 24 * HOUR_MS;
	const found = new Map<number, { views: number; visitors: number }>();
	for (const row of rows) {
		found.set(new Date(row.bucket).getTime(), { views: row.views, visitors: row.visitors });
	}

	// align the first bucket the same way date_trunc did
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

	const out: SeriesPoint[] = [];
	const end = Date.now();
	for (let t = start.getTime(); t <= end; t += step) {
		const hit = found.get(t);
		out.push({
			bucket: new Date(t).toISOString(),
			views: hit?.views ?? 0,
			visitors: hit?.visitors ?? 0
		});
	}
	return out;
}

const toBreakdown = (
	rows: { _count: { _all: number } }[],
	key: string,
	fallback = 'Unknown'
): Breakdown[] =>
	rows.map((row) => ({
		label: String((row as Record<string, unknown>)[key] ?? '') || fallback,
		count: row._count._all
	}));

export const load: PageServerLoad = async ({ url }) => {
	const requested = url.searchParams.get('range') ?? '30d';
	const range = RANGES.find((r) => r.key === requested) ?? RANGES[2];

	const now = new Date();
	const since = new Date(now.getTime() - range.hours * HOUR_MS);
	const previousSince = new Date(since.getTime() - range.hours * HOUR_MS);

	const ranges = RANGES.map(({ key, label }) => ({ key, label }));

	try {
		const unit = Prisma.raw(`'${range.unit}'`); // from the whitelist above, never user input

		const [seriesRows, totalsRows, previousRows] = await Promise.all([
			prisma.$queryRaw<{ bucket: Date; views: number; visitors: number }[]>(Prisma.sql`
				SELECT date_trunc(${unit}, "createdAt") AS bucket,
				       COUNT(*)::int AS views,
				       COUNT(DISTINCT "visitorHash")::int AS visitors
				  FROM "PageView"
				 WHERE "createdAt" >= ${since}
				 GROUP BY 1
				 ORDER BY 1
			`),
			prisma.$queryRaw<{ views: number; visitors: number; sessions: number }[]>(Prisma.sql`
				SELECT COUNT(*)::int AS views,
				       COUNT(DISTINCT "visitorHash")::int AS visitors,
				       COUNT(DISTINCT "sessionId")::int AS sessions
				  FROM "PageView"
				 WHERE "createdAt" >= ${since}
			`),
			prisma.$queryRaw<{ views: number; visitors: number }[]>(Prisma.sql`
				SELECT COUNT(*)::int AS views,
				       COUNT(DISTINCT "visitorHash")::int AS visitors
				  FROM "PageView"
				 WHERE "createdAt" >= ${previousSince} AND "createdAt" < ${since}
			`)
		]);

		const where = { createdAt: { gte: since } };

		const [pages, referrers, countries, devices, browsers] = await Promise.all([
			prisma.pageView.groupBy({
				by: ['path'],
				where,
				_count: { _all: true },
				orderBy: { _count: { path: 'desc' } },
				take: 12
			}),
			prisma.pageView.groupBy({
				by: ['referrer'],
				where: { ...where, referrer: { not: null } },
				_count: { _all: true },
				orderBy: { _count: { referrer: 'desc' } },
				take: 10
			}),
			prisma.pageView.groupBy({
				by: ['country'],
				where: { ...where, country: { not: null } },
				_count: { _all: true },
				orderBy: { _count: { country: 'desc' } },
				take: 10
			}),
			prisma.pageView.groupBy({
				by: ['device'],
				where,
				_count: { _all: true },
				orderBy: { _count: { device: 'desc' } }
			}),
			prisma.pageView.groupBy({
				by: ['browser'],
				where: { ...where, browser: { not: null } },
				_count: { _all: true },
				orderBy: { _count: { browser: 'desc' } },
				take: 6
			})
		]);

		// Conversions. The three form conversions are recorded as events by the
		// API route that performs them. Donations and sponsorships are counted
		// from their own tables instead: those are payment records, they are the
		// authoritative source, and counting them here means the numbers are
		// right for everything that happened before this dashboard existed.
		const [eventCounts, donationsStarted, donationsCompleted, sponsorSignups] = await Promise.all([
			prisma.analyticsEvent.groupBy({
				by: ['name'],
				where,
				_count: { _all: true }
			}),
			prisma.donation.count({ where }),
			prisma.donation.count({ where: { ...where, status: 'SUCCESS' } }),
			prisma.sponsor.count({ where })
		]);

		const events = new Map(eventCounts.map((e) => [e.name, e._count._all]));

		const conversions = [
			{
				key: 'requests',
				label: 'Service requests',
				icon: 'messages',
				count: events.get(CONVERSIONS.SERVICE_REQUEST) ?? 0,
				source: 'events'
			},
			{
				key: 'quotes',
				label: 'Quote requests',
				icon: 'receipt',
				count: events.get(CONVERSIONS.QUOTE_REQUEST) ?? 0,
				source: 'events'
			},
			{
				key: 'newsletter',
				label: 'Newsletter signups',
				icon: 'sms',
				count: events.get(CONVERSIONS.NEWSLETTER_SIGNUP) ?? 0,
				source: 'events'
			},
			{
				key: 'donations-started',
				label: 'Donations started',
				icon: 'heart',
				count: donationsStarted,
				source: 'records'
			},
			{
				key: 'donations-completed',
				label: 'Donations completed',
				icon: 'tick-circle',
				count: donationsCompleted,
				source: 'records'
			},
			{
				key: 'sponsors',
				label: 'Sponsor signups',
				icon: 'people',
				count: sponsorSignups,
				source: 'records'
			}
		];

		const totals = totalsRows[0] ?? { views: 0, visitors: 0, sessions: 0 };
		const previous = previousRows[0] ?? { views: 0, visitors: 0 };

		return {
			ready: true,
			error: null as string | null,
			rangeKey: range.key,
			rangeLabel: range.label,
			unit: range.unit,
			since: since.toISOString(),
			ranges,
			totals,
			previous,
			series: fillSeries(seriesRows, since, range.unit),
			pages: toBreakdown(pages, 'path'),
			referrers: toBreakdown(referrers, 'referrer', 'Direct'),
			countries: toBreakdown(countries, 'country'),
			devices: toBreakdown(devices, 'device'),
			browsers: toBreakdown(browsers, 'browser'),
			conversions
		};
	} catch (error) {
		// The most likely cause by far is that the analytics migration has not
		// been applied yet. Say so rather than throwing a 500 at the admin.
		console.error('analytics dashboard load failed:', error);
		return {
			ready: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			rangeKey: range.key,
			rangeLabel: range.label,
			unit: range.unit,
			since: since.toISOString(),
			ranges,
			totals: { views: 0, visitors: 0, sessions: 0 },
			previous: { views: 0, visitors: 0 },
			series: [] as SeriesPoint[],
			pages: [] as Breakdown[],
			referrers: [] as Breakdown[],
			countries: [] as Breakdown[],
			devices: [] as Breakdown[],
			browsers: [] as Breakdown[],
			conversions: [] as { key: string; label: string; icon: string; count: number; source: string }[]
		};
	}
};
