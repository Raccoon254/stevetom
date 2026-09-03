/**
 * The monthly mail: two reminders to the owner, and the bodies of the two
 * things that go out to other people.
 *
 * The split in this file is deliberate.
 *
 *  - The two reminders are one message to one address, so they are rendered
 *    and sent here with the shared primitives from ../mailer, exactly as
 *    ./sponsor.ts does. Same discipline too: nothing here throws. A scheduled
 *    job that fails because a reminder could not be rendered is worse than a
 *    missing reminder.
 *  - The sponsor report and the newsletter go to many people, so this file
 *    only builds their subject and their markdown body. The sending is the
 *    existing batched, resumable campaign sender in ../campaigns, which is
 *    already the one implementation of "mail a list from a Vercel function"
 *    and does not need a second.
 *
 * Every figure printed here arrives already computed from ../reports. Nothing
 * in this file calculates a number, and every value that ../reports reports as
 * unavailable is printed as unavailable rather than as a zero.
 */
import {
	sendEmail,
	renderEmail,
	p,
	label,
	divider,
	buttonDark,
	esc,
	SENDERS,
	NOTIFY_TO,
	CONTACT,
	BODY_FONT as MAILER_BODY_FONT
} from '../mailer';
import { EMAIL_TAGS } from '$lib/emailTags';
import {
	change,
	dayLabel,
	money,
	num,
	unavailableSections,
	type BlogStats,
	type MonthlyStats,
	type Period
} from '../reports';

const SITE = 'https://www.kentom.co.ke';
const ADMIN_REPORTS = `${SITE}/admin/reports`;

// Imported, not redeclared: one definition of the brand stack.
const BODY_FONT = MAILER_BODY_FONT;
const MONO_FONT = "'Courier New', monospace";

/* ────────────────────────────── shared pieces ───────────────────────────── */

/** Left mono label, right body-font value. Matches the sponsorship emails. */
function factTable(rows: Array<[string, string]>): string {
	const body = rows
		.map(([l, v], i) => {
			const top = i === 0 ? 'border-top:1px solid #e2e2e0;' : '';
			return (
				'<tr>' +
				`<td width="150" valign="top" style="${top}border-bottom:1px solid #e2e2e0;padding:11px 16px 11px 0;font-family:${MONO_FONT};font-size:12px;line-height:1.5;letter-spacing:.05em;color:#999;white-space:nowrap">${l}</td>` +
				`<td valign="top" style="${top}border-bottom:1px solid #e2e2e0;padding:11px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.5;color:#111;word-break:break-word">${v}</td>` +
				'</tr>'
			);
		})
		.join('');
	return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:0 0 24px 0">${body}</table>`;
}

/**
 * A GFM table as one markdown block.
 *
 * The rows have to be joined with single newlines and pushed as a single
 * element: the report is assembled by joining its blocks with blank lines, and
 * a blank line between two rows of a table is two paragraphs, not a table.
 */
function table(header: string[], rows: string[][]): string {
	return [
		`| ${header.join(' | ')} |`,
		`| ${header.map(() => '---').join(' | ')} |`,
		...rows.map((row) => `| ${row.join(' | ')} |`)
	].join('\n');
}

/**
 * Aligned `Label:       value` row for the plain-text alternative. Padded to a
 * column, but never to zero gap: a label longer than the column still gets its
 * space, rather than running into its own value.
 */
function textRow(l: string, v: string): string {
	return `${(l + ':').padEnd(15, ' ')} ${v}`;
}

/** The footnote naming any section that could not be read. */
function missingNote(stats: MonthlyStats): string[] {
	return unavailableSections(stats);
}

export type Rendered = { subject: string; html: string; text: string };

/* ───────────────────────────── blog reminder ────────────────────────────── */

export type BlogReminderInput = {
	period: Period;
	blog: BlogStats;
	/** Active subscribers right now, or null when the list could not be read. */
	subscribers: number | null;
};

/**
 * "It has been this long, and this was the last one." The gap is measured from
 * the real date in the post's frontmatter, so the number in the subject line
 * is the same number a reader would get by looking at the blog.
 */
