<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { Zap } from 'lucide-svelte'

	interface Skill {
		name: string
		icon: string
		color: string
	}

	const skills: { name: string; icon: string; color: string }[] = [
		{ name: 'Svelte', icon: 'devicon-svelte-plain', color: '#FF3E00' },
		{ name: 'Socket IO', icon: 'devicon-socketio-plain', color: '#F7DF1E' },
		{ name: 'Supabase', icon: 'devicon-supabase-plain', color: '#3776AB' },
		{ name: 'Postman', icon: 'devicon-postman-plain', color: '#61DAFB' },
		{ name: 'Java', icon: 'devicon-java-plain', color: '#ED8B00' },
		{ name: 'Photoshop', icon: 'devicon-photoshop-plain', color: '#FF69B4' },
		{ name: 'Cpanel', icon: 'devicon-cpanel-plain', color: 'green' },
		{ name: 'Framer Motion', icon: 'devicon-framermotion-plain', color: '#FF69B4' },
		{ name: 'My SQL', icon: 'devicon-mysql-plain', color: '#1572B6' },
		{ name: 'Open CV', icon: 'devicon-opencv-plain', color: '#E34F26' },
		{ name: 'Git', icon: 'devicon-git-plain', color: '#F05032' },
		{ name: 'PostgreSQL', icon: 'devicon-postgresql-plain', color: '#4169E1' },
		{ name: 'Next.js', icon: 'devicon-nextjs-plain', color: '#ffffff' },
		{ name: 'Docker', icon: 'devicon-docker-plain', color: '#2496ED' },
		{ name: 'Linux', icon: 'devicon-linux-plain', color: '#FCC624' },
		{ name: 'SSH', icon: 'devicon-ssh-plain', color: '#3178C6' },
		{ name: 'Prisma', icon: 'devicon-prisma-plain', color: '#ffffff' },
		{ name: 'Kotlin', icon: 'devicon-kotlin-plain', color: '#7F52FF' },
		{ name: 'Android', icon: 'devicon-android-plain', color: '#3DDC84' },
		{ name: 'Firebase', icon: 'devicon-firebase-plain', color: '#FFCA28' },
		{ name: 'Chromium', icon: 'devicon-chrome-plain', color: '#ffffff' },
		{ name: 'Vs Code', icon: 'devicon-vscode-plain', color: '#00C7B7' },
		{ name: 'Vercel', icon: 'devicon-vercel-plain', color: '#ffffff' },
		{ name: 'Nginx', icon: 'devicon-nginx-plain', color: '#009639' },
		{ name: 'Apache', icon: 'devicon-apache-plain', color: '#D22128' },
		{ name: 'Spring', icon: 'devicon-spring-plain', color: '#6DB33F' },
		{ name: 'Laravel', icon: 'devicon-laravel-original', color: '#FF2D20' },
		{ name: 'Tailwind', icon: 'devicon-tailwindcss-original', color: '#06B6D4' },
		{ name: 'Nuxt.js', icon: 'devicon-nuxtjs-plain', color: '#00DC82' },
		{ name: 'Zsh', icon: 'devicon-zsh-plain', color: '#00DC82' },
	]

	let hoveredSkill: Skill | null = null
	let selectedSkill: Skill | null = null
	let cyclingSkill: Skill | null = null
	let cyclingInterval: ReturnType<typeof setInterval>
	let isInteracting = false

	onMount(() => {
		cyclingSkill = skills[0]
		cyclingInterval = setInterval(() => {
			if (!isInteracting && !selectedSkill) {
				const currentIndex = skills.indexOf(cyclingSkill!)
				const nextIndex = (currentIndex + 1) % skills.length
				cyclingSkill = skills[nextIndex]
			}
		}, 4000)
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
		selectedSkill = selectedSkill === skill ? null : skill
	}

	$: activeDisplaySkill = hoveredSkill || selectedSkill || cyclingSkill
	$: isPersisted = !!selectedSkill

	function formatSkillName(name: string) {
		// only 8 chars
		return name.length > 8 ? name.substring(0, 8) + '...' : name
	}

	let showAll = false
	let isMobile = false

	function checkMobile() {
		isMobile = window.innerWidth < 640
		if (!isMobile) {
			showAll = false // Reset on desktop so if they go back to mobile it starts collapsed, or keep it?
			// Better to just let isMobile control the view logic.
		}
	}

	onMount(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)
	})

	$: visibleSkills = isMobile && !showAll ? skills.slice(0, 9) : skills
</script>

