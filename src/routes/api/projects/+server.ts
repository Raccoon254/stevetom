import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
	try {
		const status = url.searchParams.get('status')
		const limit = url.searchParams.get('limit')
		
		const where = status ? { status: status.toUpperCase() as any } : {}
		const take = limit ? parseInt(limit) : undefined

		const projects = await prisma.project.findMany({
			where,
			take,
			orderBy: { updatedAt: 'desc' }
		})

		return json({
			success: true,
			data: projects,
			count: projects.length
		})
	} catch (error) {
		console.error('Error fetching projects:', error)
		return json(
			{
				success: false,
				message: 'Failed to fetch projects',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json()
		
		const project = await prisma.project.create({
			data: {
				title: data.title,
				description: data.description,
				image: data.image,
				projectUrl: data.projectUrl,
				githubUrl: data.githubUrl,
				tech: data.tech,
				year: data.year,
				category: data.category,
				features: data.features,
				status: data.status?.toUpperCase() || 'DEVELOPMENT'
			}
		})

		return json({
			success: true,
			message: 'Project created successfully',
			data: project
		}, { status: 201 })
	} catch (error) {
		console.error('Error creating project:', error)
		return json(
			{
				success: false,
				message: 'Failed to create project',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}