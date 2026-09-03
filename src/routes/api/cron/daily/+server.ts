/**
 * The one scheduled entry point, hit once a day by Vercel.
 *
 * Why one endpoint and not four: a Vercel Hobby project may declare at most two
 * cron jobs and they may not run more often than daily. Four separate entries,
 * or anything hourly, would be rejected at deploy time and would take the whole
 * site's deployment down with it. So vercel.json declares this single daily
 * tick, and the dispatch by day of month lives here in code, where it is also
 * easier to read than four cron expressions.
 *
 * Each tick does two things, in this order:
 *   1. Carries any in-flight bulk send forward. A send that a previous
 *      invocation could not finish inside its time budget continues here,
 *      from exactly where it stopped, with nobody mailed twice.
 *   2. Runs every job whose day of the month has arrived and which has not
 *      already run for its month. The claim in MonthlyJobRun decides that, not
 *      the calendar, so a duplicate tick sends nothing.
 *
 * A missed day is caught up rather than lost: jobs run on or after their day.
 */
import { guardCron, cronJson } from '$lib/server/cron';
import { CRON_BUDGET_MS, drainInFlight, runDueJobs } from '$lib/server/monthlyJobs';
import type { RequestHandler } from './$types';

/** Vercel's ceiling for a single function. The work is budgeted well inside it. */
export const config = { maxDuration: 60 };

/** A third of the budget for unfinished work, the rest for what is due today. */
const DRAIN_BUDGET_MS = Math.round(CRON_BUDGET_MS / 3);

const handler: RequestHandler = async ({ request }) => {
	const denied = guardCron(request);
	if (denied) return denied;

	const startedAt = Date.now();
	const drained = await drainInFlight(DRAIN_BUDGET_MS);
	const remaining = CRON_BUDGET_MS - (Date.now() - startedAt);
	const due = await runDueJobs(new Date(), Math.max(2000, remaining));

	return cronJson({
		ok: ![...drained, ...due].some((result) => result.status === 'FAILED'),
		ranFor: new Date().toISOString(),
		resumed: drained,
		due,
		tookMs: Date.now() - startedAt
	});
};

export const GET = handler;
export const POST = handler;
