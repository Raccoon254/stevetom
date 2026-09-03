/**
 * The four scheduled monthly jobs, and the rules that keep them honest.
 *
 * ── What runs ─────────────────────────────────────────────────────────────
 *   blog-reminder     to the owner:    how long it has actually been.
 *   report-reminder   to the owner:    the month's real figures.
 *   sponsor-report    to sponsors:     the month, from the database.
 *   newsletter        to subscribers:  the month's posts.
 *
 * ── Idempotency ───────────────────────────────────────────────────────────
 * Nothing sends until a MonthlyJobRun row for (job, period) has been INSERTed.
 * That pair is unique in Postgres, so a duplicate cron fire, a Vercel retry
 * after a timeout, and the owner pressing "run now" at the same second all
 * collide on the constraint. The loser is told the job already ran and sends
 * nothing. There is no window between checking and sending, because the check
 * is the insert.
 *
 * If the table is not in the database yet, the claim fails and the job refuses
 * to run. That is deliberate: without somewhere to record that a send happened
 * there is no way to stop it happening again, so no lock means no mail.
 *
 * ── Surviving a function timeout ──────────────────────────────────────────
 * The two bulk sends do not loop over recipients. They materialise a Campaign
 * and its per-recipient CampaignDelivery rows, then hand off to deliverBatch()
 * in $lib/server/campaigns, which claims each address with a conditional
 * update before mailing it and stops at its own time budget. This module drives
 * that in a loop bounded by CRON_BUDGET_MS and then stops, whatever is left.
 * The run stays RUNNING with its campaignId, and the next invocation, whether
 * tomorrow's cron or the owner opening the campaign in /admin/messages,
 * continues exactly where it stopped. Nobody is mailed twice, because a claimed
 * row is never re-claimed.
 *
 * ── Never inventing anything ──────────────────────────────────────────────
 * A month with no revenue, no visitors, no requests, no sponsor movement and
 * no posts produces no sponsor report at all: substanceOf() returns nothing,
 * the run is recorded as SKIPPED with the reason, and the owner gets a one
 * paragraph note saying so. The same goes for a newsletter with no new post
 * behind it. Mailing a page of zeros would be presenting an absence of data as
 * a finding, and these go to people who are paying for the truth.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '$lib/db.js';
import { posts } from '$lib/content';
import { isMissingRelation, normaliseEmail, type Recipient } from '$lib/server/contacts';
import {
	MAX_RECIPIENTS,
	createCampaign,
	defaultSenderKey,
	deliverBatch,
	errorText,
	renderCampaignHtml,
	renderCampaignText,
	sendTest,
	startCampaign,
	type RenderableCampaign
} from '$lib/server/campaigns';
import { logActivity } from '$lib/server/log';
import { NOTIFY_TO } from '$lib/server/mailer';
import {
	blogStats,
	gatherMonthlyStats,
	monthOf,
	periodFromKey,
	previousMonthOf,
	substanceOf,
	type MonthlyStats,
	type Period
} from '$lib/server/reports';
import {
	newsletterMarkdown,
	newsletterSubject,
	renderBlogReminder,
	renderReportReminder,
	sendBlogReminder,
	sendJobNotice,
	sendReportReminder,
	sponsorReportMarkdown,
	sponsorReportSubject
} from '$lib/server/emails/monthly';

/* ──────────────────────────────── the jobs ──────────────────────────────── */

export type JobKey = 'blog-reminder' | 'report-reminder' | 'sponsor-report' | 'newsletter';

export type JobDefinition = {
	key: JobKey;
	label: string;
	blurb: string;
	/** Who receives it, in plain words, for the admin screen. */
	audience: string;
	/** UTC day of the month from which the dispatcher will run it. */
	day: number;
	/** Which month the run is filed under and reports on. */
	covers: 'previous' | 'current';
	/** True for the two sends that go to a list through a Campaign. */
	bulk: boolean;
};

/**
 * The order here is the order they run in, and the days are spaced so the
 * owner is never sent three things in one morning: the figures land on the
 * 1st, the sponsor report follows on the 3rd once he has had two days to read
 * them or stop it, the writing nudge is mid-month, and the newsletter closes
 * the month out.
 */
export const JOBS: JobDefinition[] = [
	{
		key: 'report-reminder',
		label: 'Report reminder',
		blurb: "Last month's real figures, sent to you so the write-up can be done from them.",
		audience: NOTIFY_TO.email,
		day: 1,
		covers: 'previous',
		bulk: false
	},
	{
		key: 'sponsor-report',
		label: 'Sponsor and investor report',
		blurb: 'The month from the database, sent to sponsors who are listed and still active.',
		audience: 'Active sponsors whose visibility is not private',
		day: 3,
		covers: 'previous',
		bulk: true
	},
	{
		key: 'blog-reminder',
		label: 'Writing reminder',
		blurb: 'How long it has been since the last post, and what it was.',
		audience: NOTIFY_TO.email,
		day: 8,
		covers: 'current',
		bulk: false
	},
	{
		key: 'newsletter',
		label: 'Monthly newsletter',
		blurb: "Last month's posts, to everyone still subscribed.",
		audience: 'Active newsletter subscribers',
		day: 15,
		covers: 'previous',
		bulk: true
	}
];

