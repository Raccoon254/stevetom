import { redirect } from '@sveltejs/kit';
import { isValidSession } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	if (!isValidSession(cookies.get('session'))) {
		throw redirect(303, '/login');
	}
	return {};
};
