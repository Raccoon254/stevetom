import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';
import { createSessionToken, isValidSession, sessionCookieOptions } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	// if already logged in, redirect to admin
	if (isValidSession(cookies.get('session'))) {
		throw redirect(303, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (typeof password === 'string' && password === ADMIN_PASSWORD) {
			cookies.set('session', createSessionToken(), sessionCookieOptions);
			throw redirect(303, '/admin');
		}

		return fail(401, { error: 'Invalid password' });
	}
};
