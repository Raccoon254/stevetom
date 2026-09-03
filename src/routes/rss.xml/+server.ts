/**
 * RSS 2.0 feed for the notes.
 *
 * Served at /rss.xml and advertised from the document head, which is how feed
 * readers and aggregators discover it. Without both, a blog is invisible to
 * that whole channel no matter how good its meta tags are.
 */
import type { RequestHandler } from './$types';
import { posts } from '$lib/content';
import { SITE, PERSON, abs } from '$lib/seo';
import { imageSize } from '$lib/imageDimensions.generated';

/**
 * Escape for XML text and attributes.
 *
 * Post excerpts and titles are author-written prose containing apostrophes and
 * ampersands, and a single unescaped `&` makes the whole feed unparseable in a
 * reader rather than degrading gracefully.
 */
function xml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** RFC 822, which is what RSS 2.0 requires. Not ISO 8601. */
function rfc822(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return new Date().toUTCString();
	return d.toUTCString();
}

const MIME: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp'
};

export const GET: RequestHandler = async ({ setHeaders }) => {
	const published = posts.filter((p) => p.date);
	const latest = published[0]?.date;

	const items = published
		.map((post) => {
			const url = abs(`/blog/${post.slug}`);
			const size = imageSize(post.image);
			const ext = post.image.split('.').pop()?.toLowerCase() ?? '';

			// An enclosure needs a length in bytes, which we do not have here, and
			// readers tolerate 0 far better than a wrong number. media:content
			// carries the real dimensions instead.
			const media =
				post.image && size
					? `\n\t\t\t<media:content url="${xml(abs(post.image))}" medium="image" type="${
							MIME[ext] ?? 'image/jpeg'
						}" width="${size.width}" height="${size.height}" />`
					: '';

			return `\t\t<item>
			<title>${xml(post.title)}</title>
			<link>${xml(url)}</link>
			<guid isPermaLink="true">${xml(url)}</guid>
			<pubDate>${rfc822(post.date)}</pubDate>
			<dc:creator>${xml(PERSON.name)}</dc:creator>${post.category ? `\n\t\t\t<category>${xml(post.category)}</category>` : ''}
			<description>${xml(post.excerpt)}</description>
			<content:encoded><![CDATA[${
				// CDATA cannot contain the closing sequence, so split any occurrence
				// across two sections rather than corrupting the document.
				post.html.split(']]>').join(']]]]><![CDATA[>')
			}]]></content:encoded>${media}
		</item>`;
		})
		.join('\n');

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:media="http://search.yahoo.com/mrss/">
	<channel>
		<title>${xml(SITE.name)}</title>
		<link>${xml(SITE.url)}</link>
		<atom:link href="${xml(abs('/rss.xml'))}" rel="self" type="application/rss+xml" />
		<description>${xml(SITE.description)}</description>
		<language>en</language>
		<copyright>${new Date().getFullYear()} ${xml(PERSON.name)}</copyright>
		<managingEditor>${xml(PERSON.email)} (${xml(PERSON.name)})</managingEditor>
		<webMaster>${xml(PERSON.email)} (${xml(PERSON.name)})</webMaster>${
			latest ? `\n\t\t<lastBuildDate>${rfc822(latest)}</lastBuildDate>` : ''
		}
		<image>
			<url>${xml(abs(SITE.ogImage))}</url>
			<title>${xml(SITE.name)}</title>
			<link>${xml(SITE.url)}</link>
		</image>
${items}
	</channel>
</rss>`;

	setHeaders({
		'content-type': 'application/rss+xml; charset=utf-8',
		'cache-control': 'public, max-age=0, s-maxage=3600'
	});

	return new Response(feed);
};
