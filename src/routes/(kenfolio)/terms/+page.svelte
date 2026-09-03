<script lang="ts">
	import MarkdownDoc from '$lib/components/kenfolio/MarkdownDoc.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { longDate } from '$lib/content';
	import { PERSON_ID, WEBSITE_ID, SITE, abs } from '$lib/seo';
	import type { PageData } from './$types';

	export let data: PageData;
	$: doc = data.doc;
	// dateModified comes straight from the document's own frontmatter, so the
	// page never claims to be fresher than the text actually is.
	$: docLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': `${abs('/terms')}#webpage`,
		url: abs('/terms'),
		name: doc.title,
		description: 'The terms of service for using kenTom (Steve Tom) and its services.',
		inLanguage: SITE.language,
		dateModified: doc.updated,
		isPartOf: { '@id': WEBSITE_ID },
		about: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID }
	};
</script>

<Seo
	title={doc.title}
	description="The terms of service for using kenTom (Steve Tom) and its services."
	path="/terms"
	breadcrumbs={[{ name: doc.title, path: '/terms' }]}
	jsonld={[docLd]}
/>

<MarkdownDoc title={doc.title} meta="Last updated {longDate(doc.updated)}" html={doc.html} />
