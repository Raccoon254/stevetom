<script lang="ts">
	import { MessageSquare, UnfoldVertical } from 'lucide-svelte'
	import Scene from './Scene.svelte'

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
			{ name: 'GSAP', icon: '🎬', color: '#88CE02' },
			{ name: 'Framer', icon: '🎨', color: '#0055FF' },
		],
	}

	function handleSkillEnter(event: MouseEvent, skill: 'design' | 'code' | 'animate') {
		// Check if skill is on cooldown
		if (cooldowns[skill]) {
			return
		}

		// Clear any existing timer
		if (autoCloseTimer) {
			clearTimeout(autoCloseTimer)
		}

		// Set menu position to mouse position
		menuPosition = { x: event.clientX, y: event.clientY }
		activeMenu = skill

		// Start 10-second auto-close timer
		autoCloseTimer = setTimeout(() => {
			closeMenu()
		}, 10000)
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

<!-- Premium Loader -->
{#if isLoading}
	<div class="loader-overlay">
		<div class="loader-container">
			<div class="loader-spinner"></div>
			<p class="loader-text">Loading 3D Scene...</p>
		</div>
	</div>
{/if}

<!-- Radial Menu (GTA Style) -->
{#if activeMenu}
	<div class="radial-menu-overlay" on:click={closeMenu} role="button" tabindex="-1">
		<div class="radial-menu" style="left: {menuPosition.x}px; top: {menuPosition.y}px;">
			<!-- Center circle with close button -->
			<div class="radial-center">
				<button class="close-btn" on:click={closeMenu}>✕</button>
			</div>

			<!-- Icons arranged in circle -->
			{#each skillIcons[activeMenu] as tool, index}
				{@const angle = (index / skillIcons[activeMenu].length) * 360}
				{@const radius = 120}
				{@const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius}
				{@const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius}
				<div
					class="radial-item"
					style="
						transform: translate(-50%, -50%) translate({x}px, {y}px);
						animation-delay: {index * 0.05}s;
					"
				>
					<div class="icon-container" style="border-color: {tool.color};">
						{#if tool.icon.startsWith('devicon')}
							<i class="{tool.icon} colored" style="font-size: 2rem;"></i>
						{:else}
							<span style="font-size: 2rem;">{tool.icon}</span>
						{/if}
					</div>
					<span class="tool-name">{tool.name}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

<main style="background-color: #252525">
	<section
		class="hero-section min-h-screen flex flex-col relative items-center justify-start overflow-x-hidden"
	>
		<!-- Rectangle with 25% bg-blue-500width -->
		<div class="w-[35%] h-screen z-0 top-0 right-0 absolute bg-blue-50"></div>

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
							role="button"
							tabindex="0"
						>
							design
						</span>
						experiences,
						<span
							class="highlight interactive-highlight"
							on:mouseenter={(e) => handleSkillEnter(e, 'code')}
							role="button"
							tabindex="0"
						>
							code
						</span>
						solutions, and
						<span
							class="highlight interactive-highlight"
							on:mouseenter={(e) => handleSkillEnter(e, 'animate')}
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
	</section>
	<section class="h-screen bg-white"></section>
</main>

<style>
	.loader-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(37, 37, 37, 0.95);
		backdrop-filter: blur(10px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.loader-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 3rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.loader-spinner {
		width: 80px;
		height: 80px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top: 4px solid #ffffff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		position: relative;
	}

	.loader-spinner::before {
		content: '';
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border-radius: 50%;
		border: 4px solid transparent;
		border-top-color: rgba(255, 255, 255, 0.3);
		animation: spin 2s linear infinite reverse;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loader-text {
		color: #ffffff;
		font-size: 1.125rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

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
		cursor: crosshair;
	}

	.radial-menu {
		position: fixed;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.radial-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60px;
		height: 60px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
		animation: radialPulse 2s ease-in-out infinite;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.close-btn:hover {
		transform: scale(1.2) rotate(90deg);
	}

	.radial-item {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		pointer-events: auto;
		animation: radialItemAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}

	.icon-container {
		width: 70px;
		height: 70px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 3px solid;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	.icon-container:hover {
		transform: scale(1.2);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
	}

	.tool-name {
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		text-align: center;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(10px);
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.radial-item:hover .tool-name {
		opacity: 1;
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
</style>