export function jobByKey(key: string | null | undefined): JobDefinition | null {
	return JOBS.find((job) => job.key === key) ?? null;
}

/** The month a job run is filed under when it fires at `now`. */
export function periodFor(job: JobDefinition, now: Date = new Date()): Period {
	return job.covers === 'previous' ? previousMonthOf(now) : monthOf(now);
}

/* ───────────────────────────────── budgets ──────────────────────────────── */

/**
 * How long one invocation may spend pushing batches out. Comfortably inside
 * the 60 second ceiling a Vercel function is given, with room for the queries
 * that ran before it and the response that follows.
 */
export const CRON_BUDGET_MS = 25_000;

/**
 * How late a missed job may still be run automatically.
 *
 * Jobs run on or after their day, so a tick that never fired is caught up the
 * next day rather than lost. Without a limit that catch-up has a sharp edge:
 * the first tick after this feature is deployed would find every job of the
 * month unclaimed and fire all of them at once, including a report to sponsors
 * about a month the owner never looked at. A week is long enough to survive an
 * outage and short enough that a stale month is left for a person to decide
 * about, from the reports console.
 */
const CATCHUP_DAYS = 7;

/**
 * A RUNNING run with no campaign behind it, older than this, is a single
 * message whose invocation died. It is left alone rather than retried: we
 * cannot know whether the mail was accepted before the process ended, and the
 * rule is never to send the same monthly mail twice.
 */
const STALE_RUN_MS = 10 * 60 * 1000;

/* ──────────────────────────────── outcomes ──────────────────────────────── */

export type OutcomeStatus = 'SENT' | 'SENDING' | 'SKIPPED' | 'FAILED' | 'ALREADY' | 'BLOCKED';

export type JobOutcome = {
	job: JobKey;
	period: string;
	status: OutcomeStatus;
	message: string;
	campaignId?: string | null;
	recipients?: number;
};

const outcome = (
	job: JobKey,
	period: string,
	status: OutcomeStatus,
	message: string,
	extra: Partial<JobOutcome> = {}
): JobOutcome => ({ job, period, status, message, ...extra });

/* ─────────────────────────────── the claim ──────────────────────────────── */

type RunRow = {
	id: string;
	job: string;
	period: string;
	status: string;
	campaignId: string | null;
	recipientCount: number;
	detail: string | null;
	trigger: string;
	startedAt: Date;
	completedAt: Date | null;
};

type Claim =
	| { ok: true; run: RunRow; resumed: boolean }
	| { ok: false; status: OutcomeStatus; message: string; run?: RunRow };

