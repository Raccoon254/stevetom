/**
 * One sponsor: what they paid, what they asked to show, and the controls.
 *
 * Every mutation is a SvelteKit form action, so it inherits the framework's
 * same-origin check and the /admin layout's session guard. There is no open
 * POST endpoint that can change a listing.
 *
 * Two rules are load-bearing here and are enforced on the server, not by the
 * buttons:
 *   - A logo is a WORKSHOP-and-above benefit (`tierAllowsLogo`). Input that
 *     would never be displayed is refused rather than quietly stored.
 *   - Ending a sponsorship never deletes anything. Donations are a ledger.
 *     When a recurring subscription is involved, `endRecurringSponsorship`
 *     does the work, because it deliberately preserves the period already
 *     paid for.
 *
 * Whether the sponsor is on the wall is always asked of `listedSponsorWhere`,
 * the same predicate the public page uses, so this screen cannot claim
 * something the wall would contradict.
 */
import { error, fail } from '@sveltejs/kit';
import { prisma } from '$lib/db.js';
import { isMissingRelation } from '$lib/server/contacts';
import { logActivity } from '$lib/server/log';
import {
	endRecurringSponsorship,
	listedSponsorWhere,
	pastSponsorWhere,
	tierAllowsLogo,
	uniqueSlug
} from '$lib/server/sponsors';
import type { SponsorVisibility } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

/**
 * Sponsorship gets its own ActivityLog category, so these lines do not sit
 * mixed in with actual payments in the logs screen. The entity column is a
 * plain String in the database, so widening the union in src/lib/server/log.ts
 * needed no migration.
 */
const LOG_ENTITY = 'sponsor' as const;

/** Asked of the database with the wall's own predicate, never inferred. */
async function isOnWall(id: string): Promise<boolean> {
	const n = await prisma.sponsor.count({ where: { AND: [{ id }, listedSponsorWhere()] } });
	return n > 0;
}

const wallLine = (live: boolean) =>
	live ? 'They are on the partners wall now.' : 'They are not on the partners wall.';

type Feedback = { message?: string; error?: string };
const ok = (message: string): Feedback => ({ message });
const bad = (error: string): Feedback => ({ error });

const text = (value: FormDataEntryValue | null, max = 300): string =>
	typeof value === 'string' ? value.trim().slice(0, max) : '';

