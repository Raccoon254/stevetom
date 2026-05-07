<script lang="ts">
	import { onMount } from 'svelte'

	interface Skill {
		name: string
		icon: string
		color: string
		x: number
		y: number
		size: number
		delay: number
		orbit: number
	}

	// Skills data with devicon mappings and brand colors
	const skillsData: { name: string; icon: string; color: string }[] = [
		{ name: 'JavaScript', icon: 'devicon-javascript-plain', color: '#F7DF1E' },
		{ name: 'Python', icon: 'devicon-python-plain', color: '#3776AB' },
		{ name: 'React', icon: 'devicon-react-original', color: '#61DAFB' },
		{ name: 'Node.js', icon: 'devicon-nodejs-plain', color: '#339933' },
		{ name: 'Java', icon: 'devicon-java-plain', color: '#ED8B00' },
		{ name: 'PHP', icon: 'devicon-php-plain', color: '#777BB4' },
		{ name: 'CSS3', icon: 'devicon-css3-plain', color: '#1572B6' },
		{ name: 'HTML5', icon: 'devicon-html5-plain', color: '#E34F26' },
		{ name: 'Git', icon: 'devicon-git-plain', color: '#F05032' },
		{ name: 'MongoDB', icon: 'devicon-mongodb-plain', color: '#47A248' },
		{ name: 'PostgreSQL', icon: 'devicon-postgresql-plain', color: '#4169E1' },
		{ name: 'Next.js', icon: 'devicon-nextjs-plain', color: '#ffffff' },
		{ name: 'Docker', icon: 'devicon-docker-plain', color: '#2496ED' },
		{ name: 'Linux', icon: 'devicon-linux-plain', color: '#FCC624' },
		{ name: 'TypeScript', icon: 'devicon-typescript-plain', color: '#3178C6' },
		{ name: 'Svelte', icon: 'devicon-svelte-plain', color: '#FF3E00' },
		{ name: 'Rust', icon: 'devicon-rust-original', color: '#ffffff' },
		{ name: 'Kotlin', icon: 'devicon-kotlin-plain', color: '#7F52FF' },
		{ name: 'Android', icon: 'devicon-android-plain', color: '#3DDC84' },
		{ name: 'Firebase', icon: 'devicon-firebase-plain', color: '#FFCA28' },
		{ name: 'Azure', icon: 'devicon-azure-plain', color: '#0078D4' },
		{ name: 'Chromium', icon: 'devicon-chrome-plain', color: '#ffffff' },
		{ name: 'Netlify', icon: 'devicon-netlify-plain', color: '#00C7B7' },
		{ name: 'Vercel', icon: 'devicon-vercel-plain', color: '#ffffff' },
		{ name: 'Nginx', icon: 'devicon-nginx-plain', color: '#009639' },
		{ name: 'Apache', icon: 'devicon-apache-plain', color: '#D22128' },
		{ name: 'Spring', icon: 'devicon-spring-plain', color: '#6DB33F' },
		{ name: 'Laravel', icon: 'devicon-laravel-original', color: '#FF2D20' },
		{ name: 'WordPress', icon: 'devicon-wordpress-plain', color: '#21759B' },
		{ name: 'Bootstrap', icon: 'devicon-bootstrap-plain', color: '#7952B3' },
		{ name: 'Tailwind', icon: 'devicon-tailwindcss-original', color: '#06B6D4' },
		{ name: 'Vuetify', icon: 'devicon-vuetify-plain', color: '#1867C0' },
		{ name: 'Nuxt.js', icon: 'devicon-nuxtjs-plain', color: '#00DC82' },
	]

	let skills: Skill[] = []
	let hoveredSkill: Skill | null = null
	let containerWidth = 800
	let containerHeight = 600

	onMount(() => {
		// Position skills in orbital rings
		skills = skillsData.map((skill, index) => {
			const totalSkills = skillsData.length
			const orbitRing = Math.floor(index / 11) // 3 rings of ~11 skills each
			const positionInRing = index % 11
			const skillsInRing = orbitRing === 2 ? 11 : 11

			// Calculate angle for this skill in its ring
			const angleOffset = orbitRing * 15 // Offset each ring
			const angle = (positionInRing / skillsInRing) * 360 + angleOffset

			// Ring radiuses (percentage of container)
			const ringRadius = [28, 40, 52][orbitRing] || 52

			// Convert to x, y coordinates (centered at 50%, 50%)
			const rad = (angle * Math.PI) / 180
			const x = 50 + ringRadius * Math.cos(rad)
			const y = 50 + ringRadius * Math.sin(rad)

			// Size varies by ring (inner = larger)
			const size = [2.8, 2.4, 2][orbitRing] || 2

			return {
				...skill,
				x,
				y,
				size,
				delay: index * 0.08,
				orbit: orbitRing,
			}
		})
	})

	function handleHover(skill: Skill) {
		hoveredSkill = skill
	}

	function handleLeave() {
		hoveredSkill = null
	}
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

			<!-- Current hovered skill display -->
			<div class="skill-display" class:active={hoveredSkill}>
				{#if hoveredSkill}
					<div class="skill-info">
						<i
							class="{hoveredSkill.icon} colored"
							style="font-size: 3rem; color: {hoveredSkill.color};"
						></i>
						<span class="skill-name" style="color: {hoveredSkill.color};">{hoveredSkill.name}</span>
					</div>
				{:else}
					<span class="skill-hint">Hover to explore</span>
				{/if}
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

		<!-- Right side - Orbital constellation -->
		<div class="skills-orbit">
			<!-- Orbital rings (decorative) -->
			<div class="orbit-ring ring-1"></div>
			<div class="orbit-ring ring-2"></div>
			<div class="orbit-ring ring-3"></div>

			<!-- Center glow -->
			<div class="center-glow">
        <img src="/new/kentom_logo.svg" alt="" class="">
      </div>

			<!-- Skill icons -->
			{#each skills as skill, index}
				<button
					class="skill-icon orbit-{skill.orbit}"
					style="
						--x: {skill.x}%;
						--y: {skill.y}%;
						--size: {skill.size}rem;
						--delay: {skill.delay}s;
						--color: {skill.color};
						--index: {index};
					"
					on:mouseenter={() => handleHover(skill)}
					on:mouseleave={handleLeave}
					on:focus={() => handleHover(skill)}
					on:blur={handleLeave}
					class:hovered={hoveredSkill === skill}
				>
					<i class={skill.icon} style="color: {skill.color};"></i>
					<span class="skill-tooltip">{skill.name}</span>
				</button>
			{/each}

			<!-- Connection lines (decorative pulses) -->
			<svg class="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
				<defs>
					<radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
						<stop offset="100%" stop-color="rgba(255,255,255,0)" />
					</radialGradient>
				</defs>
				<circle cx="50" cy="50" r="3" fill="url(#centerGlow)" class="pulse-center" />
			</svg>
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
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
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
		min-height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 2rem;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.skill-display.active {
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.08);
	}

	.skill-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		animation: fadeIn 0.3s ease;
	}

	.skill-name {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.skill-hint {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.875rem;
		letter-spacing: 0.1em;
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
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stat-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	/* Right side - Orbital */
	.skills-orbit {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		max-width: 600px;
		margin: 0 auto;
	}

	/* Orbital rings */
	.orbit-ring {
		position: absolute;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.ring-1 {
		width: 56%;
		height: 56%;
		animation: rotateRing 60s linear infinite;
	}

	.ring-2 {
		width: 80%;
		height: 80%;
		animation: rotateRing 90s linear infinite reverse;
	}

	.ring-3 {
		width: 104%;
		height: 104%;
		animation: rotateRing 120s linear infinite;
	}

	.center-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 120px;
		height: 120px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		animation: pulse 4s ease-in-out infinite;
	}

	/* Skill icons */
	.skill-icon {
		position: absolute;
		left: var(--x);
		top: var(--y);
		transform: translate(-50%, -50%);
		width: calc(var(--size) * 1.5);
		height: calc(var(--size) * 1.5);
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(37, 37, 37, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		animation:
			skillAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) var(--delay) backwards,
			float 6s ease-in-out infinite;
		animation-delay: var(--delay), calc(var(--delay) + 0.8s);
		z-index: 1;
	}

	.skill-icon i {
		font-size: var(--size);
		transition: all 0.3s ease;
	}

	.skill-icon:hover,
	.skill-icon.hovered {
		transform: translate(-50%, -50%) scale(1.4);
		border-color: var(--color);
		box-shadow:
			0 0 30px rgba(255, 255, 255, 0.2),
			0 0 60px color-mix(in srgb, var(--color) 30%, transparent);
		z-index: 10;
		background: rgba(37, 37, 37, 1);
	}

	.skill-icon:hover i,
	.skill-icon.hovered i {
		transform: scale(1.1);
	}

	/* Tooltip */
	.skill-tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%) translateY(-8px);
		padding: 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
		border-radius: 6px;
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s ease;
		pointer-events: none;
	}

	.skill-icon:hover .skill-tooltip {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(-12px);
	}

	/* Connection lines */
	.connection-lines {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.pulse-center {
		animation: pulseLine 3s ease-in-out infinite;
	}

	/* Animations */
	@keyframes skillAppear {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(-50%, -50%) translateY(0);
		}
		50% {
			transform: translate(-50%, -50%) translateY(-5px);
		}
	}

	@keyframes rotateRing {
		from {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.5;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 0.8;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	@keyframes pulseLine {
		0%,
		100% {
			r: 3;
			opacity: 0.5;
		}
		50% {
			r: 6;
			opacity: 1;
		}
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
		}

		.skills-description {
			margin: 0 auto 2rem;
		}

		.skill-stats {
			justify-content: center;
		}

		.skills-orbit {
			max-width: 500px;
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

		.skills-orbit {
			max-width: 350px;
		}

		.skill-icon {
			width: calc(var(--size) * 1.2);
			height: calc(var(--size) * 1.2);
		}
	}
</style>
