import { error } from '@sveltejs/kit';
import { getExperiment } from '$lib/data/labExperiments';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const experiment = getExperiment(params.slug);
	if (!experiment) throw error(404, `No lab experiment named "${params.slug}"`);
	return { experiment };
};
