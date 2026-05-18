<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	const links = [
		{
			label: 'TikTok',
			handle: '@raccoon.254',
			href: 'https://www.tiktok.com/@raccoon.254',
			icon: 'tiktok'
		},
		{
			label: 'GitHub',
			handle: 'Raccoon254',
			href: 'https://github.com/Raccoon254',
			icon: 'github'
		},
		{
			label: 'YouTube',
			handle: '@iamkentom',
			href: 'https://www.youtube.com/@iamkentom',
			icon: 'youtube-logo'
		},
		{
			label: 'WhatsApp',
			handle: 'Message me',
			href: 'https://wa.link/w1774n',
			icon: 'whatsapp-logo'
		}
	];
</script>

<svelte:head>
	<title>kenTom · Contact</title>
	<meta name="description" content="Get in touch with Steve Tom — email, TikTok, GitHub, WhatsApp." />
</svelte:head>

<main class="page">
	<div class="contact">
		<div class="eyebrow"><Icon name="messages" size={13} /> contact</div>

		<a class="email" href="mailto:tomsteve187@gmail.com">tomsteve187@gmail.com</a>

		<ul class="lines">
			{#each links as l}
				<li>
					<a href={l.href} target="_blank" rel="noopener">
						<span class="mark"><Icon name={l.icon} size={16} /></span>
						<span class="text">
							<span class="lbl">{l.label}</span>
							<span class="handle">{l.handle}</span>
						</span>
						<span class="ar"><Icon name="export-arrow" size={13} /></span>
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
		display: flex;
		flex-direction: column;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 clamp(20px, 4vh, 32px);
	}
	.eyebrow :global(svg) {
		stroke-width: 1.5;
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
		margin: clamp(40px, 7vh, 72px) 0 0;
		border-top: 1px solid var(--hairline);
	}
	ul.lines li {
		border-bottom: 1px solid var(--hairline);
	}
	ul.lines a {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 18px 4px;
		color: var(--ink-2);
		transition: color 0.25s;
	}
	ul.lines a:hover {
		color: var(--spark);
	}

	/* brand mark — inherits currentColor, so it follows the theme */
	.mark {
		display: inline-flex;
		flex: 0 0 auto;
		color: var(--ink);
		transition: color 0.25s;
	}
	ul.lines a:hover .mark {
		color: var(--spark);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.lbl {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.handle {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--mute);
	}

	.ar {
		margin-left: auto;
		color: var(--mute);
		transition:
			transform 0.25s,
			color 0.25s;
	}
	ul.lines a:hover .ar {
		color: var(--spark);
		transform: scale(1.2);
	}

	@media (max-width: 600px) {
		.contact .email {
			font-size: clamp(22px, 6.4vw, 30px);
		}
	}
</style>
