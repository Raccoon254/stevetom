import { verifySigned } from '$lib/server/otp';
import { unsubscribeEmail } from '$lib/server/newsletter';
import type { PageServerLoad, Actions } from './$types';

async function run(emailRaw: string | null, tokenRaw: string | null) {
	const email = (emailRaw || '').trim().toLowerCase();
	const token = tokenRaw || '';
	if (!email || !token || !verifySigned(email, token)) {
		return { ok: false, email };
	}
	const ok = await unsubscribeEmail(email);
	return { ok, email };
}

// GET — the visible "Unsubscribe" link in the email opens this page.
export const load: PageServerLoad = async ({ url }) => {
	return run(url.searchParams.get('e'), url.searchParams.get('t'));
};

// POST — RFC 8058 one-click unsubscribe (mail-client "Unsubscribe" button).
export const actions: Actions = {
	default: async ({ url }) => run(url.searchParams.get('e'), url.searchParams.get('t'))
};
