import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	try {
		const serviceRequest = await prisma.serviceRequest.findUnique({
			where: { id: params.id },
			include: {
				service: {
					select: {
						name: true,
						description: true
					}
				}
			}
		})

		if (!serviceRequest) {
			return json({ success: false, message: 'Service request not found' }, { status: 404 })
		}

		return json({ success: true, data: serviceRequest })
	} catch (error) {
		console.error('Error fetching service request:', error)
		return json(
			{
				success: false,
				message: 'Failed to fetch service request',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const data = await request.json()
		
		const serviceRequest = await prisma.serviceRequest.update({
			where: { id: params.id },
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
				status: data.status || 'PENDING',
				notes: data.notes
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
			message: 'Service request updated successfully',
			data: serviceRequest
		})
	} catch (error) {
		console.error('Error updating service request:', error)
		return json(
			{
				success: false,
				message: 'Failed to update service request',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		await prisma.serviceRequest.delete({
			where: { id: params.id }
		})

		return json({
			success: true,
			message: 'Service request deleted successfully'
		})
	} catch (error) {
		console.error('Error deleting service request:', error)
		return json(
			{
				success: false,
				message: 'Failed to delete service request',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}