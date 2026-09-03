import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendRequestReply } from '$lib/server/requests';
import { requireAdmin } from '$lib/server/auth';

/**
 * Admin -> client reply. Gated by the admin session cookie.
 *
 * The email and its activity-log line live in `sendRequestReply`, which the
 * admin request page's form action calls too, so there is one implementation
 * of a reply rather than two. This endpoint is kept for anything already
 * pointed at it; the admin UI no longer uses it.
 */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const denied = requireAdmin(cookies);
	if (denied) return denied;
	try {
		const { message } = await request.json();
		const result = await sendRequestReply(params.id, message);
		if (!result.ok) return json({ success: false, error: result.error }, { status: result.status });
		return json({ success: true });
	} catch (error) {
		console.error('reply failed:', error);
		return json({ success: false, error: 'Failed to send the reply.' }, { status: 500 });
	}
};
