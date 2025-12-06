<script lang="ts">
	import { MessageSquare, UnfoldVertical } from 'lucide-svelte'
	import Scene from './Scene.svelte'
	import Loader from './Loader.svelte'

	let isLoading = true
	let activeMenu: 'design' | 'code' | 'animate' | null = null
	let menuPosition = { x: 0, y: 0 }
	let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
	let cooldowns: Record<'design' | 'code' | 'animate', boolean> = {
		design: false,
		code: false,
		animate: false,
	}

	// Icon mappings for each skill
	const skillIcons = {
		design: [
			{ name: 'Figma', icon: 'devicon-figma-plain', color: '#F24E1E' },
			{ name: 'Adobe XD', icon: 'devicon-xd-plain', color: '#FF61F6' },
			{ name: 'Sketch', icon: 'devicon-sketch-line', color: '#F7B500' },
			{ name: 'Photoshop', icon: 'devicon-photoshop-plain', color: '#31A8FF' },
			{ name: 'Illustrator', icon: 'devicon-illustrator-plain', color: '#FF9A00' },
		],
		code: [
			{ name: 'VS Code', icon: 'devicon-vscode-plain', color: '#007ACC' },
			{ name: 'JavaScript', icon: 'devicon-javascript-plain', color: '#F7DF1E' },
			{ name: 'TypeScript', icon: 'devicon-typescript-plain', color: '#3178C6' },
			{ name: 'React', icon: 'devicon-react-original', color: '#61DAFB' },
			{ name: 'Svelte', icon: 'devicon-svelte-plain', color: '#FF3E00' },
			{ name: 'Node.js', icon: 'devicon-nodejs-plain', color: '#339933' },
		],
		animate: [
			{ name: 'After Effects', icon: 'devicon-aftereffects-plain', color: '#9999FF' },
			{ name: 'Three.js', icon: 'devicon-threejs-original', color: '#000000' },
			{ name: 'CSS3', icon: 'devicon-css3-plain', color: '#1572B6' },
			{ name: 'GSAP', icon: 'image-gsap.png', color: '#88CE02' },
			{ name: 'Framer', icon: 'devicon-framermotion-plain', color: '#0055FF' },
		],
	}

	function openMenuForSkill(event: MouseEvent, skill: 'design' | 'code' | 'animate') {
		// Clear any existing timer
		if (autoCloseTimer) {
			clearTimeout(autoCloseTimer)
		}

		// Set menu position to mouse position
		menuPosition = { x: event.clientX, y: event.clientY }
		activeMenu = skill

		// Start 5-minute auto-close timer
		autoCloseTimer = setTimeout(() => {
			closeMenu()
		}, 300000)
	}

	function handleSkillEnter(event: MouseEvent, skill: 'design' | 'code' | 'animate') {
		// Check if skill is on cooldown
		if (cooldowns[skill]) {
			return
		}

		openMenuForSkill(event, skill)
	}

	function handleSkillClick(event: MouseEvent, skill: 'design' | 'code' | 'animate') {
		// Force open by resetting cooldown
		cooldowns[skill] = false
		openMenuForSkill(event, skill)
	}

	function closeMenu() {
		if (activeMenu) {
			// Set cooldown for the current skill
			const skill = activeMenu
			cooldowns[skill] = true

			// Remove cooldown after 4 seconds
			setTimeout(() => {
				cooldowns[skill] = false
			}, 4000)
		}

		activeMenu = null
		if (autoCloseTimer) {
			clearTimeout(autoCloseTimer)
			autoCloseTimer = null
		}
	}

	function handleSceneLoaded() {
		isLoading = false
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
	/>
</svelte:head>

<!-- Minimal Loader with Facts -->
{#if isLoading}
	<Loader />
{/if}

<!-- Devicon Preloader (hidden, forces fonts to load) -->
<div class="devicon-preloader" aria-hidden="true">
	{#each Object.values(skillIcons).flat() as tool}
		{#if tool.icon.startsWith('devicon')}
			<i class="{tool.icon} colored"></i>
		{/if}
	{/each}
</div>

<!-- Radial Menu (GTA Style) -->
{#if activeMenu}
	<div class="radial-menu-overlay" on:click={closeMenu} role="button" tabindex="-1">
		<div class="radial-menu" style="left: {menuPosition.x}px; top: {menuPosition.y}px;">
			<!-- SVG for sectored wheel -->
			<svg class="radial-wheel" viewBox="0 0 300 300" width="300" height="300">
				<defs>
					<!-- Donut mask -->
					<mask id="donut-mask">
						<circle cx="150" cy="150" r="150" fill="white" />
						<circle cx="150" cy="150" r="50" fill="black" />
					</mask>
				</defs>

				<!-- Sectors -->
				{#each skillIcons[activeMenu] as tool, index}
					{@const totalSectors = skillIcons[activeMenu].length}
					{@const anglePerSector = 360 / totalSectors}
					{@const startAngle = index * anglePerSector - 90}
					{@const endAngle = (index + 1) * anglePerSector - 90}
					{@const largeArcFlag = anglePerSector > 180 ? 1 : 0}

					{@const startRad = (startAngle * Math.PI) / 180}
					{@const endRad = (endAngle * Math.PI) / 180}

					{@const x1 = 150 + 150 * Math.cos(startRad)}
					{@const y1 = 150 + 150 * Math.sin(startRad)}
					{@const x2 = 150 + 150 * Math.cos(endRad)}
					{@const y2 = 150 + 150 * Math.sin(endRad)}

					{@const innerX1 = 150 + 50 * Math.cos(startRad)}
					{@const innerY1 = 150 + 50 * Math.sin(startRad)}
					{@const innerX2 = 150 + 50 * Math.cos(endRad)}
					{@const innerY2 = 150 + 50 * Math.sin(endRad)}

					{@const midAngle = (startAngle + endAngle) / 2}
					{@const midRad = (midAngle * Math.PI) / 180}
					{@const iconX = 150 + 100 * Math.cos(midRad)}
					{@const iconY = 150 + 100 * Math.sin(midRad)}

					<g class="sector-group" style="animation-delay: {index * 0.05}s;">
						<!-- Sector path -->
						<path
							class="sector backdrop-blur-lg"
							d="M {x1} {y1} A 150 150 0 {largeArcFlag} 1 {x2} {y2} L {innerX2} {innerY2} A 50 50 0 {largeArcFlag} 0 {innerX1} {innerY1} Z"
							fill="rgba(37, 37, 37, 0.95)"
							stroke="rgba(255, 255, 255, 0.3)"
							stroke-width="1"
							mask="url(#donut-mask)"
							style="backdrop-filter: blur(10px)"
						/>

						<!-- Icon and text -->
						<g class="sector-content" transform="translate({iconX}, {iconY})">
							<text
								class="sector-icon"
								text-anchor="middle"
								dominant-baseline="middle"
								font-size="32"
								fill="white"
							>
								{#if tool.icon.startsWith('image')}
									<div class="sector-icon">
										<img
											src={'./new/' + tool.icon}
											alt={tool.name}
											style="width: 32px; height: 32px;"
										/>
									</div>
								{:else if tool.icon.startsWith('devicon')}
									<i class="{tool.icon} colored"></i>
								{:else}
									{tool.icon}
								{/if}
							</text>
							<text
								class="sector-label"
								text-anchor="middle"
								y="25"
								font-size="12"
								fill="white"
								opacity="0.9"
							>
								{tool.name}
							</text>
						</g>
					</g>
				{/each}
			</svg>

			<!-- Overlay devicons (positioned absolutely) -->
			{#each skillIcons[activeMenu] as tool, index}
				{@const totalSectors = skillIcons[activeMenu].length}
				{@const anglePerSector = 360 / totalSectors}
				{@const midAngle = (index * anglePerSector + (index + 1) * anglePerSector) / 2 - 90}
				{@const midRad = (midAngle * Math.PI) / 180}
				{@const iconX = 100 * Math.cos(midRad)}
				{@const iconY = 100 * Math.sin(midRad)}

				{#if tool.icon.startsWith('devicon')}
					<div
						class="devicon-overlay"
						style="
							left: 50%;
							top: 50%;
							--x: {iconX}px;
							--y: {iconY - 12}px;
							animation-delay: {index * 0.05}s;
						"
					>
						<i class="{tool.icon} colored" style="font-size: 2rem; color: {tool.color};"></i>
					</div>
				{:else if tool.icon.startsWith('image')}
					<div
						class="devicon-overlay"
						style="
							left: 50%;
							top: 50%;
							--x: {iconX}px;
							--y: {iconY - 12}px;
							animation-delay: {index * 0.05}s;
						"
					>
						<img src={'./new/' + tool.icon} alt={tool.name} style="width: 32px; height: 32px;" />
					</div>
				{/if}
			{/each}

			<!-- backdrop circle exact size as the svg -->
			<div class="backdrop-circle"></div>

			<!-- Center circle with close button -->
			<div class="radial-center">
				<button class="close-btn" on:click={closeMenu}>✕</button>
			</div>
		</div>
	</div>
{/if}

<div style="background: #252525 ">
	<main class="hero-section">
	<section
		class="screen overflow-y-hidden bg-black/0 flex flex-col relative items-center justify-start overflow-x-hidden"
	>
		<!-- Rectangle with 25% bg-blue-500width -->
		<div class="w-[35%] h-full z-0 top-0 right-0 absolute bg-white"></div>

		<!-- Container that locks background and 3D scene together -->
		<div class="w-full ml-[15%] z-50 h-screen absolute top-0 left-0 z-0">
			<Scene on:loaded={handleSceneLoaded} />
		</div>

		<!-- Text -->
		<div class="w-full z-50 flex items-center h-screen p-6 sm:p-12 md:p-24">
			<div class="text-start">
				<div class="intro-text text-white mb-2 sm:mb-4">I am</div>
				<h1 class="main-title text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-4">
					kenTom
				</h1>
				<div class="tagline text-white mb-6 max-w-2xl">
					<p class="tagline-text text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed">
						I
						<span
							class="highlight interactive-highlight"
							on:mouseenter={(e) => handleSkillEnter(e, 'design')}
							on:click={(e) => handleSkillClick(e, 'design')}
							role="button"
							tabindex="0"
						>
							design
						</span>
						experiences,
						<span
							class="highlight interactive-highlight"
							on:mouseenter={(e) => handleSkillEnter(e, 'code')}
							on:click={(e) => handleSkillClick(e, 'code')}
							role="button"
							tabindex="0"
						>
							code
						</span>
						solutions, and
						<span
							class="highlight interactive-highlight"
							on:mouseenter={(e) => handleSkillEnter(e, 'animate')}
							on:click={(e) => handleSkillClick(e, 'animate')}
							role="button"
							tabindex="0"
						>
							animate
						</span>
						ideas into reality.
					</p>
					<p class="tagline-subtext text-lg sm:text-xl md:text-2xl font-light mt-4 opacity-80">
						Responsive. Interactive. Beautiful. Everywhere.
					</p>
				</div>
				<button
					class="cta-button bg-[#252525]/20 backdrop-blur-sm gradient-bg border border-white ring-1 ring-white ring-offset-2 ring-offset-[#252525] text-black pr-6 p-2 rounded-full mt-6 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
				>
					<span class="mr-2 bg-white/20 p-4 text-white rounded-full">
						<MessageSquare size={26} />
					</span>
					<span class="mr-1 text-white text-3xl font-semibold hover:text-white"> Hey </span>
					<span class="mr-2 text-white text-3xl font-semibold hover:text-white wiggle"> 👋 </span>
				</button>
			</div>
		</div>

		<div class="scroll-indicator absolute bottom-5 left-5 px-6 sm:px-12 md:px-24">
			<div
				class="w-14 h-14 rounded-full bg-white z-50 flex items-center justify-center mb-3 bounce-animation shadow-lg hover:shadow-xl transition-shadow duration-300"
			>
				<UnfoldVertical size={26} class="text-[#252525]" />
			</div>
			<p class="scroll-text text-white font-medium tracking-wide">Scroll Down</p>
		</div>

		<!-- Triangle -->
		<div class="triangle absolute rotate-45 -bottom-10 right-[calc(35%-10px)]"
		style="
		border-top: 60px solid transparent;
		border-bottom: 60px solid transparent;
		border-left: 60px solid white;
		"
		></div>
	</section>
	<section class="h-screen relative border-t-[0px] border-white">
		<!-- Triangle -->
		<div class="triangle absolute rotate-45 -top-10 right-[calc(35%-50px)]"
		style="
		border-top: 60px solid transparent;
		border-bottom: 60px solid transparent;
		border-right: 60px solid white;
		"
		></div>
				<!-- Rectangle with 25% bg-blue-500width -->
		<div class="w-[65%] h-full z-0 top-0 left-0 absolute bg-white"></div>
	</section>
</main>
</div>

<style>
	.hero-section {
		/* linear-gradient slanted lines repeated*/
		background: repeating-linear-gradient(
			-25deg,
			transparent,
			transparent 39px,
			rgba(255, 255, 255, 0.15) 39px,
			rgba(255, 255, 255, 0.15) 40px
		);
		background-position: 100%;
		background-size: 150% 150%;
		animation: gradient 3s linear infinite;
		background-repeat: no-repeat;
		overflow: hidden;
	}

	@keyframes gradient {
		/* make them move up infinite */
		0% {
			background-position: 10px 39px;
		}
		100% {
			background-position: 0px 0px;
		}
	}

	.wiggle {
		animation: wiggle 2s ease-in-out infinite;
	}

	@keyframes wiggle {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(8deg);
		}
		50% {
			transform: rotate(-2deg);
		}
		75% {
			transform: rotate(8deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	/* Text Styling */
	.intro-text {
		font-size: 1.25rem;
		font-weight: 300;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		opacity: 0.9;
		animation: fadeInUp 0.8s ease-out;
	}

	.main-title {
		/* outline */
		color: transparent;
		-webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
	}

	.cta-button {
		cursor: pointer;
		animation: fadeInUp 1.2s ease-out 0.4s backwards;
	}

	.cta-button:hover {
		transform: scale(1.05) translateY(-2px);
	}

	.cta-button:active {
		transform: scale(0.98);
	}

	/* Scroll Indicator Styling */
	.scroll-indicator {
		animation: fadeInUp 1.4s ease-out 0.6s backwards;
	}

	.scroll-text {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		opacity: 0.8;
	}

	/* Devicon Preloader - Hidden but forces font loading */
	.devicon-preloader {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.bounce-animation {
		animation: bounce 2s ease-in-out infinite;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	/* Tagline Styling */
	.tagline {
		animation: fadeInUp 1.1s ease-out 0.3s backwards;
	}

	.tagline-text {
		line-height: 1.4;
	}

	.tagline-subtext {
		animation: fadeInUp 1.3s ease-out 0.5s backwards;
	}

	.highlight {
		font-weight: 600;
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
		display: inline-block;
	}

	.highlight::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, transparent, #ffffff, transparent);
		opacity: 0.5;
		animation: shimmer 3s ease-in-out infinite;
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.3;
			transform: scaleX(0.8);
		}
		50% {
			opacity: 0.6;
			transform: scaleX(1);
		}
	}

	/* Interactive Highlight */
	.interactive-highlight {
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.interactive-highlight:hover {
		transform: scale(1.05);
		filter: brightness(1.2);
	}

	/* Radial Menu (GTA Style) */
	.radial-menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 10000;
		background: rgba(0, 0, 0, 0.4);
	}

	.radial-menu {
		position: fixed;
		transform: translate(-50%, -50%);
		pointer-events: auto;
	}

	.radial-wheel {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 999;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3));
		border: 2px solid rgba(255, 255, 255, 0.4);
		animation: wheelAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}

	.sector-group {
		animation: sectorAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}

	.sector {
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.sector:hover {
		fill: rgba(37, 37, 37, 1);
		stroke: rgba(255, 255, 255, 0.6);
		stroke-width: 2;
	}

	.sector-content {
		pointer-events: none;
	}

	.sector-icon {
		font-weight: bold;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.sector-label {
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
	}

	.devicon-overlay {
		position: absolute;
		pointer-events: none;
		z-index: 99999;
		animation: iconAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	.radial-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60px;
		height: 60px;
		z-index: 10000001;
		background: rgba(37, 37, 37, 0.5);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
		animation: radialPulse 2s ease-in-out infinite;
		z-index: 10;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		cursor: pointer !important;
	}

	.backdrop-circle {
		width: 300px;
		height: 300px;
		border-radius: 50%;
		mix-blend-mode: screen;
		z-index: 9;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer !important;
		transition: transform 0.2s ease;
	}

	.close-btn:hover {
		transform: scale(1.2) rotate(90deg) !important;
	}

	/* Animations */
	@keyframes wheelAppear {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8) rotate(-10deg);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
	}

	@keyframes sectorAppear {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes iconAppear {
		0% {
			opacity: 0;
			transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0);
		}
		100% {
			opacity: 1;
			transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1);
		}
	}

	@keyframes radialPulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
		}
		50% {
			box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
		}
	}

	@keyframes radialItemAppear {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	@keyframes donutAppear {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>
