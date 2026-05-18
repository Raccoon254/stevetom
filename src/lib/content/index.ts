/**
 * Markdown content pipeline for KenFolio.
 *
 * Blog posts live in src/lib/content/blog/*.md and legal docs in
 * src/lib/content/legal/*.md, each with a simple `---` frontmatter block.
 * Files are bundled at build time via import.meta.glob; the body is
 * rendered to HTML with `marked`.
 */
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

type Meta = Record<string, string>;

function splitFrontmatter(raw: string): { meta: Meta; body: string } {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!m) return { meta: {}, body: raw };
	const meta: Meta = {};
	for (const line of m[1].split(/\r?\n/)) {
		const i = line.indexOf(':');
		if (i === -1) continue;
		meta[line.slice(0, i).trim()] = line
			.slice(i + 1)
			.trim()
			.replace(/^["']|["']$/g, '');
	}
	return { meta, body: m[2] };
}

function readingTime(body: string): string {
	const words = body.trim().split(/\s+/).length;
	return `${Math.max(1, Math.round(words / 200))} min read`;
}

export type Post = {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	category: string;
	image: string;
	readingTime: string;
	html: string;
};

export type LegalDoc = {
	slug: string;
	title: string;
	updated: string;
	html: string;
};

const blogFiles = import.meta.glob('./blog/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const legalFiles = import.meta.glob('./legal/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function slugOf(path: string): string {
	return path.split('/').pop()!.replace(/\.md$/, '');
}

export const posts: Post[] = Object.entries(blogFiles)
	.map(([path, raw]) => {
		const { meta, body } = splitFrontmatter(raw);
		return {
			slug: slugOf(path),
			title: meta.title ?? slugOf(path),
			date: meta.date ?? '',
			excerpt: meta.excerpt ?? '',
			category: meta.category ?? '',
			image: meta.image ?? '',
			readingTime: readingTime(body),
			html: marked.parse(body) as string
		};
	})
	.sort((a, b) => (a.date < b.date ? 1 : -1));

export const legalDocs: LegalDoc[] = Object.entries(legalFiles).map(([path, raw]) => {
	const { meta, body } = splitFrontmatter(raw);
	return {
		slug: slugOf(path),
		title: meta.title ?? slugOf(path),
		updated: meta.updated ?? '',
		html: marked.parse(body) as string
	};
});

export const getPost = (slug: string): Post | undefined =>
	posts.find((p) => p.slug === slug);

export const getLegal = (slug: string): LegalDoc | undefined =>
	legalDocs.find((d) => d.slug === slug);

/** "2025-12-21" -> "Dec · 25" */
export function shortDate(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	const mon = d.toLocaleString('en', { month: 'short' });
	return `${mon} · ${String(d.getFullYear()).slice(2)}`;
}

/** "2025-12-21" -> "December 21, 2025" */
export function longDate(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	return d.toLocaleString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}
