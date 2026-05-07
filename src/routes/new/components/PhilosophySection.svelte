<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import PhilosophyScene from './PhilosophyScene.svelte'
	import ToggleSwitch from './ToggleSwitch.svelte'
	import CubeControls from './CubeControls.svelte'

	const dispatch = createEventDispatcher()

	let cubeComponent: PhilosophyScene
	let currentPhrase = 'Think'
	let isManualMode = false

	function handleFaceChange(event: CustomEvent<{ face: number; phrase: string }>) {
		currentPhrase = event.detail.phrase
	}

	function handleToggleChange() {
		cubeComponent?.setManualMode(isManualMode)
	}
</script>

<section
	id="philosophy-section"
	class="min-h-[70vh] relative border-b-[50px] mb-20 border-white overflow-hidden"
>
	<!-- Triangle decoration -->
	<div
		class="absolute rotate-[65deg] -top-36 right-[calc(35%-80px)]"
		style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
	></div>

	<!-- Left side background -->
	<div class="w-[65%] h-full z-0 top-0 left-0 absolute bg-white"></div>

	<!-- Main content wrapper -->
	<div class="relative z-10 h-full flex min-h-[70vh]">
		<!-- Left side - Text content (65%) -->
		<div class="w-[65%] flex flex-col items-center justify-center py-20 px-8">
			<div class="max-w-xl text-center">
				<!-- Dynamic phrase display -->
				<div class="min-h-[120px] flex items-center justify-center perspective-[1000px] mb-8">
					{#key currentPhrase}
						<span class="current-phrase">
							{currentPhrase}<span class="opacity-40">.</span>
						</span>
					{/key}
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

				<!-- Tagline -->
				<p class="text-[#252525]/60 text-sm sm:text-base mt-10 font-light tracking-wider uppercase">
					From concept to code, with care
				</p>
			</div>
		</div>

		<!-- Right side - 3D Cube (35%) -->
		<section class="w-[35%] h-full z-0 absolute right-0 flex items-center justify-center">
			<div class="h-full z-0 relative w-full flex items-center justify-center">
				<!-- Controls overlay -->
				<div
					class="cube-controls absolute w-full h-full inset-0 flex flex-col items-center justify-center gap-4"
				>
					{#if isManualMode}
						<CubeControls
							onRotateUp={() => cubeComponent?.rotateUp()}
							onRotateDown={() => cubeComponent?.rotateDown()}
							onRotateLeft={() => cubeComponent?.rotateLeft()}
							onRotateRight={() => cubeComponent?.rotateRight()}
							onRandomFace={() => cubeComponent?.randomFace()}
						/>
					{/if}
				</div>

				<!-- 3D Cube -->
				<div class="w-full h-full min-h-[400px]">
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
