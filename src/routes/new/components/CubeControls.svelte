<script lang="ts">
	import {
		Rotate3D,
		ArrowUpFromLine,
		ArrowLeftFromLine,
		ArrowRightFromLine,
		ArrowDownFromLine,
	} from 'lucide-svelte'

	export let onRotateUp: () => void
	export let onRotateDown: () => void
	export let onRotateLeft: () => void
	export let onRotateRight: () => void
	export let onRandomFace: () => void
</script>

<div
	class="manual-controls flex relative flex-col items-center gap-4 justify-center w-full aspect-square animate-controls-reveal"
>
	<!-- Random/Shuffle button (center) -->
	<button
		class="control-btn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
		on:click={onRandomFace}
		aria-label="Random face"
	>
		<Rotate3D size={20} />
	</button>

	<!-- Up -->
	<button
		class="control-btn absolute top-10 left-1/2 -translate-x-1/2"
		on:click={onRotateUp}
		aria-label="Rotate up"
	>
		<ArrowUpFromLine size={24} />
	</button>

	<!-- Left -->
	<button
		class="control-btn absolute top-1/2 left-10 -translate-y-1/2"
		on:click={onRotateLeft}
		aria-label="Rotate left"
	>
		<ArrowLeftFromLine size={24} />
	</button>

	<!-- Right -->
	<button
		class="control-btn absolute top-1/2 right-10 -translate-y-1/2"
		on:click={onRotateRight}
		aria-label="Rotate right"
	>
		<ArrowRightFromLine size={24} />
	</button>

	<!-- Down -->
	<button
		class="control-btn absolute bottom-10 left-1/2 -translate-x-1/2"
		on:click={onRotateDown}
		aria-label="Rotate down"
	>
		<ArrowDownFromLine size={24} />
	</button>
</div>

<style>
	.control-btn {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		background-image: repeating-linear-gradient(
			-25deg,
			transparent,
			transparent 2px,
			rgba(255, 255, 255, 0.15) 2px,
			rgba(255, 255, 255, 0.15) 4px
		);
		background-position: 100%;
		background-size: 200% 200%;
		transition: all 0.3s ease;
		cursor: pointer;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.control-btn:hover {
		background-position: 0;
		transform: scale(1.1);
	}

	.control-btn:active {
		transform: scale(0.95);
	}

	.animate-controls-reveal {
		animation: controlsReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes controlsReveal {
		0% {
			opacity: 0;
			transform: scale(0.95);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
