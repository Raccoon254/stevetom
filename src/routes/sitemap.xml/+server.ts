import type { RequestHandler } from './$types';
import { SITE } from '$lib/seo';
import { posts, legalDocs } from '$lib/content';
import { projects } from '$lib/data/projects';
import { experiments } from '$lib/data/labExperiments';
import { prisma } from '$lib/db.js';
import { listedSponsorWhere } from '$lib/server/sponsors';

// Deliberately not prerendered. Sponsor pages come and go as people sign up
// and as one-time listings expire, none of which involves a deploy, so a
// build-time snapshot would advertise a stale set of URLs until the next push.
// Cached at the edge instead, which gets the same saving without the staleness.
export const prerender = false;

const TODAY = new Date().toISOString().slice(0, 10);

/** YYYY-MM-DD, or undefined when the input is not a usable date. */
function isoDay(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const day = value.slice(0, 10);
	return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined;
}

/** Newest date in a list, used so index pages report a real lastmod. */
function newest(dates: (string | undefined)[]): string {
	const usable = dates.map(isoDay).filter((d): d is string => Boolean(d));
	return usable.length ? usable.sort().at(-1)! : TODAY;
}

type Url = {
	loc: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
	/** Google image sitemap extension: images that belong to this page. */
	images?: string[];
};

const newestPost = newest(posts.map((p) => p.date));
const legalUpdated = (slug: string) => isoDay(legalDocs.find((d) => d.slug === slug)?.updated);

const STATIC_URLS: Url[] = [
	{ loc: '/', changefreq: 'weekly', priority: 1.0, images: [SITE.ogImage] },
	{ loc: '/blog', lastmod: newestPost, changefreq: 'weekly', priority: 0.8 },
	{ loc: '/lab', changefreq: 'monthly', priority: 0.7 },
	{ loc: '/partners', changefreq: 'monthly', priority: 0.7 },
	{ loc: '/quote', changefreq: 'monthly', priority: 0.8 },
	{ loc: '/contact', changefreq: 'monthly', priority: 0.8 },
	{ loc: '/donate', changefreq: 'monthly', priority: 0.5 },
	{ loc: '/brand', changefreq: 'yearly', priority: 0.4 },
	{ loc: '/privacy', lastmod: legalUpdated('privacy'), changefreq: 'yearly', priority: 0.3 },
	{ loc: '/terms', lastmod: legalUpdated('terms'), changefreq: 'yearly', priority: 0.3 }
];

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function urlBlock(u: Url): string {
	const parts = [`  <url>`, `    <loc>${escapeXml(SITE.url + u.loc)}</loc>`];
	parts.push(`    <lastmod>${u.lastmod || TODAY}</lastmod>`);
	if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
	if (u.priority !== undefined) parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
	for (const image of u.images ?? []) {
		parts.push(`    <image:image>`);
		parts.push(`      <image:loc>${escapeXml(SITE.url + image)}</image:loc>`);
		parts.push(`    </image:image>`);
	}
	parts.push(`  </url>`);
	return parts.join('\n');
}

export const GET: RequestHandler = async ({ setHeaders }) => {
	const blogUrls: Url[] = posts.map((p) => ({
		loc: `/blog/${p.slug}`,
		lastmod: isoDay(p.date),
		changefreq: 'yearly',
		priority: 0.6,
		images: p.image ? [p.image] : []
	}));

	const workUrls: Url[] = projects.map((p) => ({
		loc: `/work/${p.slug}`,
		changefreq: 'monthly',
		priority: 0.7
	}));

	const labUrls: Url[] = experiments.map((x) => ({
		loc: `/lab/${x.slug}`,
		changefreq: 'monthly',
		priority: 0.5
	}));

	// Only sponsors who are actually listed. A private sponsor has no public
	// page, so advertising one would send crawlers to a 404.
	let sponsorUrls: Url[] = [];
	try {
		const sponsors = await prisma.sponsor.findMany({
			where: listedSponsorWhere(),
			select: { slug: true, updatedAt: true }
		});
		sponsorUrls = sponsors.map((s) => ({
			loc: `/partners/${s.slug}`,
			lastmod: isoDay(s.updatedAt.toISOString()) ?? undefined,
			changefreq: 'monthly' as const,
			priority: 0.4
		}));
	} catch (error) {
		// Before the migration, or if the database is unreachable, a sitemap
		// without sponsor pages beats no sitemap at all.
		console.error('sitemap sponsor lookup failed:', error);
	}

	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=3600' });

	const all = [...STATIC_URLS, ...workUrls, ...blogUrls, ...labUrls, ...sponsorUrls];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${all.map(urlBlock).join('\n')}
</urlset>
`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
