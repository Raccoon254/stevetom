<script lang="ts">
	import Loader from './components/Loader.svelte'
	import RadialMenu from './components/RadialMenu.svelte'
	import HeroSection from './components/HeroSection.svelte'
	import PhilosophySection from './components/PhilosophySection.svelte'
	import SkillGrid from './components/SkillGrid.svelte'
	import BigName from './components/BigName.svelte'

	let isLoading = true
	let activeMenu: 'design' | 'code' | 'animate' | null = null
	let menuPosition = { x: 0, y: 0 }
	let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
	let cooldowns: Record<'design' | 'code' | 'animate', boolean> = {
		design: false,
		code: false,
		animate: false,
	}

	// Skill icons data for radial menu
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
		if (autoCloseTimer) clearTimeout(autoCloseTimer)
		menuPosition = { x: event.pageX, y: event.pageY }
		activeMenu = skill
		autoCloseTimer = setTimeout(closeMenu, 300000)
	}

	function handleSkillEnter(
		event: CustomEvent<{ event: MouseEvent; skill: 'design' | 'code' | 'animate' }>
	) {
		if (cooldowns[event.detail.skill]) return
		openMenuForSkill(event.detail.event, event.detail.skill)
	}

	function handleSkillClick(
		event: CustomEvent<{ event: MouseEvent; skill: 'design' | 'code' | 'animate' }>
	) {
		cooldowns[event.detail.skill] = false
		openMenuForSkill(event.detail.event, event.detail.skill)
	}

	function closeMenu() {
		if (activeMenu) {
			const skill = activeMenu
			cooldowns[skill] = true
			setTimeout(() => (cooldowns[skill] = false), 4000)
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

<!-- Loader -->
{#if isLoading}
	<Loader />
{/if}

<!-- Devicon Preloader -->
<div class="absolute w-px h-px opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
	{#each Object.values(skillIcons).flat() as tool}
		{#if tool.icon.startsWith('devicon')}
			<i class="{tool.icon} colored"></i>
		{/if}
	{/each}
</div>

<!-- Radial Menu -->
<RadialMenu {activeMenu} {menuPosition} {skillIcons} on:close={closeMenu} />

<!-- Main Content -->
<div class="bg-[#252525]">
	<main class="hero-section mx-auto">
		<!-- Hero Section -->
		<HeroSection
			{skillIcons}
			on:sceneLoaded={handleSceneLoaded}
			on:skillEnter={handleSkillEnter}
			on:skillClick={handleSkillClick}
		/>

		<!-- Philosophy/Cube Section -->
		<PhilosophySection {skillIcons} />

		<!-- Skills Section -->
		<SkillGrid />

		<!-- Big animated name -->
		<BigName />
	</main>
</div>

<style>
	.hero-section {
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
		0% {
			background-position: 10px 39px;
		}
		100% {
			background-position: 0px 0px;
		}
	}
</style>
