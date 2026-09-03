/**
 * The unified contact view.
 *
 * One person can be a newsletter subscriber, a donor, a sponsor and a service
 * client all at once, in four tables that share nothing but an email address.
 * This module folds them into one row per lowercased address.
 *
 * The fold happens in Postgres, never in Node. Every query here is one SQL
 * statement built from the same CTE: four per-source aggregates, a UNION of the
 * addresses they contain, and a LEFT JOIN back onto that key. Loading four
 * tables into memory to group them by email would work at today's size and
 * quietly stop working later, and paging or counting would be a lie.
 *
 * The four sources are optional. This repository has several migrations in
 * flight, so a database can legitimately be missing Sponsor (or any other
 * source) while the model exists in schema.prisma. Rather than fail, the CTE is
 * built from the tables that are actually there and the missing ones become
 * stubs that select no rows, so the page still works and reports which sources
 * it could not read.
 *
 * Nothing in here invents a fact. An address with no donations reports zero,
 * not "unknown", and a source that is missing is named as missing rather than
 * quietly counted as empty.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '$lib/db.js';

export type SegmentKey =
	| 'all'
	| 'subscribers'
	| 'sponsors'
	| 'active_sponsors'
	| 'donors'
	| 'clients'
	| 'unsubscribed';

/** The four audiences a segment can be drawn from. */
export type ContactSourceKey = 'subscribers' | 'sponsors' | 'donations' | 'requests';

export type ContactSources = {
	subscribers: boolean;
	sponsors: boolean;
	donations: boolean;
	/**
	 * Donation."usdAmount" specifically. The table can be present without it: the
	 * canonical-USD columns arrive with the sponsorship migration. Without it
	 * there is no currency-safe way to total a donor, so the total is reported as
	 * unknown rather than as a wrong number or a fake zero.
	 */
	donationUsd: boolean;
	requests: boolean;
};

export type Segment = {
	key: SegmentKey;
	label: string;
	/** What the segment means, shown next to the recipient count. */
	description: string;
	/** False for segments that must never be used as a mailing list. */
	mailable: boolean;
	/** The source table this segment needs in order to hold anyone. */
	source: ContactSourceKey;
};

export const SEGMENTS: Segment[] = [
	{
		key: 'all',
		label: 'Everyone',
		description: 'Every contact the site knows about, from any source.',
		mailable: true,
		source: 'subscribers'
	},
	{
		key: 'subscribers',
		label: 'Newsletter subscribers',
		description: 'Subscribed and still active.',
		mailable: true,
		source: 'subscribers'
	},
	{
		key: 'sponsors',
		label: 'All sponsors',
		description: 'Everyone who has ever held a sponsorship, current or lapsed.',
		mailable: true,
		source: 'sponsors'
	},
	{
		key: 'active_sponsors',
		label: 'Active sponsors',
		description: 'Sponsorship not cancelled and not expired.',
		mailable: true,
		source: 'sponsors'
	},
	{
		key: 'donors',
		label: 'Past donors',
		description: 'At least one successful donation.',
		mailable: true,
		source: 'donations'
	},
	{
		key: 'clients',
		label: 'Service clients',
		description: 'Sent at least one service request that is not archived.',
		mailable: true,
		source: 'requests'
	},
	{
		key: 'unsubscribed',
		label: 'Unsubscribed',
		description: 'Opted out of the newsletter. Never mailed in bulk.',
		mailable: false,
		source: 'subscribers'
	}
];

export function segmentByKey(key: string | null | undefined): Segment | null {
	return SEGMENTS.find((s) => s.key === key) ?? null;
}

export type ContactRow = {
	email: string;
	name: string | null;
	org: string | null;
	is_subscriber: boolean;
	subscribed: boolean;
	opted_out: boolean;
	is_sponsor: boolean;
	sponsor_active: boolean;
	sponsor_tier: string | null;
	sponsor_slug: string | null;
	sponsor_usd: number;
	donation_count: number;
	/** Null when the donor has donations but the USD column is not there yet. */
	total_usd: number | null;
	request_count: number;
	last_activity: Date | null;
};