export function renderBlogReminder(input: BlogReminderInput): Rendered {
	const { blog } = input;
	const days = blog.daysSinceLatest;
	const latest = blog.latest;

	const subject =
		days === null
			? 'Nothing published yet on the blog'
			: days === 0
				? 'You published today. Here is where the blog stands.'
				: `${days} day${days === 1 ? '' : 's'} since your last post`;

	const gap =
		days === null
			? 'No post carries a date, so there is nothing to measure from.'
			: `${num(days)} day${days === 1 ? '' : 's'}`;

	const facts: Array<[string, string]> = [
		['Last post', latest ? esc(latest.title) : 'None'],
		['Published', latest ? esc(dayLabel(latest.date)) : 'Not applicable'],
		['Gap', esc(gap)],
		[
			`Posted in ${esc(input.period.label)}`,
			blog.publishedInMonth.length
				? `${num(blog.publishedInMonth.length)} (${blog.publishedInMonth
						.map((post) => esc(post.title))
						.join(', ')})`
				: 'Nothing yet'
		],
		[
			'Waiting for it',
			input.subscribers === null
				? 'Subscriber count unavailable'
				: `${num(input.subscribers)} active subscriber${input.subscribers === 1 ? '' : 's'}`
		]
	];

	const openingLine =
		days === null
			? 'There is no dated post on the site, so this is the whole record.'
			: blog.publishedInMonth.length > 0
				? `You have already published in ${esc(input.period.label)}. This is the standing record, not a nudge.`
				: `Nothing has gone out in ${esc(input.period.label)} yet.`;

	const recent = blog.publishedInMonth.length === 0 ? recentList(input) : '';

	const html = renderEmail({
		title: 'Monthly writing reminder',
		heading: 'The blog, as it stands',
		preheader: subject,
		footerNote: 'A scheduled monthly note to yourself from kentom.co.ke.',
		bodyHtml:
			p(openingLine) +
			factTable(facts) +
			recent +
			buttonDark('Open the blog', `${SITE}/blog`) +
			divider() +
			p(
				`Posts live in <code style="font-family:${MONO_FONT};font-size:13px">src/lib/content/blog/</code> as markdown with a date in the frontmatter. That date is what this email counts from.`,
				0
			)
	});

	const textParts = [
		'THE BLOG, AS IT STANDS',
		'',
		days === null
			? 'There is no dated post on the site, so this is the whole record.'
			: blog.publishedInMonth.length > 0
				? `You have already published in ${input.period.label}. This is the standing record, not a nudge.`
				: `Nothing has gone out in ${input.period.label} yet.`,
		'',
		textRow('Last post', latest ? latest.title : 'None'),
		textRow('Published', latest ? dayLabel(latest.date) : 'Not applicable'),
		textRow('Gap', gap),
		textRow(
			`Posted in ${input.period.label}`,
			blog.publishedInMonth.length
				? `${blog.publishedInMonth.length} (${blog.publishedInMonth.map((post) => post.title).join(', ')})`
				: 'Nothing yet'
		),
		textRow(
			'Waiting for it',
			input.subscribers === null
				? 'Subscriber count unavailable'
				: `${input.subscribers} active subscriber${input.subscribers === 1 ? '' : 's'}`
		),
		'',
		`The blog: ${SITE}/blog`
	];

	return { subject, html, text: textParts.join('\n') };
}

/** The three most recent posts, so the reminder carries context, not just a gap. */
function recentList(input: BlogReminderInput): string {
	const recent = input.blog.latest ? [input.blog.latest] : [];
	if (recent.length === 0) return '';
	const rows = recent
		.map(
			(post) =>
				'<tr>' +
				`<td valign="top" style="padding:0 0 10px 0;font-family:${BODY_FONT};font-size:14px;line-height:1.6;color:#555">` +
				`<a href="${SITE}/blog/${encodeURIComponent(post.slug)}" style="color:#111;text-decoration:underline">${esc(post.title)}</a>` +
				` <span style="color:#999">${esc(dayLabel(post.date))}</span>` +
				'</td></tr>'
		)
		.join('');
	return (
		label('Most recent') +
		`<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:0 0 20px 0">${rows}</table>`
	);
}

