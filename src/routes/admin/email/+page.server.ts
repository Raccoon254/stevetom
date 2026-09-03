/**
 * Email delivery analytics.
 *
 * Two sources, joined on the provider's message id: EmailMessage is what this
 * site handed to Axene Mailer, EmailDeliveryEvent is what Axene reported back
 * over the webhook. Sending is not delivery, so the denominators come from the
 * outbound table and the numerators from the events.
 *
 * Every number here is aggregated inside Postgres. The time series, the totals
 * and the per-tag breakdown are date_trunc / COUNT DISTINCT / FILTER queries;
 * nothing does a findMany over the event table. The only rows that reach this
 * process are the twenty-five most recent hard failures, which are a list
 * rather than a statistic.
 *
 * Counted per message, not per event: one recipient opening the same mail six
 * times is one open. That is the number a rate should be built on.
 *
 * If the email tables have not been migrated yet the page says so plainly
 * instead of throwing a 500, and it never invents numbers: an empty database
 * renders an empty state.
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
 * Below this many messages a percentage is noise dressed up as a fact: two
 * emails and one open is not a 50% open rate. Under the threshold the page
 * shows the raw counts and suppresses the percentage entirely.
 */
const MIN_SAMPLE = 50;

type SeriesPoint = { bucket: string; sent: number; delivered: number };
type TagRow = {
	tag: string;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	bounced: number;
};

/** Continuous buckets, so a quiet day shows as a gap in the chart, not a skip. */
function fillSeries(
	sentRows: { bucket: Date; n: number }[],
	deliveredRows: { bucket: Date; n: number }[],
	since: Date,
	unit: Unit
): SeriesPoint[] {
	const step = unit === 'hour' ? HOUR_MS : unit === 'day' ? 24 * HOUR_MS : 7 * 24 * HOUR_MS;
	const sent = new Map(sentRows.map((r) => [new Date(r.bucket).getTime(), r.n]));
	const delivered = new Map(deliveredRows.map((r) => [new Date(r.bucket).getTime(), r.n]));

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
		out.push({
			bucket: new Date(t).toISOString(),
			sent: sent.get(t) ?? 0,
			delivered: delivered.get(t) ?? 0
		});
	}
	return out;
}

/** Best line we can offer about why a message failed, from the provider blob. */
function failureReason(detail: unknown): string | null {
	if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return null;
	const d = detail as Record<string, unknown>;
	for (const key of ['response', 'error', 'reason', 'dsn', 'feedback_type']) {
		const v = d[key];
		if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 240);
	}
	return null;
}

