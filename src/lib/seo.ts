/**
 * Central SEO configuration for kentom.co.ke.
 *
 * Site-wide constants live here; per-page metadata is applied through the
 * <Seo> component (src/lib/components/Seo.svelte). The sitemap route reads
 * SITE.url from here, and the JSON-LD blocks in app.html restate the same
 * canonical domain, so this file is the reference for anything that has to
 * agree across the site: the domain, the person, and the navigation.
 */

export const SITE = {
	url: 'https://kentom.co.ke',
	name: 'kenTom',
	/** default <title> for the home page */
	title: 'kenTom · Steve Tom · Full-Stack Developer in Kenya',
	description:
		'Steve Tom (kenTom) is a full-stack developer in Kenya building web apps, mobile apps, and custom software. Selected work, field notes, and a lab of interface experiments.',
	locale: 'en_KE',
	language: 'en',
	/** social card image, served from /static */
	ogImage: '/kentom_website_banner.jpg',
	/** Intrinsic pixel size of ogImage. Emitted as og:image:width/height so
	 *  scrapers can lay the card out before the file finishes downloading.
	 *  Only declared for this known image, never guessed for per-page images. */
	ogImageWidth: 2100,
	ogImageHeight: 1305,
	ogImageAlt: 'kenTom, the portfolio of Steve Tom, full-stack developer in Kenya',
	/** suffix appended to inner-page titles */
	titleSuffix: 'kenTom',
	themeColor: '#050505'
} as const;

/** Stable @id values for the entities declared once in src/app.html.
 *  Per-page JSON-LD references these instead of restating the entity. */
export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const SERVICE_ID = `${SITE.url}/#service`;

export const PERSON = {
	name: 'Steve Osoro Tom',
	alternateName: ['kenTom', 'KenTom', 'Raccoon254'],
	jobTitle: 'Full-Stack Developer & Software Engineer',
	email: 'me@kentom.co.ke',
	telephone: '+254758481320',
	image: '/steve-osoro-tom-full-image.png',
	sameAs: [
		'https://github.com/Raccoon254',
		'https://www.linkedin.com/in/steve-tom-822a81230/',
		'https://www.tiktok.com/@raccoon.254',
		'https://www.youtube.com/@iamkentom'
	]
} as const;

/** Primary navigation: drives both the sitemap and SiteNavigationElement JSON-LD. */
export const NAV: { name: string; path: string; description: string }[] = [
	{ name: 'Home', path: '/', description: 'kenTom · Steve Tom, full-stack developer in Kenya' },
	{ name: 'Notes', path: '/blog', description: 'Field notes on building software, products, and the work' },
	{ name: 'Lab', path: '/lab', description: 'Interface experiments and animation studies, explained' },
	{ name: 'Partners', path: '/partners', description: 'Sponsor the work: tiers, reasons, and how to partner' },
	{ name: 'Quote', path: '/quote', description: 'Tell Steve Tom what you are building and get a quote' },
	{ name: 'Contact', path: '/contact', description: 'Start a conversation with Steve Tom' },
	{ name: 'Support', path: '/donate', description: 'Support the work with a one-off gift' }
];

/** Absolute URL for a path on the canonical domain. */
export const abs = (path = '/'): string => new URL(path, SITE.url).href;

/** Reference to the Person node declared in app.html. */
export const personRef = () => ({ '@id': PERSON_ID });

/**
 * BlogPosting node for a markdown post. Kept here so the blog route, and any
 * future feed, describe a post the same way.
 */
export function blogPostingLd(post: {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	category?: string;
	image?: string;
	readingTime?: string;
}): Record<string, unknown> {
	const url = abs(`/blog/${post.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: post.title,
		name: post.title,
		description: post.excerpt,
		url,
		inLanguage: SITE.language,
		datePublished: post.date,
		dateModified: post.date,
		...(post.image ? { image: [abs(post.image)] } : { image: [abs(SITE.ogImage)] }),
		...(post.category ? { articleSection: post.category, keywords: post.category } : {}),
		...(post.readingTime ? { timeRequired: readingTimeToIso(post.readingTime) } : {}),
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID },
		mainEntityOfPage: { '@type': 'WebPage', '@id': url }
	};
}

/** "7 min read" -> "PT7M". Returns undefined when the string has no minutes. */
function readingTimeToIso(readingTime: string): string | undefined {
	const m = readingTime.match(/(\d+)/);
	return m ? `PT${m[1]}M` : undefined;
}
