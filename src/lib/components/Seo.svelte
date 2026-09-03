<script lang="ts">
	import { SITE, PERSON, abs } from '$lib/seo';

	/** Page title: for inner pages the site name is appended automatically. */
	export let title: string;
	export let description: string;
	/** Route path, used for canonical + og:url. */
	export let path: string = '/';
	/** Social card image: absolute URL or a /static path. */
	export let image: string = SITE.ogImage;
	/** Alt text for the social card image. */
	export let imageAlt: string = '';
	/**
	 * Intrinsic pixel size of `image`. Only pass these when the real size is
	 * known: a wrong og:image:width makes scrapers reserve the wrong box. When
	 * the page falls back to the site card the size is filled in from SITE.
	 */
	export let imageWidth: number | undefined = undefined;
	export let imageHeight: number | undefined = undefined;
	export let type: 'website' | 'article' | 'profile' = 'website';
	export let keywords: string = '';
	export let noindex: boolean = false;
	/** Breadcrumb trail → emits BreadcrumbList JSON-LD. */
	export let breadcrumbs: { name: string; path: string }[] = [];
	/** ISO dates for article-type pages. */
	export let published: string = '';
	export let modified: string = '';
	/** Section and tags for article-type pages (article:section / article:tag). */
	export let section: string = '';
	export let tags: string[] = [];
	/** Extra JSON-LD objects to embed for this page. */
	export let jsonld: Record<string, unknown>[] = [];

	$: fullTitle = path === '/' ? title : `${title} · ${SITE.titleSuffix}`;
	$: canonical = abs(path);
	$: resolvedImage = image || SITE.ogImage;
	$: ogImage = resolvedImage.startsWith('http') ? resolvedImage : abs(resolvedImage);
	$: isDefaultImage = resolvedImage === SITE.ogImage;
	// Dimensions are declared only when they are actually known, never guessed.
	$: ogWidth = imageWidth ?? (isDefaultImage ? SITE.ogImageWidth : undefined);
	$: ogHeight = imageHeight ?? (isDefaultImage ? SITE.ogImageHeight : undefined);
	$: ogAlt = imageAlt || (isDefaultImage ? SITE.ogImageAlt : title);

	const TAG_OPEN = '<' + 'script type="application/ld+json">';
	const TAG_CLOSE = '</' + 'script>';

	/**
	 * JSON-LD is injected as raw HTML, so any "<" inside a string value would
	 * let page content close the script tag early. Escape the three characters
	 * that matter plus the two line separators that are illegal in JS strings.
	 */
	function serialize(obj: Record<string, unknown>): string {
		return JSON.stringify(obj)
			.replace(/</g, '\\u003c')
			.replace(/>/g, '\\u003e')
			.replace(/&/g, '\\u0026')
			.replace(/\u2028/g, '\\u2028')
			.replace(/\u2029/g, '\\u2029');
	}

	$: graph = [
		...(breadcrumbs.length
			? [
					{
						'@context': 'https://schema.org',
						'@type': 'BreadcrumbList',
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: 'Home',
								item: abs('/')
							},
							...breadcrumbs.map((b, i) => ({
								'@type': 'ListItem',
								position: i + 2,
								name: b.name,
								item: abs(b.path)
							}))
						]
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
	<meta property="og:image:secure_url" content={ogImage} />
	<meta property="og:image:alt" content={ogAlt} />
	{#if ogWidth && ogHeight}
		<meta property="og:image:width" content={String(ogWidth)} />
		<meta property="og:image:height" content={String(ogHeight)} />
	{/if}
	{#if type === 'article'}
		<meta property="article:author" content={PERSON.name} />
		{#if published}<meta property="article:published_time" content={published} />{/if}
		{#if modified || published}
			<meta property="article:modified_time" content={modified || published} />
		{/if}
		{#if section}<meta property="article:section" content={section} />{/if}
		{#each tags as tag}<meta property="article:tag" content={tag} />{/each}
	{/if}
	{#if type === 'profile'}
		<meta property="profile:first_name" content="Steve" />
		<meta property="profile:last_name" content="Tom" />
		<meta property="profile:username" content="kenTom" />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={ogAlt} />

	{#each graph as obj}
		{@html TAG_OPEN + serialize(obj) + TAG_CLOSE}
	{/each}
</svelte:head>
