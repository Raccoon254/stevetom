<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import PhilosophyScene from './PhilosophyScene.svelte'
	import ToggleSwitch from './ToggleSwitch.svelte'
	import CubeControls from './CubeControls.svelte'
	import BarMenu from './BarMenu.svelte'
	import type { SkillTool } from '../../app.d.ts'

	const dispatch = createEventDispatcher()

	export let skillIcons: { design: SkillTool[]; code: SkillTool[]; animate: SkillTool[] }

	let cubeComponent: PhilosophyScene
	let currentPhrase = 'Think'
	let isManualMode = false
	let isHoveringPhrase = false
	let activeTools: { name: string; icon: string; color: string }[] = []
	let hoverTimeout: ReturnType<typeof setTimeout>

	// Map phrases to skill categories
	$: {
		const phrase = currentPhrase.toLowerCase()
		if (phrase === 'think' || phrase === 'dream') {
			activeTools = skillIcons?.design || []
		} else if (phrase === 'make' || phrase === 'build') {
			activeTools = skillIcons?.code || []
		} else if (phrase === 'solve' || phrase === 'create') {
			activeTools = skillIcons?.animate || []
		}
	}

	function handleFaceChange(event: CustomEvent<{ face: number; phrase: string }>) {
		currentPhrase = event.detail.phrase
	}

	function handleToggleChange() {
		cubeComponent?.setManualMode(isManualMode)
	}

	function handleMouseEnter() {
		clearTimeout(hoverTimeout)
		isHoveringPhrase = true
	}

	function handleMouseLeave() {
		hoverTimeout = setTimeout(() => {
			isHoveringPhrase = false
		}, 300) // 300ms delay to allow bridging the gap
	}
</script>

<section
	id="philosophy-section"
	class="min-h-screen lg:min-h-[70vh] relative md:border-b-[50px] border-white overflow-hidden flex flex-col lg:block"
>
	<!-- Triangle decoration (Desktop only) -->
	<div
		class="hidden lg:block absolute rotate-[65deg] -top-36 right-[calc(35%-80px)]"
		style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
	></div>

	<!-- Desktop Left Background (Hidden on mobile) -->
	<div class="hidden lg:block w-[65%] h-full z-0 top-0 left-0 absolute bg-white"></div>

	<!-- Main content wrapper -->
	<div
		class="relative z-10 w-full h-full flex flex-col lg:flex-row h-screen lg:h-auto lg:min-h-[70vh]"
	>
		<!-- Top Half - Text content (White BG on mobile) -->
		<div
			class="w-full h-[55vh] lg:h-auto lg:w-[65%] bg-white lg:bg-transparent flex flex-col items-center justify-center py-8 lg:py-20 px-8 relative z-20"
		>
			<div class="max-w-xl text-center relative">
				<!-- Dynamic phrase display -->
				<div
					class="min-h-[100px] lg:min-h-[120px] flex items-center justify-center perspective-[1000px] mb-4 lg:mb-8 relative z-20 cursor-pointer"
					on:mouseenter={handleMouseEnter}
					on:mouseleave={handleMouseLeave}
					role="button"
					tabindex="0"
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') handleMouseEnter()
					}}
				>
					{#key currentPhrase}
						<span class="current-phrase relative">
							{currentPhrase}<span class="opacity-40">.</span>
						</span>
					{/key}

					<!-- Bar Menu shows on hover -->
					<BarMenu
						items={activeTools}
						visible={isHoveringPhrase}
						on:menuenter={handleMouseEnter}
						on:menuleave={handleMouseLeave}
					/>
				</div>

				<!-- Toggle switch -->
				<div class="flex flex-col items-center gap-4 mt-4">
					<ToggleSwitch
						bind:checked={isManualMode}
						leftLabel="Auto"
						rightLabel="Manual"
						on:change={handleToggleChange}
					/>
				</div>
			</div>
			<!-- Tagline -->
			<p
				class="text-[#252525]/60 lg:absolute lg:bottom-10 text-sm sm:text-base mt-8 lg:mt-10 font-thin tracking-wider uppercase text-center"
			>
				From concept to code, with care
			</p>
		</div>

		<!-- Bottom Half - 3D Cube (Dark BG) -->
		<section
			class="w-full h-[45vh] lg:h-full lg:w-[35%] lg:absolute lg:right-0 flex items-center justify-center relative z-10"
		>
			<div class="h-full z-0 relative w-full flex items-center justify-center">
				<!-- Controls overlay -->
				<div class="cube-controls absolute w-full h-full inset-0 pointer-events-none z-20">
					{#if isManualMode}
						<div class="pointer-events-auto w-full h-full">
							<CubeControls
								onRotateUp={() => cubeComponent?.rotateUp()}
								onRotateDown={() => cubeComponent?.rotateDown()}
								onRotateLeft={() => cubeComponent?.rotateLeft()}
								onRotateRight={() => cubeComponent?.rotateRight()}
								onRandomFace={() => cubeComponent?.randomFace()}
							/>
						</div>
					{/if}
				</div>

				<!-- 3D Cube -->
				<div class="w-full h-full absolute inset-0">
					<PhilosophyScene bind:this={cubeComponent} on:faceChange={handleFaceChange} />
				</div>
			</div>
		</section>
	</div>
</section>

<style>
	.current-phrase {
		font-size: clamp(4rem, 12vw, 8rem);
		font-weight: 900;
		color: transparent;
		-webkit-text-stroke: 2px #252525;
		display: inline-block;
		animation: phraseChange 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes phraseChange {
		0% {
			opacity: 0;
			transform: scale(0.8) rotateX(-30deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotateX(0deg);
		}
	}

	@media (max-width: 768px) {
		.current-phrase {
			font-size: clamp(2.5rem, 14vw, 5rem);
			-webkit-text-stroke: 1.5px #252525;
		}
	}
</style>
