import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db.js';
import { sendEmail, renderEmail, p, esc, SENDERS, NOTIFY_TO } from '$lib/server/mailer';

/** Admin → client reply. Gated by the admin session cookie. */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
	if (cookies.get('session') !== 'admin') {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}
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
			replyTo: NOTIFY_TO,
			subject: `Re: ${sr.projectTitle}`,
			tags: ['reply'],
			html: renderEmail({
				heading: `Hi ${esc(sr.clientName.split(' ')[0] || sr.clientName)},`,
				preheader: 'A reply from kenTom.',
				footerNote: 'You received this as a reply to your request on kentom.co.ke.',
				bodyHtml: paras + p('— Steve', 0)
			})
		});

		return json({ success: true });
	} catch (error) {
		console.error('reply failed:', error);
		return json({ success: false, error: 'Failed to send the reply.' }, { status: 500 });
	}
};
