import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
	try {
		const activeOnly = url.searchParams.get('active') === 'true'
		
		const where = activeOnly ? { isActive: true } : {}

		const services = await prisma.service.findMany({
			where,
			include: {
				_count: {
					select: { requests: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		return json({
			success: true,
			data: services,
			count: services.length
		})
	} catch (error) {
		console.error('Error fetching services:', error)
		return json(
			{
				success: false,
				message: 'Failed to fetch services',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json()
		
		const service = await prisma.service.create({
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
			message: 'Service created successfully',
			data: service
		}, { status: 201 })
	} catch (error) {
		console.error('Error creating service:', error)
		return json(
			{
				success: false,
				message: 'Failed to create service',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}