/**
 * The reports console: what is scheduled, what it would say, and a way to make
 * it happen now.
 *
 * Preview is a GET with ?job=, so reading the exact email is a link and never a
 * side effect. The two things that actually send are form actions, which
 * inherit SvelteKit's same-origin check and the /admin layout's session guard,
 * so there is no open POST here that could mail anybody.
 *
 * Everything a button does here goes through the same runJob() the scheduler
 * calls, with trigger 'admin'. There is no second send path, which means the
 * (job, month) claim protects a hand-triggered send exactly as it protects a
 * scheduled one: pressing the button twice cannot send twice, and pressing it
 * on a month the cron already sent does nothing at all.
 */
import { fail } from '@sveltejs/kit';
import { isMissingRelation } from '$lib/server/contacts';
import {
	JOBS,
	clearRun,
	jobByKey,
	previewJob,
	runJob,
	runsForPeriods,
	type JobKey,
	type JobPreview,
	type RunSummary
} from '$lib/server/monthlyJobs';
import {
	change,
	dayLabel,
	gatherMonthlyStats,
	money,
	num,
	periodFromKey,
	previousMonthOf,
	recentPeriods,
	substanceOf,
	unavailableSections,
	type MonthlyStats
} from '$lib/server/reports';
import { NOTIFY_TO } from '$lib/server/mailer';
import type { Actions, PageServerLoad } from './$types';

/** One headline figure, already turned into words by the server. */
type Tile = { label: string; value: string; note: string | null };

function tiles(stats: MonthlyStats): Tile[] {
	const revenue = stats.revenue.data;
	const traffic = stats.traffic.data;
	const sponsors = stats.sponsors.data;
	const requests = stats.requests.data;
	const audience = stats.audience.data;

	return [
		{
			label: 'Money in',
			value: !revenue
				? 'Unavailable'
				: revenue.successful === 0
					? 'Nothing'
					: money(revenue.usdTotal),
			note: !revenue
				? stats.revenue.unavailable
				: revenue.successful === 0
					? `${num(revenue.unsettled)} started and did not settle`
					: `${num(revenue.successful)} payment${revenue.successful === 1 ? '' : 's'}${revenue.usdMissing ? `, ${num(revenue.usdMissing)} with no USD figure` : ''}`
		},
		{
			label: 'Page views',
			value: traffic ? num(traffic.views) : 'Unavailable',
			note: traffic ? change(traffic.views, traffic.previousViews, stats.previous.label) : null
		},
		{
			label: 'Visitors',
			value: traffic ? num(traffic.visitors) : 'Unavailable',
			note: traffic ? `${num(traffic.sessions)} sessions` : null
		},
		{
			label: 'Sponsors',
			value: sponsors ? num(sponsors.activeAtEnd) : 'Unavailable',
			note: sponsors
				? `${num(sponsors.newInMonth.length)} new, ${num(sponsors.cancelledInMonth)} cancelled`
				: null
		},
		{
			label: 'Requests',
			value: requests ? num(requests.total) : 'Unavailable',
			note: requests && requests.byStatus.length
				? requests.byStatus.map((row) => `${row.count} ${row.status.toLowerCase()}`).join(', ')
				: null
		},
		{
			label: 'Subscribers',
			value: audience ? num(audience.activeSubscribers) : 'Unavailable',
			note: audience
				? audience.movementUnrecorded
					? 'no movement recorded in the log yet'
					: `${num(audience.joined)} joined, ${num(audience.left)} left`
				: null
		},
		{
			label: 'Posts',
			value: num(stats.blog.publishedInMonth.length),
			note: stats.blog.publishedInMonth.length
				? stats.blog.publishedInMonth.map((post) => post.title).join(', ')
				: stats.blog.latest
					? `last one ${dayLabel(stats.blog.latest.date)}`
					: 'nothing dated on the blog'
		}
	];
}