/** Send the blog reminder to the owner. Never throws. */
export async function sendBlogReminder(
	input: BlogReminderInput
): Promise<{ ok: boolean; error?: string }> {
	try {
		const rendered = renderBlogReminder(input);
		await sendEmail({
			from: SENDERS.hq,
			to: [NOTIFY_TO],
			replyTo: CONTACT,
			subject: rendered.subject,
			tags: [EMAIL_TAGS.MONTHLY_BLOG_REMINDER, 'monthly', `period:${input.period.key}`],
			html: rendered.html,
			text: rendered.text
		});
		return { ok: true };
	} catch (error) {
		console.error('Blog reminder email failed:', error);
		return { ok: false, error: error instanceof Error ? error.message : String(error) };
	}
}

/* ──────────────────────────── report reminder ───────────────────────────── */

/**
 * The month's real headline numbers, so the write-up can be done from the
 * email itself. Anything ../reports could not read is named as unreadable.
 */
export function renderReportReminder(stats: MonthlyStats): Rendered {
	const { period, previous } = stats;
	const revenue = stats.revenue.data;
	const traffic = stats.traffic.data;
	const sponsors = stats.sponsors.data;
	const requests = stats.requests.data;
	const audience = stats.audience.data;

	const subject = `${period.label} in numbers, for the monthly report`;

	const revenueLine = !revenue
		? 'Unavailable'
		: revenue.successful === 0
			? 'No donation settled this month'
			: `${money(revenue.usdTotal)} across ${num(revenue.successful)} payment${revenue.successful === 1 ? '' : 's'}` +
				(revenue.usdMissing > 0
					? `, and ${num(revenue.usdMissing)} of them carry no USD figure`
					: '');

	const trafficLine = !traffic
		? 'Unavailable'
		: traffic.views === 0
			? 'No page views recorded'
			: `${num(traffic.views)} views, ${num(traffic.visitors)} visitors, ${num(traffic.sessions)} sessions (${change(traffic.views, traffic.previousViews, previous.label)})`;

	const sponsorLine = !sponsors
		? 'Unavailable'
		: `${num(sponsors.activeAtEnd)} active at the close` +
			(sponsors.newInMonth.length ? `, ${num(sponsors.newInMonth.length)} new` : '') +
			(sponsors.cancelledInMonth ? `, ${num(sponsors.cancelledInMonth)} cancelled` : '') +
			(sponsors.expiredInMonth ? `, ${num(sponsors.expiredInMonth)} expired` : '');

	const requestLine = !requests
		? 'Unavailable'
		: requests.total === 0
			? 'None'
			: `${num(requests.total)} (${requests.byStatus.map((row) => `${row.count} ${row.status.toLowerCase()}`).join(', ')})`;

	const audienceLine = !audience
		? 'Unavailable'
		: `${num(audience.activeSubscribers)} active` +
			(audience.movementUnrecorded
				? ', with no joins or departures recorded in the log yet'
				: `, ${num(audience.joined)} joined and ${num(audience.left)} left this month`);

	const postLine = stats.blog.publishedInMonth.length
		? stats.blog.publishedInMonth.map((post) => esc(post.title)).join(', ')
		: 'Nothing published';

	const facts: Array<[string, string]> = [
		['Window', `${esc(dayLabel(period.start))} to ${esc(dayLabel(stats.period.end))}, UTC`],
		['Money in', esc(revenueLine)],
		['Traffic', esc(trafficLine)],
		['Sponsors', esc(sponsorLine)],
		['Requests', esc(requestLine)],
		['Subscribers', esc(audienceLine)],
		['Posts', postLine]
	];

	const pages =
		traffic && traffic.topPages.length
			? label('Most read') +
				`<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:0 0 22px 0">` +
				traffic.topPages
					.slice(0, 5)
					.map(
						(row) =>
							'<tr>' +
							`<td style="padding:5px 0;font-family:${MONO_FONT};font-size:13px;color:#111">${esc(row.path)}</td>` +
							`<td align="right" style="padding:5px 0;font-family:${BODY_FONT};font-size:13px;color:#666">${num(row.views)}</td>` +
							'</tr>'
					)
					.join('') +
				'</table>'
			: '';

	const missing = missingNote(stats);
	const missingHtml = missing.length
		? divider() + label('Not included') + missing.map((line) => p(esc(line), 8)).join('')
		: '';

	const html = renderEmail({
		title: `${period.label} in numbers`,
		heading: `${period.label}, ready to write up`,
		preheader: subject,
		footerNote: 'A scheduled monthly note to yourself from kentom.co.ke.',
		bodyHtml:
			p(
				`Every figure below came out of the database this morning. Nothing is estimated, and anything that could not be read says so rather than showing a zero.`
			) +
			factTable(facts) +
			pages +
			buttonDark('Open the reports console', ADMIN_REPORTS) +
			p(
				'The sponsor and investor report goes out from that screen, where you can read the exact email before it is sent.',
				0
			) +
			missingHtml
	});

	const textParts = [
		`${period.label.toUpperCase()}, READY TO WRITE UP`,
		'',
		'Every figure below came out of the database this morning. Nothing is estimated.',
		'',
		textRow('Window', `${dayLabel(period.start)} to ${dayLabel(period.end)}, UTC`),
		textRow('Money in', revenueLine),
		textRow('Traffic', trafficLine),
		textRow('Sponsors', sponsorLine),
		textRow('Requests', requestLine),
		textRow('Subscribers', audienceLine),
		textRow(
			'Posts',
			stats.blog.publishedInMonth.length
				? stats.blog.publishedInMonth.map((post) => post.title).join(', ')
				: 'Nothing published'
		)
	];

	if (traffic && traffic.topPages.length) {
		textParts.push('', 'MOST READ');
		for (const row of traffic.topPages.slice(0, 5)) {
			textParts.push(`  ${row.path.padEnd(34, ' ')}${num(row.views)}`);
		}
	}
	if (missing.length) {
		textParts.push('', 'NOT INCLUDED', ...missing.map((line) => `- ${line}`));
	}
	textParts.push('', `Reports console: ${ADMIN_REPORTS}`);

	return { subject, html, text: textParts.join('\n') };
}

