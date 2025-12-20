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

	// Static project data
	const staticProjects: Project[] = [
		{
			id: '1',
			title: 'Qailly',
			description: 'AI-powered quality assurance platform',
			image: '/apps/qailly.png',
			projectUrl: 'https://qailly.com',
			githubUrl: '',
			tech: ['React', 'Python', 'AI'],
			year: '2024',
			category: 'SaaS',
			features: [],
			status: 'LIVE',
		},
		{
			id: '2',
			title: 'Futurespace',
			description: 'Digital workspace for remote teams',
			image: '/apps/future.png',
			projectUrl: 'https://futurespace.vercel.app',
			githubUrl: '',
			tech: ['Svelte', 'WebRTC'],
			year: '2023',
			category: 'Web App',
			features: [],
			status: 'LIVE',
		},
		{
			id: '3',
			title: 'Crown Chambers',
			description: 'Legal practice management system',
			image: '/apps/crown.png',
			projectUrl: 'https://crown-chambers.vercel.app',
			githubUrl: '',
			tech: ['Next.js', 'PostgreSQL'],
			year: '2023',
			category: 'Enterprise',
			features: [],
			status: 'LIVE',
		},
		{
			id: '4',
			title: 'DishPoa',
			description: 'Food delivery and discovery platform',
			image: '/apps/dishpoa.png',
			projectUrl: 'https://dishpoa.com',
			githubUrl: '',
			tech: ['React Native', 'Firebase'],
			year: '2024',
			category: 'Mobile App',
			features: [],
			status: 'LIVE',
		},
		{
			id: '5',
			title: 'ZidiPlay',
			description: 'Music streaming and discovery service',
			image: '/apps/zidiplay.png',
			projectUrl: 'https://zidiplay.vercel.app',
			githubUrl: '',
			tech: ['Vue', 'Node.js'],
			year: '2023',
			category: 'Entertainment',
			features: [],
			status: 'LIVE',
		},
		{
			id: '6',
			title: 'Status Saver',
			description: 'Social media utility application',
			image: '/apps/status.png',
			projectUrl: 'https://status-saver.vercel.app',
			githubUrl: '',
			tech: ['Android', 'Kotlin'],
			year: '2022',
			category: 'Mobile Utility',
			features: [],
			status: 'LIVE',
		},
		{
			id: '7',
			title: 'DevCleaner',
			description: 'Development environment cleanup tool',
			image: '/dev-cleaner.png',
			projectUrl: '#',
			githubUrl: '',
			tech: ['Java', 'Tauri'],
			year: '2024',
			category: 'Developer Tool',
			features: [],
			status: 'LIVE',
		},
	]

	const services = [
		{ num: '01', label: 'Research & Strategy' },
		{ num: '02', label: 'Design & Development' },
		{ num: '03', label: 'Launch & Growth' },
		{ num: '04', label: 'Ongoing Support' },
	]

	let projects: Project[] = []
	let loading = true
	let currdeg = 180 // Start at 180 to show the 'back' of the cylinder (concave view) as center
	let hoveredIndex: number | null = null

	// Derived values for 3D layout
	$: numItems = projects.length || 7
	$: angleStep = 360 / numItems

	const RADIUS = 850 // Doubled radius (was 400ish)
	const customOrange = '#ff6b35'

	onMount(() => {
		setTimeout(() => {
			// Duplicate the list to have more items (14 total)
			const doubled = [
				...staticProjects,
				...staticProjects.map((p) => ({ ...p, id: p.id + '_dup' })),
			]
			projects = doubled
			loading = false
		}, 800)
	})

	function rotate(direction: 'next' | 'prev') {
		if (direction === 'next') {
			currdeg -= angleStep
		} else {
			currdeg += angleStep
		}
	}

	function calculateActiveIndex(currentDegrees: number, step: number, total: number) {
		const rawIndex = Math.round(currentDegrees / step) * -1
		let idx = rawIndex % total
		if (idx < 0) {
			idx += total
		}
		return idx
	}

	$: activeIndex = calculateActiveIndex(currdeg, angleStep, numItems)

	function getStyle(i: number) {
		const angle = i * angleStep
		const currentAngle = (angle + currdeg) % 360
		const normalizedAngle = (currentAngle + 360) % 360 // 0..360 deg

		// "Inside-Out" view:
		// Front items (near 0deg) are invisible.
		// Back items (near 180deg) are visible.
		// Widen the range to see more items (user wants ~7 visible).

		// Visible zone: Keep a small gap in the front (e.g., 60 degree slice hidden)
		// So visible from 30deg to 330deg? Or strictly back?
		// If 0 is front, and we hide +/- 30 deg, we show 60..300.
		// Let's go with > 45 and < 315 to be safe (90 deg front hidden).
		// Wait, normalized angle 0 is front. 180 is back.
		// We want to hide near 0.
		// So show if angle > 40 && angle < 320.

		const isVisible = normalizedAngle > 40 && normalizedAngle < 320

		const opacity = isVisible ? 1 : 0
		const pointerEvents = isVisible ? 'auto' : 'none'

		// Z-index: Back items (180) should be behind (or conceptually interactable).
		// Actually for inside-out, we want the "back" items to be clearly visible without front items blocking.
		// Since front items are opacity 0, z-index doesn't block view, but let's keep logic clean.

		// Distance from front (0). 180 is max distance.
		let distFromFront = Math.abs(normalizedAngle)
		if (distFromFront > 180) distFromFront = 360 - distFromFront
		const zIndex = 1000 - Math.floor(distFromFront)

		return `
			transform: rotateY(${angle}deg) translateZ(${RADIUS}px) rotateY(180deg);
			opacity: ${opacity};
			pointer-events: ${pointerEvents};
			z-index: ${zIndex};
			transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s;
		`
	}
