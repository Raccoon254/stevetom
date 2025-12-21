<script lang="ts">
	import { onMount } from 'svelte'

	const letters = 'KENTOM'.split('')
	let visible = false

	onMount(() => {
		// Stagger the animation start
		setTimeout(() => {
			visible = true
		}, 100)
	})
</script>

<section class="name-section border-y border-gray-200/10">
	<div class="name-container">
		<h1 class="name-display">
			{#each letters as letter, i}
				<span
					class="letter {i < 3 ? 'web' : 'design'}"
					class:visible
					style="--delay: {i * 0.1}s; --color: {i < 3 ? '#252525' : '#ffee01'};"
				>
					{letter}
				</span>
			{/each}
		</h1>
		<p class="tagline" class:visible>Full-Stack Developer & Designer</p>
	</div>

	<!-- Decorative elements -->
	<div class="decoration left"></div>
	<div class="decoration right"></div>
</section>

<style>
	.name-section {
		min-height: 80vh;
		background: rgba(37, 37, 37, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		padding: 4rem 2rem;
	}

	.name-container {
		text-align: center;
		z-index: 1;
	}

	.letter.web {
		-webkit-text-stroke: 1px rgb(255, 255, 255)	
  }

	.name-display {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.letter {
		font-size: clamp(4rem, 15vw, 12rem);
		font-weight: 900;
		color: var(--color);
		opacity: 0;
		transform: translateY(100px) rotateX(-90deg);
		transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
		transition-delay: var(--delay);
		display: inline-block;
	}

	.letter.visible {
		opacity: 1;
		transform: translateY(0) rotateX(0);
	}

	.letter:hover {
		transform: translateY(-10px) scale(1.1);
		text-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
	}

	.tagline {
		font-size: clamp(1rem, 2.5vw, 1.5rem);
		color: rgba(255, 255, 255, 0.6);
		letter-spacing: 0.3em;
		text-transform: uppercase;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease 0.8s;
	}

	.tagline.visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Decorative lines */
	.decoration {
		position: absolute;
		width: 200px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	}

	.decoration.left {
		top: 50%;
		left: 0;
		transform: translateY(-50%);
	}

	.decoration.right {
		top: 50%;
		right: 0;
		transform: translateY(-50%);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.name-display {
			gap: 0.2rem;
		}

		.tagline {
			letter-spacing: 0.15em;
		}
	}
</style>