export const load: PageServerLoad = async ({ url }) => {
	const requested = url.searchParams.get('range') ?? '30d';
	const range = RANGES.find((r) => r.key === requested) ?? RANGES[2];

	const now = new Date();
	const since = new Date(now.getTime() - range.hours * HOUR_MS);
	const ranges = RANGES.map(({ key, label }) => ({ key, label }));

	const empty = {
		rangeKey: range.key,
		rangeLabel: range.label,
		unit: range.unit,
		since: since.toISOString(),
		ranges,
		minSample: MIN_SAMPLE,
		sent: 0,
		counts: {} as Record<string, { messages: number; events: number }>,
		uncorrelated: 0,
		series: [] as SeriesPoint[],
		tags: [] as TagRow[],
		failures: [] as {
			id: string;
			type: string;
			recipient: string | null;
			subject: string | null;
			reason: string | null;
			occurredAt: string;
		}[],
		lastEventAt: null as string | null,
		everReceived: false
	};

	try {
		const unit = Prisma.raw(`'${range.unit}'`); // from the whitelist above, never user input

		const [sentSeries, deliveredSeries, sent, eventRows, uncorrelatedRows, tagSent, tagEvents] =
			await Promise.all([
				prisma.$queryRaw<{ bucket: Date; n: number }[]>(Prisma.sql`
					SELECT date_trunc(${unit}, "createdAt") AS bucket, COUNT(*)::int AS n
					  FROM "EmailMessage"
					 WHERE "createdAt" >= ${since}
					 GROUP BY 1
					 ORDER BY 1
				`),
				prisma.$queryRaw<{ bucket: Date; n: number }[]>(Prisma.sql`
					SELECT date_trunc(${unit}, "occurredAt") AS bucket,
					       COUNT(DISTINCT "messageId")::int AS n
					  FROM "EmailDeliveryEvent"
					 WHERE "occurredAt" >= ${since} AND "type" = 'DELIVERED'
					 GROUP BY 1
					 ORDER BY 1
				`),
				prisma.emailMessage.count({ where: { createdAt: { gte: since } } }),
				// One row per event type: how many distinct messages reached that
				// state, and how many raw events arrived. Opens and clicks repeat,
				// so the two differ and only the first belongs in a rate.
				prisma.$queryRaw<{ type: string; messages: number; events: number }[]>(Prisma.sql`
					SELECT "type"::text AS type,
					       COUNT(DISTINCT "messageId")::int AS messages,
					       COUNT(*)::int AS events
					  FROM "EmailDeliveryEvent"
					 WHERE "occurredAt" >= ${since}
					 GROUP BY 1
				`),
				// Events we could not tie to a send: reported honestly rather than
				// folded into a rate whose denominator does not contain them.
				prisma.$queryRaw<{ n: number }[]>(Prisma.sql`
					SELECT COUNT(*)::int AS n
					  FROM "EmailDeliveryEvent"
					 WHERE "occurredAt" >= ${since} AND "messageId" IS NULL
				`),
				// Tags are an array column, so the breakdown unnests in Postgres.
				// Messages sent without tags become one honest "(untagged)" row
				// instead of vanishing from a breakdown that claims to be complete.
				prisma.$queryRaw<{ tag: string; sent: number }[]>(Prisma.sql`
					SELECT t AS tag, COUNT(*)::int AS sent
					  FROM "EmailMessage" m,
					       LATERAL unnest(
					         CASE WHEN cardinality(m."tags") = 0
					              THEN ARRAY['(untagged)']
					              ELSE m."tags" END
					       ) AS t
					 WHERE m."createdAt" >= ${since}
					 GROUP BY 1
					 ORDER BY 2 DESC
					 LIMIT 12
				`),
				prisma.$queryRaw<
					{ tag: string; delivered: number; opened: number; clicked: number; bounced: number }[]
				>(Prisma.sql`
					SELECT t AS tag,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'DELIVERED'))::int AS delivered,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'OPENED'))::int    AS opened,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'CLICKED'))::int   AS clicked,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'BOUNCED'))::int   AS bounced
					  FROM "EmailDeliveryEvent" e,
					       LATERAL unnest(
					         CASE WHEN cardinality(e."tags") = 0
					              THEN ARRAY['(untagged)']
					              ELSE e."tags" END
					       ) AS t
					 WHERE e."occurredAt" >= ${since}
					 GROUP BY 1
				`)
			]);

		// A bounded list, not an aggregate: the failures worth reading about.
		const failureEvents = await prisma.emailDeliveryEvent.findMany({
			where: {
				occurredAt: { gte: since },
				type: { in: ['BOUNCED', 'FAILED', 'COMPLAINED'] }
			},
			orderBy: { occurredAt: 'desc' },
			take: 25,
			select: {
				id: true,
				type: true,
				recipient: true,
				messageId: true,
				detail: true,
				occurredAt: true
			}
		});

		const failureMessageIds = failureEvents
			.map((e) => e.messageId)
			.filter((id): id is string => Boolean(id));

		const subjects = failureMessageIds.length
			? await prisma.emailMessage.findMany({
					where: { messageId: { in: failureMessageIds } },
					select: { messageId: true, subject: true }
				})
			: [];
		const subjectFor = new Map(subjects.map((m) => [m.messageId, m.subject]));

		// Whether the webhook has ever fired at all, which is a different
		// question from whether anything happened in this range.
		const lastEvent = await prisma.emailDeliveryEvent.findFirst({
			orderBy: { createdAt: 'desc' },
			select: { createdAt: true }
		});

		const counts: Record<string, { messages: number; events: number }> = {};
		for (const row of eventRows) {
			counts[row.type] = { messages: row.messages, events: row.events };
		}

		const tagEventsByTag = new Map(tagEvents.map((r) => [r.tag, r]));
		const tags: TagRow[] = tagSent.map((row) => {
			const e = tagEventsByTag.get(row.tag);
			return {
				tag: row.tag,
				sent: row.sent,
				delivered: e?.delivered ?? 0,
				opened: e?.opened ?? 0,
				clicked: e?.clicked ?? 0,
				bounced: e?.bounced ?? 0
			};
		});

		return {
			...empty,
			ready: true,
			error: null as string | null,
			sent,
			counts,
			uncorrelated: uncorrelatedRows[0]?.n ?? 0,
			series: fillSeries(sentSeries, deliveredSeries, since, range.unit),
			tags,
			failures: failureEvents.map((e) => ({
				id: e.id,
				type: e.type as string,
				recipient: e.recipient,
				subject: e.messageId ? (subjectFor.get(e.messageId) ?? null) : null,
				reason: failureReason(e.detail),
				occurredAt: e.occurredAt.toISOString()
			})),
			lastEventAt: lastEvent?.createdAt.toISOString() ?? null,
			everReceived: Boolean(lastEvent)
		};
	} catch (error) {
		// Overwhelmingly likely to be an un-migrated database. Say so, rather
		// than throwing a 500 at the admin.
		console.error('email analytics load failed:', error);
		return {
			...empty,
			ready: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