<section class="skills-section">
	<div class="skills-content">
		<!-- Left side - Text -->
		<div class="skills-text">
			<span class="section-label">EXPERTISE</span>
			<h2 class="skills-title">Tech Stack</h2>
			<p class="skills-description">
				Technologies I've mastered over the years. Each tool carefully chosen to craft exceptional
				digital experiences.
			</p>

			<!-- Current active skill display -->
			<div class="skill-display" class:selected={isPersisted && !hoveredSkill}>
				<div class="flex flex-col items-center w-full">
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
								<i class="{activeDisplaySkill.icon} colored" style="font-size: 3rem;"></i>
								<div class="flex flex-col text-left">
									<span class="skill-name" style="color: {activeDisplaySkill.color};">
										{activeDisplaySkill.name}
									</span>
									<span class="text-sm text-white/50">Professional Experience</span>
								</div>
							</div>
						{/key}
					{/if}
				</div>
			</div>

			<div class="skill-stats">
				<div class="stat">
					<span class="stat-number">{skills.length}+</span>
					<span class="stat-label">Technologies</span>
				</div>
				<div class="stat">
					<span class="stat-number">5+</span>
					<span class="stat-label">Years Experience</span>
				</div>
			</div>
		</div>

		<!-- Right side - Grid of skills -->
		<div class="skills-grid">
			{#each visibleSkills as skill, index}
				<button
					class="skill-card"
					style="--color: {skill.color}; --delay: {index * 0.05}s;"
					on:mouseenter={() => handleHover(skill)}
					on:mouseleave={handleLeave}
					on:click={() => handleClick(skill)}
					class:active={hoveredSkill === skill ||
						selectedSkill === skill ||
						(!hoveredSkill && !selectedSkill && cyclingSkill === skill)}
					class:selected={selectedSkill === skill}
				>
					<i class={skill.icon} style="color: {skill.color};"></i>
					<span class="skill-label">{formatSkillName(skill.name)}</span>

					{#if selectedSkill === skill}
						<div class="selected-badge">
							<Zap size={10} class="fill-yellow-400 text-yellow-400" />
						</div>
					{/if}
				</button>
			{/each}
		</div>

		{#if isMobile && !showAll && skills.length > 9}
			<div class="show-more-container">
				<button class="show-more-btn" on:click={() => (showAll = true)}>
					Show More ({skills.length - 9} more)
				</button>
			</div>
		{/if}
	</div>
</section>

<style>
	.skills-section {
		min-height: 100vh;
		position: relative;
		padding: 6rem 2rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.skills-content {
		margin: 0 auto;
		width: 100%;
		max-width: 1400px;
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 4rem;
		align-items: start;
	}

	.skills-text {
		color: white;
		position: sticky;
		top: 6rem;
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
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 700;
		margin-bottom: 1.5rem;
		line-height: 1.1;
		color: white;
	}

	.skills-description {
		font-size: 1rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.6);
		max-width: 400px;
		margin-bottom: 2rem;
	}

	.skill-display {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1.25rem 1.5rem;
		min-height: 100px;
		display: flex;
		align-items: center;
		margin-bottom: 2rem;
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}

	.skill-display.selected {
		border-color: rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.08);
	}

	.skill-info {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		width: 100%;
	}

	.skill-name {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.skill-stats {
		display: flex;
		gap: 2.5rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		color: white;
	}

	.stat-label {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	/* Skills Grid */
	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
	}

	.skill-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		aspect-ratio: 1;
		padding: 1.25rem 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			background 0.2s ease;
		animation: fadeIn 0.4s ease var(--delay) backwards;
	}

	.skill-card i {
		font-size: 2rem;
		transition: transform 0.2s ease;
	}

	.skill-label {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
	}

	.skill-card:hover,
	.skill-card.active {
		transform: translateY(-4px);
		border-color: var(--color);
		background: rgba(255, 255, 255, 0.06);
	}

	.skill-card:hover i,
	.skill-card.active i {
		transform: scale(1.1);
	}

	.skill-card.selected {
		border-color: var(--color);
		background: rgba(255, 255, 255, 0.08);
	}

	.selected-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #252525;
		border-radius: 50%;
		padding: 3px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
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
			position: static;
		}

		.skills-description {
			margin: 0 auto 2rem;
		}

		.skill-display {
			max-width: 400px;
			margin: 0 auto 2rem;
		}

		.skill-info {
			justify-content: center;
		}

		.skill-stats {
			justify-content: center;
		}

		.skills-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}
	}

	@media (max-width: 640px) {
		.skills-section {
			padding: 4rem 1rem;
		}

		.skills-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 0.75rem;
		}

		.skill-card {
			padding: 1rem 0.5rem;
		}

		.skill-card i {
			font-size: 1.5rem;
		}

		.skill-label {
			font-size: 0.6rem;
		}

		.stat-number {
			font-size: 1.75rem;
		}

		.show-more-container {
			width: 100%;
			display: flex;
			justify-content: center;
			margin-top: 1.5rem;
		}

		.show-more-btn {
			background: rgba(37, 37, 37, 0.1);
			border: 1px solid rgba(255, 255, 255, 0.1);
			color: white;
			padding: 0.75rem 2rem;
			border-radius: 9999px;
			font-size: 0.875rem;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s ease;
			backdrop-filter: blur(10px);
		}

		.show-more-btn:active {
			transform: scale(0.95);
			background: rgba(255, 255, 255, 0.15);
		}
	}
</style>
