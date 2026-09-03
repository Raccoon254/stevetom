/**
 * Sponsorship: turning a payment into a listing, and taking it down again.
 *
 * A Donation is a payment event and stays an immutable ledger row. A Sponsor is
 * the relationship: who they are, what they get, and whether they consented to
 * appear in public. Keeping them apart means the partners wall is one indexed
 * query rather than a fold over every transaction, and it gives consent and
 * logo data somewhere to live.
 *
 * Tiers are always decided against a USD figure captured at the time of the
 * charge. Paystack settles in KES at a rate that moves daily, so deriving the
 * tier later would silently reclassify people who paid months ago.
 */
import { prisma } from '$lib/db.js';
import type { SponsorCadence, SponsorTier, SponsorVisibility } from '@prisma/client';

/**
 * Tier thresholds, in USD. Recurring is per month, one-time is the single gift.
 * The one-time equivalents let a single larger gift buy the same wall placement
 * as a monthly sponsor, which is roughly fair and avoids inventing a second set
 * of benefits for one-time supporters.
 */
export const TIER_THRESHOLDS = {
	STANDARD: { monthlyUsd: 1, oneTimeUsd: 25 },
	WORKSHOP: { monthlyUsd: 10, oneTimeUsd: 100 }
} as const;

/** How long a one-time gift keeps its place on the wall before rolling off. */
export const ONE_TIME_LISTING_MONTHS = 12;

/**
 * Whether a public listing goes live without a human looking at it first.
 *
 * True is what "auto add" means, and it is what this is set to. Be aware of the
 * trade: anyone who can pay the minimum can put a display name of their
 * choosing on the site until someone notices. The admin screen can reject a
 * sponsor at any time, and flipping this to false makes every new public
 * listing wait for approval instead.
 */
export const AUTO_APPROVE_PUBLIC_LISTINGS = true;

/** CUSTOM is arranged by email and never resolved from an amount. */
export function resolveTier(usdAmount: number | null, cadence: SponsorCadence): SponsorTier {
	if (!usdAmount || usdAmount <= 0) return 'SUPPORTER';
	const t = TIER_THRESHOLDS;
	if (cadence === 'RECURRING') {
		if (usdAmount >= t.WORKSHOP.monthlyUsd) return 'WORKSHOP';
		if (usdAmount >= t.STANDARD.monthlyUsd) return 'STANDARD';
		return 'SUPPORTER';
	}
	if (usdAmount >= t.WORKSHOP.oneTimeUsd) return 'WORKSHOP';
	if (usdAmount >= t.STANDARD.oneTimeUsd) return 'STANDARD';
	return 'SUPPORTER';
}

/** Only WORKSHOP and CUSTOM carry a logo. Below that a listing is text only. */
export function tierAllowsLogo(tier: SponsorTier): boolean {
	return tier === 'WORKSHOP' || tier === 'CUSTOM';
}

/** Tiers at or above STANDARD appear on the partners wall at all. */
export function tierIsListed(tier: SponsorTier): boolean {
	return tier !== 'SUPPORTER';
}

const RESERVED_SLUGS = new Set(['new', 'edit', 'admin', 'api', 'join', 'index']);

export function slugify(input: string): string {
	const base = input
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);
	return base || 'sponsor';
}

/**
 * A slug nobody else holds. Collisions are resolved with a numeric suffix
 * rather than by rejecting the signup, because the sponsor has already paid by
 * the time we get here and must not be turned away over a name clash.
 */
export async function uniqueSlug(desired: string, ignoreSponsorId?: string): Promise<string> {
	const base = slugify(desired);
	for (let n = 0; n < 200; n++) {
		const candidate = n === 0 ? base : `${base}-${n + 1}`;
		if (RESERVED_SLUGS.has(candidate)) continue;
		const clash = await prisma.sponsor.findUnique({
			where: { slug: candidate },
			select: { id: true }
		});
		if (!clash || clash.id === ignoreSponsorId) return candidate;
	}
	// Vanishingly unlikely, but never leave the caller without a usable slug.
	return `${base}-${Date.now().toString(36)}`;
}

function addMonths(from: Date, months: number): Date {
	const d = new Date(from);
	d.setMonth(d.getMonth() + months);
	return d;
}

export type SponsorIntake = {
	email: string;
	/** What they want shown. Their brand or their name. */
	displayName?: string | null;
	orgName?: string | null;
	websiteUrl?: string | null;
	logoUrl?: string | null;
	blurb?: string | null;
	/** PRIVATE unless they explicitly asked to be listed. */
	visibility?: SponsorVisibility | null;
	cadence: SponsorCadence;
	usdAmount: number | null;
};

/**
 * Create or update the sponsor behind a successful payment.
 *
 * Never downgrades. If someone gave at WORKSHOP once and later gives a small
 * one-off, the small gift must not demote them mid-term: the tier only ever
 * moves up while a sponsorship is live.
 */
