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
	description="The terms of service for using kenTom (Steve Tom) and its services."
	path="/terms"
	breadcrumbs={[{ name: doc.title, path: '/terms' }]}
/>

<MarkdownDoc title={doc.title} meta="Last updated {longDate(doc.updated)}" html={doc.html} />
