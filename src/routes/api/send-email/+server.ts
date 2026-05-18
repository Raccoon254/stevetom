import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import { sendEmail, emailShell, esc, SENDERS, NOTIFY_TO } from '$lib/server/mailer';

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
			if (message) rows.push(['Message', message]);

			const fields = rows
				.map(
					([label, value]) =>
						`<tr>
							<td style="padding:6px 0;font-size:12px;color:#6a8a82;text-transform:uppercase;letter-spacing:1px;width:110px;vertical-align:top;">${esc(label)}</td>
							<td style="padding:6px 0;font-size:14px;color:#0e110f;">${esc(value).replace(/\n/g, '<br>')}</td>
						</tr>`
				)
				.join('');

			await sendEmail({
				from: SENDERS.hq,
				to: [NOTIFY_TO],
				replyTo: email ? { email } : undefined,
				subject: isQuote ? `New quote request — ${who}` : `New contact message — ${who}`,
				tags: ['notification', isQuote ? 'quote' : 'contact'],
				html: emailShell(
					isQuote ? 'New quote request' : 'New contact message',
					`<table style="width:100%;border-collapse:collapse;">${fields}</table>
					 <p style="margin-top:18px;font-size:12px;color:#6a8a82;">Request ID: ${esc(serviceRequest.id)}</p>`
				)
			});

			// confirmation to the sender
			if (email && String(email).includes('@')) {
				await sendEmail({
					from: SENDERS.hq,
					to: [{ email }],
					replyTo: NOTIFY_TO,
					subject: isQuote ? 'Thanks — I have your request' : 'Thanks — I got your message',
					tags: ['confirmation', isQuote ? 'quote' : 'contact'],
					html: emailShell(
						'Thank you.',
						`<p style="font-size:15px;line-height:1.6;color:#2a3d38;">
							I have received your ${isQuote ? 'request' : 'message'} and will get back to you,
							usually within a day. If it is urgent, just reply to this email.
						</p>
						<p style="font-size:15px;line-height:1.6;color:#2a3d38;">— Steve</p>`
					)
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
