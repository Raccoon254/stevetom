import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
	try {
		const status = url.searchParams.get('status')
		const serviceId = url.searchParams.get('serviceId')
		
		const where: any = {}
		if (status) where.status = status.toUpperCase()
		if (serviceId) where.serviceId = serviceId

		const requests = await prisma.serviceRequest.findMany({
			where,
			include: {
				service: {
					select: {
						name: true,
						description: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		return json({
			success: true,
			data: requests,
			count: requests.length
		})
	} catch (error) {
		console.error('Error fetching service requests:', error)
		return json(
			{
				success: false,
				message: 'Failed to fetch service requests',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json()
		
		// Validate required fields
		if (!data.serviceId || !data.clientName || !data.clientEmail || !data.projectTitle || !data.description) {
			return json(
				{
					success: false,
					message: 'Missing required fields: serviceId, clientName, clientEmail, projectTitle, description'
				},
				{ status: 400 }
			)
		}

		const serviceRequest = await prisma.serviceRequest.create({
			data: {
				serviceId: data.serviceId,
				clientName: data.clientName,
				clientEmail: data.clientEmail,
				clientPhone: data.clientPhone,
				company: data.company,
				projectTitle: data.projectTitle,
				description: data.description,
				requirements: data.requirements,
				budget: data.budget ? parseFloat(data.budget) : null,
				timeline: data.timeline,
				status: 'PENDING'
			},
			include: {
				service: {
					select: {
						name: true,
						description: true
					}
				}
			}
		})

		return json({
			success: true,
			message: 'Service request submitted successfully',
			data: serviceRequest
		}, { status: 201 })
	} catch (error) {
		console.error('Error creating service request:', error)
		return json(
			{
				success: false,
				message: 'Failed to submit service request',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}