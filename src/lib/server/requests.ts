/**
 * Service-request creation + the notification / confirmation emails.
 * Shared by the email-verification confirm endpoint.
 */
import { prisma } from '$lib/db.js';
import {
	sendEmail,
	renderEmail,
	p,
	label,
	value,
	divider,
	esc,
	SENDERS,
	NOTIFY_TO,
	CONTACT
} from './mailer';
import { logActivity } from './log';
import { EMAIL_TAGS } from '$lib/emailTags';

export type RequestInput = {
	name?: string;
	email: string;
	company?: string;
	phone?: string;
	message?: string;
	budget?: string;
	timeline?: string;
	service?: string;
	mode?: string;
};

/**
 * Persist a service request and send both the admin notification and the
 * customised confirmation back to the sender. Email failures are logged,
 * never thrown, so the request is always saved.
 */
export async function createServiceRequest(data: RequestInput): Promise<{ id: string }> {
	const { name, email, company, phone, message, budget, timeline, service, mode } = data;
	const isQuote = mode === 'quote';
	const who = (name && String(name).trim()) || email.split('@')[0];

	// default service bucket
	let defaultService = await prisma.service.findFirst({
		where: { name: { contains: 'General', mode: 'insensitive' } }
	});
	if (!defaultService) {
		defaultService = await prisma.service.findFirst({ where: { isActive: true } });
		if (!defaultService) {
			defaultService = await prisma.service.create({
				data: {
					name: 'General Inquiry',
					description: 'General contact and quote requests',
					isActive: true,
					technologies: []
				}
			});
		}
	}

	let budgetValue: number | null = null;
	if (budget) {
		const match = budget.toString().match(/\$?(\d+)/);
		if (match) budgetValue = parseInt(match[1]);
	}

	const serviceRequest = await prisma.serviceRequest.create({
		data: {
			serviceId: defaultService.id,
			clientName: who,
			clientEmail: email,
			clientPhone: phone || null,
			company: company || null,
			projectTitle: isQuote && service ? `${service} Project` : 'General Contact Inquiry',
			description:
				message ||
				`${isQuote ? 'Quote request for' : 'Contact inquiry about'} ${service || 'general services'}`,
			requirements: isQuote
				? `Budget: ${budget || 'Not specified'}, Timeline: ${timeline || 'Not specified'}`
				: null,
			budget: budgetValue,
			timeline: timeline || null,
			status: 'PENDING'
		}
	});

	await logActivity({
		action: 'request.created',
		entity: 'request',
		entityId: serviceRequest.id,
		actor: 'client',
		summary: `${who} submitted a ${isQuote ? 'quote request' : 'contact message'}`
	});

	try {
		const rows: Array<[string, string]> = [
			['Name', who],
			['Email', email]
		];
		if (company) rows.push(['Company', company]);
		if (phone) rows.push(['Phone', phone]);
		if (isQuote && service) rows.push(['Service', service]);
		if (isQuote && budget) rows.push(['Budget', budget]);
		if (isQuote && timeline) rows.push(['Timeline', timeline]);

		const fields = rows.map(([l, v]) => label(l) + value(esc(v))).join('');
		const msgBlock = message
			? label('Message') + value(esc(message).replace(/\n/g, '<br>'))
			: '';

		await sendEmail({
			from: SENDERS.hq,
			to: [NOTIFY_TO],
			replyTo: { email },
			subject: isQuote ? `New quote request from ${who}` : `New contact message from ${who}`,
			tags: [EMAIL_TAGS.REQUEST_NOTIFICATION, 'notification', isQuote ? 'quote' : 'contact'],
			html: renderEmail({
				heading: isQuote ? 'New quote request' : 'New contact message',
				preheader: `From ${who}`,
				footerNote: 'You received this because a verified form on kentom.co.ke was submitted.',
				bodyHtml:
					fields +
					msgBlock +
					divider() +
					`<div style="font-family:'Courier New',monospace;font-size:12px;color:#999">Request ID: ${esc(serviceRequest.id)}</div>`
			})
		});

		// customised confirmation to the sender
		const intro = isQuote
			? `Thanks ${who}, I have your request${service ? ` about <strong>${esc(service)}</strong>` : ''}.`
			: `Thanks ${who}, I have your message.`;
		await sendEmail({
			from: SENDERS.hq,
			to: [{ email, name: who }],
			replyTo: CONTACT,
			subject: isQuote ? 'I have your request' : 'I have your message',
			tags: [EMAIL_TAGS.REQUEST_CONFIRMATION, 'confirmation', isQuote ? 'quote' : 'contact'],
			html: renderEmail({
				heading: 'Thank you',
				preheader: `I have your ${isQuote ? 'request' : 'message'}.`,
				bodyHtml:
					p(intro) +
					p(
						`I read everything that comes in myself and will get back to you, usually within a day.${
							isQuote ? ' If it helps, I may follow up with a couple of questions to scope it well.' : ''
						}`
					) +
					p('If anything is urgent, just reply to this email.') +
					p('Steve', 0)
			})
		});
	} catch (mailError) {
		console.error('Axene Mailer notification failed:', mailError);
	}

	return { id: serviceRequest.id };
}

/**
 * The admin -> client reply for one service request: the email itself and the
 * activity-log line that records it.
 *
 * This lives here, next to the request's own emails, so the two callers share
 * one implementation: the admin request page's `reply` form action and the
 * older POST /api/service-requests/[id]/reply endpoint. Neither reimplements
 * the email.
 *
 * It never throws. Failures come back as a status and a message, so the API
 * route can answer with JSON and the form action can answer with `fail()`.
 */
export type ReplyResult =
	| { ok: true; email: string }
	| { ok: false; status: number; error: string };

export async function sendRequestReply(id: string, message: unknown): Promise<ReplyResult> {
	const text = String(message ?? '').trim();
	if (!text) return { ok: false, status: 400, error: 'The reply is empty.' };

	try {
		const sr = await prisma.serviceRequest.findUnique({ where: { id } });
		if (!sr) return { ok: false, status: 404, error: 'Request not found.' };

		const paras = text
			.split(/\n{2,}/)
			.map((para) => p(esc(para).replace(/\n/g, '<br>')))
			.join('');

		await sendEmail({
			from: SENDERS.hq,
			to: [{ email: sr.clientEmail, name: sr.clientName }],
			replyTo: CONTACT,
			subject: `Re: ${sr.projectTitle}`,
			tags: [EMAIL_TAGS.REQUEST_REPLY, 'reply'],
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

		return { ok: true, email: sr.clientEmail };
	} catch (error) {
		console.error('reply failed:', error);
		return { ok: false, status: 500, error: 'Failed to send the reply.' };
	}
}