/* --------------------------- source availability --------------------------- */

export const SOURCE_LABEL: Record<ContactSourceKey, string> = {
	subscribers: 'newsletter subscribers',
	sponsors: 'sponsors',
	donations: 'donations',
	requests: 'service requests'
};

let sourceCache: { at: number; value: ContactSources } | null = null;
const SOURCE_TTL_MS = 60_000;

/**
 * Which of the four source tables this database actually has. Cached briefly:
 * it changes only when a migration runs, and asking on every query would add a
 * round trip to every page load.
 */
export async function contactSources(): Promise<ContactSources> {
	if (sourceCache && Date.now() - sourceCache.at < SOURCE_TTL_MS) return sourceCache.value;
	const rows = await prisma.$queryRaw<
		{ sub: boolean; spo: boolean; don: boolean; don_usd: boolean; req: boolean }[]
	>(Prisma.sql`
		SELECT to_regclass('public."NewsletterSubscriber"') IS NOT NULL AS sub,
		       to_regclass('public."Sponsor"') IS NOT NULL AS spo,
		       to_regclass('public."Donation"') IS NOT NULL AS don,
		       EXISTS (
		         SELECT 1 FROM information_schema.columns
		          WHERE table_schema = 'public'
		            AND table_name = 'Donation'
		            AND column_name = 'usdAmount'
		       ) AS don_usd,
		       to_regclass('public."ServiceRequest"') IS NOT NULL AS req
	`);
	const value: ContactSources = {
		subscribers: rows[0]?.sub ?? false,
		sponsors: rows[0]?.spo ?? false,
		donations: rows[0]?.don ?? false,
		donationUsd: rows[0]?.don_usd ?? false,
		requests: rows[0]?.req ?? false
	};
	sourceCache = { at: Date.now(), value };
	return value;
}

/**
 * Whether a segment can be resolved at all here. "Everyone" only needs one of
 * the four sources; the rest need their own.
 */
export function segmentAvailable(segment: Segment, sources: ContactSources): boolean {
	if (segment.key === 'all') {
		return (Object.keys(SOURCE_LABEL) as ContactSourceKey[]).some((key) => sources[key]);
	}
	return sources[segment.source];
}

/** Human names of the sources this database cannot read, for the UI to say so. */
export function missingSources(sources: ContactSources): string[] {
	return (Object.keys(SOURCE_LABEL) as ContactSourceKey[])
		.filter((key) => !sources[key])
		.map((key) => SOURCE_LABEL[key]);
}

/* -------------------------------- the fold -------------------------------- */

/**
 * The shared fold. Every query below selects from `contacts`.
 *
 * Enum columns are compared as text so the SQL does not have to name a Postgres
 * enum type that a future migration might rename. `greatest()` in Postgres
 * ignores nulls, which is what makes last_activity work for a contact who only
 * exists in one of the four tables. A missing table becomes a stub selecting no
 * rows, so the shape of every query below never changes.
 */
