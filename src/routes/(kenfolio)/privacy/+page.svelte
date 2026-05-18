<script lang="ts">
	import MarkdownDoc from '$lib/components/kenfolio/MarkdownDoc.svelte';
	import { longDate } from '$lib/content';
	import type { PageData } from './$types';

	export let data: PageData;
	$: doc = data.doc;
</script>

<svelte:head>
	<title>kenTom · {doc.title}</title>
	<meta name="description" content="Privacy Policy for KenTom." />
</svelte:head>

<MarkdownDoc title={doc.title} meta="Last updated {longDate(doc.updated)}" html={doc.html} />
