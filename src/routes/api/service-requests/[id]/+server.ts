import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import { logActivity } from '$lib/server/log'
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

		const prev = await prisma.serviceRequest.findUnique({ where: { id: params.id } })

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
				notes: data.notes,
				deletedAt: data.deletedAt !== undefined ? data.deletedAt : undefined
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

		if (prev && prev.status !== serviceRequest.status) {
			await logActivity({
				action: 'request.status',
				entity: 'request',
				entityId: serviceRequest.id,
				actor: 'admin',
				summary: `${serviceRequest.clientName}: status ${prev.status} → ${serviceRequest.status}`
			})
		}
		if (prev && prev.deletedAt && !serviceRequest.deletedAt) {
			await logActivity({
				action: 'request.restored',
				entity: 'request',
				entityId: serviceRequest.id,
				actor: 'admin',
				summary: `Restored the request from ${serviceRequest.clientName}`
			})
		}

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

// "Delete" is a soft delete — the row is archived, never destroyed.
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const archived = await prisma.serviceRequest.update({
			where: { id: params.id },
			data: { deletedAt: new Date() }
		})

		await logActivity({
			action: 'request.archived',
			entity: 'request',
			entityId: archived.id,
			actor: 'admin',
			summary: `Archived the request from ${archived.clientName}`
		})

		return json({
			success: true,
			message: 'Service request archived'
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