/** Send the report reminder to the owner. Never throws. */
export async function sendReportReminder(
	stats: MonthlyStats
): Promise<{ ok: boolean; error?: string }> {
	try {
		const rendered = renderReportReminder(stats);
		await sendEmail({
			from: SENDERS.hq,
			to: [NOTIFY_TO],
			replyTo: CONTACT,
			subject: rendered.subject,
			tags: [EMAIL_TAGS.MONTHLY_REPORT_REMINDER, 'monthly', `period:${stats.period.key}`],
			html: rendered.html,
			text: rendered.text
		});
		return { ok: true };
	} catch (error) {
		console.error('Report reminder email failed:', error);
		return { ok: false, error: error instanceof Error ? error.message : String(error) };
	}
}

/* ─────────────────────────── the sponsor report ─────────────────────────── */

export function sponsorReportSubject(stats: MonthlyStats): string {
	return `kenTom in ${stats.period.label}`;
}

/**
 * The markdown body sent to sponsors and investors.
 *
 * Written as markdown because the campaign sender renders it with the same
 * $lib/emailMarkdown pipeline the compose screen previews with, so what the
 * owner reads in the preview is what the recipient receives.
 *
 * The heading is not repeated in the body: the campaign template already uses
 * the subject as the heading.
 */
export function sponsorReportMarkdown(stats: MonthlyStats): string {
	const { period, previous } = stats;
	const revenue = stats.revenue.data;
	const sponsors = stats.sponsors.data;
	const traffic = stats.traffic.data;
	const requests = stats.requests.data;

	const out: string[] = [];

	out.push(
		`This is the ${period.label} note. It covers ${dayLabel(period.start)} to ${dayLabel(period.end)}, UTC, and every number in it is counted from the site's own records on the day it was sent.`
	);

	/* Money */
	out.push('## Money');
	if (!revenue) {
		out.push(stats.revenue.unavailable ?? 'The payment records could not be read this month.');
	} else if (revenue.successful === 0) {
		out.push(
			`No payment settled in ${period.label}.` +
				(revenue.unsettled > 0
					? ` ${num(revenue.unsettled)} were started and did not complete.`
					: '')
		);
	} else {
		const lines: string[] = [];
		lines.push(
			`${num(revenue.successful)} payment${revenue.successful === 1 ? '' : 's'} settled, totalling ${money(revenue.usdTotal)}.`
		);
		if (revenue.usdMissing > 0) {
			lines.push(
				revenue.usdMissing === 1
					? 'One of those carries no canonical USD figure, so it is counted in the number of payments but not in that total.'
					: `${num(revenue.usdMissing)} of those carry no canonical USD figure, so they are counted in the number of payments but not in that total.`
			);
		}
		if (revenue.previousUsdTotal !== null && revenue.usdTotal !== null) {
			lines.push(
				`${previous.label} was ${money(revenue.previousUsdTotal)}, so this month is ${change(Math.round(revenue.usdTotal), Math.round(revenue.previousUsdTotal), previous.label)}.`
			);
		}
		if (revenue.recurring > 0) {
			lines.push(
				revenue.recurring === 1
					? 'One of them was a recurring charge rather than a one-off payment.'
					: `${num(revenue.recurring)} of them were recurring charges rather than one-off payments.`
			);
		}
		out.push(lines.join(' '));

		if (revenue.byCurrency.length > 1) {
			out.push(
				table(
					['Charged in', 'Payments', 'Total'],
					revenue.byCurrency.map((row) => [
						row.currency,
						num(row.count),
						money(row.total, row.currency)
					])
				)
			);
		}
	}

	/* Sponsors */
	out.push('## Sponsors');
	if (!sponsors) {
		out.push(stats.sponsors.unavailable ?? 'The sponsor records could not be read this month.');
	} else {
		const lines: string[] = [];
		lines.push(
			sponsors.activeAtEnd === 0
				? `No sponsorship was active at the close of ${period.label}.`
				: `${num(sponsors.activeAtEnd)} sponsorship${sponsors.activeAtEnd === 1 ? ' was' : 's were'} active at the close of ${period.label}.`
		);
		if (sponsors.newInMonth.length > 0) {
			// Only a sponsor who consented to be shown is named. PRIVATE and
			// ANONYMOUS sponsors are counted and never identified.
			const named = sponsors.newInMonth
				.filter((row) => row.visibility === 'PUBLIC')
				.map((row) => row.displayName)
				.filter(Boolean);
			lines.push(
				`${num(sponsors.newInMonth.length)} joined this month` +
					(named.length ? `, including ${named.join(', ')}.` : '.')
			);
		}
		if (sponsors.cancelledInMonth > 0) {
			lines.push(
				`${num(sponsors.cancelledInMonth)} cancelled.`
			);
		}
		if (sponsors.expiredInMonth > 0) {
			lines.push(`${num(sponsors.expiredInMonth)} one-time listing${sponsors.expiredInMonth === 1 ? '' : 's'} reached the end of its window.`);
		}
		if (sponsors.activeRecurring > 0 && sponsors.mrrUsd !== null) {
			lines.push(
				`${num(sponsors.activeRecurring)} recurring sponsorship${sponsors.activeRecurring === 1 ? ' is' : 's are'} live, worth ${money(sponsors.mrrUsd)} a month at today's rates.`
			);
		}
		out.push(lines.join(' '));
	}

	/* Traffic */
	out.push('## The site');
	if (!traffic) {
		out.push(stats.traffic.unavailable ?? 'Traffic could not be read this month.');
	} else if (traffic.views === 0) {
		out.push(
			`No page view was recorded in ${period.label}. The site counts its own traffic, and visitors who send Do Not Track are never counted, so this is a floor rather than a ceiling.`
		);
	} else {
		out.push(
			`${num(traffic.views)} page views from ${num(traffic.visitors)} visitors across ${num(traffic.sessions)} sessions, ${change(traffic.views, traffic.previousViews, previous.label)}.`
		);
		if (traffic.topPages.length) {
			out.push(
				table(
					['Page', 'Views'],
					traffic.topPages.slice(0, 6).map((row) => [row.path, num(row.views)])
				)
			);
		}
		if (traffic.topCountries.length) {
			out.push(
				`Read mostly from ${traffic.topCountries
					.slice(0, 3)
					.map((row) => `${row.country} (${num(row.views)})`)
					.join(', ')}.`
			);
		}
	}

	/* Work */
	out.push('## Work coming in');
	if (!requests) {
		out.push(stats.requests.unavailable ?? 'Service requests could not be read this month.');
	} else if (requests.total === 0) {
		out.push(`No new service request arrived in ${period.label}.`);
	} else {
		out.push(
			`${num(requests.total)} service request${requests.total === 1 ? '' : 's'} arrived: ${requests.byStatus
				.map((row) => `${num(row.count)} ${row.status.toLowerCase().replace(/_/g, ' ')}`)
				.join(', ')}.`
		);
	}

	/* Writing */
	out.push('## Published');
	if (stats.blog.publishedInMonth.length === 0) {
		out.push(
			stats.blog.latest
				? `Nothing new went up in ${period.label}. The most recent piece is still "${stats.blog.latest.title}", from ${dayLabel(stats.blog.latest.date)}.`
				: `Nothing new went up in ${period.label}.`
		);
	} else {
		out.push(
			stats.blog.publishedInMonth
				.map(
					(post) =>
						`- [${post.title}](${SITE}/blog/${post.slug}), ${dayLabel(post.date)}. ${post.excerpt}`
				)
				.join('\n')
		);
	}

	/* Notes */
	const missing = missingNote(stats);
	if (missing.length) {
		out.push('## Not included');
		out.push(missing.map((line) => `- ${line}`).join('\n'));
	}

	out.push('---');
	out.push(
		'You are getting this because you sponsor kenTom or hold a stake in it. Reply to this email if you would rather not, and I will take you off the list.'
	);

	return out.join('\n\n');
}

