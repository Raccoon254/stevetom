
import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    // if already logged in, redirect to admin
	if (cookies.get('session') === 'admin') {
		throw redirect(303, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (password === ADMIN_PASSWORD) {
			cookies.set('session', 'admin', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 1 week
			});
			throw redirect(303, '/admin');
		}

		return fail(401, { error: 'Invalid password' });
	}
};
