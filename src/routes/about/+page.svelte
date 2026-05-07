<script lang="ts">
	import Cursor from '../components/Cursor.svelte'
	import { ArrowRight, Code, Heart, Zap, Coffee, Globe, Terminal } from 'lucide-svelte'
</script>

<svelte:head>
	<title>About | Steve Tom - Full-Stack Developer</title>
	<meta
		name="description"
		content="Learn more about Steve Tom, a full-stack developer passionate about creating premium digital experiences."
	/>
</svelte:head>

<Cursor />

<div class="bg-[#252525] min-h-screen relative overflow-x-hidden text-white">
	<!-- Background decoration -->
	<div
		class="hidden lg:block absolute rotate-[65deg] top-20 -left-20 opacity-10 pointer-events-none"
		style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
	></div>

	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative z-10">
		<!-- Hero Section -->
		<section class="mb-32 flex flex-col md:flex-row items-center gap-12">
			<div class="w-full md:w-1/2">
				<h1 class="text-5xl md:text-7xl font-bold mb-6">
					More Than <br />
					<span class="text-transparent stroke-text">Just Code.</span>
				</h1>
				<p class="text-xl text-white/70 font-light leading-relaxed mb-8">
					I'm Steve, a developer who believes that <span class="text-[#ffee01]">great software</span
					> is where engineering meets art. I build digital experiences that are not only functional
					but also intuitive and beautiful.
				</p>
				<div class="flex gap-4">
					<a href="/contact" class="nav-btn-primary">
						Let's Talk <ArrowRight size="20" class="ml-2" />
					</a>
					<a href="/new" class="nav-btn-secondary"> View Work </a>
				</div>
			</div>
			<div class="w-full md:w-1/2 relative">
				<div
					class="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm relative p-8 flex items-center justify-center"
				>
					<!-- Geometric Abstract Art -->
					<div class="absolute inset-0 bg-gradient-to-br from-[#ffee01]/20 to-transparent"></div>
					<div class="relative z-10 grid grid-cols-2 gap-4 animate-pulse-slow">
						<div class="w-24 h-24 border-2 border-[#ffee01] rounded-full"></div>
						<div class="w-24 h-24 bg-[#ffee01] rounded-lg transform rotate-12"></div>
						<div
							class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-lg transform -rotate-6"
						></div>
						<div class="w-24 h-24 border-2 border-white rounded-full"></div>
					</div>
				</div>
			</div>
		</section>

		<!-- Philosophy / Values -->
		<section class="mb-32">
			<h2 class="text-3xl font-bold mb-12 flex items-center">
				<span class="w-12 h-1 bg-[#ffee01] mr-4"></span>
				My Philosophy
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="value-card group">
					<div class="icon-wrapper">
						<Zap size="32" />
					</div>
					<h3>Performance First</h3>
					<p>
						Speed isn't a feature, it's a requirement. I optimize every line of code to ensure
						instant load times and smooth interactions.
					</p>
				</div>

				<div class="value-card group">
					<div class="icon-wrapper">
						<Heart size="32" />
					</div>
					<h3>User Centric</h3>
					<p>
						I design with empathy. Understanding the user's journey is crucial to creating
						interfaces that feel natural and intuitive.
					</p>
				</div>

				<div class="value-card group">
					<div class="icon-wrapper">
						<Code size="32" />
					</div>
					<h3>Clean Code</h3>
					<p>
						Maintainable, scalable, and readable code. I write software that future developers (and
						future me) will thank me for.
					</p>
				</div>
			</div>
		</section>

		<!-- Journey / Timeline -->
		<section class="max-w-4xl mx-auto mb-20">
			<h2 class="text-3xl font-bold mb-12 text-center">My Journey</h2>

			<div class="relative border-l border-white/20 ml-4 md:ml-0 pl-8 md:pl-0 space-y-12">
				<!-- Item 1 -->
				<div class="timeline-item">
					<div class="md:w-1/2 md:text-right md:pr-12">
						<span class="text-[#ffee01] font-bold text-sm tracking-widest uppercase mb-2 block"
							>2023 - Present</span
						>
						<h3 class="text-2xl font-bold mb-2">Senior Full-Stack Developer</h3>
						<p class="text-white/60">
							Leading development teams and architecting complex web solutions for enterprise
							clients.
						</p>
					</div>
					<div class="timeline-dot">
						<Globe size="20" />
					</div>
					<div class="hidden md:block md:w-1/2"></div>
				</div>

				<!-- Item 2 -->
				<div class="timeline-item">
					<div class="hidden md:block md:w-1/2"></div>
					<div class="timeline-dot">
						<Terminal size="20" />
					</div>
					<div class="md:w-1/2 md:pl-12">
						<span class="text-[#ffee01] font-bold text-sm tracking-widest uppercase mb-2 block"
							>2021 - 2023</span
						>
						<h3 class="text-2xl font-bold mb-2">Backend Developer</h3>
						<p class="text-white/60">
							Focused on scalable API design, database optimization, and cloud infrastructure.
						</p>
					</div>
				</div>

				<!-- Item 3 -->
				<div class="timeline-item">
					<div class="md:w-1/2 md:text-right md:pr-12">
						<span class="text-[#ffee01] font-bold text-sm tracking-widest uppercase mb-2 block"
							>2018 - 2021</span
						>
						<h3 class="text-2xl font-bold mb-2">Frontend Developer</h3>
						<p class="text-white/60">
							Crafting responsive, interactive user interfaces and mastering modern frontend
							frameworks.
						</p>
					</div>
					<div class="timeline-dot">
						<Coffee size="20" />
					</div>
					<div class="hidden md:block md:w-1/2"></div>
				</div>
			</div>
		</section>
	</main>
</div>

<style>
	/* Text styles */
	.stroke-text {
		-webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
	}

	/* Buttons */
	.nav-btn-primary {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		background: #ffee01;
		color: black;
		font-weight: 700;
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.nav-btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px -5px rgba(255, 238, 1, 0.3);
	}

	.nav-btn-secondary {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		font-weight: 600;
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.nav-btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: white;
	}

	/* Value Cards */
	.value-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		transition: all 0.3s ease;
	}

	.value-card:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-5px);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.icon-wrapper {
		width: 60px;
		height: 60px;
		background: rgba(255, 238, 1, 0.1);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffee01;
		margin-bottom: 1.5rem;
		transition: all 0.3s ease;
	}

	.group:hover .icon-wrapper {
		background: #ffee01;
		color: black;
		transform: rotate(-5deg);
	}

	.value-card h3 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.value-card p {
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.6;
	}

	/* Timeline */
	.timeline-item {
		display: flex;
		align-items: flex-start;
		position: relative;
	}

	.timeline-dot {
		position: absolute;
		left: -48px;
		top: 0;
		width: 32px;
		height: 32px;
		background: #252525;
		border: 2px solid #ffee01;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffee01;
		z-index: 10;
	}

	@media (min-width: 768px) {
		.timeline-dot {
			left: 50%;
			transform: translateX(-50%);
		}
	}

	.animate-pulse-slow {
		animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