export const load: PageServerLoad = async ({ url }) => {
	const now = new Date();
	const periods = recentPeriods(12, now).map((period) => ({
		key: period.key,
		label: period.label
	}));
	const selected = periodFromKey(url.searchParams.get('period')) ?? previousMonthOf(now);

	const stats = await gatherMonthlyStats(selected, now);

	let runs: RunSummary[] = [];
	let runsUnavailable: string | null = null;
	try {
		runs = await runsForPeriods([selected.key]);
	} catch (error) {
		console.error('reports console: run history unavailable:', error);
		runsUnavailable = isMissingRelation(error)
			? 'The MonthlyJobRun table is not in this database yet. Apply the migration for the model at the end of prisma/schema.prisma. Until then every scheduled job refuses to run, because there would be nowhere to record that a month had already gone out.'
			: 'The record of scheduled runs could not be read.';
	}

	let preview: JobPreview | null = null;
	let previewError: string | null = null;
	const previewKey = url.searchParams.get('job');
	if (previewKey && jobByKey(previewKey)) {
		try {
			preview = await previewJob(previewKey as JobKey, selected);
		} catch (error) {
			console.error('reports console: preview failed:', error);
			previewError = 'That email could not be rendered.';
		}
	}

	return {
		periods,
		selected: { key: selected.key, label: selected.label },
		today: now.toISOString().slice(0, 10),
		jobs: JOBS,
		tiles: tiles(stats),
		substance: substanceOf(stats),
		missing: unavailableSections(stats),
		runs,
		runsUnavailable,
		notifyTo: NOTIFY_TO.email,
		preview: preview
			? {
					job: preview.job.key,
					subject: preview.subject,
					html: preview.html,
					text: preview.text,
					recipients: preview.recipients,
					sample: preview.sample,
					skipReason: preview.skipReason
				}
			: null,
		previewError
	};
};

type Feedback = { message?: string; error?: string };

function resolveJob(form: FormData): JobKey | null {
	const key = String(form.get('job') ?? '');
	return jobByKey(key)?.key ?? null;
}

export const actions: Actions = {
	/** Do exactly what the scheduler would do, now. */
	run: async ({ request, url }) => {
		const form = await request.formData();
		const job = resolveJob(form);
		if (!job) return fail(400, { error: 'No such job.' } satisfies Feedback);

		const definition = jobByKey(job)!;
		// A bulk send needs the count acknowledged, checked on the server. The two
		// reminders go to the owner's own inbox and need no ceremony.
		if (definition.bulk && form.get('confirm') !== 'on') {
			return fail(400, {
				error: 'Tick the confirmation before sending this to a list.'
			} satisfies Feedback);
		}

		const period = periodFromKey(url.searchParams.get('period')) ?? undefined;
		const result = await runJob(job, { trigger: 'admin', mode: 'send', period });
		if (result.status === 'FAILED' || result.status === 'BLOCKED') {
			return fail(409, { error: result.message } satisfies Feedback);
		}
		return { message: `${definition.label}: ${result.message}` } satisfies Feedback;
	},

	/** Build the campaign and stop, so it can be read and sent by hand. */
	draft: async ({ request, url }) => {
		const form = await request.formData();
		const job = resolveJob(form);
		if (!job) return fail(400, { error: 'No such job.' } satisfies Feedback);
		const definition = jobByKey(job)!;
		if (!definition.bulk) {
			return fail(400, {
				error: 'That one is a single email to your own inbox. There is nothing to draft.'
			} satisfies Feedback);
		}

		const period = periodFromKey(url.searchParams.get('period')) ?? undefined;
		const result = await runJob(job, { trigger: 'admin', mode: 'draft', period });
		if (result.status === 'FAILED' || result.status === 'BLOCKED') {
			return fail(409, { error: result.message } satisfies Feedback);
		}
		return {
			message: `${definition.label}: ${result.message}`
		} satisfies Feedback;
	},

	/** Release a stuck run so the month can be attempted again. */
	clear: async ({ request, url }) => {
		const form = await request.formData();
		const job = resolveJob(form);
		if (!job) return fail(400, { error: 'No such job.' } satisfies Feedback);
		const period = periodFromKey(url.searchParams.get('period'));
		if (!period) return fail(400, { error: 'No month selected.' } satisfies Feedback);

		const cleared = await clearRun(job, period.key);
		return cleared
			? ({ message: `${period.label} is open again for that job.` } satisfies Feedback)
			: fail(400, {
					error: 'Only a run that is stuck, failed or skipped can be cleared. A send that completed stays recorded.'
				} satisfies Feedback);
	}
};
