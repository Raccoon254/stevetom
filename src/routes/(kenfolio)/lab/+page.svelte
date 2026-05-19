<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	// the interaction experiments that live across this site
	const experiments = [
		{
			name: 'ECG Ribbon',
			blurb:
				'A heartbeat trace that paints itself across the hero, then erases and redraws — a tapering ribbon stitched from 70 live SVG segments.',
			tag: 'SVG',
			href: '/#hero'
		},
		{
			name: 'Halftone Wave',
			blurb:
				'A field of dots that breathes. A smoothed sine field rendered dot-by-dot on canvas, sitting quietly behind the about section.',
			tag: 'Canvas',
			href: '/#about'
		},
		{
			name: 'Ambient Rain',
			blurb:
				'Slow vertical streaks drifting in the dark — the backdrop behind the lab section, tuned to be felt more than seen.',
			tag: 'Canvas',
			href: '/#lab'
		},
		{
			name: 'Theme Toggle',
			blurb:
				'A sun that eclipses into a moon. On phones it collapses to a single half-disc that rotates between light and dark.',
			tag: 'CSS',
			href: '/#hero'
		},
		{
			name: 'Scroll Drop',
			blurb:
				'A spark that falls under gravity and breaks into a ripple when it lands — the scroll cue at the foot of the hero.',
			tag: 'CSS',
			href: '/#hero'
		}
	];
</script>

<svelte:head>
	<title>kenTom · Lab</title>
	<meta
		name="description"
		content="The lab — side rigs, animations, and interaction experiments built for the joy of it."
	/>
</svelte:head>

<main class="page">
	<div class="lab">
		<div class="eyebrow"><Icon name="flash" size={13} /> lab</div>
		<h1>Side rigs, things that <em>move for the joy of it</em>.</h1>
		<p class="lede">
			The lab is the unserious shelf — small builds, animations, and interaction studies that
			exist because they were fun to make. No roadmap, no clients. Most of them are hiding in
			plain sight on this very site; here's what to look for.
		</p>

		<section class="block">
			<div class="section-label">Experiments · {experiments.length}</div>
			<ul class="grid">
				{#each experiments as x}
					<li>
						<a href={x.href}>
							<div class="x-head">
								<span class="x-name">{x.name}</span>
								<span class="x-tag">{x.tag}</span>
							</div>
							<p class="x-blurb">{x.blurb}</p>
							<span class="x-see">
								<span>See it live</span>
								<Icon name="flash" size={13} />
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>

		<div class="cta-row">
			<a class="pill pill--solid" href="/">
				<span>Back home</span>
				<span class="ar" aria-hidden="true"><Icon name="home" size={14} /></span>
			</a>
			<span class="alt">more is always cooking</span>
		</div>
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
		max-width: 56ch;
		margin: 0 0 clamp(40px, 6vh, 60px);
		text-wrap: pretty;
	}

	.block {
		margin-bottom: clamp(40px, 6vh, 60px);
	}
	.section-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		padding-bottom: 14px;
		margin-bottom: clamp(18px, 3vh, 24px);
		border-bottom: 1px solid var(--hairline);
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: clamp(12px, 1.6vw, 16px);
	}
	.grid a {
		display: flex;
		flex-direction: column;
		gap: 10px;
		height: 100%;
		border: 1px solid var(--hairline-2);
		border-radius: 14px;
		padding: clamp(20px, 2.6vw, 26px);
		color: var(--ink-2);
		transition:
			border-color 0.25s,
			transform 0.25s;
	}
	.grid a:hover {
		border-color: var(--mute);
		transform: translateY(-2px);
	}
	.x-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.x-name {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(18px, 2vw, 22px);
		letter-spacing: -0.012em;
		color: var(--ink);
	}
	.x-tag {
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
	.x-blurb {
		font-size: 14px;
		line-height: 1.6;
		color: var(--ink-2);
		margin: 0;
		flex: 1;
	}
	.x-see {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
		transition: color 0.25s;
	}
	.grid a:hover .x-see {
		color: var(--spark);
	}

	.cta-row {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
	}
	.cta-row .alt {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
	}

	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
