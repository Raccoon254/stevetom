<script lang="ts">
	import MarkdownDoc from '$lib/components/kenfolio/MarkdownDoc.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { longDate } from '$lib/content';
	import { abs } from '$lib/seo';
	import type { PageData } from './$types';

	export let data: PageData;
	$: post = data.post;
	$: meta = [post.category, longDate(post.date), post.readingTime]
		.filter(Boolean)
		.join('  ·  ');
	$: articleLd = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.excerpt,
		url: abs(`/blog/${post.slug}`),
		datePublished: post.date,
		...(post.image ? { image: abs(post.image) } : {}),
		...(post.category ? { articleSection: post.category } : {}),
		author: { '@id': 'https://kentom.co.ke/#person' },
		publisher: { '@id': 'https://kentom.co.ke/#person' },
		mainEntityOfPage: abs(`/blog/${post.slug}`)
	};
</script>

<Seo
	title={post.title}
	description={post.excerpt}
	path="/blog/{post.slug}"
	type="article"
	image={post.image || undefined}
	published={post.date}
	breadcrumbs={[
		{ name: 'Notes', path: '/blog' },
		{ name: post.title, path: `/blog/${post.slug}` }
	]}
	jsonld={[articleLd]}
/>

<MarkdownDoc title={post.title} {meta} html={post.html} image={post.image} />
