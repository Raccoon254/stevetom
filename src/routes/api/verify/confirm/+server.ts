import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/otp';
import { createServiceRequest } from '$lib/server/requests';
import { subscribeEmail } from '$lib/server/newsletter';
import { CONVERSIONS, recordEventFromRequest } from '$lib/server/analytics';

/** Step 2: verify the code, then create the request + send the emails. */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { token, code } = await request.json();
		const result = verifyToken(String(token || ''), String(code || '').trim());
		if (!result.ok) {
			return json({ success: false, error: result.reason }, { status: 400 });
		}

		// sponsorship signup (/partners/join): proving the address is all this
		// does. No Sponsor row is created and no payment is taken here; the
		// Paystack webhook stays the only thing that creates a sponsor. The
		// canonical address goes back so the client can use it for checkout.
		if (result.payload?.mode === 'sponsor') {
			return json({ success: true, verified: true, email: result.email });
		}

		// newsletter sign-up: just subscribe the verified address
		if (result.payload?.mode === 'newsletter') {
			await subscribeEmail(result.email);
			// analytics conversion, recorded here because this is the point the
			// signup actually succeeded. Never throws.
			await recordEventFromRequest(request, {
				name: CONVERSIONS.NEWSLETTER_SIGNUP,
				path: '/'
			});
			return json({ success: true, subscribed: true });
		}

		const { id } = await createServiceRequest({ ...result.payload, email: result.email });
		const isQuote = result.payload?.mode === 'quote';
		await recordEventFromRequest(request, {
			name: isQuote ? CONVERSIONS.QUOTE_REQUEST : CONVERSIONS.SERVICE_REQUEST,
			path: isQuote ? '/quote' : '/contact',
			entityId: id
		});
		return json({ success: true, requestId: id });
	} catch (error) {
		console.error('verify/confirm failed:', error);
		return json(
			{ success: false, error: 'Verification failed. Please try again.' },
			{ status: 500 }
		);
	}
};
