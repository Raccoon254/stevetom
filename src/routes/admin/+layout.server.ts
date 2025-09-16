
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (session !== 'admin') {
		throw redirect(303, '/login');
	}
    return {};
};
