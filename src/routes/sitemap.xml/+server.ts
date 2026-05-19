import type { RequestHandler } from './$types';
import { SITE } from '$lib/seo';
import { posts } from '$lib/content';
import { projects } from '$lib/data/projects';
import { experiments } from '$lib/data/labExperiments';

export const prerender = true;

const TODAY = new Date().toISOString().slice(0, 10);

type Url = {
	loc: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
};

const STATIC_URLS: Url[] = [
	{ loc: '/', changefreq: 'weekly', priority: 1.0 },
	{ loc: '/blog', changefreq: 'weekly', priority: 0.8 },
	{ loc: '/lab', changefreq: 'monthly', priority: 0.7 },
	{ loc: '/partners', changefreq: 'monthly', priority: 0.7 },
	{ loc: '/quote', changefreq: 'monthly', priority: 0.8 },
	{ loc: '/contact', changefreq: 'monthly', priority: 0.8 },
	{ loc: '/donate', changefreq: 'monthly', priority: 0.5 },
	{ loc: '/privacy', changefreq: 'yearly', priority: 0.3 },
	{ loc: '/terms', changefreq: 'yearly', priority: 0.3 }
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
	parts.push(`  </url>`);
	return parts.join('\n');
}

export const GET: RequestHandler = async () => {
	const blogUrls: Url[] = posts.map((p) => ({
		loc: `/blog/${p.slug}`,
		lastmod: (p.date || '').slice(0, 10) || TODAY,
		changefreq: 'yearly',
		priority: 0.6
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

	const all = [...STATIC_URLS, ...workUrls, ...blogUrls, ...labUrls];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
