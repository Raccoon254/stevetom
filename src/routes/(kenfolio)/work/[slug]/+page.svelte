<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	$: project = data.project;
</script>

<svelte:head>
	<title>kenTom · {project.name}</title>
	<meta name="description" content="{project.name}: {project.meta}." />
</svelte:head>

<main class="page">
	<article class="proj">
		<header class="head">
			<h1>{project.name}</h1>
			<span class="meta-line">{project.meta}</span>
		</header>

		<figure class="shot"></figure>

		{#each project.body as para}
			<p>{@html para}</p>
		{/each}

		<a class="out" href={project.link.href} target="_blank" rel="noopener">
			<span>{project.link.label}</span>
			<Icon name="paperclip" size={14} />
		</a>
	</article>
</main>

<style>
	.proj {
		width: 100%;
		max-width: var(--page-w);
	}
	.proj .head {
		display: flex;
		align-items: baseline;
		gap: 16px;
		margin-bottom: clamp(28px, 4.5vh, 40px);
		flex-wrap: wrap;
	}
	.proj .head h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(40px, 6vw, 76px);
		line-height: 0.95;
		letter-spacing: -0.03em;
		margin: 0;
		color: var(--ink);
	}
	.proj .head .meta-line {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		padding-bottom: 10px;
	}
	.proj .shot {
		position: relative;
		aspect-ratio: 16 / 10;
		border-radius: 12px;
		overflow: hidden;
		background:
			repeating-linear-gradient(
				135deg,
				rgba(var(--wave), 0.06) 0,
				rgba(var(--wave), 0.06) 14px,
				rgba(var(--wave), 0.02) 14px,
				rgba(var(--wave), 0.02) 28px
			),
			var(--mute-3);
		margin: clamp(28px, 4vh, 44px) 0 clamp(36px, 6vh, 56px);
	}
	.proj p {
		font-size: clamp(17px, 1.5vw, 20px);
		line-height: 1.6;
		color: var(--ink-2);
		max-width: 60ch;
		margin: 0 0 18px;
		text-wrap: pretty;
	}
	.proj p :global(em) {
		font-style: normal;
		color: var(--ink);
	}
	.proj .out {
		margin-top: clamp(36px, 6vh, 56px);
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
		padding-bottom: 4px;
		transition:
			color 0.25s,
			border-color 0.25s;
	}
	.proj .out:hover {
		color: var(--spark);
		border-color: var(--spark);
	}
</style>