export async function upsertSponsorFromPayment(intake: SponsorIntake) {
	const email = intake.email.trim().toLowerCase();
	if (!email.includes('@')) return null;

	const existing = await prisma.sponsor.findUnique({ where: { email } });
	const earnedTier = resolveTier(intake.usdAmount, intake.cadence);
	const usd = intake.usdAmount ?? 0;

	// Consent is opt-in. Absent an explicit choice, a new sponsor stays private
	// and an existing one keeps whatever they previously chose.
	const visibility: SponsorVisibility =
		intake.visibility ?? existing?.visibility ?? 'PRIVATE';

	const displayName =
		intake.displayName?.trim() || existing?.displayName || email.split('@')[0];

	if (!existing) {
		const tier = earnedTier;
		return prisma.sponsor.create({
			data: {
				email,
				slug: await uniqueSlug(intake.orgName || displayName),
				displayName,
				orgName: intake.orgName?.trim() || null,
				websiteUrl: intake.websiteUrl?.trim() || null,
				logoUrl: tierAllowsLogo(tier) ? intake.logoUrl?.trim() || null : null,
				blurb: intake.blurb?.trim() || null,
				tier,
				cadence: intake.cadence,
				visibility,
				moderation:
					visibility === 'PUBLIC' && !AUTO_APPROVE_PUBLIC_LISTINGS
						? 'PENDING_REVIEW'
						: 'APPROVED',
				monthlyUsd: intake.cadence === 'RECURRING' ? usd : 0,
				lifetimeUsd: usd,
				expiresAt:
					intake.cadence === 'ONE_TIME'
						? addMonths(new Date(), ONE_TIME_LISTING_MONTHS)
						: null,
				cancelledAt: null
			}
		});
	}

	const tier = higherTier(existing.tier, earnedTier);
	const lifetimeUsd = existing.lifetimeUsd + usd;

	// A one-time gift extends the window from today rather than from whatever
	// the old expiry was, so a lapsed supporter who gives again comes straight
	// back rather than being credited a window that already ran out.
	const expiresAt =
		intake.cadence === 'RECURRING'
			? null
			: addMonths(new Date(), ONE_TIME_LISTING_MONTHS);

	return prisma.sponsor.update({
		where: { id: existing.id },
		data: {
			displayName,
			orgName: intake.orgName?.trim() || existing.orgName,
			websiteUrl: intake.websiteUrl?.trim() || existing.websiteUrl,
			logoUrl: tierAllowsLogo(tier)
				? intake.logoUrl?.trim() || existing.logoUrl
				: existing.logoUrl,
			blurb: intake.blurb?.trim() || existing.blurb,
			tier,
			cadence: intake.cadence,
			visibility,
			moderation:
				visibility === 'PUBLIC' && !AUTO_APPROVE_PUBLIC_LISTINGS && existing.moderation !== 'APPROVED'
					? 'PENDING_REVIEW'
					: existing.moderation,
			monthlyUsd: intake.cadence === 'RECURRING' ? usd : existing.monthlyUsd,
			lifetimeUsd,
			expiresAt,
			// Paying again un-cancels: a returning sponsor is a live sponsor.
			cancelledAt: null
		}
	});
}

const TIER_RANK: Record<SponsorTier, number> = {
	SUPPORTER: 0,
	STANDARD: 1,
	WORKSHOP: 2,
	CUSTOM: 3
};

export function higherTier(a: SponsorTier, b: SponsorTier): SponsorTier {
	return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

/**
 * Take a recurring sponsor down when their subscription ends.
 *
 * They keep their place until the end of the period they already paid for,
 * which is what `currentPeriodEnd` is for. Yanking the listing the instant
 * someone cancels would be taking back something already bought.
 */
export async function endRecurringSponsorship(
	subscriptionCode: string,
	opts: { immediate?: boolean } = {}
) {
	const sub = await prisma.subscription.findUnique({
		where: { subscriptionCode },
		include: { sponsor: true }
	});
	if (!sub) return null;

	const now = new Date();
	const endsAt = opts.immediate ? now : (sub.currentPeriodEnd ?? now);

	await prisma.subscription.update({
		where: { id: sub.id },
		data: { status: 'CANCELLED', cancelledAt: now }
	});

	return prisma.sponsor.update({
		where: { id: sub.sponsorId },
		data: { cancelledAt: now, expiresAt: endsAt }
	});
}

/**
 * The one definition of "currently on the wall". Everything that renders a
 * sponsor list must use this, so the public page, the admin screen and any
 * count can never disagree about who is live.
 */
export function listedSponsorWhere(now: Date = new Date()) {
	return {
		visibility: 'PUBLIC' as const,
		moderation: 'APPROVED' as const,
		tier: { not: 'SUPPORTER' as const },
		OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
	};
}

/** Sponsors whose window has closed. Shown as past supporters, never deleted. */
export function pastSponsorWhere(now: Date = new Date()) {
	return {
		visibility: 'PUBLIC' as const,
		moderation: 'APPROVED' as const,
		tier: { not: 'SUPPORTER' as const },
		expiresAt: { lte: now }
	};
}
