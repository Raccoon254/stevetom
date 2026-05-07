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

<div class="manual-controls absolute inset-0 w-full h-full animate-controls-reveal">
	<!-- Random/Shuffle button (center) -->
	<button
		class="control-btn center absolute top-1/2 left-1/2"
		on:click={onRandomFace}
		aria-label="Random face"
	>
		<Rotate3D size={20} />
	</button>

	<!-- Up -->
	<button
		class="control-btn top absolute top-4 sm:top-10 left-1/2"
		on:click={onRotateUp}
		aria-label="Rotate up"
	>
		<ArrowUpFromLine size={24} />
	</button>

	<!-- Left -->
	<button
		class="control-btn left absolute top-1/2 left-4 sm:left-10"
		on:click={onRotateLeft}
		aria-label="Rotate left"
	>
		<ArrowLeftFromLine size={24} />
	</button>

	<!-- Right -->
	<button
		class="control-btn right absolute top-1/2 right-4 sm:right-10"
		on:click={onRotateRight}
		aria-label="Rotate right"
	>
		<ArrowRightFromLine size={24} />
	</button>

	<!-- Down -->
	<button
		class="control-btn bottom absolute bottom-4 sm:bottom-10 left-1/2"
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
			-45deg,
			rgba(255, 255, 255, 0.1),
			rgba(255, 255, 255, 0.1) 2px,
			rgba(255, 255, 255, 0.2) 2px,
			rgba(255, 255, 255, 0.2) 4px
		);
		background-size: 200% 200%;
		transition:
			background-position 0.3s ease,
			transform 0.3s ease;
		cursor: pointer;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 30;
	}

	/* Base Translations */
	.control-btn.center {
		transform: translate(-50%, -50%) scale(1);
	}
	.control-btn.top,
	.control-btn.bottom {
		transform: translateX(-50%) scale(1);
	}
	.control-btn.left,
	.control-btn.right {
		transform: translateY(-50%) scale(1);
	}

	/* Hover States - Maintaining Translations */
	.control-btn.center:hover {
		background-position: 0;
		transform: translate(-50%, -50%) scale(1.3);
	}
	.control-btn.top:hover,
	.control-btn.bottom:hover {
		background-position: 0;
		transform: translateX(-50%) scale(1.3);
	}
	.control-btn.left:hover,
	.control-btn.right:hover {
		background-position: 0;
		transform: translateY(-50%) scale(1.3);
	}

	.control-btn:active {
		opacity: 0.8;
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
