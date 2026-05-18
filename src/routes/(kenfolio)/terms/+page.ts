import { error } from '@sveltejs/kit';
import { getLegal } from '$lib/content';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	const doc = getLegal('terms');
	if (!doc) throw error(404, 'Not found');
	return { doc };
};
