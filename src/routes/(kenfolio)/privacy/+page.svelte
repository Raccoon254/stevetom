<script lang="ts">
	import MarkdownDoc from '$lib/components/kenfolio/MarkdownDoc.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { longDate } from '$lib/content';
	import type { PageData } from './$types';

	export let data: PageData;
	$: doc = data.doc;
</script>

<Seo
	title={doc.title}
	description="How kenTom (Steve Tom) collects, uses, and protects your information."
	path="/privacy"
	breadcrumbs={[{ name: doc.title, path: '/privacy' }]}
/>

<MarkdownDoc title={doc.title} meta="Last updated {longDate(doc.updated)}" html={doc.html} />
