/**
 * Central SEO configuration for kentom.co.ke.
 *
 * Site-wide constants live here; per-page metadata is applied through the
 * <Seo> component (src/lib/components/Seo.svelte). The sitemap route and the
 * JSON-LD in app.html also read from these values so there is one source of
 * truth for the canonical domain, the person, and the navigation.
 */

export const SITE = {
	url: 'https://kentom.co.ke',
	name: 'kenTom',
	/** default <title> for the home page */
	title: 'kenTom — Steve Tom · Full-Stack Developer in Kenya',
	description:
		'Steve Tom (kenTom) is a full-stack developer in Kenya building web apps, mobile apps, and custom software. Selected work, field notes, and a lab of interface experiments.',
	locale: 'en_KE',
	/** social card image, served from /static */
	ogImage: '/kentom_website_banner.jpg',
	/** suffix appended to inner-page titles */
	titleSuffix: 'kenTom',
	themeColor: '#050505'
} as const;

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

/** Primary navigation — drives both the sitemap and SiteNavigationElement JSON-LD. */
export const NAV: { name: string; path: string; description: string }[] = [
	{ name: 'Home', path: '/', description: 'kenTom — Steve Tom, full-stack developer in Kenya' },
	{ name: 'Notes', path: '/blog', description: 'Field notes on building software, products, and the work' },
	{ name: 'Lab', path: '/lab', description: 'Interface experiments and animation studies, explained' },
	{ name: 'Partners', path: '/partners', description: 'Sponsor the work — tiers, reasons, and how to partner' },
	{ name: 'Quote', path: '/quote', description: 'Tell Steve Tom what you are building and get a quote' },
	{ name: 'Contact', path: '/contact', description: 'Start a conversation with Steve Tom' }
];

/** Absolute URL for a path on the canonical domain. */
export const abs = (path = '/'): string => new URL(path, SITE.url).href;
