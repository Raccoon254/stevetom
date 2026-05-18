import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import {
	sendEmail,
	renderEmail,
	p,
	label,
	value,
	divider,
	esc,
	SENDERS,
	NOTIFY_TO
} from '$lib/server/mailer';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { name, email, company, phone, message, budget, timeline, service, mode } = data;

		const isQuote = mode === 'quote';
		const who = (name && String(name).trim()) || 'Someone';

		// Get or create a default service for general inquiries
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

		// Parse budget if provided
		let budgetValue: number | null = null;
		if (budget) {
			const match = budget.toString().match(/\$?(\d+)/);
			if (match) budgetValue = parseInt(match[1]);
		}

		// Save to database
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

		// ── notifications (via Axene Mailer) — never block the submission ──
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

			const fields = rows
				.map(([lbl, val]) => label(lbl) + value(esc(val)))
				.join('');
			const msgBlock = message
				? label('Message') + value(esc(message).replace(/\n/g, '<br>'))
				: '';

			await sendEmail({
				from: SENDERS.hq,
				to: [NOTIFY_TO],
				replyTo: email ? { email } : undefined,
				subject: isQuote ? `New quote request — ${who}` : `New contact message — ${who}`,
				tags: ['notification', isQuote ? 'quote' : 'contact'],
				html: renderEmail({
					heading: isQuote ? 'New quote request' : 'New contact message',
					preheader: `From ${who}`,
					footerNote: 'You received this because a form on kentom.co.ke was submitted.',
					bodyHtml:
						fields +
						msgBlock +
						divider() +
						`<div style="font-family:'Courier New',monospace;font-size:12px;color:#999">Request ID: ${esc(serviceRequest.id)}</div>`
				})
			});

			// confirmation to the sender
			if (email && String(email).includes('@')) {
				await sendEmail({
					from: SENDERS.hq,
					to: [{ email }],
					replyTo: NOTIFY_TO,
					subject: isQuote ? 'Thanks — I have your request' : 'Thanks — I got your message',
					tags: ['confirmation', isQuote ? 'quote' : 'contact'],
					html: renderEmail({
						heading: 'Thank you',
						preheader: `I have your ${isQuote ? 'request' : 'message'}.`,
						bodyHtml:
							p(
								`I have received your ${isQuote ? 'request' : 'message'} and will get back to you, usually within a day.`
							) +
							p('If it is urgent, just reply to this email.') +
							p('— Steve', 0)
					})
				});
			}
		} catch (mailError) {
			console.error('Axene Mailer notification failed:', mailError);
		}

		return json({
			success: true,
			message: 'Request submitted successfully',
			requestId: serviceRequest.id
		});
	} catch (error) {
		console.error('Error processing request:', error);
		return json(
			{ success: false, error: 'Failed to submit request. Please try again later.' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
};
