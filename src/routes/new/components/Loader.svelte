<script lang="ts">
	import { onMount } from 'svelte'

	let currentFact = ''
	let factIndex = 0

	const facts = [
		'The first computer bug was an actual moth found in a computer in 1947.',
		'The average person blinks 15-20 times per minute.',
		'Honey never spoils. Archaeologists have found 3000-year-old honey that is still edible.',
		'A day on Venus is longer than a year on Venus.',
		'Bananas are berries, but strawberries are not.',
		'The shortest war in history lasted 38 minutes.',
		'Octopuses have three hearts and blue blood.',
		'The Eiffel Tower can grow up to 6 inches in summer due to thermal expansion.',
		"Your brain uses 20% of your body's energy but only makes up 2% of your weight.",
		'The first webcam was created to monitor a coffee pot at Cambridge University.',
		'JavaScript was created in just 10 days by Brendan Eich in 1995.',
		'The first computer programmer was Ada Lovelace in the 1840s.',
		"More than 90% of the world's currency exists only on computers.",
		'The first domain name ever registered was Symbolics.com in 1985.',
		'A group of flamingos is called a "flamboyance".',
		'Sharks have been around longer than trees.',
		'The human nose can detect over 1 trillion different scents.',
		'There are more possible iterations of a chess game than atoms in the universe.',
		'The first computer mouse was made of wood.',
		'Cleopatra lived closer to the moon landing than to the building of the pyramids.',
		'A single Google search uses more computing power than the entire Apollo 11 mission.',
		'The word "robot" comes from the Czech word "robota" meaning forced labor.',
		'Your smartphone has more computing power than NASA had in 1969.',
		'The @ symbol is called an "at sign" in English but has different names in other languages.',
		'The first email was sent in 1971 by Ray Tomlinson to himself.',
		"There are more stars in the universe than grains of sand on all Earth's beaches.",
		'A bolt of lightning is five times hotter than the surface of the sun.',
		"The world's oldest known living tree is over 5,000 years old.",
		'Polar bears have black skin under their white fur.',
		'The unicorn is the national animal of Scotland.',
		'A cloud can weigh more than a million pounds.',
		'The first video game was created in 1958 and was called "Tennis for Two".',
		'The inventor of the World Wide Web, Tim Berners-Lee, was knighted by Queen Elizabeth II.',
		'The first computer virus was created in 1983 and was called "Elk Cloner".',
		'The average person walks the equivalent of three times around the world in a lifetime.',
		'Butterflies taste with their feet.',
		'The shortest complete sentence in English is "I am."',
		'A jiffy is an actual unit of time: 1/100th of a second.',
		'The dot over the letter "i" is called a tittle.',
		'The first alarm clock could only ring at 4 AM.',
		'The inventor of the frisbee was turned into a frisbee after he died.',
		'The longest English word without a vowel is "rhythms".',
		'A group of owls is called a parliament.',
		'The first computer weighed more than 27 tons.',
		'Your fingernails grow faster than your toenails.',
		'The human body contains enough carbon to make 900 pencils.',
		'A sneeze travels at about 100 miles per hour.',
		'The average person spends 6 months of their lifetime waiting for red lights to turn green.',
		'There are more possible ways to arrange a deck of cards than atoms on Earth.',
		'The first YouTube video was uploaded on April 23, 2005, titled "Me at the zoo".',
	]

	onMount(() => {
		factIndex = Math.floor(Math.random() * facts.length)
		currentFact = facts[factIndex]
	})
</script>

<div class="loader-overlay">
	<div class="loader-content">
		<!-- Animated Logo -->
		<div class="logo-container">
			<svg class="animated-logo" viewBox="0 0 576 596" width="120" height="124">
				<path
					class="logo-path path-1"
					d="M 0 0 L 319.02 -1 L 318.946 402.932 L 158 595 L 158 183 L -1 183 L 0 0 Z"
					fill="none"
					stroke="#FFFFFF"
					stroke-width="3"
					transform="translate(1,1)"
				/>
				<path
					class="logo-path path-2"
					d="M 0 0 C 110.421 0 191.846 0 191.846 0 L 0 183.628 C 0 183.628 0 65.96 0 0 Z"
					fill="none"
					stroke="#FFFFFF"
					stroke-width="3"
					transform="translate(384,0)"
				/>
			</svg>
		</div>

		<!-- Random fact -->
		{#if currentFact}
			<div class="fact-container">
				<p class="fact-label">Did you know?</p>
				<p class="fact-text">{currentFact}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Clean Stroke Animation */
	.loader-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(37, 37, 37, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99999;
	}

	.loader-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3rem;
		max-width: 500px;
		padding: 2rem;
	}

	.logo-container {
		display: flex;
		align-items: center;
		justify-content: center;
		/* Subtle float */
		animation: float 6s ease-in-out infinite;
	}

	.animated-logo {
		overflow: visible;
	}

	.logo-path {
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: transparent;
	}

	.path-1 {
		stroke-dasharray: 1800;
		stroke-dashoffset: 1800;
		animation:
			drawStroke 2s cubic-bezier(0.77, 0, 0.175, 1) forwards,
			fillFadeIn 0.5s ease-out 1.5s forwards;
	}

	.path-2 {
		stroke-dasharray: 600;
		stroke-dashoffset: 600;
		animation:
			drawStroke 2s cubic-bezier(0.77, 0, 0.175, 1) 0.2s forwards,
			fillFadeIn 0.5s ease-out 1.7s forwards;
	}

	@keyframes drawStroke {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes fillFadeIn {
		to {
			fill: #ffffff;
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	.fact-container {
		text-align: center;
		opacity: 0;
		animation: fadeInUp 0.8s ease-out 2s forwards;
	}

	.fact-label {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		margin-bottom: 0.75rem;
	}

	.fact-text {
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.95rem;
		line-height: 1.7;
		font-weight: 300;
		max-width: 400px;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
