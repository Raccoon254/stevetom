import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/server/otp';
import { createServiceRequest } from '$lib/server/requests';
import { subscribeEmail } from '$lib/server/newsletter';

/** Step 2: verify the code, then create the request + send the emails. */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { token, code } = await request.json();
		const result = verifyToken(String(token || ''), String(code || '').trim());
		if (!result.ok) {
			return json({ success: false, error: result.reason }, { status: 400 });
		}

		// newsletter sign-up: just subscribe the verified address
		if (result.payload?.mode === 'newsletter') {
			await subscribeEmail(result.email);
			return json({ success: true, subscribed: true });
		}

		const { id } = await createServiceRequest({ ...result.payload, email: result.email });
		return json({ success: true, requestId: id });
	} catch (error) {
		console.error('verify/confirm failed:', error);
		return json(
			{ success: false, error: 'Verification failed. Please try again.' },
			{ status: 500 }
		);
	}
};
