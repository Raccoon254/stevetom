/**
 * Carry every in-flight monthly send forward, and nothing else.
 *
 * This is the resume handle. It starts nothing and claims no new month: it only
 * pushes batches for runs that are already RUNNING with a campaign behind them,
 * and closes a run whose campaign has finished. Safe to call as often as you
 * like, from a cron entry on a plan that allows more than one, or by hand.
 */
import { guardCron, cronJson } from '$lib/server/cron';
import { CRON_BUDGET_MS, drainInFlight } from '$lib/server/monthlyJobs';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 60 };

const handler: RequestHandler = async ({ request }) => {
	const denied = guardCron(request);
	if (denied) return denied;

	const startedAt = Date.now();
	const resumed = await drainInFlight(CRON_BUDGET_MS);
	return cronJson({
		ok: !resumed.some((result) => result.status === 'FAILED'),
		resumed,
		tookMs: Date.now() - startedAt
	});
};

export const GET = handler;
export const POST = handler;
