import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	try {
		const project = await prisma.project.findUnique({
			where: { id: params.id }
		})

		if (!project) {
			return json({ success: false, message: 'Project not found' }, { status: 404 })
		}

		return json({ success: true, data: project })
	} catch (error) {
		console.error('Error fetching project:', error)
		return json(
			{
				success: false,
				message: 'Failed to fetch project',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const data = await request.json()
		
		const project = await prisma.project.update({
			where: { id: params.id },
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
			message: 'Project updated successfully',
			data: project
		})
	} catch (error) {
		console.error('Error updating project:', error)
		return json(
			{
				success: false,
				message: 'Failed to update project',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		await prisma.project.delete({
			where: { id: params.id }
		})

		return json({
			success: true,
			message: 'Project deleted successfully'
		})
	} catch (error) {
		console.error('Error deleting project:', error)
		return json(
			{
				success: false,
				message: 'Failed to delete project',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}