function contactsCte(sources: ContactSources): Prisma.Sql {
	const sub = sources.subscribers
		? Prisma.sql`
  SELECT lower(trim("email")) AS email,
         bool_or("isActive") AS active,
         max("updatedAt") AS last_at
    FROM "NewsletterSubscriber"
   GROUP BY 1`
		: Prisma.sql`
  SELECT NULL::text AS email, NULL::boolean AS active, NULL::timestamp AS last_at WHERE false`;

	const spo = sources.sponsors
		? Prisma.sql`
  SELECT lower(trim("email")) AS email,
         (array_agg("displayName" ORDER BY "lifetimeUsd" DESC NULLS LAST, "createdAt" DESC))[1] AS display_name,
         (array_agg("orgName" ORDER BY "lifetimeUsd" DESC NULLS LAST, "createdAt" DESC))[1] AS org_name,
         (array_agg("tier"::text ORDER BY "lifetimeUsd" DESC NULLS LAST, "createdAt" DESC))[1] AS tier,
         (array_agg("slug" ORDER BY "lifetimeUsd" DESC NULLS LAST, "createdAt" DESC))[1] AS slug,
         sum(coalesce("lifetimeUsd", 0))::float8 AS lifetime_usd,
         bool_or("cancelledAt" IS NULL AND ("expiresAt" IS NULL OR "expiresAt" > now())) AS active,
         max("createdAt") AS last_at
    FROM "Sponsor"
   GROUP BY 1`
		: Prisma.sql`
  SELECT NULL::text AS email, NULL::text AS display_name, NULL::text AS org_name,
         NULL::text AS tier, NULL::text AS slug, NULL::float8 AS lifetime_usd,
         NULL::boolean AS active, NULL::timestamp AS last_at WHERE false`;

	// The USD total is only selected when the column exists; otherwise it is null,
	// which the outer query turns into "unknown" rather than into a zero.
	const donUsd = sources.donationUsd
		? Prisma.sql`sum(coalesce("usdAmount", 0))::float8`
		: Prisma.sql`NULL::float8`;
	const don = sources.donations
		? Prisma.sql`
  SELECT lower(trim("email")) AS email,
         count(*)::int AS donation_count,
         ${donUsd} AS total_usd,
         max("createdAt") AS last_at
    FROM "Donation"
   WHERE "status"::text = 'SUCCESS'
   GROUP BY 1`
		: Prisma.sql`
  SELECT NULL::text AS email, NULL::int AS donation_count,
         NULL::float8 AS total_usd, NULL::timestamp AS last_at WHERE false`;

	const req = sources.requests
		? Prisma.sql`
  SELECT lower(trim("clientEmail")) AS email,
         count(*)::int AS request_count,
         (array_agg("clientName" ORDER BY "createdAt" DESC))[1] AS client_name,
         (array_agg("company" ORDER BY "createdAt" DESC))[1] AS company,
         max("createdAt") AS last_at
    FROM "ServiceRequest"
   WHERE "deletedAt" IS NULL
   GROUP BY 1`
		: Prisma.sql`
  SELECT NULL::text AS email, NULL::int AS request_count, NULL::text AS client_name,
         NULL::text AS company, NULL::timestamp AS last_at WHERE false`;

	return Prisma.sql`
WITH sub AS (${sub}
),
spo AS (${spo}
),
don AS (${don}
),
req AS (${req}
),
people AS (
  SELECT email FROM sub
  UNION SELECT email FROM spo
  UNION SELECT email FROM don
  UNION SELECT email FROM req
),
contacts AS (
  SELECT p.email AS email,
         nullif(coalesce(spo.display_name, req.client_name), '') AS name,
         nullif(coalesce(spo.org_name, req.company), '') AS org,
         (sub.email IS NOT NULL) AS is_subscriber,
         coalesce(sub.active, false) AS subscribed,
         (sub.email IS NOT NULL AND sub.active IS NOT TRUE) AS opted_out,
         (spo.email IS NOT NULL) AS is_sponsor,
         coalesce(spo.active, false) AS sponsor_active,
         spo.tier AS sponsor_tier,
         spo.slug AS sponsor_slug,
         coalesce(spo.lifetime_usd, 0)::float8 AS sponsor_usd,
         coalesce(don.donation_count, 0) AS donation_count,
         (CASE WHEN don.email IS NULL THEN 0::float8 ELSE don.total_usd END) AS total_usd,
         coalesce(req.request_count, 0) AS request_count,
         greatest(sub.last_at, spo.last_at, don.last_at, req.last_at) AS last_activity
    FROM people p
    LEFT JOIN sub ON sub.email = p.email
    LEFT JOIN spo ON spo.email = p.email
    LEFT JOIN don ON don.email = p.email
    LEFT JOIN req ON req.email = p.email
   WHERE p.email IS NOT NULL
     AND p.email <> ''
     AND p.email LIKE '%_@_%'
)`;
}

