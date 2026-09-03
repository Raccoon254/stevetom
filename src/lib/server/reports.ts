/**
 * The monthly numbers.
 *
 * Everything here is a query. There is no estimate, no extrapolation and no
 * placeholder anywhere in this file: a figure either came out of the database
 * (or out of the real post dates in $lib/content) or it is reported as
 * unavailable. That rule is the whole point of the module, because these
 * numbers are mailed to sponsors and investors, and a number nobody can trace
 * back to a row is worse than no number at all.
 *
 * Two consequences of that rule shape the types below.
 *
 *  1. Every section is a `Section<T>`: either `data`, or an `unavailable`
 *     sentence saying why not. A table that has not been migrated yet, or a
 *     query that fails, produces "could not be read", never a zero. The
 *     database this runs against is young and some models genuinely arrive
 *     ahead of their migration, so a missing relation is an expected state.
 *  2. Sums that Postgres returns as NULL stay null. `usdTotal` is null when no
 *     donation in the window carried a canonical USD figure, and the count of
 *     rows missing one is reported next to it, so "we took nothing" and "we
 *     cannot price what we took" are never confused with each other.
 *
 * All windows are UTC month boundaries, and every consumer says so in the
 * copy it prints. Nairobi is UTC+3, so a report for "August" covers 03:00 on
 * 1 August to 03:00 on 1 September local time. Reporting a consistent,
 * stated boundary beats a friendlier one that drifts from the analytics
 * dashboard, which counts raw UTC timestamps.
 */
import { prisma } from '$lib/db.js';
import { Prisma } from '@prisma/client';
import { isMissingRelation } from '$lib/server/contacts';
import { posts, type Post } from '$lib/content';

/* ────────────────────────────── month arithmetic ────────────────────────── */

export type Period = {
	/** `2026-08`. The idempotency key every scheduled job is filed under. */
	key: string;
	/** `August 2026`. */
	label: string;
	/** Inclusive start, 00:00:00 UTC on the first. */
	start: Date;
	/** Exclusive end, 00:00:00 UTC on the first of the next month. */
	end: Date;
};

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

