<script lang="ts">
	import { onMount } from 'svelte'
	import { ArrowRight } from 'lucide-svelte'

	type Project = {
		id: string
		title: string
		description: string
		image: string
		projectUrl: string
		githubUrl: string
		tech: string[]
		year: string
		category: string
		features: string[]
		status: 'LIVE' | 'DEVELOPMENT' | 'ARCHIVED'
		featured?: boolean
	}

	let projects: Project[] = []
	let loading = true

	onMount(async () => {
		await fetchProjects()
	})

	async function fetchProjects() {
		try {
			const response = await fetch('/api/projects?status=LIVE')
			const data = await response.json()
			if (data.success) {
				const liveProjects = data.data
				const featuredProjects = liveProjects.filter((p: Project) => p.featured)

				if (featuredProjects.length >= 4) {
					projects = featuredProjects.slice(0, 4)
				} else {
					const needed = 4 - featuredProjects.length
					const randomProjects = liveProjects
						.filter((p: Project) => !p.featured)
						.sort(() => Math.random() - 0.5)
						.slice(0, needed)
					projects = [...featuredProjects, ...randomProjects]
				}
			}
		} catch (error) {
			console.error('Error fetching projects:', error)
		} finally {
			loading = false
		}
	}

	function getTechName(name: string) {
		if (name === 'Tailwind') return 'tailwindcss'
		if (name === 'HTML') return 'html5'
		if (name === 'Material Design') return 'materialui'
		return name.toLowerCase().replace(/\s+/g, '')
	}
</script>

<section class="py-16 md:py-32 relative">
	<!-- Header -->
	<div class="text-center mb-16 md:mb-24">
		<h2
			class="text-interactive text-4xl md:text-6xl font-bold mb-4 bg-black/70 dark:bg-white bg-clip-text text-transparent"
		>
			Featured Projects
		</h2>
		<p class="text-lg text-base-content/60 max-w-2xl mx-auto">
			A curated collection of my live digital creations, showcasing innovation, problem-solving, and
			technical excellence in action.
		</p>
		<div
			class="w-48 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6"
		></div>
	</div>

	{#if loading}
		<div class="text-center py-20">
			<div class="loading loading-spinner loading-lg text-primary"></div>
			<p class="mt-4 text-base-content/60">Loading amazing projects...</p>
		</div>
	{:else if projects.length === 0}
		<div class="text-center py-20">
			<p class="text-base-content/60">No live projects to display at the moment.</p>
		</div>
	{:else}
		<!-- Projects Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
			{#each projects as project}
				<div
					class="rounded-xl interactive grid grid-cols-2 md:grid-cols-1 overflow-hidden bg-base-200/50 border border-base-300 dark:border-gray-50/10 hover:border-primary/10 transition-all ring-1 ring-offset-2 ring-offset-base-100 hover:ring-primary/20 ring-gray-900/5 dark:ring-gray-100/5 dark:ring-offset-base-100 shadow-sm hover:shadow-lg"
				>
					<div class="card-body p-6">
						<h3 class="card-title text-lg mb-4">{project.title}</h3>

						<!-- Tech Stack Icons -->
						<div class="flex flex-wrap gap-3">
							{#each project.tech as tech}
								<div class="tooltip" data-tip={tech}>
									<i class={`devicon-${getTechName(tech)}-plain text-2xl`}></i>
								</div>
							{/each}
						</div>
					</div>
					<div class="md:hidden">
						<img src={project.image} alt={project.title} class="w-full h-full object-cover" />
					</div>
				</div>
			{/each}
		</div>

		<!-- View All Link -->
		<div class="text-center mt-16">
			<a
				href="/projects"
				class="inline-flex text-interactive items-center gap-2 text-interactive py-2 px-4 border border-base-300 rounded-full ring-1 ring-offset-2 ring-gray-500/10 hover:bg-gray-100 dark:hover:bg-gray-800 dark:ring-offset-base-100 hover:ring-gray-500/20 dark:hover:ring-gray-400/20 transition-all duration-200"
			>
				<span>Explore All Projects</span>
				<ArrowRight size="16" />
			</a>
			<p class="text-base-content/50 text-sm mt-4">
				Discover my complete portfolio of web, mobile, and desktop applications
			</p>
		</div>
	{/if}
</section>
