<script lang="ts">
	import { SITE, abs } from '$lib/seo';

	/** Page title — for inner pages the site name is appended automatically. */
	export let title: string;
	export let description: string;
	/** Route path, used for canonical + og:url. */
	export let path: string = '/';
	/** Social card image — absolute URL or a /static path. */
	export let image: string = SITE.ogImage;
	export let type: 'website' | 'article' | 'profile' = 'website';
	export let keywords: string = '';
	export let noindex: boolean = false;
	/** Breadcrumb trail → emits BreadcrumbList JSON-LD. */
	export let breadcrumbs: { name: string; path: string }[] = [];
	/** ISO dates for article-type pages. */
	export let published: string = '';
	export let modified: string = '';
	/** Extra JSON-LD objects to embed for this page. */
	export let jsonld: Record<string, unknown>[] = [];

	$: fullTitle = path === '/' ? title : `${title} · ${SITE.titleSuffix}`;
	$: canonical = abs(path);
	$: ogImage = image.startsWith('http') ? image : abs(image);

	const TAG_OPEN = '<' + 'script type="application/ld+json">';
	const TAG_CLOSE = '</' + 'script>';

	$: graph = [
		...(breadcrumbs.length
			? [
					{
						'@context': 'https://schema.org',
						'@type': 'BreadcrumbList',
						itemListElement: breadcrumbs.map((b, i) => ({
							'@type': 'ListItem',
							position: i + 1,
							name: b.name,
							item: abs(b.path)
						}))
					}
				]
			: []),
		...jsonld
	];
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	{#if keywords}<meta name="keywords" content={keywords} />{/if}
	{#if noindex}<meta name="robots" content="noindex, nofollow" />{/if}
	<link rel="canonical" href={canonical} />

	<!-- Open Graph -->
	<meta property="og:type" content={type} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	{#if published}<meta property="article:published_time" content={published} />{/if}
	{#if modified}<meta property="article:modified_time" content={modified} />{/if}

	<!-- Twitter -->
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	{#each graph as obj}
		{@html TAG_OPEN + JSON.stringify(obj) + TAG_CLOSE}
	{/each}
</svelte:head>
