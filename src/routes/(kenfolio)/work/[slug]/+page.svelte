<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { PERSON_ID, WEBSITE_ID, SITE, abs } from '$lib/seo';
	import type { PageData } from './$types';
	export let data: PageData;
	$: project = data.project;
	// Plain-text description for meta and JSON-LD: the project body carries
	// inline <em> markup for the page, which must not leak into metadata.
	$: summary = project.body[0].replace(/<[^>]+>/g, '');
	// Meta descriptions get trimmed at a word boundary so search results end on
	// a whole word rather than mid-sentence.
	$: metaDescription =
		summary.length <= 175 ? summary : summary.slice(0, summary.lastIndexOf(' ', 175)) + '…';
	$: workLd = {
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		'@id': `${abs(`/work/${project.slug}`)}#work`,
		name: project.name,
		headline: project.name,
		description: summary,
		url: abs(`/work/${project.slug}`),
		sameAs: [project.link.href],
		inLanguage: SITE.language,
		creator: { '@id': PERSON_ID },
		author: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID },
		mainEntityOfPage: { '@type': 'WebPage', '@id': abs(`/work/${project.slug}`) }
	};
</script>

<Seo
	title={project.name}
	description={metaDescription}
	path="/work/{project.slug}"
	keywords={`${project.name}, Steve Tom, kenTom, selected work, software project Kenya`}
	breadcrumbs={[{ name: project.name, path: `/work/${project.slug}` }]}
	jsonld={[workLd]}
/>

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
