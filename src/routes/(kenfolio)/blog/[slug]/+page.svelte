<script lang="ts">
	import MarkdownDoc from '$lib/components/kenfolio/MarkdownDoc.svelte';
	import { longDate } from '$lib/content';
	import type { PageData } from './$types';

	export let data: PageData;
	$: post = data.post;
	$: meta = [post.category, longDate(post.date), post.readingTime]
		.filter(Boolean)
		.join('  ·  ');
</script>

<svelte:head>
	<title>kenTom · {post.title}</title>
	<meta name="description" content={post.excerpt} />
</svelte:head>

<MarkdownDoc title={post.title} {meta} html={post.html} image={post.image} />
