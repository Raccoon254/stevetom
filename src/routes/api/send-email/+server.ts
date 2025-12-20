import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	EMAIL_FROM
} from '$env/static/private';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { name, email, company, phone, message, budget, timeline, service, mode } = data;

		const isQuote = mode === 'quote';

		// Get or create a default service for general inquiries
		let defaultService = await prisma.service.findFirst({
			where: { name: { contains: 'General', mode: 'insensitive' } }
		});

		if (!defaultService) {
			// If no general service exists, get the first active service or create one
			defaultService = await prisma.service.findFirst({
				where: { isActive: true }
			});

			if (!defaultService) {
				// Create a default service if none exists
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
			const budgetStr = budget.toString();
			// Extract numbers from budget string like "$1000 - $2500" or "< $100"
			const match = budgetStr.match(/\$?(\d+)/);
			if (match) {
				budgetValue = parseInt(match[1]);
			}
		}

		// Save to database
		const serviceRequest = await prisma.serviceRequest.create({
			data: {
				serviceId: defaultService.id,
				clientName: name,
				clientEmail: email,
				clientPhone: phone || null,
				company: company || null,
				projectTitle: isQuote && service
					? `${service} Project`
					: 'General Contact Inquiry',
				description: message || `${isQuote ? 'Quote request for' : 'Contact inquiry about'} ${service || 'general services'}`,
				requirements: isQuote
					? `Budget: ${budget || 'Not specified'}, Timeline: ${timeline || 'Not specified'}`
					: null,
				budget: budgetValue,
				timeline: timeline || null,
				status: 'PENDING'
			}
		});

		// Create transporter
		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: parseInt(SMTP_PORT),
			secure: true,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		});

		// Prepare email content
		const subject = isQuote
			? `New Quote Request from ${name}`
			: `New Contact Message from ${name}`;

		let htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: #252525; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
					.content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
					.field { margin-bottom: 15px; }
					.label { font-weight: bold; color: #555; }
					.value { color: #333; margin-top: 5px; }
					.footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h2>${isQuote ? '📋 New Quote Request' : '💬 New Contact Message'}</h2>
					</div>
					<div class="content">
						<div class="field">
							<div class="label">Name:</div>
							<div class="value">${name}</div>
						</div>
						<div class="field">
							<div class="label">Email:</div>
							<div class="value"><a href="mailto:${email}">${email}</a></div>
						</div>
		`;

		if (company) {
			htmlContent += `
						<div class="field">
							<div class="label">Company:</div>
							<div class="value">${company}</div>
						</div>
			`;
		}

		if (phone) {
			htmlContent += `
						<div class="field">
							<div class="label">Phone:</div>
							<div class="value">${phone}</div>
						</div>
			`;
		}

		if (service && isQuote) {
			htmlContent += `
						<div class="field">
							<div class="label">Service Requested:</div>
							<div class="value">${service}</div>
						</div>
			`;
		}

		if (budget && isQuote) {
			htmlContent += `
						<div class="field">
							<div class="label">Budget:</div>
							<div class="value">${budget}</div>
						</div>
			`;
		}

		if (timeline && isQuote) {
			htmlContent += `
						<div class="field">
							<div class="label">Timeline:</div>
							<div class="value">${timeline}</div>
						</div>
			`;
		}

		if (message) {
			htmlContent += `
						<div class="field">
							<div class="label">Message:</div>
							<div class="value">${message.replace(/\n/g, '<br>')}</div>
						</div>
			`;
		}

		htmlContent += `
						<div class="footer">
							<p>This ${isQuote ? 'quote request' : 'message'} was sent from your portfolio website contact form.</p>
							<p><strong>Request ID:</strong> ${serviceRequest.id}</p>
						</div>
					</div>
				</div>
			</body>
			</html>
		`;

		// Send email
		await transporter.sendMail({
			from: EMAIL_FROM,
			to: 'tomsteve187@gmail.com',
			subject: subject,
			html: htmlContent,
			replyTo: email
		});

		return json({
			success: true,
			message: 'Request submitted successfully',
			requestId: serviceRequest.id
		});
	} catch (error) {
		console.error('Error processing request:', error);
		return json(
			{
				success: false,
				error: 'Failed to submit request. Please try again later.'
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
};
