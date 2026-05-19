<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { experiments } from '$lib/data/labExperiments';
	import EcgRibbonDemo from '$lib/components/lab/EcgRibbonDemo.svelte';
	import HalftoneWaveDemo from '$lib/components/lab/HalftoneWaveDemo.svelte';
	import RainDemo from '$lib/components/lab/RainDemo.svelte';
	import ScrollDropDemo from '$lib/components/lab/ScrollDropDemo.svelte';
	import ThemeToggle from '$lib/components/kenfolio/ThemeToggle.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const demoMap = {
		ecg: EcgRibbonDemo,
		wave: HalftoneWaveDemo,
		rain: RainDemo,
		drop: ScrollDropDemo,
		theme: ThemeToggle
	} as const;

	$: x = data.experiment;
	$: Demo = demoMap[x.demo];
	$: idx = experiments.findIndex((e) => e.slug === x.slug);
	$: next = experiments[(idx + 1) % experiments.length];
</script>

<svelte:head>
	<title>kenTom · Lab · {x.name}</title>
	<meta name="description" content={x.summary} />
</svelte:head>

<main class="page">
	<article class="exp">
		<nav class="crumb">
			<a href="/lab"><Icon name="flash" size={12} /> Lab</a>
			<span class="sep">/</span>
			<span>{x.name}</span>
		</nav>

		<div class="meta">
			<span class="tag">{x.tag}</span>
			<span class="year">{x.year}</span>
		</div>
		<h1>{x.name}</h1>
		<p class="intro">{x.intro}</p>

		<!-- live demo -->
		<figure class="stage" class:stage--compact={x.demo === 'theme' || x.demo === 'drop'}>
			<div class="stage-frame">
				<svelte:component this={Demo} />
			</div>
			<figcaption><span class="dot"></span> Live — running now</figcaption>
		</figure>

		<!-- write-up -->
		<div class="notes">
			{#each x.sections as s, i}
				<section class="note">
					<span class="note-n">{String(i + 1).padStart(2, '0')}</span>
					<div>
						<h2>{s.heading}</h2>
						<p>{s.body}</p>
					</div>
				</section>
			{/each}
		</div>

		<div class="foot">
			<a class="pill pill--solid" href="/lab/{next.slug}">
				<span>Next · {next.name}</span>
				<span class="ar" aria-hidden="true"><Icon name="flash" size={13} /></span>
			</a>
			<a class="back" href="/lab">All experiments</a>
		</div>
	</article>
</main>

<style>
	.exp {
		width: 100%;
		max-width: var(--page-w);
	}

	/* breadcrumb */
	.crumb {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 clamp(20px, 4vh, 32px);
	}
	.crumb a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--ink-2);
		transition: color 0.25s;
	}
	.crumb a:hover {
		color: var(--spark);
	}
	.crumb .sep {
		color: var(--mute-2);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
	}
	.tag {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--spark);
		border: 1px solid var(--spark);
		border-radius: 999px;
		padding: 4px 10px;
	}
	.year {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.22em;
		color: var(--mute);
	}

	h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(38px, 5.4vw, 68px);
		line-height: 1.04;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 16px;
		text-wrap: balance;
	}
	.intro {
		font-size: clamp(16px, 1.6vw, 20px);
		line-height: 1.6;
		color: var(--ink-2);
		max-width: 62ch;
		margin: 0 0 clamp(32px, 5vh, 48px);
		text-wrap: pretty;
	}

	/* demo stage */
	.stage {
		margin: 0 0 clamp(40px, 6vh, 64px);
	}
	.stage-frame {
		height: clamp(220px, 40vh, 360px);
		border: 1px solid var(--hairline);
		border-radius: 16px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--bg-rgb), 0.5);
	}
	.stage--compact .stage-frame {
		height: clamp(180px, 28vh, 240px);
	}
	figcaption {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--spark);
		box-shadow: 0 0 8px var(--spark-glow);
	}

	/* write-up — numbered, borderless */
	.notes {
		border-top: 1px solid var(--hairline);
		margin-bottom: clamp(36px, 6vh, 56px);
	}
	.note {
		border-bottom: 1px solid var(--hairline);
		padding: clamp(20px, 3.4vh, 30px) 0;
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: clamp(14px, 3vw, 28px);
		align-items: baseline;
	}
	.note-n {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.2em;
		color: var(--spark);
	}
	.note h2 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(18px, 2vw, 23px);
		line-height: 1.25;
		letter-spacing: -0.012em;
		color: var(--ink);
		margin: 0 0 8px;
	}
	.note p {
		margin: 0;
		font-size: 15px;
		line-height: 1.65;
		color: var(--ink-2);
		max-width: 64ch;
	}

	.foot {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
	}
	.back {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
		transition: color 0.25s, border-color 0.25s;
	}
	.back:hover {
		color: var(--spark);
		border-color: var(--spark);
	}

	@media (max-width: 560px) {
		.note {
			grid-template-columns: 1fr;
			gap: 6px;
		}
	}
</style>
