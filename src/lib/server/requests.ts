/**
 * Service-request creation + the notification / confirmation emails.
 * Shared by the email-verification confirm endpoint.
 */
import { PrismaClient } from '@prisma/client';
import { sendEmail, renderEmail, p, label, value, divider, esc, SENDERS, NOTIFY_TO } from './mailer';

const prisma = new PrismaClient();

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
 * never thrown — the request is always saved.
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
			subject: isQuote ? `New quote request — ${who}` : `New contact message — ${who}`,
			tags: ['notification', isQuote ? 'quote' : 'contact'],
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
			? `Thanks ${who} — I have your request${service ? ` about <strong>${esc(service)}</strong>` : ''}.`
			: `Thanks ${who} — I have your message.`;
		await sendEmail({
			from: SENDERS.hq,
			to: [{ email, name: who }],
			replyTo: NOTIFY_TO,
			subject: isQuote ? 'I have your request' : 'I have your message',
			tags: ['confirmation', isQuote ? 'quote' : 'contact'],
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
					p('— Steve', 0)
			})
		});
	} catch (mailError) {
		console.error('Axene Mailer notification failed:', mailError);
	}

	return { id: serviceRequest.id };
}
