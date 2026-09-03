/**
 * Email delivery analytics.
 *
 * Two sources, joined on the provider's message id: EmailMessage is what this
 * site handed to Axene Mailer, EmailDeliveryEvent is what Axene reported back
 * over the webhook. Sending is not delivery, so the denominators come from the
 * outbound table and the numerators from the events.
 *
 * Every number here is aggregated inside Postgres. The time series, the totals
 * and the per-purpose breakdown are date_trunc / COUNT DISTINCT / FILTER
 * queries over a LATERAL unnest of the tag array; nothing does a findMany over
 * the event table to count it. The only rows that reach this process are the
 * recent hard failures and the last few opens and clicks, which are lists
 * rather than statistics.
 *
 * Counted per message, not per event: one recipient opening the same mail six
 * times is one open. That is the number a rate should be built on.
 *
 * The purpose of a message is its canonical tag from $lib/emailTags, which
 * every send site puts first in the tags array. Anything without one is
 * counted as "(unclassified)" rather than dropped.
 *
 * If the email tables have not been migrated yet the page says so plainly
 * instead of throwing a 500, and it never invents numbers: an empty database
 * renders an empty state.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '$lib/db.js';
import {
	EMAIL_PURPOSES,
	PURPOSE_TAGS,
	SENSITIVE_PURPOSE_TAGS,
	UNCLASSIFIED,
	purposeOf
} from '$lib/emailTags';
import {
	HOUR_MS,
	MIN_SAMPLE,
	RANGES,
	clickUrl,
	clientName,
	failureReason,
	rangeByKey,
	shortUrl,
	userAgent,
	type Unit
} from './shared';
import type { PageServerLoad } from './$types';

type SeriesPoint = { bucket: string; sent: number; delivered: number };

type TagRow = {
	tag: string;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	bounced: number;
};

/** One purpose, with every state the owner asked to see side by side. */
export type PurposeRow = {
	tag: string;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	bounced: number;
	complained: number;
	failed: number;
};

