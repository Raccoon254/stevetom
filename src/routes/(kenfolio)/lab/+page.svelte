<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { experiments } from '$lib/data/labExperiments';
</script>

<Seo
	title="Lab"
	description="The lab — side rigs, animations, and interaction experiments built for the joy of it, each with a live demo and a write-up."
	path="/lab"
	keywords="UI experiments, animation studies, SVG canvas CSS, creative coding"
	breadcrumbs={[{ name: 'Lab', path: '/lab' }]}
/>

<main class="page">
	<div class="lab">
		<div class="eyebrow"><Icon name="flash" size={13} /> lab</div>
		<h1>Side rigs, things that <em>move for the joy of it</em>.</h1>
		<p class="lede">
			This is where I keep the unserious stuff. Small builds, animations, and interaction studies
			I made simply because they were fun to figure out. Nothing here is on a roadmap and none of
			it is for a client. Every one has its own page where you can watch it run and read how I
			put it together.
		</p>

		<div class="section-label">Experiments · {experiments.length}</div>
		<ul class="index">
			{#each experiments as x}
				<li>
					<a href="/lab/{x.slug}">
						<span class="row">
							<span class="name">{x.name}</span>
							<span class="tag">{x.tag}</span>
						</span>
						<span class="blurb">{x.summary}</span>
						<span class="go"><Icon name="flash" size={13} /></span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</main>

<style>
	.lab {
		width: 100%;
		max-width: var(--page-w);
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
		margin: 0 0 clamp(18px, 3vh, 26px);
	}
	.eyebrow :global(svg) {
		stroke-width: 1.5;
	}

	h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(36px, 5vw, 60px);
		line-height: 1.08;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 16px;
		text-wrap: balance;
	}
	h1 em {
		font-style: normal;
		color: var(--mute);
	}
	.lede {
		font-size: clamp(16px, 1.5vw, 19px);
		line-height: 1.55;
		color: var(--ink-2);
		max-width: 58ch;
		margin: 0 0 clamp(40px, 6vh, 56px);
		text-wrap: pretty;
	}

	.section-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		padding-bottom: 14px;
		border-bottom: 1px solid var(--hairline);
	}

	/* borderless divider list: no boxed cards */
	.index {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.index li {
		border-bottom: 1px solid var(--hairline);
	}
	.index a {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 6px 18px;
		padding: clamp(22px, 3.4vh, 30px) 4px;
		color: var(--ink-2);
		transition: padding-left 0.25s ease;
	}
	.index a:hover {
		padding-left: 12px;
	}
	.row {
		display: flex;
		align-items: baseline;
		gap: 14px;
	}
	.name {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(22px, 2.6vw, 30px);
		letter-spacing: -0.015em;
		color: var(--ink);
		transition: color 0.25s;
	}
	.index a:hover .name {
		color: var(--spark);
	}
	.tag {
		font-family: var(--mono);
		font-size: 9px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		padding: 4px 9px;
		flex: 0 0 auto;
	}
	.blurb {
		grid-column: 1;
		font-size: 14.5px;
		line-height: 1.55;
		color: var(--ink-2);
		max-width: 60ch;
	}
	.go {
		grid-column: 2;
		grid-row: 1 / span 2;
		align-self: center;
		display: inline-flex;
		color: var(--mute);
		transition: color 0.25s, transform 0.25s;
	}
	.index a:hover .go {
		color: var(--spark);
		transform: scale(1.2);
	}
</style>
