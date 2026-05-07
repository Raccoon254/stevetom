<script lang="ts">
	import { MessageSquare, UnfoldVertical } from 'lucide-svelte'
	import { createEventDispatcher } from 'svelte'
	import Scene from './Scene.svelte'
	import Counter from './Counter.svelte'
	import type { SkillTool } from '../../app.d.ts'

	const dispatch = createEventDispatcher()

	function handleSceneLoaded() {
		dispatch('sceneLoaded')
	}

	function handleSkillEnter(event: MouseEvent, skill: 'design' | 'code' | 'animate') {
		dispatch('skillEnter', { event, skill })
	}

	function handleSkillClick(
		event: MouseEvent | KeyboardEvent,
		skill: 'design' | 'code' | 'animate'
	) {
		dispatch('skillClick', { event, skill })
	}

	export let skillIcons: { design: SkillTool[]; code: SkillTool[]; animate: SkillTool[] }
</script>

<section
	class="screen min-h-screen overflow-y-hidden bg-transparent flex flex-col relative items-center justify-start overflow-x-hidden"
>
	<!-- Right panel background (Hidden on mobile) -->
	<div
		class="hidden lg:flex lg:w-[35%] h-full overflow-hidden items-center justify-center z-0 top-0 right-0 absolute bg-white"
	>
		<Counter />
	</div>

	<!-- 3D Scene container (Full width on mobile, shifted on desktop) -->
	<div
		class="w-full lg:ml-[15%] z-10 h-screen absolute top-0 left-0 pointer-events-none lg:pointer-events-auto opacity-20 lg:opacity-100 transition-opacity duration-300"
	>
		<Scene on:loaded={handleSceneLoaded} />
	</div>

	<!-- Text content -->
	<div class="w-full z-20 flex items-center h-screen p-6 sm:p-12 md:p-24 pointer-events-none">
		<div class="text-start pointer-events-auto">
			<!-- Intro -->
			<div
				class="text-white mb-2 sm:mb-4 text-sm sm:text-lg md:text-xl font-light tracking-widest uppercase opacity-90 animate-fade-in"
			>
				I am
			</div>

			<!-- Name -->
			<h1
				class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.8)]"
			>
				kenTom
			</h1>

			<!-- Tagline -->
			<div class="text-white mb-6 max-w-2xl animate-fade-in-delay">
				<p class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed">
					I
					<span
						class="highlight-word cursor-pointer transition-all duration-300 hover:scale-105 hover:brightness-125"
						on:mouseenter={(e) => handleSkillEnter(e, 'design')}
						on:click={(e) => handleSkillClick(e, 'design')}
						on:keydown={(e) => e.key === 'Enter' && handleSkillClick(e, 'design')}
						role="button"
						tabindex="0"
					>
						design
					</span>
					experiences,
					<span
						class="highlight-word cursor-pointer transition-all duration-300 hover:scale-105 hover:brightness-125"
						on:mouseenter={(e) => handleSkillEnter(e, 'code')}
						on:click={(e) => handleSkillClick(e, 'code')}
						on:keydown={(e) => e.key === 'Enter' && handleSkillClick(e, 'code')}
						role="button"
						tabindex="0"
					>
						code
					</span>
					solutions, and
					<span
						class="highlight-word cursor-pointer transition-all duration-300 hover:scale-105 hover:brightness-125"
						on:mouseenter={(e) => handleSkillEnter(e, 'animate')}
						on:click={(e) => handleSkillClick(e, 'animate')}
						on:keydown={(e) => e.key === 'Enter' && handleSkillClick(e, 'animate')}
						role="button"
						tabindex="0"
					>
						animate
					</span>
					ideas into reality.
				</p>
				<p class="text-base sm:text-lg md:text-xl lg:text-2xl font-light mt-4 opacity-80">
					Responsive. Interactive. Beautiful. Everywhere.
				</p>
			</div>

			<!-- CTA Button -->
			<a
				href="/contact"
				class="bg-[#252525]/80 border border-white ring-1 ring-white ring-offset-2 ring-offset-[#252525] text-black pr-4 sm:pr-6 p-1.5 sm:p-2 rounded-full mt-6 inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
			>
				<span
					class="mr-2 bg-white/20 p-3 sm:p-4 ring-1 ring-white text-white rounded-full flex items-center justify-center"
					style="background-image: repeating-linear-gradient(
					-45deg,
					#252525,
					#252525 2px,
					#3a3a3a 2px,
					#3a3a3a 4px
				);"
				>
					<MessageSquare class="w-5 h-5 sm:w-6 sm:h-6" />
				</span>
				<span class="mr-1 text-white text-xl sm:text-3xl font-semibold"> Hey </span>
				<span class="mr-2 text-white text-xl sm:text-3xl font-semibold animate-wiggle"> 👋 </span>
			</a>
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-5 left-5 px-6 sm:px-12 md:px-24 animate-fade-in-late">
		<div
			class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white z-50 flex items-center justify-center mb-3 animate-bounce shadow-lg hover:shadow-xl transition-shadow duration-300"
		>
			<UnfoldVertical class="text-[#252525] w-5 h-5 sm:w-6 sm:h-6" />
		</div>
		<p
			class="text-white font-medium tracking-wide text-xs sm:text-sm uppercase tracking-widest opacity-80"
		>
			Scroll Down
		</p>
	</div>

	<!-- Triangle decoration (Desktop only) -->
	<div
		class="hidden lg:block absolute rotate-[65deg] -bottom-36 right-[calc(35%-10px)]"
		style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-left: 80px solid white;"
	></div>
</section>

<style>
	.highlight-word {
		font-weight: 600;
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
		display: inline-block;
	}

	.highlight-word::after {
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

	.animate-fade-in {
		animation: fadeInUp 0.8s ease-out;
	}

	.animate-fade-in-delay {
		animation: fadeInUp 1.1s ease-out 0.3s backwards;
	}

	.animate-fade-in-late {
		animation: fadeInUp 1.4s ease-out 0.6s backwards;
	}

	.animate-wiggle {
		animation: wiggle 2s ease-in-out infinite;
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

	@keyframes wiggle {
		0%,
		100% {
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
	}
</style>