/** The WHERE fragment for one segment, evaluated against the `contacts` CTE. */
function segmentClause(key: SegmentKey): Prisma.Sql {
	switch (key) {
		case 'subscribers':
			return Prisma.sql`subscribed IS TRUE`;
		case 'sponsors':
			return Prisma.sql`is_sponsor IS TRUE`;
		case 'active_sponsors':
			return Prisma.sql`sponsor_active IS TRUE`;
		case 'donors':
			return Prisma.sql`donation_count > 0`;
		case 'clients':
			return Prisma.sql`request_count > 0`;
		case 'unsubscribed':
			return Prisma.sql`opted_out IS TRUE`;
		case 'all':
		default:
			return Prisma.sql`TRUE`;
	}
}

function searchClause(search: string): Prisma.Sql | null {
	const q = search.trim().toLowerCase();
	if (!q) return null;
	const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
	return Prisma.sql`(email LIKE ${like}
		OR lower(coalesce(name, '')) LIKE ${like}
		OR lower(coalesce(org, '')) LIKE ${like})`;
}

function whereSql(parts: (Prisma.Sql | null)[]): Prisma.Sql {
	const kept = parts.filter((p): p is Prisma.Sql => p !== null);
	if (kept.length === 0) return Prisma.empty;
	return Prisma.sql`WHERE ${Prisma.join(kept, ' AND ')}`;
}

export type ContactQuery = {
	segment: SegmentKey;
	search?: string;
	page?: number;
	perPage?: number;
};

export type ContactPage = {
	rows: ContactRow[];
	total: number;
	page: number;
	perPage: number;
	pages: number;
	sources: ContactSources;
};