/** An absolute http(s) URL, or null for blank. `false` means it was unusable. */
function normaliseUrl(value: string): string | null | false {
	if (!value) return null;
	const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	try {
		const url = new URL(candidate);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
		if (!url.hostname.includes('.')) return false;
		return url.toString();
	} catch {
		return false;
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const now = new Date();

	let sponsor;
	try {
		sponsor = await prisma.sponsor.findUnique({
			where: { id: params.id },
			include: {
				donations: {
					orderBy: { createdAt: 'desc' },
					take: 100,
					select: {
						id: true,
						amount: true,
						currency: true,
						usdAmount: true,
						status: true,
						cadence: true,
						provider: true,
						paystackReference: true,
						paypalOrderId: true,
						createdAt: true
					}
				},
				subscriptions: {
					orderBy: { createdAt: 'desc' },
					select: {
						id: true,
						provider: true,
						planCode: true,
						subscriptionCode: true,
						amountUsd: true,
						interval: true,
						status: true,
						currentPeriodEnd: true,
						cancelledAt: true,
						createdAt: true
					}
				}
			}
		});
	} catch (err) {
		console.error('sponsor load failed:', err);
		throw error(
			500,
			isMissingRelation(err)
				? 'The Sponsor table is not in this database yet.'
				: 'That sponsor could not be read.'
		);
	}

	if (!sponsor) throw error(404, 'No such sponsor');

	const [listed, past] = await Promise.all([
		prisma.sponsor.count({ where: { AND: [{ id: sponsor.id }, listedSponsorWhere(now)] } }),
		prisma.sponsor.count({ where: { AND: [{ id: sponsor.id }, pastSponsorWhere(now)] } })
	]);

	// Why they are not on the wall, in the same order the predicate checks it.
	const blockers: string[] = [];
	if (sponsor.visibility !== 'PUBLIC') {
		blockers.push(
			sponsor.visibility === 'ANONYMOUS'
				? 'Visibility is Anonymous: they are counted in the total, never named.'
				: 'Visibility is Private: they asked not to be shown at all.'
		);
	}
	if (sponsor.moderation !== 'APPROVED') {
		blockers.push(
			sponsor.moderation === 'PENDING_REVIEW'
				? 'Moderation is still pending review.'
				: 'Moderation is Rejected.'
		);
	}
	if (sponsor.tier === 'SUPPORTER') {
		blockers.push('The Supporter tier is below the threshold for a listing.');
	}
	if (sponsor.expiresAt && sponsor.expiresAt <= now) {
		blockers.push('Their listing window has closed.');
	}

	return {
		sponsor,
		listed: listed > 0,
		past: past > 0,
		allowsLogo: tierAllowsLogo(sponsor.tier),
		blockers,
		donationCount: sponsor.donations.length
	};
};

export const actions: Actions = {
	approve: async ({ params }) => {
		const sponsor = await prisma.sponsor.findUnique({ where: { id: params.id } });
		if (!sponsor) return fail(404, bad('That sponsor no longer exists.'));
		if (sponsor.moderation === 'APPROVED') {
			return ok(`${sponsor.displayName} was already approved. ${wallLine(await isOnWall(sponsor.id))}`);
		}

		await prisma.sponsor.update({ where: { id: sponsor.id }, data: { moderation: 'APPROVED' } });
		const live = await isOnWall(sponsor.id);

		await logActivity({
			action: 'sponsor.approved',
			entity: LOG_ENTITY,
			entityId: sponsor.id,
			actor: 'admin',
			summary: `Approved sponsor ${sponsor.displayName} (${sponsor.email})`
		});

		return ok(`Approved. ${wallLine(live)}`);
	},

	reject: async ({ params }) => {
		const sponsor = await prisma.sponsor.findUnique({ where: { id: params.id } });
		if (!sponsor) return fail(404, bad('That sponsor no longer exists.'));
		if (sponsor.moderation === 'REJECTED') {
			return ok(`${sponsor.displayName} was already rejected. ${wallLine(false)}`);
		}

		await prisma.sponsor.update({ where: { id: sponsor.id }, data: { moderation: 'REJECTED' } });

		await logActivity({
			action: 'sponsor.rejected',
			entity: LOG_ENTITY,
			entityId: sponsor.id,
			actor: 'admin',
			summary: `Rejected sponsor ${sponsor.displayName} (${sponsor.email}); listing removed, donations kept`
		});

		return ok(
			'Rejected. They are off the partners wall immediately. Their donations are untouched: the money is a ledger and stays.'
		);
	},

	visibility: async ({ params, request }) => {
		const form = await request.formData();
		const wanted = text(form.get('visibility'), 20);
		const allowed: SponsorVisibility[] = ['PRIVATE', 'ANONYMOUS', 'PUBLIC'];
		const visibility = allowed.find((v) => v === wanted);
		if (!visibility) return fail(400, bad('That is not a visibility this system has.'));

		const sponsor = await prisma.sponsor.findUnique({ where: { id: params.id } });
		if (!sponsor) return fail(404, bad('That sponsor no longer exists.'));
		if (sponsor.visibility === visibility) {
			return fail(400, bad(`Visibility is already ${visibility.toLowerCase()}.`));
		}

		await prisma.sponsor.update({ where: { id: sponsor.id }, data: { visibility } });
		const live = await isOnWall(sponsor.id);

		await logActivity({
			action: 'sponsor.visibility',
			entity: LOG_ENTITY,
			entityId: sponsor.id,
			actor: 'admin',
			summary: `Set sponsor ${sponsor.displayName} (${sponsor.email}) visibility from ${sponsor.visibility} to ${visibility}`
		});

		return ok(`Visibility is now ${visibility.toLowerCase()}. ${wallLine(live)}`);
	},

	details: async ({ params, request }) => {
		const form = await request.formData();
		const sponsor = await prisma.sponsor.findUnique({ where: { id: params.id } });
		if (!sponsor) return fail(404, bad('That sponsor no longer exists.'));

		const displayName = text(form.get('displayName'), 120);
		if (!displayName) {
			return fail(400, bad('A display name is required: a sponsor with no name cannot be listed.'));
		}

		const websiteUrl = normaliseUrl(text(form.get('websiteUrl'), 300));
		if (websiteUrl === false) {
			return fail(400, bad('That website address is not a usable http(s) URL.'));
		}

		// A logo is a WORKSHOP-and-above benefit. On a lower tier the field is
		// disabled in the page, so nothing arrives here; anything that does
		// arrive anyway is refused rather than stored where it can never show.
		const allowsLogo = tierAllowsLogo(sponsor.tier);
		const rawLogo = form.get('logoUrl');
		let logoUrl = sponsor.logoUrl;

		if (allowsLogo) {
			const parsed = normaliseUrl(text(rawLogo, 500));
			if (parsed === false) return fail(400, bad('That logo address is not a usable http(s) URL.'));
			logoUrl = parsed;
		} else if (text(rawLogo, 500)) {
			return fail(
				400,
				bad(
					`A logo is a Workshop benefit and this sponsor is on the ${sponsor.tier.toLowerCase()} tier, so a logo would never be displayed. The tier follows what they paid, and is not editable here.`
				)
			);
		} else if (form.get('removeLogo') === 'on') {
			logoUrl = null;
		}

		// A slug change breaks every link already shared, so it only moves when
		// the admin deliberately submits a different one. uniqueSlug both
		// normalises the input and guarantees it collides with nobody.
		const wantedSlug = text(form.get('slug'), 60);
		const slug = wantedSlug ? await uniqueSlug(wantedSlug, sponsor.id) : sponsor.slug;
		const slugChanged = slug !== sponsor.slug;

		await prisma.sponsor.update({
			where: { id: sponsor.id },
			data: {
				displayName,
				orgName: text(form.get('orgName'), 120) || null,
				websiteUrl,
				logoUrl,
				blurb: text(form.get('blurb'), 300) || null,
				slug
			}
		});
		const live = await isOnWall(sponsor.id);

		await logActivity({
			action: 'sponsor.updated',
			entity: LOG_ENTITY,
			entityId: sponsor.id,
			actor: 'admin',
			summary: slugChanged
				? `Updated sponsor ${displayName} (${sponsor.email}); slug ${sponsor.slug} became ${slug}`
				: `Updated sponsor ${displayName} (${sponsor.email}) listing details`
		});

		const notes: string[] = ['Saved.'];
		if (slugChanged) {
			notes.push(
				`Their page is now /partners/${slug}. The old link /partners/${sponsor.slug} is dead and anyone holding it gets a 404.`
			);
			if (wantedSlug !== slug) {
				notes.push('What you typed was taken or reserved, so it was given a suffix.');
			}
		} else if (wantedSlug && wantedSlug !== slug) {
			notes.push(`The slug you typed resolved to ${slug}, which it already was, so nothing moved.`);
		}
		notes.push(wallLine(live));
		return ok(notes.join(' '));
	},

	end: async ({ params, request }) => {
		const form = await request.formData();
		const immediate = form.get('immediate') === 'on';

		const sponsor = await prisma.sponsor.findUnique({
			where: { id: params.id },
			include: {
				subscriptions: {
					where: { status: { in: ['ACTIVE', 'PAST_DUE'] } },
					orderBy: { createdAt: 'desc' }
				}
			}
		});
		if (!sponsor) return fail(404, bad('That sponsor no longer exists.'));

		// The helper owns the recurring case: it cancels the Subscription row and
		// leaves the listing up until the end of the period already paid for.
		const live = sponsor.subscriptions.find((s) => s.subscriptionCode);
		let ended: string;

		if (live) {
			const result = await endRecurringSponsorship(live.subscriptionCode as string, { immediate });
			if (!result) return fail(500, bad('That subscription could not be read back to end it.'));
			ended = immediate
				? 'The subscription is cancelled and the listing came down now.'
				: `The subscription is cancelled. The listing stands until ${
						result.expiresAt ? result.expiresAt.toLocaleDateString('en') : 'now'
					}, which is the period they already paid for.`;
		} else {
			const now = new Date();
			// A one-time gift bought a fixed window. Unless the admin says
			// otherwise, that window is honoured exactly as the recurring path
			// honours a paid period.
			const expiresAt =
				immediate || !sponsor.expiresAt || sponsor.expiresAt <= now ? now : sponsor.expiresAt;
			await prisma.sponsor.update({
				where: { id: sponsor.id },
				data: { cancelledAt: sponsor.cancelledAt ?? now, expiresAt }
			});
			ended =
				expiresAt <= now
					? 'The listing came down now.'
					: `Marked as ended. The listing stands until ${expiresAt.toLocaleDateString('en')}, which is the window they paid for.`;
			// A live subscription row with no provider code cannot be cancelled
			// through the helper, and this screen will not fake it: there is
			// nothing to key on at Paystack, so say so rather than mark it dead.
			if (sponsor.subscriptions.length) {
				ended += ' A subscription row is still open but carries no provider code, so it could not be cancelled here. Cancel it in the Paystack dashboard.';
			}
		}

		const stillListed = await isOnWall(sponsor.id);

		await logActivity({
			action: 'sponsor.ended',
			entity: LOG_ENTITY,
			entityId: sponsor.id,
			actor: 'admin',
			summary: `Ended sponsorship for ${sponsor.displayName} (${sponsor.email})${
				immediate ? ' immediately' : ' at the end of the paid period'
			}`
		});

		return ok(`${ended} Nothing was deleted: the sponsor and every donation stay. ${wallLine(stillListed)}`);
	}
};
