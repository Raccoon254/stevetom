import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	try {
		// Test database connection
		const projectCount = await prisma.project.count()
		const serviceCount = await prisma.service.count()
		const requestCount = await prisma.serviceRequest.count()

		return json({
			success: true,
			message: 'Database connection successful!',
			data: {
				projects: projectCount,
				services: serviceCount,
				serviceRequests: requestCount
			},
			timestamp: new Date().toISOString()
		})
	} catch (error) {
		console.error('Database connection error:', error)
		return json(
			{
				success: false,
				message: 'Database connection failed',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}