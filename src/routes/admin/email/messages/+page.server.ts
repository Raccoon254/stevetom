/**
 * The message log: every individual email this site handed to Axene Mailer,
 * newest first, with what happened to each one afterwards.
 *
 * This is the screen that answers "did this person get my email", so the
 * recipient search is the point of it. The search is a substring match on the
 * stored address, which is written lowercased at send time, so the query is
 * lowercased to match rather than asking Postgres for a case-insensitive scan.
 *
 * Counting and paging happen in Postgres (count + take/skip). The only rows
 * that reach this process are the forty messages on the page and the delivery
 * events belonging to them, which is a list, not a statistic.
 *
 * ── What is on the screen, and what is deliberately not ───────────────────
 * EmailMessage stores the provider's message id, the recipient, the subject,
 * the from address, the tags and a queue-time status. It does not store the
 * body, so no email body can appear here. The subject is still withheld for
 * purposes marked sensitive in $lib/emailTags (verification codes), together
 * with every provider detail string on their events: today's verification
 * subject carries no code, but a rule tied to the purpose survives a template
 * edit that a rule tied to today's wording would not.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '$lib/db.js';
import {
	EMAIL_PURPOSES,
	PURPOSE_TAGS,
	UNCLASSIFIED,
	purposeMeta,
	purposeOf
} from '$lib/emailTags';
import {
	ALL_TIME,
	RANGES,
	clickUrl,
	clientName,
	failureReason,
	messageState,
	rangeByKey,
	redactCodes,
	shortUrl,
	sinceFor,
	userAgent
} from '../shared';
import type { PageServerLoad } from './$types';

const PER_PAGE = 40;

/** How many delivery events one page of messages may pull back. */
const EVENT_CAP = 500;

const LOG_RANGES = [...RANGES, ALL_TIME];

/** One message as the page renders it. */
export type LogRow = {
	id: string;
	recipient: string;
	subject: string | null;
	subjectWithheld: boolean;
	fromEmail: string | null;
	purpose: string;
	purposeLabel: string;
	audience: 'outbound' | 'internal';
	facets: string[];
	state: string;
	sentAt: string;
	timeline: TimelineEntry[];
};

type TimelineEntry = {
	id: string;
	type: string;
	occurredAt: string;
	note: string | null;
	url: string | null;
	urlLabel: string | null;
	client: string | null;
};

export const load: PageServerLoad = async ({ url }) => {
	const range = rangeByKey(url.searchParams.get('range'), LOG_RANGES);
	const since = sinceFor(range);
	const search = (url.searchParams.get('q') ?? '').trim().slice(0, 160);

	// Only a tag from the canonical vocabulary, or the unclassified bucket, can
	// reach the query. Anything else is treated as no filter at all.
	const requestedPurpose = url.searchParams.get('purpose') ?? '';
	const purpose =
		requestedPurpose === UNCLASSIFIED || PURPOSE_TAGS.includes(requestedPurpose)
			? requestedPurpose
			: '';

	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	const filters = {
		ranges: LOG_RANGES.map(({ key, label }) => ({ key, label })),
		rangeKey: range.key,
		rangeLabel: range.label,
		purposes: EMAIL_PURPOSES.map(({ tag, label }) => ({ tag, label })),
		purpose,
		unclassified: UNCLASSIFIED,
		search
	};

	const empty = {
		...filters,
		ready: true,
		error: null as string | null,
		rows: [] as LogRow[],
		total: 0,
		page: 1,
		pages: 1,
		eventsTruncated: false
	};

	const where: Prisma.EmailMessageWhereInput = {
		...(since ? { createdAt: { gte: since } } : {}),
		...(search ? { recipient: { contains: search.toLowerCase() } } : {}),
		...(purpose && purpose !== UNCLASSIFIED ? { tags: { has: purpose } } : {}),
		// "Unclassified" is the absence of every canonical tag, not a tag of
		// its own: nothing is ever written with that string.
		...(purpose === UNCLASSIFIED ? { NOT: { tags: { hasSome: [...PURPOSE_TAGS] } } } : {})
	};

	try {
		const total = await prisma.emailMessage.count({ where });
		const pages = Math.max(1, Math.ceil(total / PER_PAGE));
		const current = Math.min(page, pages);

		const messages = await prisma.emailMessage.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: PER_PAGE,
			skip: (current - 1) * PER_PAGE,
			select: {
				id: true,
				messageId: true,
				recipient: true,
				subject: true,
				fromEmail: true,
				tags: true,
				createdAt: true
			}
		});

		const ids = messages.map((m) => m.messageId);
		const events = ids.length
			? await prisma.emailDeliveryEvent.findMany({
					where: { messageId: { in: ids } },
					orderBy: { occurredAt: 'asc' },
					take: EVENT_CAP,
					select: { id: true, messageId: true, type: true, occurredAt: true, detail: true }
				})
			: [];

		const byMessage = new Map<string, typeof events>();
		for (const event of events) {
			if (!event.messageId) continue;
			const list = byMessage.get(event.messageId);
			if (list) list.push(event);
			else byMessage.set(event.messageId, [event]);
		}

		const rows: LogRow[] = messages.map((message) => {
			const purposeTag = purposeOf(message.tags);
			const meta = purposeMeta(purposeTag);
			const own = byMessage.get(message.messageId) ?? [];

			const timeline: TimelineEntry[] = own.map((event) => {
				const reason = failureReason(event.detail);
				const url = meta.sensitive ? null : clickUrl(event.detail);
				return {
					id: event.id,
					type: event.type as string,
					occurredAt: event.occurredAt.toISOString(),
					// A bounce response can quote the original message. Redacted
					// rather than dropped, so the reason is still readable.
					note: reason ? (meta.sensitive ? redactCodes(reason) : reason) : null,
					url,
					urlLabel: url ? shortUrl(url) : null,
					client: meta.sensitive ? null : clientName(userAgent(event.detail))
				};
			});

			return {
				id: message.id,
				recipient: message.recipient,
				// Withheld, not missing: the page says so where it would have gone.
				subject: meta.sensitive ? null : message.subject,
				subjectWithheld: meta.sensitive,
				fromEmail: message.fromEmail,
				purpose: purposeTag,
				purposeLabel: meta.label,
				audience: meta.audience,
				// The facets a send carries alongside its purpose, all of them
				// values this codebase wrote itself.
				facets: message.tags.filter((tag) => tag !== purposeTag),
				state: messageState(timeline.map((entry) => entry.type)),
				sentAt: message.createdAt.toISOString(),
				timeline
			};
		});

		return {
			...empty,
			rows,
			total,
			page: current,
			pages,
			eventsTruncated: events.length === EVENT_CAP
		};
	} catch (error) {
		// Almost certainly an un-migrated database. Say so instead of 500ing.
		console.error('email message log load failed:', error);
		return {
			...empty,
			ready: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
