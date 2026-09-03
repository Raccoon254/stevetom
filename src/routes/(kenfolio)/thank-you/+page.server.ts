/**
 * Where Paystack sends the donor back to.
 *
 * This page reports what actually happened rather than assuming success from
 * the redirect alone. The old callback was /donate?success=true, which claimed
 * success for anyone who reached the URL, including someone who abandoned the
 * checkout and pressed back.
 *
 * The webhook remains the source of truth for the money. This page reads the
 * record, and only asks Paystack directly when the webhook has not landed yet,
 * which is the normal race for a donor who returns within a second or two.
 */
import type { PageServerLoad } from './$types';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import { prisma } from '$lib/db.js';
import { tierIsListed } from '$lib/server/sponsors';

type Outcome = 'success' | 'pending' | 'failed' | 'unknown';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	// Never let a receipt be cached and shown to the next person on a shared machine.
	setHeaders({ 'cache-control': 'no-store' });

	// Paystack appends both; either can be the one that survives a redirect.
	const reference = url.searchParams.get('reference') ?? url.searchParams.get('trxref');

	if (!reference) {
		return { outcome: 'unknown' as Outcome, donation: null, sponsor: null };
	}

	let donation = await prisma.donation.findUnique({
		where: { paystackReference: reference },
		include: { sponsor: true }
	});

	// The webhook usually wins this race, but not always. Asking Paystack
	// directly means the donor sees a confirmed result instead of a shrug.
	if (donation && donation.status === 'PENDING') {
		try {
			const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
				headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
			});
			const body = await res.json();
			if (res.ok && body?.status && body?.data?.status === 'success') {
				// Only the status is touched here. The webhook owns sponsor creation,
				// so that the listing is created in exactly one place.
				donation = await prisma.donation.update({
					where: { id: donation.id },
					data: { status: 'SUCCESS' },
					include: { sponsor: true }
				});
			}
		} catch {
			// Leave it pending. The webhook will settle it.
		}
	}

	if (!donation) {
		return { outcome: 'unknown' as Outcome, donation: null, sponsor: null };
	}

	const outcome: Outcome =
		donation.status === 'SUCCESS'
			? 'success'
			: donation.status === 'PENDING'
				? 'pending'
				: 'failed';

	const sponsor = donation.sponsor;

	return {
		outcome,
		donation: {
			amount: donation.amount,
			currency: donation.currency,
			usdAmount: donation.usdAmount,
			originalAmount: donation.originalAmount,
			originalCurrency: donation.originalCurrency,
			reference: donation.paystackReference,
			cadence: donation.cadence
		},
		sponsor: sponsor
			? {
					displayName: sponsor.displayName,
					slug: sponsor.slug,
					tier: sponsor.tier,
					// Whether they will actually appear, rather than whether they paid.
					listed:
						sponsor.visibility === 'PUBLIC' &&
						sponsor.moderation === 'APPROVED' &&
						tierIsListed(sponsor.tier),
					pendingReview: sponsor.visibility === 'PUBLIC' && sponsor.moderation === 'PENDING_REVIEW',
					expiresAt: sponsor.expiresAt ? sponsor.expiresAt.toISOString() : null
				}
			: null
	};
};
