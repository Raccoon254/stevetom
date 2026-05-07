<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { Zap } from 'lucide-svelte'

	interface Skill {
		name: string
		icon: string
		color: string
	}

	// Skills data with devicon mappings and brand colors
	const skillsData: { name: string; icon: string; color: string }[] = [
		{ name: 'Svelte', icon: 'devicon-svelte-plain', color: '#FF3E00' },
		{ name: 'JavaScript', icon: 'devicon-javascript-plain', color: '#F7DF1E' },
		{ name: 'Python', icon: 'devicon-python-plain', color: '#3776AB' },
		{ name: 'React', icon: 'devicon-react-original', color: '#61DAFB' },
		{ name: 'Java', icon: 'devicon-java-plain', color: '#ED8B00' },
		{ name: 'Photoshop', icon: 'devicon-photoshop-plain', color: '#FF69B4' },
		{ name: 'Photoshop', icon: 'devicon-photoshop-plain', color: '#FF69B4' },
		{ name: 'Photoshop', icon: 'devicon-photoshop-plain', color: '#FF69B4' },
		{ name: 'PHP', icon: 'devicon-php-plain', color: '#777BB4' },
		{ name: 'CSS3', icon: 'devicon-android-plain', color: '#1572B6' },
		{ name: 'HTML5', icon: 'devicon-html5-plain', color: '#E34F26' },
		{ name: 'Git', icon: 'devicon-git-plain', color: '#F05032' },
		{ name: 'PostgreSQL', icon: 'devicon-postgresql-plain', color: '#4169E1' },
		{ name: 'Next.js', icon: 'devicon-nextjs-plain', color: '#ffffff' },
		{ name: 'Docker', icon: 'devicon-docker-plain', color: '#2496ED' },
		{ name: 'Linux', icon: 'devicon-linux-plain', color: '#FCC624' },
		{ name: 'TypeScript', icon: 'devicon-typescript-plain', color: '#3178C6' },
		{ name: 'Rust', icon: 'devicon-rust-original', color: '#ffffff' },
		{ name: 'Kotlin', icon: 'devicon-kotlin-plain', color: '#7F52FF' },
		{ name: 'Android', icon: 'devicon-android-plain', color: '#3DDC84' },
		{ name: 'Firebase', icon: 'devicon-firebase-plain', color: '#FFCA28' },
		{ name: 'Chromium', icon: 'devicon-chrome-plain', color: '#ffffff' },
		{ name: 'Netlify', icon: 'devicon-netlify-plain', color: '#00C7B7' },
		{ name: 'Vercel', icon: 'devicon-vercel-plain', color: '#ffffff' },
		{ name: 'Nginx', icon: 'devicon-nginx-plain', color: '#009639' },
		{ name: 'Apache', icon: 'devicon-apache-plain', color: '#D22128' },
		{ name: 'Spring', icon: 'devicon-spring-plain', color: '#6DB33F' },
		{ name: 'Laravel', icon: 'devicon-laravel-original', color: '#FF2D20' },
		{ name: 'Tailwind', icon: 'devicon-tailwindcss-original', color: '#06B6D4' },
		{ name: 'Nuxt.js', icon: 'devicon-nuxtjs-plain', color: '#00DC82' },
	]

	let skills: Skill[] = []
	let hoveredSkill: Skill | null = null
	let selectedSkill: Skill | null = null
	let cyclingSkill: Skill | null = null
	let cyclingInterval: ReturnType<typeof setInterval>
	let isInteracting = false

	onMount(() => {
		// add all skills to the skills array
		skills = skillsData

		// Start cycling
		cyclingSkill = skills[0]
		cyclingInterval = setInterval(() => {
			if (!isInteracting && !selectedSkill) {
				const currentIndex = skills.indexOf(cyclingSkill!)
				const nextIndex = (currentIndex + 1) % skills.length
				cyclingSkill = skills[nextIndex]
			}
		}, 2000)
	})

	onDestroy(() => {
		if (cyclingInterval) clearInterval(cyclingInterval)
	})

	function handleHover(skill: Skill) {
		isInteracting = true
		hoveredSkill = skill
	}

	function handleLeave() {
		isInteracting = false
		hoveredSkill = null
	}

	function handleClick(skill: Skill) {
		// Toggle selection
		if (selectedSkill === skill) {
			selectedSkill = null
		} else {
			selectedSkill = skill
		}
	}

	// Determine which skill to show in the display (Priority: Hovered > Selected > Cycling)
	$: activeDisplaySkill = hoveredSkill || selectedSkill || cyclingSkill
	$: isPersisted = !!selectedSkill
</script>

