/**
 * The sponsor-report job on its own.
 *
 * Not in vercel.json: the daily dispatcher at /api/cron/daily runs it on its
 * day. This URL exists so one job can be triggered deliberately, with the same
 * bearer secret, without waiting for the calendar. It is idempotent for the
 * same reason every path is: the (job, month) claim decides whether anything
 * sends, so calling it twice sends once.
 */
import { guardCron, cronJson } from '$lib/server/cron';
import { runJob } from '$lib/server/monthlyJobs';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 60 };

const handler: RequestHandler = async ({ request }) => {
	const denied = guardCron(request);
	if (denied) return denied;

	const result = await runJob('sponsor-report', { trigger: 'cron' });
	return cronJson({ ok: result.status !== 'FAILED', result }, result.status === 'FAILED' ? 500 : 200);
};

export const GET = handler;
export const POST = handler;