type EngagementRow = {
	id: string;
	recipient: string | null;
	purpose: string;
	url: string | null;
	urlLabel: string | null;
	client: string | null;
	occurredAt: string;
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

/**
 * Purposes in the order the vocabulary declares, then anything unrecognised,
 * then the unclassified bucket last. A purpose with no traffic in the range is
 * kept at zero on purpose: "no OTPs went out this week" is an answer.
 */
function orderPurposes(rows: Map<string, PurposeRow>): PurposeRow[] {
	const blank = (tag: string): PurposeRow => ({
		tag,
		sent: 0,
		delivered: 0,
		opened: 0,
		clicked: 0,
		bounced: 0,
		complained: 0,
		failed: 0
	});

	const known = EMAIL_PURPOSES.map((p) => rows.get(p.tag) ?? blank(p.tag));
	const extra = [...rows.values()]
		.filter((r) => r.tag !== UNCLASSIFIED && !PURPOSE_TAGS.includes(r.tag))
		.sort((a, b) => b.sent - a.sent);
	const unclassified = rows.get(UNCLASSIFIED);

	return [...known, ...extra, ...(unclassified ? [unclassified] : [])];
}

export const load: PageServerLoad = async ({ url }) => {
	const range = rangeByKey(url.searchParams.get('range'), RANGES);

	const now = new Date();
	// Every range on this page is bounded, so `hours` is never null here.
	const since = new Date(now.getTime() - (range.hours ?? 24 * 30) * HOUR_MS);
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
		purposes: [] as PurposeRow[],
		tags: [] as TagRow[],
		clicks: [] as EngagementRow[],
		opens: [] as EngagementRow[],
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
		// The canonical tag list, as SQL parameters. A constant from
		// $lib/emailTags, never anything a request can influence.
		const purposeList = Prisma.join([...PURPOSE_TAGS]);

		const [
			sentSeries,
			deliveredSeries,
			sent,
			eventRows,
			uncorrelatedRows,
			tagSent,
			tagEvents,
			purposeSent,
			purposeEvents
		] = await Promise.all([
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
					 LIMIT 20
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
				`),
			// How many of each purpose were handed to the provider. The LATERAL
			// picks the first canonical tag on the message, which is the one the
			// send site put there; everything else on the array is a facet.
			prisma.$queryRaw<{ purpose: string; sent: number }[]>(Prisma.sql`
					SELECT COALESCE(pu.tag, ${UNCLASSIFIED}) AS purpose, COUNT(*)::int AS sent
					  FROM "EmailMessage" m
					  LEFT JOIN LATERAL (
					        SELECT t AS tag
					          FROM unnest(m."tags") AS t
					         WHERE t IN (${purposeList})
					         LIMIT 1
					  ) pu ON true
					 WHERE m."createdAt" >= ${since}
					 GROUP BY 1
				`),
			// What happened to them. COUNT(DISTINCT "messageId") ignores nulls,
			// so uncorrelated events cannot inflate a purpose they were never
			// attributed to.
			prisma.$queryRaw<
				{
					purpose: string;
					delivered: number;
					opened: number;
					clicked: number;
					bounced: number;
					complained: number;
					failed: number;
				}[]
			>(Prisma.sql`
					SELECT COALESCE(pu.tag, ${UNCLASSIFIED}) AS purpose,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'DELIVERED'))::int  AS delivered,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'OPENED'))::int     AS opened,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'CLICKED'))::int    AS clicked,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'BOUNCED'))::int    AS bounced,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'COMPLAINED'))::int AS complained,
					       (COUNT(DISTINCT e."messageId") FILTER (WHERE e."type" = 'FAILED'))::int     AS failed
					  FROM "EmailDeliveryEvent" e
					  LEFT JOIN LATERAL (
					        SELECT t AS tag
					          FROM unnest(e."tags") AS t
					         WHERE t IN (${purposeList})
					         LIMIT 1
					  ) pu ON true
					 WHERE e."occurredAt" >= ${since}
					 GROUP BY 1
				`)
		]);

		// Bounded lists, not aggregates: the failures worth reading about, and
		// the most recent engagement with a link or a client attached.
		const [failureEvents, clickEvents, openEvents] = await Promise.all([
			prisma.emailDeliveryEvent.findMany({
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
			}),
			// Sensitive purposes are excluded from both lists at the query, not
			// filtered afterwards: a verification mail's engagement is nobody's
			// business and must not be one bug away from the screen.
			prisma.emailDeliveryEvent.findMany({
				where: {
					occurredAt: { gte: since },
					type: 'CLICKED',
					NOT: { tags: { hasSome: [...SENSITIVE_PURPOSE_TAGS] } }
				},
				orderBy: { occurredAt: 'desc' },
				take: 10,
				select: { id: true, recipient: true, tags: true, detail: true, occurredAt: true }
			}),
			prisma.emailDeliveryEvent.findMany({
				where: {
					occurredAt: { gte: since },
					type: 'OPENED',
					NOT: { tags: { hasSome: [...SENSITIVE_PURPOSE_TAGS] } }
				},
				orderBy: { occurredAt: 'desc' },
				take: 10,
				select: { id: true, recipient: true, tags: true, detail: true, occurredAt: true }
			})
		]);

		const failureMessageIds = failureEvents
			.map((e) => e.messageId)
			.filter((id): id is string => Boolean(id));

		const failureMessages = failureMessageIds.length
			? await prisma.emailMessage.findMany({
					where: { messageId: { in: failureMessageIds } },
					select: { messageId: true, subject: true, tags: true }
				})
			: [];
		// Keyed by message id, so a failed verification mail can be recognised
		// and have its subject withheld.
		const messageInfo = new Map(failureMessages.map((m) => [m.messageId, m]));

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

		const byPurpose = new Map<string, PurposeRow>();
		for (const row of purposeSent) {
			byPurpose.set(row.purpose, {
				tag: row.purpose,
				sent: row.sent,
				delivered: 0,
				opened: 0,
				clicked: 0,
				bounced: 0,
				complained: 0,
				failed: 0
			});
		}
		for (const row of purposeEvents) {
			const existing = byPurpose.get(row.purpose);
			const target: PurposeRow = existing ?? {
				tag: row.purpose,
				sent: 0,
				delivered: 0,
				opened: 0,
				clicked: 0,
				bounced: 0,
				complained: 0,
				failed: 0
			};
			target.delivered = row.delivered;
			target.opened = row.opened;
			target.clicked = row.clicked;
			target.bounced = row.bounced;
			target.complained = row.complained;
			target.failed = row.failed;
			byPurpose.set(row.purpose, target);
		}

		const engagement = (
			rows: { id: string; recipient: string | null; tags: string[]; detail: unknown; occurredAt: Date }[]
		): EngagementRow[] =>
			rows.map((e) => {
				const url = clickUrl(e.detail);
				return {
					id: e.id,
					recipient: e.recipient,
					purpose: purposeOf(e.tags),
					url,
					urlLabel: url ? shortUrl(url) : null,
					client: clientName(userAgent(e.detail)),
					occurredAt: e.occurredAt.toISOString()
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
			purposes: orderPurposes(byPurpose),
			tags,
			clicks: engagement(clickEvents),
			opens: engagement(openEvents),
			failures: failureEvents.map((e) => {
				const info = e.messageId ? messageInfo.get(e.messageId) : undefined;
				const purpose = purposeOf(info?.tags ?? []);
				const sensitive = SENSITIVE_PURPOSE_TAGS.includes(purpose);
				const reason = failureReason(e.detail);
				return {
					id: e.id,
					type: e.type as string,
					recipient: e.recipient,
					// A verification mail's subject carries no code today, but the
					// per-purpose rule is the one that survives a template edit.
					subject: sensitive ? null : (info?.subject ?? null),
					reason: reason && sensitive ? null : reason,
					occurredAt: e.occurredAt.toISOString()
				};
			}),
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
