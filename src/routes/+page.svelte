<script lang="ts">
	import Loader from './components/Loader.svelte'
	import RadialMenu from './components/RadialMenu.svelte'
	import HeroSection from './components/HeroSection.svelte'
	import PhilosophySection from './components/PhilosophySection.svelte'
	import SkillGrid from './components/SkillGrid.svelte'
	import BigName from './components/BigName.svelte'
	import ProjectsSection from './components/ProjectsSection.svelte'
	import StartProjectSection from './components/StartProjectSection.svelte'
	import SupportSection from './components/SupportSection.svelte'
	import DonationSection from './components/DonationSection.svelte'
	import PaymentAssist from './components/PaymentAssist.svelte'
	import ImageShapeSection from './components/ImageShapeSection.svelte'

	let isLoading = true
	let activeMenu: 'design' | 'code' | 'animate' | null = null
	let menuPosition = { x: 0, y: 0 }
	let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
	let cooldowns: Record<'design' | 'code' | 'animate', boolean> = {
		design: false,
		code: false,
		animate: false,
	}

	type SkillTool = { name: string; icon: string; color: string }

	// Skill icons data for radial menu
	const skillIcons: {
		design: SkillTool[]
		code: SkillTool[]
		animate: SkillTool[]
	} = {
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

	function isDevicon(tool: SkillTool) {
		return tool.icon.startsWith('devicon')
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
	/>

	<!-- Primary Meta Tags -->
	<title>KenTom | Engineering Creative Solutions</title>
	<meta name="title" content="KenTom | Engineering Creative Solutions" />
	<meta
		name="description"
		content="Creative problem-solver and full-stack developer with 5+ years building apps that matter. From Status Saver to custom web solutions - I turn your vision into working code."
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://stevetom.vercel.app/" />
	<meta property="og:title" content="KenTom | Engineering Creative Solutions" />
	<meta
		property="og:description"
		content="Creative problem-solver and full-stack developer with 5+ years building apps that matter. From Status Saver to custom web solutions - I turn your vision into working code."
	/>
	<meta property="og:image" content="https://stevetom.vercel.app/kentom_website_banner.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://stevetom.vercel.app/" />
	<meta name="twitter:title" content="KenTom | Engineering Creative Solutions" />
	<meta
		name="twitter:description"
		content="Creative problem-solver and full-stack developer with 5+ years building apps that matter. From Status Saver to custom web solutions - I turn your vision into working code."
	/>
	<meta name="twitter:image" content="https://stevetom.vercel.app/kentom_website_banner.jpg" />
</svelte:head>

<!-- Loader -->
{#if isLoading}
	<Loader />
{/if}

<!-- Devicon Preloader -->
<div class="absolute w-px h-px opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
	{#each Object.values(skillIcons).flat() as tool}
		{#if isDevicon(tool)}
			<i class="{tool.icon} colored"></i>
		{/if}
	{/each}
</div>

<!-- Radial Menu -->
<RadialMenu {activeMenu} {menuPosition} {skillIcons} on:close={closeMenu} />

<!-- Main Content -->
<div class="bg-transparent">
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

		<!-- Support Section -->
		<SupportSection />

		<!-- Image Shape Section -->
		<ImageShapeSection />

		<!-- Projects Section -->
		<ProjectsSection />

		<!-- Start Project Section -->
		<StartProjectSection />

		<!--		&lt;!&ndash; Donation Section &ndash;&gt;-->
		<!--		<DonationSection />-->

		<!--		&lt;!&ndash; Payment Assist Section &ndash;&gt;-->
		<!--		<PaymentAssist />-->
	</main>
</div>
