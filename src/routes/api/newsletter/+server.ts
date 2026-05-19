import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db.js';
import { posts } from '$lib/content';
import { sendIssue } from '$lib/server/newsletter';
import { requireAdmin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/** Admin newsletter overview: subscriber count, sent issues, unsent posts. */
export const GET: RequestHandler = async ({ cookies }) => {
	const denied = requireAdmin(cookies);
	if (denied) return denied;
	try {
		const [subscribers, issues] = await Promise.all([
			prisma.newsletterSubscriber.count({ where: { isActive: true } }),
			prisma.newsletterIssue.findMany({ orderBy: { sentAt: 'desc' } })
		]);
		const sentSlugs = new Set(issues.map((i) => i.postSlug));
		const unsent = posts
			.filter((p) => !sentSlugs.has(p.slug))
			.map((p) => ({ slug: p.slug, title: p.title, date: p.date, excerpt: p.excerpt }));
		return json({ success: true, subscribers, sent: issues, unsent });
	} catch (error) {
		console.error('newsletter overview failed:', error);
		return json({ success: false, error: 'Failed to load newsletter.' }, { status: 500 });
	}
};

/** Send a post to all active subscribers. Admin only. */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const denied = requireAdmin(cookies);
	if (denied) return denied;
	try {
		const { slug } = await request.json();
		const result = await sendIssue(String(slug || ''));
		if (!result.ok) return json({ success: false, error: result.error }, { status: 400 });
		return json({ success: true, recipients: result.recipients });
	} catch (error) {
		console.error('newsletter send failed:', error);
		return json({ success: false, error: 'Failed to send the issue.' }, { status: 500 });
	}
};