function makePeriod(year: number, monthIndex: number): Period {
	const start = new Date(Date.UTC(year, monthIndex, 1));
	const end = new Date(Date.UTC(year, monthIndex + 1, 1));
	const key = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`;
	return {
		key,
		label: `${MONTHS[start.getUTCMonth()]} ${start.getUTCFullYear()}`,
		start,
		end
	};
}

/** The UTC month containing `date`. */
export function monthOf(date: Date): Period {
	return makePeriod(date.getUTCFullYear(), date.getUTCMonth());
}

/** The UTC month before the one containing `date`. */
export function previousMonthOf(date: Date): Period {
	return makePeriod(date.getUTCFullYear(), date.getUTCMonth() - 1);
}

/** The month before this one. */
export function priorPeriod(period: Period): Period {
	return makePeriod(period.start.getUTCFullYear(), period.start.getUTCMonth() - 1);
}

/** Parse a `YYYY-MM` key. Returns null for anything that is not one. */
export function periodFromKey(key: string | null | undefined): Period | null {
	const match = /^(\d{4})-(\d{2})$/.exec(String(key ?? '').trim());
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	if (month < 1 || month > 12) return null;
	return makePeriod(year, month - 1);
}

/** The last `count` complete-or-current months, newest first. */
export function recentPeriods(count: number, now: Date = new Date()): Period[] {
	const out: Period[] = [];
	for (let i = 0; i < count; i++) {
		out.push(makePeriod(now.getUTCFullYear(), now.getUTCMonth() - i));
	}
	return out;
}

/* ─────────────────────────────── section wrapper ────────────────────────── */

/**
 * One block of the report. `data` or an explanation, never both, never neither.
 * A section that cannot be read is printed as unavailable rather than as zeros,
 * and a section that is unavailable never counts towards "something happened".
 */
export type Section<T> = { data: T | null; unavailable: string | null };

async function section<T>(what: string, run: () => Promise<T>): Promise<Section<T>> {
	try {
		return { data: await run(), unavailable: null };
	} catch (error) {
		console.error(`reports: ${what} could not be read:`, error);
		return {
			data: null,
			unavailable: isMissingRelation(error)
				? `${what}: the table behind this is not in the database yet, so it is left out rather than reported as nothing.`
				: `${what}: this could not be read from the database, so it is left out rather than reported as nothing.`
		};
	}
}

/* ──────────────────────────────── the sections ──────────────────────────── */

export type RevenueStats = {
	/** Donations that settled inside the window. */
	successful: number;
	/** Sum of the canonical USD figure. Null when no row carried one. */
	usdTotal: number | null;
	/** Settled donations with no USD figure recorded, so nothing is silently dropped. */
	usdMissing: number;
	/** What was actually charged, by the currency it was charged in. */
	byCurrency: { currency: string; count: number; total: number }[];
	/** Of the settled donations, how many were a recurring charge. */
	recurring: number;
	/** The same USD total for the month before, for an honest comparison. */
	previousUsdTotal: number | null;
	/** Donations that were started and did not settle. */
	unsettled: number;
};

export type SponsorSummary = {
	displayName: string;
	tier: string;
	cadence: string;
	visibility: string;
	startedAt: Date;
};

export type SponsorStats = {
	/** Sponsors whose relationship was live at the close of the window. */
	activeAtEnd: number;
	newInMonth: SponsorSummary[];
	cancelledInMonth: number;
	/** One-time listings whose window ran out inside the month. */
	expiredInMonth: number;
	activeRecurring: number;
	/** Sum of amountUsd over ACTIVE subscriptions. Null when there are none. */
	mrrUsd: number | null;
};

export type TrafficStats = {
	views: number;
	visitors: number;
	sessions: number;
	previousViews: number;
	previousVisitors: number;
	topPages: { path: string; views: number }[];
	topReferrers: { referrer: string; views: number }[];
	topCountries: { country: string; views: number }[];
};

export type RequestStats = {
	total: number;
	byStatus: { status: string; count: number }[];
	titles: string[];
};

export type AudienceStats = {
	/** Active subscribers as of now, not as of the end of the window. */
	activeSubscribers: number;
	/** Joins and departures logged inside the window, from ActivityLog. */
	joined: number;
	left: number;
	/** True when ActivityLog holds no newsletter entries at all: see below. */
	movementUnrecorded: boolean;
};

export type EmailStats = {
	queued: number;
	byEvent: { type: string; count: number }[];
};

export type BlogStats = {
	publishedInMonth: Post[];
	latest: Post | null;
	/** Whole days between the most recent post and `asOf`. Null with no posts. */
	daysSinceLatest: number | null;
};

export type MonthlyStats = {
	period: Period;
	previous: Period;
	generatedAt: Date;
	revenue: Section<RevenueStats>;
	sponsors: Section<SponsorStats>;
	traffic: Section<TrafficStats>;
	requests: Section<RequestStats>;
	audience: Section<AudienceStats>;
	email: Section<EmailStats>;
	blog: BlogStats;
};

/* ──────────────────────────────── the queries ───────────────────────────── */

async function revenueStats(period: Period, previous: Period): Promise<RevenueStats> {
	const window = { gte: period.start, lt: period.end };
	const settled = { status: 'SUCCESS' as const, createdAt: window };

	const [totals, missing, currencies, recurring, previousTotals, unsettled] = await Promise.all([
		prisma.donation.aggregate({ where: settled, _sum: { usdAmount: true }, _count: { _all: true } }),
		prisma.donation.count({ where: { ...settled, usdAmount: null } }),
		prisma.donation.groupBy({
			by: ['currency'],
			where: settled,
			_count: { _all: true },
			_sum: { amount: true }
		}),
		prisma.donation.count({ where: { ...settled, cadence: 'RECURRING' } }),
		prisma.donation.aggregate({
			where: { status: 'SUCCESS', createdAt: { gte: previous.start, lt: previous.end } },
			_sum: { usdAmount: true }
		}),
		prisma.donation.count({ where: { createdAt: window, status: { not: 'SUCCESS' } } })
	]);

	return {
		successful: totals._count._all,
		usdTotal: totals._sum.usdAmount ?? null,
		usdMissing: missing,
		byCurrency: currencies
			.map((row) => ({
				currency: row.currency,
				count: row._count._all,
				total: row._sum.amount ?? 0
			}))
			.sort((a, b) => b.total - a.total),
		recurring,
		previousUsdTotal: previousTotals._sum.usdAmount ?? null,
		unsettled
	};
}

async function sponsorStats(period: Period): Promise<SponsorStats> {
	const window = { gte: period.start, lt: period.end };

	// "Live at the close of the month": started before the month ended, not
	// cancelled before it ended, and not expired before it ended. Asked as of
	// period.end rather than now, so a report about August cannot be changed by
	// something that happened in September.
	const activeAtEnd = prisma.sponsor.count({
		where: {
			startedAt: { lt: period.end },
			AND: [
				{ OR: [{ cancelledAt: null }, { cancelledAt: { gte: period.end } }] },
				{ OR: [{ expiresAt: null }, { expiresAt: { gte: period.end } }] }
			]
		}
	});

	const [active, joined, cancelled, expired, recurring, mrr] = await Promise.all([
		activeAtEnd,
		prisma.sponsor.findMany({
			where: { startedAt: window },
			orderBy: { startedAt: 'asc' },
			take: 50,
			select: {
				displayName: true,
				tier: true,
				cadence: true,
				visibility: true,
				startedAt: true
			}
		}),
		prisma.sponsor.count({ where: { cancelledAt: window } }),
		prisma.sponsor.count({ where: { expiresAt: window, cancelledAt: null } }),
		prisma.subscription.count({ where: { status: 'ACTIVE' } }),
		prisma.subscription.aggregate({ where: { status: 'ACTIVE' }, _sum: { amountUsd: true } })
	]);

	return {
		activeAtEnd: active,
		newInMonth: joined,
		cancelledInMonth: cancelled,
		expiredInMonth: expired,
		activeRecurring: recurring,
		mrrUsd: mrr._sum.amountUsd ?? null
	};
}

async function trafficStats(period: Period, previous: Period): Promise<TrafficStats> {
	const where = { createdAt: { gte: period.start, lt: period.end } };

	// The totals are raw SQL for the same reason the analytics dashboard uses it:
	// COUNT(DISTINCT ...) is not expressible through Prisma's groupBy.
	const [totals, previousTotals, pages, referrers, countries] = await Promise.all([
		prisma.$queryRaw<{ views: number; visitors: number; sessions: number }[]>(Prisma.sql`
			SELECT COUNT(*)::int AS views,
			       COUNT(DISTINCT "visitorHash")::int AS visitors,
			       COUNT(DISTINCT "sessionId")::int AS sessions
			  FROM "PageView"
			 WHERE "createdAt" >= ${period.start} AND "createdAt" < ${period.end}
		`),
		prisma.$queryRaw<{ views: number; visitors: number }[]>(Prisma.sql`
			SELECT COUNT(*)::int AS views,
			       COUNT(DISTINCT "visitorHash")::int AS visitors
			  FROM "PageView"
			 WHERE "createdAt" >= ${previous.start} AND "createdAt" < ${previous.end}
		`),
		prisma.pageView.groupBy({
			by: ['path'],
			where,
			_count: { _all: true },
			orderBy: { _count: { path: 'desc' } },
			take: 8
		}),
		prisma.pageView.groupBy({
			by: ['referrer'],
			where: { ...where, referrer: { not: null } },
			_count: { _all: true },
			orderBy: { _count: { referrer: 'desc' } },
			take: 6
		}),
		prisma.pageView.groupBy({
			by: ['country'],
			where: { ...where, country: { not: null } },
			_count: { _all: true },
			orderBy: { _count: { country: 'desc' } },
			take: 6
		})
	]);

	return {
		views: totals[0]?.views ?? 0,
		visitors: totals[0]?.visitors ?? 0,
		sessions: totals[0]?.sessions ?? 0,
		previousViews: previousTotals[0]?.views ?? 0,
		previousVisitors: previousTotals[0]?.visitors ?? 0,
		topPages: pages.map((row) => ({ path: row.path, views: row._count._all })),
		topReferrers: referrers.map((row) => ({
			referrer: row.referrer ?? 'unknown',
			views: row._count._all
		})),
		topCountries: countries.map((row) => ({
			country: row.country ?? 'unknown',
			views: row._count._all
		}))
	};
}

async function requestStats(period: Period): Promise<RequestStats> {
	const where = { createdAt: { gte: period.start, lt: period.end }, deletedAt: null };

	const [total, byStatus, recent] = await Promise.all([
		prisma.serviceRequest.count({ where }),
		prisma.serviceRequest.groupBy({ by: ['status'], where, _count: { _all: true } }),
		prisma.serviceRequest.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: 8,
			select: { projectTitle: true }
		})
	]);

	return {
		total,
		byStatus: byStatus
			.map((row) => ({ status: String(row.status), count: row._count._all }))
			.sort((a, b) => b.count - a.count),
		titles: recent.map((row) => row.projectTitle).filter(Boolean)
	};
}

async function audienceStats(period: Period): Promise<AudienceStats> {
	const window = { gte: period.start, lt: period.end };

	// Movement comes from ActivityLog, not from NewsletterSubscriber.updatedAt.
	// updatedAt moves for any reason at all, so counting rows by it would answer
	// a different question than the one being asked. The log records the two
	// events exactly, and `movementUnrecorded` admits when the log predates
	// nothing at all rather than presenting a bare zero as a finding.
	const [activeSubscribers, joined, left, anyLogged] = await Promise.all([
		prisma.newsletterSubscriber.count({ where: { isActive: true } }),
		prisma.activityLog.count({ where: { action: 'newsletter.subscribed', createdAt: window } }),
		prisma.activityLog.count({ where: { action: 'newsletter.unsubscribed', createdAt: window } }),
		prisma.activityLog.count({
			where: { action: { in: ['newsletter.subscribed', 'newsletter.unsubscribed'] } }
		})
	]);

	return {
		activeSubscribers,
		joined,
		left,
		movementUnrecorded: anyLogged === 0
	};
}

async function emailStats(period: Period): Promise<EmailStats> {
	const [queued, events] = await Promise.all([
		prisma.emailMessage.count({
			where: { createdAt: { gte: period.start, lt: period.end } }
		}),
		prisma.emailDeliveryEvent.groupBy({
			by: ['type'],
			where: { occurredAt: { gte: period.start, lt: period.end } },
			_count: { _all: true }
		})
	]);

	return {
		queued,
		byEvent: events
			.map((row) => ({ type: String(row.type), count: row._count._all }))
			.sort((a, b) => b.count - a.count)
	};
}

/* ─────────────────────────────────── blog ───────────────────────────────── */

const DAY_MS = 24 * 60 * 60 * 1000;

function postTime(post: Post): number {
	const time = Date.parse(post.date);
	return Number.isFinite(time) ? time : NaN;
}

/** Real posts, newest first, with anything undated dropped rather than guessed. */
export function datedPosts(): Post[] {
	return posts
		.filter((post) => Number.isFinite(postTime(post)))
		.sort((a, b) => postTime(b) - postTime(a));
}

/** What the blog looks like from `asOf`, straight out of the post frontmatter. */
export function blogStats(period: Period, asOf: Date = new Date()): BlogStats {
	const ordered = datedPosts();
	const latest = ordered[0] ?? null;
	const startMs = period.start.getTime();
	const endMs = period.end.getTime();

	return {
		publishedInMonth: ordered.filter((post) => {
			const time = postTime(post);
			return time >= startMs && time < endMs;
		}),
		latest,
		daysSinceLatest: latest
			? Math.max(0, Math.floor((asOf.getTime() - postTime(latest)) / DAY_MS))
			: null
	};
}

/* ────────────────────────────────── gather ──────────────────────────────── */

/** Every figure for one month. Sections fail independently. */
export async function gatherMonthlyStats(
	period: Period,
	asOf: Date = new Date()
): Promise<MonthlyStats> {
	const previous = priorPeriod(period);

	const [revenue, sponsors, traffic, requests, audience, email] = await Promise.all([
		section('Donations', () => revenueStats(period, previous)),
		section('Sponsorships', () => sponsorStats(period)),
		section('Traffic', () => trafficStats(period, previous)),
		section('Service requests', () => requestStats(period)),
		section('The subscriber list', () => audienceStats(period)),
		section('Email delivery', () => emailStats(period))
	]);

	return {
		period,
		previous,
		generatedAt: asOf,
		revenue,
		sponsors,
		traffic,
		requests,
		audience,
		email,
		blog: blogStats(period, asOf)
	};
}

/* ───────────────────────────────── substance ────────────────────────────── */

/**
 * What actually happened in the window, in plain words.
 *
 * An empty array means the month produced nothing at all, and the callers use
 * that to skip the send outright. A month with no revenue, no visitors, no
 * requests, no sponsor movement and no posts has no report in it, and mailing
 * a page of zeros to sponsors would be worse than mailing nothing: it would
 * dress an absence of data up as a finding.
 *
 * A section that could not be read never contributes: unreadable is not the
 * same as empty, and the caller is told separately when a section is missing.
 */
export function substanceOf(stats: MonthlyStats): string[] {
	const found: string[] = [];
	const revenue = stats.revenue.data;
	const sponsors = stats.sponsors.data;
	const traffic = stats.traffic.data;
	const requests = stats.requests.data;
	const audience = stats.audience.data;

	if (revenue && revenue.successful > 0) found.push('money came in');
	if (traffic && traffic.views > 0) found.push('the site had visitors');
	if (requests && requests.total > 0) found.push('service requests arrived');
	if (sponsors && (sponsors.newInMonth.length > 0 || sponsors.cancelledInMonth > 0)) {
		found.push('the sponsor list moved');
	}
	if (audience && (audience.joined > 0 || audience.left > 0)) {
		found.push('the subscriber list moved');
	}
	if (stats.blog.publishedInMonth.length > 0) found.push('posts were published');
	return found;
}

/** The sections that could not be read, for a footnote. */
export function unavailableSections(stats: MonthlyStats): string[] {
	return [
		stats.revenue.unavailable,
		stats.sponsors.unavailable,
		stats.traffic.unavailable,
		stats.requests.unavailable,
		stats.audience.unavailable,
		stats.email.unavailable
	].filter((note): note is string => Boolean(note));
}

/* ──────────────────────────────── formatting ────────────────────────────── */

/** `1,234`. */
export function num(value: number): string {
	return Number.isFinite(value) ? value.toLocaleString('en-US') : '0';
}

/** `USD 1,234.56`, or the honest blank when the figure was never recorded. */
export function money(amount: number | null, currency = 'USD'): string {
	if (amount === null || amount === undefined || !Number.isFinite(amount)) return 'not recorded';
	return `${currency.toUpperCase()} ${amount.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}

/**
 * `up 12% on July`, or a plain statement when a percentage would be a fiction.
 * A change from zero has no percentage, and saying so is more use than
 * printing an infinity or a made-up 100%.
 */
export function change(current: number, prior: number, priorLabel: string): string {
	if (prior === 0 && current === 0) return `the same as ${priorLabel}: nothing either month`;
	if (prior === 0) return `up from nothing in ${priorLabel}`;
	if (current === 0) return `down from ${num(prior)} in ${priorLabel}`;
	const delta = Math.round(((current - prior) / prior) * 100);
	if (delta === 0) return `level with ${priorLabel}`;
	return `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)}% on ${priorLabel}`;
}

/** `3 September 2026`, UTC. */
export function dayLabel(value: Date | string): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	try {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(date);
	} catch {
		return date.toISOString().slice(0, 10);
	}
}