/* ────────────────────────────── the newsletter ──────────────────────────── */

export type NewsletterInput = {
	period: Period;
	/** Posts that are genuinely new to the list, oldest first. */
	posts: { slug: string; title: string; excerpt: string; date: string }[];
};

export function newsletterSubject(input: NewsletterInput): string {
	if (input.posts.length === 1) return input.posts[0].title;
	return `${input.posts.length} new pieces from ${input.period.label}`;
}

/**
 * The subscriber newsletter. Posts only: subscribers signed up for writing,
 * not for the business numbers, and there is nothing else this site can
 * truthfully claim happened in a month.
 *
 * The unsubscribe link is not written here. The campaign sender appends the
 * signed one-click link to both the HTML and the plain text and sets the
 * List-Unsubscribe headers, so there is exactly one unsubscribe mechanism.
 */
export function newsletterMarkdown(input: NewsletterInput): string {
	const out: string[] = [];

	out.push(
		input.posts.length === 1
			? `One new piece went up in ${input.period.label}.`
			: `${input.posts.length} new pieces went up in ${input.period.label}.`
	);

	for (const post of input.posts) {
		out.push(`## ${post.title}`);
		if (post.excerpt) out.push(post.excerpt);
		out.push(`[Read it](${SITE}/blog/${post.slug})`);
	}

	out.push('---');
	out.push('Steve');

	return out.join('\n\n');
}

