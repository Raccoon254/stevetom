/**
 * Markdown to email-safe HTML.
 *
 * This runs on both sides: the compose screen previews with it and the sender
 * renders the outgoing body with it, so what the owner sees is what goes out.
 *
 * Nothing the author types is ever trusted as HTML. We tokenise with `marked`
 * and then emit the HTML ourselves from a fixed set of tags, escaping every
 * piece of text on the way through. A raw `<script>` in the body comes out as
 * visible text, not as markup. That is a deliberately stricter posture than
 * "render then sanitise with a regex": there is no pass where attacker markup
 * exists in a string we later try to clean.
 *
 * The output is also inline-styled, because email clients strip stylesheets.
 * The type matches the Axene system-email template in $lib/server/mailer.ts:
 * Georgia body, #111 ink, hairline #e2e2e0 rules.
 */
import { marked } from 'marked';
import type { Token, Tokens } from 'marked';

const BODY_FONT = 'Georgia, serif';
const MONO_FONT = "'Courier New', monospace";
const SITE = 'https://www.kentom.co.ke';

/**
 * Escape for HTML. `&` is only escaped when it does not already open a valid
 * entity, so a body containing `&amp;` is not mangled into `&amp;amp;`.
 */
const AMP = /&(?![a-zA-Z][a-zA-Z0-9]{1,31};|#\d{1,7};|#[xX][0-9a-fA-F]{1,6};)/g;

export function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(AMP, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Only absolute http(s) and mailto links survive. A site-relative link is made
 * absolute (a relative URL in an inbox goes nowhere). Anything else, including
 * javascript: and data:, returns an empty string and the link is rendered as
 * plain text by the caller.
 */
function safeUrl(href: string | null | undefined): string {
	const raw = String(href ?? '').trim();
	if (!raw) return '';
	if (/^(https?:\/\/|mailto:)/i.test(raw)) return escapeHtml(raw);
	if (raw.startsWith('/')) return escapeHtml(SITE + raw);
	return '';
}

/* ─────────────────────────────── inline ─────────────────────────────── */

function inline(tokens: Token[] | undefined): string {
	if (!tokens) return '';
	let out = '';
	for (const token of tokens) {
		out += inlineOne(token);
	}
	return out;
}

function inlineOne(token: Token): string {
	switch (token.type) {
		case 'escape':
			return escapeHtml((token as Tokens.Escape).text);
		case 'text': {
			const t = token as Tokens.Text;
			return t.tokens ? inline(t.tokens) : escapeHtml(t.text);
		}
		case 'strong':
			return `<strong style="font-weight:700">${inline((token as Tokens.Strong).tokens)}</strong>`;
		case 'em':
			return `<em>${inline((token as Tokens.Em).tokens)}</em>`;
		case 'del':
			return `<s>${inline((token as Tokens.Del).tokens)}</s>`;
		case 'codespan':
			return (
				`<code style="font-family:${MONO_FONT};font-size:13px;background:#f4f3ef;` +
				`padding:2px 5px;border-radius:3px">${escapeHtml((token as Tokens.Codespan).text)}</code>`
			);
		case 'br':
			return '<br>';
		case 'link': {
			const t = token as Tokens.Link;
			const href = safeUrl(t.href);
			const text = inline(t.tokens) || escapeHtml(t.text);
			if (!href) return text;
			return `<a href="${href}" target="_blank" style="color:#111;text-decoration:underline">${text}</a>`;
		}
		case 'image': {
			const t = token as Tokens.Image;
			const src = safeUrl(t.href);
			if (!src || !/^https?:/i.test(t.href ?? '')) return escapeHtml(t.text ?? '');
			return (
				`<img src="${src}" alt="${escapeHtml(t.text ?? '')}" ` +
				`style="display:block;max-width:100%;height:auto;border:0;margin:16px 0">`
			);
		}
		// Raw HTML is never markup here: it is shown as the literal text typed.
		case 'html':
			return escapeHtml((token as Tokens.HTML).raw);
		default:
			return escapeHtml((token as { raw?: string }).raw ?? '');
	}
}

/* ─────────────────────────────── block ─────────────────────────────── */

function paragraph(html: string, bottom = 16): string {
	return `<p style="margin:0 0 ${bottom}px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:#111">${html}</p>`;
}

function listItems(token: Tokens.List): string {
	let out = '';
	for (const item of token.items) {
		const body = item.tokens?.length
			? item.tokens
					.map((child) =>
						child.type === 'text'
							? inline((child as Tokens.Text).tokens ?? [child])
							: block([child])
					)
					.join('')
			: escapeHtml(item.text);
		out += `<li style="margin:0 0 6px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:#111">${body}</li>`;
	}
	return out;
}

function block(tokens: Token[]): string {
	let out = '';
	for (const token of tokens) {
		switch (token.type) {
			case 'space':
				break;
			case 'paragraph':
				out += paragraph(inline((token as Tokens.Paragraph).tokens));
				break;
			case 'heading': {
				const t = token as Tokens.Heading;
				const size = t.depth <= 1 ? 22 : t.depth === 2 ? 18 : 16;
				out +=
					`<h${t.depth <= 2 ? 2 : 3} style="margin:26px 0 12px 0;font-family:${BODY_FONT};` +
					`font-size:${size}px;line-height:1.35;font-weight:600;color:#111">` +
					`${inline(t.tokens)}</h${t.depth <= 2 ? 2 : 3}>`;
				break;
			}
			case 'list': {
				const t = token as Tokens.List;
				const tag = t.ordered ? 'ol' : 'ul';
				const start = t.ordered && Number(t.start) > 1 ? ` start="${Number(t.start)}"` : '';
				out += `<${tag}${start} style="margin:0 0 16px 0;padding-left:22px">${listItems(t)}</${tag}>`;
				break;
			}
			case 'blockquote':
				out +=
					`<blockquote style="margin:0 0 16px 0;padding:2px 0 2px 16px;border-left:2px solid #e2e2e0;color:#555">` +
					`${block((token as Tokens.Blockquote).tokens)}</blockquote>`;
				break;
			case 'code':
				out +=
					`<pre style="margin:0 0 16px 0;padding:14px 16px;background:#f9f8f5;border-radius:6px;overflow-x:auto">` +
					`<code style="font-family:${MONO_FONT};font-size:13px;line-height:1.6;color:#111;white-space:pre-wrap">` +
					`${escapeHtml((token as Tokens.Code).text)}</code></pre>`;
				break;
			case 'hr':
				out +=
					'<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:20px 0">' +
					'<tr><td style="border-top:1px solid #e2e2e0;height:0;font-size:0;line-height:0">&nbsp;</td></tr></table>';
				break;
			case 'table': {
				const t = token as Tokens.Table;
				const head = t.header
					.map(
						(cell) =>
							`<th style="text-align:left;padding:8px 10px;border-bottom:1px solid #e2e2e0;` +
							`font-family:${BODY_FONT};font-size:13px;color:#666;font-weight:600">${inline(cell.tokens)}</th>`
					)
					.join('');
				const body = t.rows
					.map(
						(row) =>
							'<tr>' +
							row
								.map(
									(cell) =>
										`<td style="padding:8px 10px;border-bottom:1px solid #f0efec;` +
										`font-family:${BODY_FONT};font-size:14px;color:#111">${inline(cell.tokens)}</td>`
								)
								.join('') +
							'</tr>'
					)
					.join('');
				out +=
					`<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 18px 0">` +
					`<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
				break;
			}
			// A raw HTML block is shown as the literal text typed, never parsed.
			case 'html':
				out += paragraph(escapeHtml((token as Tokens.HTML).raw.trim()));
				break;
			case 'text': {
				const t = token as Tokens.Text;
				out += paragraph(t.tokens ? inline(t.tokens) : escapeHtml(t.text));
				break;
			}
			default:
				break;
		}
	}
	return out;
}

/** Render a markdown body to inline-styled, email-safe HTML. */
export function renderBodyHtml(markdown: string): string {
	const source = String(markdown ?? '');
	if (!source.trim()) return '';
	const tokens = marked.lexer(source, { gfm: true, breaks: true });
	return block(tokens);
}

/** Plain-text alternative, for clients that will not render HTML. */
export function renderBodyText(markdown: string): string {
	return String(markdown ?? '')
		.replace(/\r\n/g, '\n')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 ($2)')
		.replace(/\[([^\]]*)\]\(([^)]+)\)/g, '$1 ($2)')
		.trim();
}
