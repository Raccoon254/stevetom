import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	try {
		const service = await prisma.service.findUnique({
			where: { id: params.id },
			include: {
				_count: {
					select: { requests: true }
				}
			}
		})

		if (!service) {
			return json({ success: false, message: 'Service not found' }, { status: 404 })
		}

		return json({ success: true, data: service })
	} catch (error) {
		console.error('Error fetching service:', error)
		return json(
			{
				success: false,
				message: 'Failed to fetch service',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const data = await request.json()
		
		const service = await prisma.service.update({
			where: { id: params.id },
			data: {
				name: data.name,
				description: data.description,
				price: data.price ? parseFloat(data.price) : null,
				duration: data.duration,
				technologies: data.technologies || [],
				isActive: data.isActive !== false
			}
		})

		return json({
			success: true,
			message: 'Service updated successfully',
			data: service
		})
	} catch (error) {
		console.error('Error updating service:', error)
		return json(
			{
				success: false,
				message: 'Failed to update service',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		await prisma.service.delete({
			where: { id: params.id }
		})

		return json({
			success: true,
			message: 'Service deleted successfully'
		})
	} catch (error) {
		console.error('Error deleting service:', error)
		return json(
			{
				success: false,
				message: 'Failed to delete service',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}