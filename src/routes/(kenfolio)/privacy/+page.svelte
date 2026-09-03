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
		'@id': `${abs('/privacy')}#webpage`,
		url: abs('/privacy'),
		name: doc.title,
		description: 'How kenTom (Steve Tom) collects, uses, and protects your information.',
		inLanguage: SITE.language,
		dateModified: doc.updated,
		isPartOf: { '@id': WEBSITE_ID },
		about: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID }
	};
</script>

<Seo
	title={doc.title}
	description="How kenTom (Steve Tom) collects, uses, and protects your information."
	path="/privacy"
	breadcrumbs={[{ name: doc.title, path: '/privacy' }]}
	jsonld={[docLd]}
/>

<MarkdownDoc title={doc.title} meta="Last updated {longDate(doc.updated)}" html={doc.html} />
