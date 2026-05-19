import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db.js';
import { sendEmail, renderEmail, p, esc, SENDERS, CONTACT } from '$lib/server/mailer';
import { logActivity } from '$lib/server/log';
import { requireAdmin } from '$lib/server/auth';

/** Admin → client reply. Gated by the admin session cookie. */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const denied = requireAdmin(cookies);
	if (denied) return denied;
	try {
		const { message } = await request.json();
		const text = String(message || '').trim();
		if (!text) {
			return json({ success: false, error: 'The reply is empty.' }, { status: 400 });
		}

		const sr = await prisma.serviceRequest.findUnique({ where: { id: params.id } });
		if (!sr) return json({ success: false, error: 'Request not found.' }, { status: 404 });

		const paras = text
			.split(/\n{2,}/)
			.map((para) => p(esc(para).replace(/\n/g, '<br>')))
			.join('');

		await sendEmail({
			from: SENDERS.hq,
			to: [{ email: sr.clientEmail, name: sr.clientName }],
			replyTo: CONTACT,
			subject: `Re: ${sr.projectTitle}`,
			tags: ['reply'],
			html: renderEmail({
				heading: `Hi ${esc(sr.clientName.split(' ')[0] || sr.clientName)},`,
				preheader: 'A reply from kenTom.',
				footerNote: 'You received this as a reply to your request on kentom.co.ke.',
				bodyHtml: paras + p('Steve', 0)
			})
		});

		await logActivity({
			action: 'request.reply',
			entity: 'request',
			entityId: sr.id,
			actor: 'admin',
			summary: `Replied by email to ${sr.clientName}`
		});

		return json({ success: true });
	} catch (error) {
		console.error('reply failed:', error);
		return json({ success: false, error: 'Failed to send the reply.' }, { status: 500 });
	}
};