</script>

<div class="projects-section">
	<!-- Styles -->
	<div class="text-center max-w-xl px-6 mb-16">
		<span class="inline-block text-md font-thin mb-4" style="color: {customOrange}">
			Behind the Code
		</span>
		<h2 class="text-3xl md:text-5xl font-extrabold text-[#252525] leading-tight mb-5">
			Curious What Else I’ve Built?
		</h2>
		<p class="text-base text-gray-600/50 font-medium mb-8">
			Explore more brand and projects I’ve worked on.
		</p>

		<a
			href="/projects"
			class="group inline-flex items-center gap-3 p-3 pr-2 pl-6 bg-white border border-gray-200 rounded-full font-medium text-gray-800 transition-all duration-300 hover:border-transparent bg-[#252525] text-white ring-1 ring-[#252525] ring-offset-2 ring-offset-white border-2 border-[#252525] hover:border-gray-800/30"
			style="
			 background: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(37, 37, 37, 0.3) 2px, rgba(37, 37, 37, 0.3) 4px);
			"
		>
			<span
				class="font-bold text-[#252525] text-2xl"
				style="
			">More Projects</span
			>
			<span
				class="flex items-center justify-center w-10 h-10 rounded-full text-white transition-transform duration-300 group-hover:translate-x-1"
				style="background: linear-gradient(135deg, {customOrange} 0%, #ff8c5a 100%)"
			>
				<ArrowRight size={18} />
			</span>
		</a>
	</div>

	<!-- 3D Carousel Area -->
	<div class="carousel-area">
		{#if !loading && projects.length > 0}
			<div class="carousel-container">
				<div class="carousel-track" style="transform: rotateY({currdeg}deg)">
					{#each projects as project, i}
						<a
							href={project.projectUrl || '#'}
							class="carousel-item"
							style={getStyle(i)}
							on:mouseenter={() => (hoveredIndex = i)}
							on:mouseleave={() => (hoveredIndex = null)}
						>
							<!-- Fallback image handler standard in Svelte is tricky inline, simpler to just assume valid or use action -->
							<img src={project.image} alt={project.title} />
							<div class="item-overlay" class:visible={hoveredIndex === i}>
								<span class="text-white font-semibold text-xl block">{project.title}</span>
								<p class="text-sm text-gray-300">{project.description}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Loading Skeleton -->
			<div class="flex justify-center py-16 w-full">
				<div class="flex gap-4 items-center">
					{#each Array(numItems) as _}
						<div class="w-40 h-64 bg-gray-200 rounded-xl animate-pulse"></div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Services -->
	<div class="services">
		{#each services as service, i}
			<div class="service-item" style="--delay: {i * 0.1}s">
				<span class="service-num" style="color: {customOrange}">#{service.num}</span>
				<span class="service-label">{service.label}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.projects-section {
		min-height: 100vh;
		background: #f9fafb; /* bg-gray-50 */
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial,
			sans-serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 6rem;
		padding-bottom: 8rem;
		gap: 4rem;
		overflow-x: hidden;
		position: relative;
	}

	/* Carousel Container */
	.carousel-area {
		display: flex;
		justify-content: center;
		width: 100%;
		position: relative;
		perspective: 1200px;
	}

	.carousel-container {
		margin: 0 auto;
		width: 350px;
		height: 600px;
		position: relative;
		perspective: 1200px;
	}

	.carousel-track {
		height: 100%;
		width: 100%;
		position: absolute;
		transform-style: preserve-3d;
		transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.carousel-item {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		width: 380px;
		height: 600px;
		overflow: hidden;
		border-radius: 40px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		/* opacity driven by inline style */
		/* transition: opacity 0.3s; -- moved to inline to match user code preference */
		cursor: pointer;
		background: white; /* Ensure bg if image fails */
	}

	.carousel-item:hover {
		/* opacity: 1; -- handled by inline logic mostly, but user had this */
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
		z-index: 10; /* detailed z-index logic in inline style might conflict, but hover usually wins */
	}

	.carousel-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	/* scale removed */
	.carousel-item:hover img {
		transform: scale(1.005);
	}

	.item-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
		transition: opacity 0.3s ease;
		opacity: 0;
	}

	.item-overlay.visible {
		opacity: 1;
	}

	/* Services */
	.services {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 3rem; /* gap-x-12 equivalent approx */
		margin-top: 2rem;
		max-width: 56rem; /* max-w-4xl */
	}

	.service-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem; /* gap-1.5 */
		animation: fadeUp 0.6s ease var(--delay) backwards;
	}

	.service-num {
		font-size: 1.125rem; /* text-lg */
		font-weight: 700;
	}

	.service-label {
		font-size: 0.875rem; /* text-sm */
		color: #4b5563; /* text-gray-600 */
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile Fallback */
	@media (max-width: 768px) {
		.carousel-container {
			perspective: none;
			width: 100%;
			height: 450px;
		}
		.carousel-track {
			position: static;
			transform-style: flat;
			transition: none;
			transform: none !important;
			display: flex;
			overflow-x: auto;
			padding: 1rem;
			gap: 1rem;
			align-items: center;
			justify-content: flex-start;
		}
		.carousel-item {
			position: relative;
			flex-shrink: 0;
			width: 200px;
			height: 300px;
			transform: none !important;
			opacity: 1 !important;
			pointer-events: auto !important;
		}
	}
</style>
