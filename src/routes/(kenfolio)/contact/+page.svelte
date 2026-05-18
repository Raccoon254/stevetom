<script lang="ts">
	const links = [
		{ label: 'WhatsApp', href: 'https://wa.link/w1774n' },
		{ label: 'GitHub', href: 'https://github.com/Raccoon254' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/steve-tom-822a81230/' }
	];
</script>

<svelte:head>
	<title>kenTom · Contact</title>
	<meta name="description" content="Get in touch with Steve Tom — email, WhatsApp, GitHub, LinkedIn." />
</svelte:head>

<main class="page">
	<div class="contact">
		<a class="email" href="mailto:tomsteve187@gmail.com">tomsteve187@gmail.com</a>
		<ul class="lines">
			{#each links as l}
				<li>
					<a href={l.href} target="_blank" rel="noopener">
						{l.label} <span class="ar">↗</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</main>

<style>
	.page {
		place-items: center !important;
	}
	.contact {
		width: 100%;
		max-width: 640px;
	}
	.contact .email {
		display: inline-block;
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(28px, 4.4vw, 48px);
		letter-spacing: -0.025em;
		color: var(--ink);
		border-bottom: 1px solid var(--mute-2);
		padding-bottom: 6px;
		transition:
			color 0.25s,
			border-color 0.25s;
		word-break: break-word;
	}
	.contact .email:hover {
		color: var(--spark);
		border-color: var(--spark);
	}

	ul.lines {
		list-style: none;
		padding: 0;
		margin: clamp(48px, 8vh, 80px) 0 0;
	}
	ul.lines li + li {
		margin-top: 18px;
	}
	ul.lines a {
		display: inline-flex;
		align-items: baseline;
		gap: 14px;
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--ink-2);
		transition: color 0.25s;
	}
	ul.lines a:hover {
		color: var(--spark);
	}
	ul.lines a .ar {
		color: var(--mute);
		transition:
			transform 0.25s,
			color 0.25s;
	}
	ul.lines a:hover .ar {
		color: var(--spark);
		transform: translate(2px, -2px);
	}
</style>