<section class="skills-section">
	<div class="skills-content">
		<!-- Left side - Text -->
		<div class="skills-text">
			<span class="section-label">EXPERTISE</span>
			<h2 class="skills-title">Tech Stack</h2>
			<p class="skills-description">
				A constellation of technologies I've mastered over the years. Each tool carefully chosen to
				craft exceptional digital experiences.
			</p>

			<!-- Current active skill display -->
			<div class="skill-display" class:selected={isPersisted && !hoveredSkill}>
				<div class="flex flex-col items-center w-full">
					<!-- Top label -->
					<div class="w-full flex justify-between items-start mb-2 h-6">
						<span class="text-xs uppercase tracking-widest text-white/40 font-medium">
							{#if hoveredSkill}
								Exploring
							{:else if selectedSkill}
								Selected
							{:else}
								Example
							{/if}
						</span>

						{#if isPersisted && !hoveredSkill}
							<div class="animate-pulse">
								<Zap size={16} class="fill-yellow-400 text-yellow-400" />
							</div>
						{/if}
					</div>

					{#if activeDisplaySkill}
						{#key activeDisplaySkill.name}
							<div class="skill-info">
								<i class="{activeDisplaySkill.icon} colored" style="font-size: 3.5rem;"></i>
								<div class="flex flex-col text-left">
									<span class="skill-name" style="color: {activeDisplaySkill.color};">
										{activeDisplaySkill.name}
									</span>
									<span class="text-sm text-white/50"> Professional Experience </span>
								</div>
							</div>
						{/key}
					{/if}
				</div>
			</div>

			<div class="skill-stats">
				<div class="stat">
					<span class="stat-number">33+</span>
					<span class="stat-label">Technologies</span>
				</div>
				<div class="stat">
					<span class="stat-number">5+</span>
					<span class="stat-label">Years Experience</span>
				</div>
			</div>
		</div>

		<!-- Right side - Horizontal row of skills -->
		<div class="skills-row">
			{#each skills as skill, index}
				<button
					class="skill-icon"
					style="--color: {skill.color};"
					on:mouseenter={() => handleHover(skill)}
					on:mouseleave={handleLeave}
					on:focus={() => handleHover(skill)}
					on:blur={handleLeave}
					on:click={() => handleClick(skill)}
					class:active={hoveredSkill === skill ||
						selectedSkill === skill ||
						(!hoveredSkill && !selectedSkill && cyclingSkill === skill)}
					class:selected={selectedSkill === skill}
				>
					<i class={skill.icon} style="color: {skill.color};"></i>

					{#if selectedSkill === skill}
						<div
							class="absolute -top-1 -right-1 bg-[#252525] rounded-full p-0.5 border border-white/20 z-20"
						>
							<Zap size={8} class="fill-yellow-400 text-yellow-400" />
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</section>

<style>
	.skills-section {
		min-height: 100vh;
		background: rgba(37, 37, 37, 0.8);
		backdrop-filter: invert(0.2);
		position: relative;
		padding: 6rem 2rem;
		overflow: hidden;
	}

	.skills-content {
		max-width: 1400px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1.2fr;
		gap: 4rem;
		align-items: center;
		min-height: 80vh;
	}

	/* Left side text */
	.skills-text {
		color: white;
	}

	.section-label {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 1rem;
		display: block;
	}

	.skills-title {
		font-size: clamp(3rem, 8vw, 5rem);
		font-weight: 700;
		margin-bottom: 1.5rem;
		line-height: 1.1;
		color: white;
	}

	.skills-description {
		font-size: 1.125rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.7);
		max-width: 400px;
		margin-bottom: 2rem;
	}

	.skill-display {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1.5rem 2rem;
		min-height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 2rem;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		position: relative;
		overflow: hidden;
	}

	.skill-display::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	}

	.skill-display.selected {
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.08);
	}

	.skill-info {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
	}

	.skill-name {
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.skill-stats {
		display: flex;
		gap: 3rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: 700;
		color: white;
	}

	.stat-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	/* Right side - Horizontal row */
	.skills-row {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.75rem;
		overflow-x: auto;
		padding: 1rem 0;
		scrollbar-width: none;
	}

	.skills-row::-webkit-scrollbar {
		display: none;
	}

	/* Skill icons */
	.skill-icon {
		position: relative;
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(37, 37, 37, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease;
	}

	.skill-icon i {
		font-size: 1.5rem;
		transition: transform 0.2s ease;
	}

	/* Active/Hover state */
	.skill-icon:hover,
	.skill-icon.active {
		transform: scale(1.15);
		border-color: var(--color);
		z-index: 10;
		background: rgba(37, 37, 37, 1);
	}

	.skill-icon.selected {
		border-color: var(--color);
		background: rgba(37, 37, 37, 1);
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
	}

	/* Animations */
	@keyframes skillAppear {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.skills-content {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.skills-text {
			text-align: center;
		}

		.skills-description {
			margin: 0 auto 2rem;
		}

		.skill-display {
			max-width: 500px;
			margin: 0 auto 2rem;
		}

		.skill-info {
			justify-content: center;
		}

		.skill-stats {
			justify-content: center;
		}

		.skills-grid {
			max-width: 400px;
		}
	}

	@media (max-width: 640px) {
		.skills-section {
			padding: 4rem 1rem;
		}

		.skill-stats {
			gap: 2rem;
		}

		.stat-number {
			font-size: 2rem;
		}

		.skills-grid {
			grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
			gap: 0.5rem;
		}

		.skill-icon {
			width: calc(var(--size) * 1.1);
			height: calc(var(--size) * 1.1);
		}
	}
</style>