/* ─────────────────────────── operational notices ────────────────────────── */

/**
 * A short note to the owner when a scheduled job decided not to send, or could
 * not. It only ever goes to his own inbox. Never throws.
 */
export async function sendJobNotice(input: {
	subject: string;
	heading: string;
	lines: string[];
	period: Period;
	job: string;
}): Promise<void> {
	try {
		await sendEmail({
			from: SENDERS.hq,
			to: [NOTIFY_TO],
			replyTo: CONTACT,
			subject: input.subject,
			tags: [EMAIL_TAGS.MONTHLY_JOB_NOTICE, 'monthly', `job:${input.job}`, `period:${input.period.key}`],
			html: renderEmail({
				title: input.subject,
				heading: input.heading,
				preheader: input.lines[0] ?? input.subject,
				footerNote: 'A scheduled job on kentom.co.ke reporting what it did.',
				bodyHtml:
					input.lines.map((line) => p(esc(line))).join('') +
					buttonDark('Open the reports console', ADMIN_REPORTS)
			}),
			text: [
				input.heading.toUpperCase(),
				'',
				...input.lines,
				'',
				`Reports console: ${ADMIN_REPORTS}`
			].join('\n')
		});
	} catch (error) {
		console.error('Scheduled job notice failed:', error);
	}
}