/** One page of contacts, plus the true total for that filter. */
export async function listContacts(query: ContactQuery): Promise<ContactPage> {
	const sources = await contactSources();
	const cte = contactsCte(sources);
	const perPage = Math.min(Math.max(query.perPage ?? 40, 1), 200);
	const page = Math.max(query.page ?? 1, 1);
	const where = whereSql([segmentClause(query.segment), searchClause(query.search ?? '')]);

	const [rows, totals] = await Promise.all([
		prisma.$queryRaw<ContactRow[]>(Prisma.sql`
			${cte}
			SELECT * FROM contacts
			${where}
			ORDER BY last_activity DESC NULLS LAST, email ASC
			LIMIT ${perPage} OFFSET ${(page - 1) * perPage}
		`),
		prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
			${cte}
			SELECT count(*)::int AS total FROM contacts ${where}
		`)
	]);

	const total = totals[0]?.total ?? 0;
	return {
		rows,
		total,
		page,
		perPage,
		pages: Math.max(1, Math.ceil(total / perPage)),
		sources
	};
}

/** How many contacts each segment holds. Used for the segment chips. */
export async function segmentCounts(): Promise<Record<SegmentKey, number>> {
	const cte = contactsCte(await contactSources());
	const rows = await prisma.$queryRaw<
		{
			all: number;
			subscribers: number;
			sponsors: number;
			active_sponsors: number;
			donors: number;
			clients: number;
			unsubscribed: number;
		}[]
	>(Prisma.sql`
		${cte}
		SELECT count(*)::int AS "all",
		       count(*) FILTER (WHERE subscribed IS TRUE)::int AS subscribers,
		       count(*) FILTER (WHERE is_sponsor IS TRUE)::int AS sponsors,
		       count(*) FILTER (WHERE sponsor_active IS TRUE)::int AS active_sponsors,
		       count(*) FILTER (WHERE donation_count > 0)::int AS donors,
		       count(*) FILTER (WHERE request_count > 0)::int AS clients,
		       count(*) FILTER (WHERE opted_out IS TRUE)::int AS unsubscribed
		  FROM contacts
	`);
	const r = rows[0];
	return {
		all: r?.all ?? 0,
		subscribers: r?.subscribers ?? 0,
		sponsors: r?.sponsors ?? 0,
		active_sponsors: r?.active_sponsors ?? 0,
		donors: r?.donors ?? 0,
		clients: r?.clients ?? 0,
		unsubscribed: r?.unsubscribed ?? 0
	};
}

/**
 * Mailable size of every segment in one statement, so the compose screen can
 * show real counts without six round trips. Opt-outs are excluded here exactly
 * as they are in resolveSegmentRecipients, so the number shown is the number
 * that would actually be mailed.
 */
export async function mailableSegmentCounts(): Promise<Record<string, number>> {
	const cte = contactsCte(await contactSources());
	const rows = await prisma.$queryRaw<
		{
			all: number;
			subscribers: number;
			sponsors: number;
			active_sponsors: number;
			donors: number;
			clients: number;
		}[]
	>(Prisma.sql`
		${cte}
		SELECT count(*)::int AS "all",
		       count(*) FILTER (WHERE subscribed IS TRUE)::int AS subscribers,
		       count(*) FILTER (WHERE is_sponsor IS TRUE)::int AS sponsors,
		       count(*) FILTER (WHERE sponsor_active IS TRUE)::int AS active_sponsors,
		       count(*) FILTER (WHERE donation_count > 0)::int AS donors,
		       count(*) FILTER (WHERE request_count > 0)::int AS clients
		  FROM contacts
		 WHERE opted_out IS NOT TRUE
	`);
	const r = rows[0];
	return {
		all: r?.all ?? 0,
		subscribers: r?.subscribers ?? 0,
		sponsors: r?.sponsors ?? 0,
		active_sponsors: r?.active_sponsors ?? 0,
		donors: r?.donors ?? 0,
		clients: r?.clients ?? 0
	};
}

/** The single folded row for one address, or null if nothing knows them. */
export async function getContact(email: string): Promise<ContactRow | null> {
	const addr = normaliseEmail(email);
	if (!addr) return null;
	const cte = contactsCte(await contactSources());
	const rows = await prisma.$queryRaw<ContactRow[]>(Prisma.sql`
		${cte}
		SELECT * FROM contacts WHERE email = ${addr} LIMIT 1
	`);
	return rows[0] ?? null;
}

export type Recipient = { email: string; name: string | null };

/**
 * The addresses a segment send would actually go to.
 *
 * `opted_out IS NOT TRUE` is applied to every segment without exception. Anyone
 * who has ever unsubscribed from the newsletter is off every bulk list here,
 * even the sponsor and donor ones: they told us to stop, and "but you paid us"
 * is not consent. The one place that rule does not apply is a one-to-one send,
 * which does not come through this function.
 *
 * `limit` is a hard cap, not a page. The caller compares it against
 * countSegmentRecipients() so it can refuse rather than silently truncate.
 */
export async function resolveSegmentRecipients(
	key: SegmentKey,
	limit: number
): Promise<Recipient[]> {
	const cte = contactsCte(await contactSources());
	return prisma.$queryRaw<Recipient[]>(Prisma.sql`
		${cte}
		SELECT email, name FROM contacts
		 WHERE ${segmentClause(key)} AND opted_out IS NOT TRUE
		 ORDER BY email ASC
		 LIMIT ${limit}
	`);
}

/** The true size of a mailable segment, before any cap. */
export async function countSegmentRecipients(key: SegmentKey): Promise<number> {
	const cte = contactsCte(await contactSources());
	const rows = await prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
		${cte}
		SELECT count(*)::int AS total FROM contacts
		 WHERE ${segmentClause(key)} AND opted_out IS NOT TRUE
	`);
	return rows[0]?.total ?? 0;
}

/* ------------------------------ detail view ------------------------------ */

export type ContactTimeline = {
	donations: {
		id: string;
		amount: number;
		currency: string;
		usdAmount: number | null;
		status: string;
		provider: string | null;
		cadence: string | null;
		createdAt: Date;
	}[];
	requests: {
		id: string;
		projectTitle: string;
		status: string;
		company: string | null;
		budget: number | null;
		serviceName: string | null;
		createdAt: Date;
	}[];
	subscriber: { isActive: boolean; createdAt: Date; updatedAt: Date } | null;
	sponsor: {
		slug: string;
		displayName: string;
		orgName: string | null;
		tier: string;
		cadence: string;
		visibility: string;
		moderation: string;
		monthlyUsd: number;
		lifetimeUsd: number;
		startedAt: Date;
		expiresAt: Date | null;
		cancelledAt: Date | null;
	} | null;
};

type TimelineRequestRow = {
	id: string;
	projectTitle: string;
	status: string;
	company: string | null;
	budget: number | null;
	createdAt: Date;
	service: { name: string } | null;
};

/** Run a source query, returning the fallback if that table is not there yet. */
async function ifPresent<T>(present: boolean, run: () => Promise<T>, fallback: T): Promise<T> {
	if (!present) return fallback;
	try {
		return await run();
	} catch (error) {
		if (isMissingRelation(error)) return fallback;
		throw error;
	}
}

/** Everything we hold on one person, for the timeline. Scoped by email. */
export async function getContactTimeline(email: string): Promise<ContactTimeline> {
	const addr = normaliseEmail(email);
	const sources = await contactSources();

	const [donations, requests, subscriber, sponsor] = await Promise.all([
		ifPresent(
			sources.donations,
			async () => {
				// The newer columns only exist once the sponsorship migration has run,
				// so they are asked for only when they are there.
				const rows = await prisma.donation.findMany({
					where: { email: { equals: addr, mode: 'insensitive' } },
					orderBy: { createdAt: 'desc' },
					take: 100,
					select: {
						id: true,
						amount: true,
						currency: true,
						status: true,
						createdAt: true,
						...(sources.donationUsd
							? { usdAmount: true, provider: true, cadence: true }
							: {})
					}
				});
				return rows.map((row) => ({
					id: row.id,
					amount: row.amount,
					currency: row.currency,
					status: row.status,
					createdAt: row.createdAt,
					usdAmount: 'usdAmount' in row ? (row.usdAmount ?? null) : null,
					provider: 'provider' in row ? String(row.provider) : null,
					cadence: 'cadence' in row ? String(row.cadence) : null
				}));
			},
			[] as ContactTimeline['donations']
		),
		ifPresent(
			sources.requests,
			() =>
				prisma.serviceRequest.findMany({
					where: { clientEmail: { equals: addr, mode: 'insensitive' }, deletedAt: null },
					orderBy: { createdAt: 'desc' },
					take: 100,
					select: {
						id: true,
						projectTitle: true,
						status: true,
						company: true,
						budget: true,
						createdAt: true,
						service: { select: { name: true } }
					}
				}),
			[] as TimelineRequestRow[]
		),
		ifPresent(
			sources.subscribers,
			() =>
				prisma.newsletterSubscriber.findFirst({
					where: { email: { equals: addr, mode: 'insensitive' } },
					select: { isActive: true, createdAt: true, updatedAt: true }
				}),
			null as ContactTimeline['subscriber']
		),
		ifPresent(
			sources.sponsors,
			() =>
				prisma.sponsor.findFirst({
					where: { email: { equals: addr, mode: 'insensitive' } },
					select: {
						slug: true,
						displayName: true,
						orgName: true,
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
			null as ContactTimeline['sponsor']
		)
	]);

	return {
		donations,
		requests: requests.map(({ service, ...r }) => ({ ...r, serviceName: service?.name ?? null })),
		subscriber,
		sponsor
	};
}

/** Lowercased and trimmed, the form every join in this file assumes. */
export function normaliseEmail(email: string | null | undefined): string {
	return String(email ?? '')
		.trim()
		.toLowerCase();
}

export function isEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * True when the error is Postgres saying a table or column is not there yet.
 * The admin pages use it to say "not migrated" instead of returning a 500.
 */
export function isMissingRelation(error: unknown): boolean {
	const code = (error as { code?: string })?.code;
	if (code === 'P2021' || code === 'P2022') return true;
	const pgCode = (error as { meta?: { code?: string } })?.meta?.code;
	if (pgCode === '42P01' || pgCode === '42703') return true;
	const message = String((error as { message?: string })?.message ?? '');
	return /does not exist/i.test(message);
}
