<script lang="ts">
	import MarkdownDoc from '$lib/components/kenfolio/MarkdownDoc.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { longDate } from '$lib/content';
	import { blogPostingLd } from '$lib/seo';
	import { imageSize } from '$lib/imageDimensions.generated';
	import type { PageData } from './$types';

	export let data: PageData;
	$: post = data.post;
	$: meta = [post.category, longDate(post.date), post.readingTime]
		.filter(Boolean)
		.join('  ·  ');
	$: articleLd = blogPostingLd(post);
</script>

<Seo
	title={post.title}
	description={post.excerpt}
	path="/blog/{post.slug}"
	type="article"
	image={post.image || undefined}
	imageAlt={post.title}
	imageWidth={imageSize(post.image)?.width}
	imageHeight={imageSize(post.image)?.height}
	published={post.date}
	modified={post.date}
	section={post.category}
	tags={post.category ? [post.category] : []}
	keywords={[post.category, 'Steve Tom', 'kenTom', 'notes'].filter(Boolean).join(', ')}
	breadcrumbs={[
		{ name: 'Notes', path: '/blog' },
		{ name: post.title, path: `/blog/${post.slug}` }
	]}
	jsonld={[articleLd]}
/>

<MarkdownDoc title={post.title} {meta} html={post.html} image={post.image} />
