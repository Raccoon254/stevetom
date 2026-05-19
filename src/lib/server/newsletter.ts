/**
 * Blog newsletter: verified subscribe, one-click unsubscribe, and
 * per-post issue sending through Axene Mailer.
 */
import { PrismaClient } from '@prisma/client';
import { sign } from './otp';
import { sendEmail, renderEmail, p, buttonDark, esc, SENDERS } from './mailer';
import { logActivity } from './log';
import { posts } from '$lib/content';

const prisma = new PrismaClient();
const SITE = 'https://www.kentom.co.ke';

const norm = (email: string) => email.trim().toLowerCase();

/** One-click unsubscribe URL (HMAC-signed so it can't be forged). */
export function unsubscribeUrl(email: string): string {
	const e = norm(email);
	return `${SITE}/unsubscribe?e=${encodeURIComponent(e)}&t=${sign(e)}`;
}

/** Subscribe (or reactivate) a verified email, then send the welcome note. */
export async function subscribeEmail(email: string): Promise<void> {
	const addr = norm(email);
	await prisma.newsletterSubscriber.upsert({
		where: { email: addr },
		update: { isActive: true },
		create: { email: addr, isActive: true }
	});
	await logActivity({
		action: 'newsletter.subscribed',
		entity: 'newsletter',
		actor: 'client',
		summary: `${addr} subscribed to the newsletter`
	});
	try {
		await sendEmail({
			from: SENDERS.hq,
			to: [{ email: addr }],
			subject: "You're on the list",
			tags: ['newsletter', 'welcome'],
			headers: {
				'List-Unsubscribe': `<${unsubscribeUrl(addr)}>`,
				'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
			},
			html: renderEmail({
				heading: "You're on the list",
				preheader: 'Notes from the workshop, straight to your inbox.',
				footerNote: 'You subscribed to the kenTom newsletter at kentom.co.ke.',
				bodyHtml:
					p(
						"Thanks for subscribing. When I publish a new note, you'll get it here: a short, plain email with a link. Nothing else."
					) +
					`<p style="margin:18px 0 0;font-family:Georgia,serif;font-size:12px;color:#999">Changed your mind? <a href="${unsubscribeUrl(addr)}" style="color:#999;text-decoration:underline">Unsubscribe in one click</a>.</p>`
			})
		});
	} catch (error) {
		console.error('Newsletter welcome email failed:', error);
	}
}

/** Flip a subscriber inactive. Returns false if the email is unknown. */
export async function unsubscribeEmail(email: string): Promise<boolean> {
	const addr = norm(email);
	try {
		await prisma.newsletterSubscriber.update({
			where: { email: addr },
			data: { isActive: false }
		});
		await logActivity({
			action: 'newsletter.unsubscribed',
			entity: 'newsletter',
			actor: 'client',
			summary: `${addr} unsubscribed from the newsletter`
		});
		return true;
	} catch {
		return false;
	}
}

/** Email a blog post to every active subscriber. One issue per slug. */
export async function sendIssue(
	slug: string
): Promise<{ ok: boolean; error?: string; recipients?: number }> {
	const post = posts.find((p) => p.slug === slug);
	if (!post) return { ok: false, error: 'Post not found.' };

	const existing = await prisma.newsletterIssue.findUnique({ where: { postSlug: slug } });
	if (existing) return { ok: false, error: 'This post has already been sent.' };

	const subscribers = await prisma.newsletterSubscriber.findMany({ where: { isActive: true } });

	let sent = 0;
	for (const sub of subscribers) {
		try {
			await sendEmail({
				from: SENDERS.hq,
				to: [{ email: sub.email }],
				subject: post.title,
				tags: ['newsletter', 'issue'],
				headers: {
					'List-Unsubscribe': `<${unsubscribeUrl(sub.email)}>`,
					'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
				},
				html: renderEmail({
					heading: post.title,
					preheader: post.excerpt,
					footerNote: "You're getting this because you subscribed at kentom.co.ke.",
					bodyHtml:
						p(esc(post.excerpt)) +
						buttonDark('Read it', `${SITE}/blog/${post.slug}`) +
						`<p style="margin:8px 0 0;font-family:Georgia,serif;font-size:12px;color:#999"><a href="${unsubscribeUrl(sub.email)}" style="color:#999;text-decoration:underline">Unsubscribe in one click</a></p>`
				})
			});
			sent++;
		} catch (error) {
			console.error('Newsletter send failed for', sub.email, error);
		}
	}

	await prisma.newsletterIssue.create({
		data: { postSlug: slug, postTitle: post.title, recipients: sent }
	});
	await logActivity({
		action: 'newsletter.sent',
		entity: 'newsletter',
		entityId: slug,
		actor: 'admin',
		summary: `Sent "${post.title}" to ${sent} subscriber${sent === 1 ? '' : 's'}`
	});

	return { ok: true, recipients: sent };
}