function isUniqueViolation(error: unknown): boolean {
	return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

/**
 * Take the lock for (job, period), or explain why this invocation may not send.
 *
 * The happy path is one INSERT. Everything else is a decision about a row that
 * already exists, and the bias in every one of those decisions is towards not
 * sending.
 */
async function claim(job: JobKey, period: Period, trigger: 'cron' | 'admin'): Promise<Claim> {
	try {
		const run = await prisma.monthlyJobRun.create({
			data: { job, period: period.key, status: 'RUNNING', trigger }
		});
		return { ok: true, run, resumed: false };
	} catch (error) {
		if (isMissingRelation(error)) {
			return {
				ok: false,
				status: 'BLOCKED',
				message:
					'The MonthlyJobRun table is not in this database yet, so there is nowhere to record that this month already went out. Nothing was sent. Apply the migration for the model at the end of prisma/schema.prisma.'
			};
		}
		if (!isUniqueViolation(error)) {
			console.error(`monthlyJobs: could not claim ${job} ${period.key}:`, error);
			return {
				ok: false,
				status: 'FAILED',
				message: `The run could not be claimed, so nothing was sent: ${errorText(error)}`
			};
		}
	}

	const existing = await prisma.monthlyJobRun.findUnique({
		where: { job_period: { job, period: period.key } }
	});
	if (!existing) {
		// The row that collided has gone. Rather than race again, stop.
		return { ok: false, status: 'FAILED', message: 'The run record vanished mid-claim.' };
	}

	if (existing.status === 'SENT') {
		return {
			ok: false,
			status: 'ALREADY',
			message: `${period.label} already went out on ${existing.completedAt?.toISOString().slice(0, 10) ?? 'an earlier run'}.`,
			run: existing
		};
	}
	if (existing.status === 'SKIPPED') {
		return {
			ok: false,
			status: 'ALREADY',
			message: existing.detail ?? `${period.label} was deliberately skipped.`,
			run: existing
		};
	}
	if (existing.status === 'FAILED') {
		// Nothing was sent under a FAILED run, so retrying is safe. The
		// conditional update is what makes it safe to retry concurrently.
		const { count } = await prisma.monthlyJobRun.updateMany({
			where: { id: existing.id, status: 'FAILED' },
			data: { status: 'RUNNING', detail: null, trigger }
		});
		if (count !== 1) {
			return { ok: false, status: 'ALREADY', message: 'Another run picked this up.', run: existing };
		}
		return { ok: true, run: { ...existing, status: 'RUNNING' }, resumed: true };
	}

	// RUNNING. A bulk send has a campaign to resume; a single message does not.
	if (existing.campaignId) {
		return { ok: true, run: existing, resumed: true };
	}
	const age = Date.now() - new Date(existing.startedAt).getTime();
	if (age < STALE_RUN_MS) {
		return {
			ok: false,
			status: 'ALREADY',
			message: 'This run is already in progress.',
			run: existing
		};
	}
	return {
		ok: false,
		status: 'BLOCKED',
		message:
			'A previous run of this job started and never finished, and it sends a single message, so there is no per-recipient record proving whether it went. It is left alone rather than risk a second copy. Clear it from the reports console if you know it did not send.',
		run: existing
	};
}

/**
 * The three ways a run ends. None of them may throw.
 *
 * By the time one of these is called the mail has already been handed to the
 * provider, so an exception here would be caught upstream and recorded as a
 * failure, and a failed run is one that may be retried. That is exactly the
 * double send this whole module exists to prevent. A write that does not land
 * instead leaves the run RUNNING, which is treated as "we cannot prove this
 * did not send" and is never retried on its own.
 */
async function mark(runId: string, data: Record<string, unknown>): Promise<void> {
	try {
		await prisma.monthlyJobRun.update({ where: { id: runId }, data });
	} catch (error) {
		console.error(`monthlyJobs: could not update run ${runId}:`, error);
	}
}

async function markSent(runId: string, recipients: number, detail?: string): Promise<void> {
	await mark(runId, {
		status: 'SENT',
		recipientCount: recipients,
		completedAt: new Date(),
		detail: detail ?? null
	});
}

async function markSkipped(runId: string, reason: string): Promise<void> {
	await mark(runId, { status: 'SKIPPED', completedAt: new Date(), detail: reason });
}

async function markFailed(runId: string, reason: string): Promise<void> {
	await mark(runId, { status: 'FAILED', detail: reason.slice(0, 900) });
}

/* ───────────────────────────── recipient lists ──────────────────────────── */

/**
 * Who the sponsor report goes to: a live sponsorship, and consent to be
 * contacted about it.
 *
 * PRIVATE is excluded because a sponsor who asked to be invisible did not ask
 * for a monthly bulletin. Anyone who has unsubscribed from the newsletter is
 * excluded too: an opt-out is an opt-out, whatever list the address turns up
 * on. No existing segment expresses this pair of conditions, which is why the
 * list is built here rather than through resolveSegmentRecipients.
 */
export async function sponsorReportRecipients(now: Date = new Date()): Promise<Recipient[]> {
	const sponsors = await prisma.sponsor.findMany({
		where: {
			visibility: { not: 'PRIVATE' },
			cancelledAt: null,
			OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
		},
		orderBy: { email: 'asc' },
		take: MAX_RECIPIENTS,
		select: { email: true, displayName: true, orgName: true }
	});
	if (sponsors.length === 0) return [];

	const optedOut = new Set(
		(
			await prisma.newsletterSubscriber.findMany({
				where: { isActive: false },
				select: { email: true }
			})
		).map((row) => normaliseEmail(row.email))
	);

	const seen = new Set<string>();
	const out: Recipient[] = [];
	for (const sponsor of sponsors) {
		const email = normaliseEmail(sponsor.email);
		if (!email || !email.includes('@')) continue;
		if (optedOut.has(email) || seen.has(email)) continue;
		seen.add(email);
		out.push({ email, name: sponsor.orgName || sponsor.displayName || null });
	}
	return out;
}

/**
 * Posts published in the window that have not already been mailed to the list.
 *
 * NewsletterIssue is the existing record of "this post has been sent", written
 * by sendIssue() in $lib/server/newsletter. Reusing it means the monthly digest
 * and a one-off issue can never both mail the same piece.
 */
export async function newsletterPosts(period: Period): Promise<
	{ slug: string; title: string; excerpt: string; date: string }[]
> {
	const inWindow = posts
		.filter((post) => {
			const time = Date.parse(post.date);
			return (
				Number.isFinite(time) && time >= period.start.getTime() && time < period.end.getTime()
			);
		})
		.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
	if (inWindow.length === 0) return [];

	const sent = new Set(
		(
			await prisma.newsletterIssue.findMany({
				where: { postSlug: { in: inWindow.map((post) => post.slug) } },
				select: { postSlug: true }
			})
		).map((row) => row.postSlug)
	);

	return inWindow
		.filter((post) => !sent.has(post.slug))
		.map((post) => ({
			slug: post.slug,
			title: post.title,
			excerpt: post.excerpt,
			date: post.date
		}));
}

/* ─────────────────────────── campaign plumbing ──────────────────────────── */

/**
 * Write the Campaign and one CampaignDelivery per recipient, as a DRAFT.
 *
 * This mirrors what createCampaign() does for a segment, and exists only
 * because the sponsor list is not a segment. The chunking, the snapshot and the
 * corrected count are the same, and the rows it writes are driven by the same
 * deliverBatch().
 */
async function materialiseCampaign(input: {
	subject: string;
	bodyMd: string;
	segment: string;
	segmentLabel: string;
	includeUnsubscribe: boolean;
	recipients: Recipient[];
}): Promise<{ id: string; recipients: number }> {
	const campaign = await prisma.campaign.create({
		data: {
			subject: input.subject,
			bodyMd: input.bodyMd,
			fromKey: defaultSenderKey(),
			segment: input.segment,
			segmentLabel: input.segmentLabel,
			contactEmail: null,
			includeUnsubscribe: input.includeUnsubscribe,
			recipientCount: 0,
			sentBy: 'scheduled'
		}
	});

	const CHUNK = 500;
	for (let i = 0; i < input.recipients.length; i += CHUNK) {
		await prisma.campaignDelivery.createMany({
			data: input.recipients.slice(i, i + CHUNK).map((row) => ({
				campaignId: campaign.id,
				email: normaliseEmail(row.email),
				name: row.name ?? null
			})),
			skipDuplicates: true
		});
	}

	const written = await prisma.campaignDelivery.count({ where: { campaignId: campaign.id } });
	await prisma.campaign.update({
		where: { id: campaign.id },
		data: { recipientCount: written }
	});
	return { id: campaign.id, recipients: written };
}

/** Push batches until the campaign is done or the invocation runs out of time. */
async function drive(campaignId: string, budgetMs: number) {
	const deadline = Date.now() + Math.max(0, budgetMs);
	let result = await deliverBatch(campaignId);
	while (!result.done && Date.now() < deadline) {
		result = await deliverBatch(campaignId);
	}
	return result;
}

/**
 * How far a bulk run should be carried this time.
 *
 *   send    start it if it has not started, then push batches.
 *   draft   build it and stop, so a person can read it and send it.
 *   resume  continue what is already going, and never start a draft that a
 *           person built by hand: a draft is a decision not yet made.
 */
type AdvanceMode = 'send' | 'draft' | 'resume';

/**
 * Carry a claimed bulk run forward from wherever it is.
 *
 * Every state a campaign can be in is handled here, so this is equally the
 * "start it" path, the "resume after a timeout" path, and the "the owner sent
 * it by hand from /admin/messages" path.
 */
async function advanceCampaignRun(
	job: JobDefinition,
	period: Period,
	run: RunRow,
	budgetMs: number,
	mode: AdvanceMode = 'resume'
): Promise<JobOutcome> {
	const campaignId = run.campaignId;
	if (!campaignId) {
		return outcome(job.key, period.key, 'FAILED', 'The run has no campaign to advance.');
	}
	const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
	if (!campaign) {
		await markFailed(run.id, 'The campaign this run created no longer exists.');
		return outcome(job.key, period.key, 'FAILED', 'The campaign this run created is gone.');
	}

	if (campaign.status === 'CANCELLED') {
		await markSkipped(run.id, 'The campaign was cancelled by hand, so nothing more will be sent.');
		return outcome(job.key, period.key, 'SKIPPED', 'The campaign was cancelled.', {
			campaignId
		});
	}

	if (campaign.status === 'DRAFT') {
		// A draft that a person asked for is left alone by everything except an
		// explicit send. That is the whole point of building it as a draft, and
		// it is why the scheduler resuming this run will not push it out from
		// under him.
		if (mode === 'draft' || (mode === 'resume' && run.trigger === 'admin')) {
			return outcome(
				job.key,
				period.key,
				'SENDING',
				'A draft is waiting for you to test and send it.',
				{ campaignId, recipients: campaign.recipientCount }
			);
		}
		if (!campaign.testSentAt) {
			// The scheduled path sends the owner his own copy first. That is the
			// sender's own precondition for a real send, and it means the exact
			// email is in his inbox before the first recipient gets it.
			const test = await sendTest(campaignId);
			if (!test.ok) {
				await markFailed(run.id, `The copy to your own inbox failed: ${test.error}`);
				return outcome(job.key, period.key, 'FAILED', `Your own copy failed: ${test.error}`, {
					campaignId
				});
			}
		}
		const started = await startCampaign(campaignId);
		if (!started.ok) {
			await markFailed(run.id, started.error);
			return outcome(job.key, period.key, 'FAILED', started.error, { campaignId });
		}
	}

	const fresh = await prisma.campaign.findUnique({ where: { id: campaignId } });
	if (fresh?.status === 'SENDING') {
		try {
			await drive(campaignId, budgetMs);
		} catch (error) {
			console.error(`monthlyJobs: batch failed for ${job.key} ${period.key}:`, error);
			// The run stays RUNNING on purpose. Whatever was claimed and sent is
			// recorded per recipient, and the next invocation continues.
			return outcome(
				job.key,
				period.key,
				'SENDING',
				`A batch failed and the send will resume: ${errorText(error)}`,
				{ campaignId }
			);
		}
	}

	return finaliseCampaignRun(job, period, run.id, campaignId);
}

/** Close the run once its campaign has finished, or report what is left. */
async function finaliseCampaignRun(
	job: JobDefinition,
	period: Period,
	runId: string,
	campaignId: string
): Promise<JobOutcome> {
	const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
	if (!campaign) {
		await markFailed(runId, 'The campaign this run created no longer exists.');
		return outcome(job.key, period.key, 'FAILED', 'The campaign is gone.');
	}

	if (campaign.status !== 'SENT') {
		const remaining = await prisma.campaignDelivery.count({
			where: { campaignId, status: 'QUEUED' }
		});
		return outcome(
			job.key,
			period.key,
			'SENDING',
			`${campaign.sentCount} sent, ${remaining} still queued. It will continue on the next run.`,
			{ campaignId, recipients: campaign.sentCount }
		);
	}

	await markSent(
		runId,
		campaign.sentCount,
		campaign.failedCount
			? `${campaign.failedCount} address${campaign.failedCount === 1 ? '' : 'es'} failed.`
			: undefined
	);

	if (job.key === 'newsletter') {
		await recordNewsletterIssues(period, campaign.sentCount);
	}

	await logActivity({
		action: `monthly.${job.key}.sent`,
		entity: job.key === 'newsletter' ? 'newsletter' : 'sponsor',
		entityId: `${job.key}:${period.key}`,
		actor: 'system',
		summary: `${job.label} for ${period.label} sent to ${campaign.sentCount} recipient${campaign.sentCount === 1 ? '' : 's'}${campaign.failedCount ? `, ${campaign.failedCount} failed` : ''}`
	});

	return outcome(
		job.key,
		period.key,
		'SENT',
		`Sent to ${campaign.sentCount} recipient${campaign.sentCount === 1 ? '' : 's'}.`,
		{ campaignId, recipients: campaign.sentCount }
	);
}

/**
 * Mark the digest's posts as mailed, using the count the campaign actually
 * confirmed rather than the size of the list it started with.
 */
async function recordNewsletterIssues(period: Period, sentCount: number): Promise<void> {
	try {
		const covered = await newsletterPosts(period);
		if (covered.length === 0) return;
		await prisma.newsletterIssue.createMany({
			data: covered.map((post) => ({
				postSlug: post.slug,
				postTitle: post.title,
				recipients: sentCount
			})),
			skipDuplicates: true
		});
	} catch (error) {
		console.error('monthlyJobs: could not record newsletter issues:', error);
	}
}

/* ──────────────────────────────── run a job ─────────────────────────────── */

export type RunOptions = {
	now?: Date;
	trigger?: 'cron' | 'admin';
	budgetMs?: number;
	/**
	 * 'send' does the whole thing. 'draft' stops after building the campaign so
	 * the owner can read it, test it and send it himself from /admin/messages.
	 * Only meaningful for the two bulk jobs.
	 */
	mode?: 'send' | 'draft';
	/** Report on this month instead of the one the schedule implies. */
	period?: Period;
};

/**
 * A scheduled invocation only ever resumes work that is already in flight. A
 * person pressing a button says which of the two things he meant.
 */
function advanceModeFor(options: RunOptions, trigger: 'cron' | 'admin'): AdvanceMode {
	return trigger === 'admin' ? (options.mode ?? 'send') : 'resume';
}

export async function runJob(key: JobKey, options: RunOptions = {}): Promise<JobOutcome> {
	const job = jobByKey(key);
	if (!job) return outcome(key, '', 'FAILED', 'No such job.');

	const now = options.now ?? new Date();
	const period = options.period ?? periodFor(job, now);
	const trigger = options.trigger ?? 'cron';
	const budgetMs = options.budgetMs ?? CRON_BUDGET_MS;

	const claimed = await claim(key, period, trigger);
	if (!claimed.ok) {
		// An in-flight bulk run is still worth advancing rather than reporting.
		if (claimed.status === 'ALREADY' && claimed.run?.campaignId && claimed.run.status === 'RUNNING') {
			return advanceCampaignRun(job, period, claimed.run, budgetMs, advanceModeFor(options, trigger));
		}
		return outcome(key, period.key, claimed.status, claimed.message, {
			campaignId: claimed.run?.campaignId ?? null
		});
	}

	const run = claimed.run;

	try {
		if (run.campaignId) {
			return await advanceCampaignRun(job, period, run, budgetMs, advanceModeFor(options, trigger));
		}

		switch (key) {
			case 'blog-reminder':
				return await runBlogReminder(job, period, run, now);
			case 'report-reminder':
				return await runReportReminder(job, period, run, now);
			case 'sponsor-report':
				return await runSponsorReport(job, period, run, now, budgetMs, options.mode ?? 'send');
			case 'newsletter':
				return await runNewsletter(job, period, run, now, budgetMs, options.mode ?? 'send');
			default:
				return outcome(key, period.key, 'FAILED', 'No such job.');
		}
	} catch (error) {
		console.error(`monthlyJobs: ${key} ${period.key} failed:`, error);
		await markFailed(run.id, errorText(error));
		return outcome(key, period.key, 'FAILED', errorText(error));
	}
}

async function runBlogReminder(
	job: JobDefinition,
	period: Period,
	run: RunRow,
	now: Date
): Promise<JobOutcome> {
	const blog = blogStats(period, now);

	// Already published this month: there is nothing to remind him of, and a
	// reminder that arrives anyway is exactly the nagging this was meant not
	// to be. Recorded as skipped so it cannot fire later in the same month.
	if (blog.publishedInMonth.length > 0) {
		const reason = `Already published in ${period.label}: ${blog.publishedInMonth
			.map((post) => post.title)
			.join(', ')}.`;
		await markSkipped(run.id, reason);
		await logActivity({
			action: 'monthly.blog-reminder.skipped',
			entity: 'newsletter',
			entityId: `blog-reminder:${period.key}`,
			actor: 'system',
			summary: reason
		});
		return outcome(job.key, period.key, 'SKIPPED', reason);
	}

	let subscribers: number | null = null;
	try {
		subscribers = await prisma.newsletterSubscriber.count({ where: { isActive: true } });
	} catch (error) {
		console.error('monthlyJobs: subscriber count unavailable:', error);
	}

	const sent = await sendBlogReminder({ period, blog, subscribers });
	if (!sent.ok) {
		await markFailed(run.id, sent.error ?? 'The reminder could not be sent.');
		return outcome(job.key, period.key, 'FAILED', sent.error ?? 'The reminder could not be sent.');
	}

	await markSent(run.id, 1);
	await logActivity({
		action: 'monthly.blog-reminder.sent',
		entity: 'newsletter',
		entityId: `blog-reminder:${period.key}`,
		actor: 'system',
		summary:
			blog.daysSinceLatest === null
				? `Writing reminder for ${period.label} sent: no dated post on the site`
				: `Writing reminder for ${period.label} sent: ${blog.daysSinceLatest} days since "${blog.latest?.title ?? 'the last post'}"`
	});
	return outcome(job.key, period.key, 'SENT', `Sent to ${NOTIFY_TO.email}.`, { recipients: 1 });
}

async function runReportReminder(
	job: JobDefinition,
	period: Period,
	run: RunRow,
	now: Date
): Promise<JobOutcome> {
	const stats = await gatherMonthlyStats(period, now);
	const sent = await sendReportReminder(stats);
	if (!sent.ok) {
		await markFailed(run.id, sent.error ?? 'The reminder could not be sent.');
		return outcome(job.key, period.key, 'FAILED', sent.error ?? 'The reminder could not be sent.');
	}

	await markSent(run.id, 1);
	await logActivity({
		action: 'monthly.report-reminder.sent',
		entity: 'sponsor',
		entityId: `report-reminder:${period.key}`,
		actor: 'system',
		summary: `Figures for ${period.label} sent to ${NOTIFY_TO.email}`
	});
	return outcome(job.key, period.key, 'SENT', `Sent to ${NOTIFY_TO.email}.`, { recipients: 1 });
}

async function runSponsorReport(
	job: JobDefinition,
	period: Period,
	run: RunRow,
	now: Date,
	budgetMs: number,
	mode: 'send' | 'draft'
): Promise<JobOutcome> {
	const stats = await gatherMonthlyStats(period, now);
	const substance = substanceOf(stats);

	if (substance.length === 0) {
		const reason = `Nothing happened in ${period.label} that the database can show: no payment, no visitor, no request, no sponsor movement and no post. No report was sent.`;
		await markSkipped(run.id, reason);
		await sendJobNotice({
			job: job.key,
			period,
			subject: `No sponsor report for ${period.label}`,
			heading: `${period.label} had nothing in it`,
			lines: [
				reason,
				'Rather than mail a page of zeros to people who are paying for the truth, the send was skipped. If you know something happened that the site never recorded, write it up yourself from the reports console.'
			]
		});
		return outcome(job.key, period.key, 'SKIPPED', reason);
	}

	const recipients = await sponsorReportRecipients(now);
	if (recipients.length === 0) {
		const reason =
			'There is no sponsor to send to: nobody is both currently active and visible as anything other than private.';
		await markSkipped(run.id, reason);
		await sendJobNotice({
			job: job.key,
			period,
			subject: `No one to send the ${period.label} report to`,
			heading: 'The report was written and not sent',
			lines: [
				reason,
				`The figures for ${period.label} are on the reports console, where you can read the exact email that would have gone out.`
			]
		});
		return outcome(job.key, period.key, 'SKIPPED', reason);
	}

	const built = await materialiseCampaign({
		subject: sponsorReportSubject(stats),
		bodyMd: sponsorReportMarkdown(stats),
		segment: 'monthly_report',
		segmentLabel: `Sponsors and investors, ${period.label}`,
		// No unsubscribe link: this is a report to people with a live financial
		// relationship, and the one-click link unsubscribes from the newsletter,
		// which is a different list. The body says plainly how to stop it, and
		// anyone who has opted out of the newsletter was already excluded.
		includeUnsubscribe: false,
		recipients
	});

	await prisma.monthlyJobRun.update({
		where: { id: run.id },
		data: { campaignId: built.id, recipientCount: built.recipients }
	});
	await logActivity({
		action: 'monthly.sponsor-report.built',
		entity: 'sponsor',
		entityId: `sponsor-report:${period.key}`,
		actor: mode === 'draft' ? 'admin' : 'system',
		summary: `${period.label} report drafted for ${built.recipients} sponsor${built.recipients === 1 ? '' : 's'}`
	});

	if (mode === 'draft') {
		return outcome(
			job.key,
			period.key,
			'SENDING',
			`Drafted for ${built.recipients} recipient${built.recipients === 1 ? '' : 's'}. Read it, test it and send it from the message screen.`,
			{ campaignId: built.id, recipients: built.recipients }
		);
	}

	return advanceCampaignRun(job, period, { ...run, campaignId: built.id }, budgetMs, 'send');
}

async function runNewsletter(
	job: JobDefinition,
	period: Period,
	run: RunRow,
	now: Date,
	budgetMs: number,
	mode: 'send' | 'draft'
): Promise<JobOutcome> {
	const fresh = await newsletterPosts(period);

	if (fresh.length === 0) {
		const reason = `No post published in ${period.label} that the list has not already been sent, so there was nothing to write about.`;
		await markSkipped(run.id, reason);
		await sendJobNotice({
			job: job.key,
			period,
			subject: `No newsletter for ${period.label}`,
			heading: 'There was nothing to send',
			lines: [
				reason,
				'A newsletter with no writing in it is just an email. It was skipped rather than padded out.'
			]
		});
		return outcome(job.key, period.key, 'SKIPPED', reason);
	}

	// The subscriber list is resolved by the existing segment code, which
	// excludes anyone who has opted out and refuses an empty list outright.
	const created = await createCampaign({
		subject: newsletterSubject({ period, posts: fresh }),
		bodyMd: newsletterMarkdown({ period, posts: fresh }),
		fromKey: defaultSenderKey(),
		target: 'subscribers'
	});

	if (!created.ok) {
		await markSkipped(run.id, created.error);
		await sendJobNotice({
			job: job.key,
			period,
			subject: `No newsletter for ${period.label}`,
			heading: 'The newsletter was not sent',
			lines: [created.error]
		});
		return outcome(job.key, period.key, 'SKIPPED', created.error);
	}

	await prisma.monthlyJobRun.update({
		where: { id: run.id },
		data: { campaignId: created.id, recipientCount: created.recipients }
	});

	if (mode === 'draft') {
		return outcome(
			job.key,
			period.key,
			'SENDING',
			`Drafted for ${created.recipients} subscriber${created.recipients === 1 ? '' : 's'}. Read it, test it and send it from the message screen.`,
			{ campaignId: created.id, recipients: created.recipients }
		);
	}

	return advanceCampaignRun(job, period, { ...run, campaignId: created.id }, budgetMs, 'send');
}

/* ────────────────────────────── the dispatcher ──────────────────────────── */

/**
 * Every job whose day has come and which has not already run for its month.
 *
 * The comparison is `>=`, not `==`, so a day the cron never fired is caught up
 * the next day rather than lost for a month, up to CATCHUP_DAYS late. Running
 * twice is impossible anyway: the claim is what decides, not the calendar.
 */
export async function runDueJobs(
	now: Date = new Date(),
	budgetMs: number = CRON_BUDGET_MS
): Promise<JobOutcome[]> {
	const day = now.getUTCDate();
	const deadline = Date.now() + budgetMs;
	const results: JobOutcome[] = [];

	for (const job of JOBS) {
		if (day < job.day) continue;
		if (day - job.day > CATCHUP_DAYS) continue;
		const remaining = deadline - Date.now();
		if (remaining <= 2000 && job.bulk) {
			// Out of time for a send. Leave it unclaimed so tomorrow picks it up.
			continue;
		}
		results.push(await runJob(job.key, { now, trigger: 'cron', budgetMs: Math.max(2000, remaining) }));
	}
	return results;
}

/**
 * Carry every in-flight bulk send forward. This is what makes a send that was
 * cut off by a function timeout finish on its own, and what closes a run whose
 * campaign the owner sent by hand.
 */
export async function drainInFlight(budgetMs: number = CRON_BUDGET_MS): Promise<JobOutcome[]> {
	const deadline = Date.now() + budgetMs;
	const results: JobOutcome[] = [];

	let running: RunRow[] = [];
	try {
		running = await prisma.monthlyJobRun.findMany({
			where: { status: 'RUNNING', NOT: { campaignId: null } },
			orderBy: { startedAt: 'asc' },
			take: 10
		});
	} catch (error) {
		if (isMissingRelation(error)) return results;
		throw error;
	}

	for (const run of running) {
		const job = jobByKey(run.job);
		const period = periodFromKey(run.period);
		if (!job || !period) continue;
		const remaining = deadline - Date.now();
		if (remaining <= 1000) break;
		try {
			results.push(await advanceCampaignRun(job, period, run, remaining));
		} catch (error) {
			console.error(`monthlyJobs: could not advance ${run.job} ${run.period}:`, error);
		}
	}
	return results;
}

/* ──────────────────────────────── previewing ────────────────────────────── */

export type JobPreview = {
	job: JobDefinition;
	period: Period;
	subject: string;
	html: string;
	text: string;
	/** How many people it would go to right now. */
	recipients: number;
	/** A handful of the addresses, for a sanity check. */
	sample: string[];
	/** Set when running it now would send nothing, and why. */
	skipReason: string | null;
	stats: MonthlyStats | null;
};

/**
 * Render exactly what would be sent, without sending it and without claiming
 * the run. Safe to call as often as he likes.
 */
export async function previewJob(key: JobKey, period: Period): Promise<JobPreview> {
	const job = jobByKey(key);
	if (!job) throw new Error('No such job.');
	const now = new Date();

	if (key === 'blog-reminder') {
		const blog = blogStats(period, now);
		let subscribers: number | null = null;
		try {
			subscribers = await prisma.newsletterSubscriber.count({ where: { isActive: true } });
		} catch {
			subscribers = null;
		}
		const rendered = renderBlogReminder({ period, blog, subscribers });
		return {
			job,
			period,
			...rendered,
			recipients: 1,
			sample: [NOTIFY_TO.email],
			skipReason:
				blog.publishedInMonth.length > 0
					? `You have already published in ${period.label}, so the scheduled run will skip this rather than nag.`
					: null,
			stats: null
		};
	}

	if (key === 'report-reminder') {
		const stats = await gatherMonthlyStats(period, now);
		const rendered = renderReportReminder(stats);
		return {
			job,
			period,
			...rendered,
			recipients: 1,
			sample: [NOTIFY_TO.email],
			skipReason: null,
			stats
		};
	}

	if (key === 'sponsor-report') {
		const stats = await gatherMonthlyStats(period, now);
		const substance = substanceOf(stats);
		const recipients = await sponsorReportRecipients(now).catch(() => [] as Recipient[]);
		const draft: RenderableCampaign = {
			subject: sponsorReportSubject(stats),
			bodyMd: sponsorReportMarkdown(stats),
			segment: 'monthly_report',
			segmentLabel: `Sponsors and investors, ${period.label}`,
			contactEmail: null,
			includeUnsubscribe: false
		};
		const sampleAddress = recipients[0]?.email ?? NOTIFY_TO.email;
		return {
			job,
			period,
			subject: draft.subject,
			html: renderCampaignHtml(draft, sampleAddress),
			text: renderCampaignText(draft, sampleAddress),
			recipients: recipients.length,
			sample: recipients.slice(0, 8).map((row) => row.email),
			skipReason:
				substance.length === 0
					? `Nothing happened in ${period.label} that the database can show, so the scheduled run will skip this rather than mail a page of zeros.`
					: recipients.length === 0
						? 'There is nobody to send to: no sponsor is both currently active and visible as anything other than private.'
						: null,
			stats
		};
	}

	// newsletter
	const fresh = await newsletterPosts(period);
	const draft: RenderableCampaign = {
		subject: fresh.length ? newsletterSubject({ period, posts: fresh }) : `Nothing to send`,
		bodyMd: fresh.length
			? newsletterMarkdown({ period, posts: fresh })
			: `No post published in ${period.label} is waiting to go out.`,
		segment: 'subscribers',
		segmentLabel: 'Newsletter subscribers',
		contactEmail: null,
		includeUnsubscribe: true
	};
	let subscribers = 0;
	let sample: string[] = [];
	try {
		const rows = await prisma.newsletterSubscriber.findMany({
			where: { isActive: true },
			orderBy: { email: 'asc' },
			take: 8,
			select: { email: true }
		});
		subscribers = await prisma.newsletterSubscriber.count({ where: { isActive: true } });
		sample = rows.map((row) => row.email);
	} catch (error) {
		console.error('monthlyJobs: subscriber preview unavailable:', error);
	}
	const sampleAddress = sample[0] ?? NOTIFY_TO.email;

	return {
		job,
		period,
		subject: draft.subject,
		html: renderCampaignHtml(draft, sampleAddress),
		text: renderCampaignText(draft, sampleAddress),
		recipients: subscribers,
		sample,
		skipReason:
			fresh.length === 0
				? `No post from ${period.label} is waiting to go out, so the scheduled run will skip this.`
				: subscribers === 0
					? 'Nobody is subscribed, so there is nothing to send.'
					: null,
		stats: null
	};
}

/* ─────────────────────────────── run history ────────────────────────────── */

export type RunSummary = {
	job: string;
	period: string;
	status: string;
	campaignId: string | null;
	recipientCount: number;
	detail: string | null;
	trigger: string;
	startedAt: Date;
	completedAt: Date | null;
};

/** Every recorded run for the given months. Empty when the table is missing. */
export async function runsForPeriods(periodKeys: string[]): Promise<RunSummary[]> {
	if (periodKeys.length === 0) return [];
	return prisma.monthlyJobRun.findMany({
		where: { period: { in: periodKeys } },
		orderBy: [{ period: 'desc' }, { startedAt: 'desc' }]
	});
}

/**
 * Release a run that is stuck: it goes back to being unclaimed, so the job can
 * be run again for that month. Only ever used by hand, and only when the owner
 * knows the mail did not go out.
 */
export async function clearRun(job: JobKey, periodKey: string): Promise<boolean> {
	const { count } = await prisma.monthlyJobRun.deleteMany({
		where: { job, period: periodKey, status: { in: ['RUNNING', 'FAILED', 'SKIPPED'] } }
	});
	if (count > 0) {
		await logActivity({
			action: `monthly.${job}.cleared`,
			entity: job === 'newsletter' || job === 'blog-reminder' ? 'newsletter' : 'sponsor',
			entityId: `${job}:${periodKey}`,
			actor: 'admin',
			summary: `Cleared the ${job} run for ${periodKey} so it can be run again`
		});
	}
	return count > 0;
}
