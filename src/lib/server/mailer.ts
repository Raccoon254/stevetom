/**
 * Axene Mailer: transactional email for kenTom.
 * Docs: https://axene.io/docs/mailer/sending/api
 *
 * Sending goes through the Axene REST API with AXENE_MAILER_API_KEY.
 * The HTML templates follow the Axene system-email style: white ground,
 * #111 text, Google Sans body, mono labels, hairline #e2e2e0 dividers,
 * dark buttons, table-based for legacy mail-client support.
 *
 * Verified senders (all forward to tomsteve187@gmail.com):
 *   i@kentom.co.ke         "KenTom HQ"
 *   me@kentom.co.ke        "KenTom HQ"
 *   partners@kentom.co.ke  "Kentom Partners"
 *   youtube@kentom.co.ke   "IAm Kentom"
 */
import { env } from '$env/dynamic/private';

const ENDPOINT = 'https://mail.axene.io/v1/emails/';

export type Addr = { email: string; name?: string };

export const SENDERS = {
	hq: { email: 'i@kentom.co.ke', name: 'KenTom HQ' } as Addr,
	partners: { email: 'partners@kentom.co.ke', name: 'Kentom Partners' } as Addr
};

/** Where internal notifications land: the only place the personal inbox is used. */
export const NOTIFY_TO: Addr = { email: 'tomsteve187@gmail.com', name: 'Steve Tom' };

/** Public-facing reply-to address (forwards to the inbox above). */
export const CONTACT: Addr = { email: 'me@kentom.co.ke', name: 'KenTom HQ' };

export type SendOptions = {
	from: Addr;
	to: Addr[];
	subject: string;
	html?: string;
	text?: string;
	replyTo?: Addr;
	tags?: string[];
	headers?: Record<string, string>;
};

/**
 * Send one email through Axene Mailer. Resolves with the queued message
 * info (202). Throws on a missing key or non-2xx response, so callers
 * decide whether an email failure is fatal.
 */
export async function sendEmail(opts: SendOptions): Promise<{ id?: string; status?: string }> {
	const key = env.AXENE_MAILER_API_KEY;
	if (!key) throw new Error('AXENE_MAILER_API_KEY is not configured');

	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from_: opts.from,
			to: opts.to,
			subject: opts.subject,
			...(opts.html ? { html: opts.html } : {}),
			...(opts.text ? { text: opts.text } : {}),
			...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
			...(opts.tags ? { tags: opts.tags } : {}),
			...(opts.headers ? { headers: opts.headers } : {})
		})
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Axene Mailer ${res.status}: ${body}`);
	}
	const queued = await res.json().catch(() => ({}));
	await recordQueued(opts, queued);
	return queued;
}

/**
 * Remember what we just handed to Axene, so the delivery webhook has something
 * to attribute an open, a bounce or a complaint to: the webhook payload carries
 * the message id but not the recipient or the tags.
 *
 * Best-effort by construction. The send has already succeeded by the time this
 * runs and every failure path here is swallowed, so a missing table, a cold
 * database or a duplicate id can never turn a delivered email into a thrown
 * error for the caller. Losing a row costs one message's worth of analytics.
 */
async function recordQueued(opts: SendOptions, queued: { id?: string; status?: string }) {
	try {
		const messageId = typeof queued?.id === 'string' ? queued.id.trim() : '';
		const recipient = opts.to[0]?.email?.trim().toLowerCase();
		if (!messageId || !recipient) return;

		const { prisma } = await import('$lib/db.js');
		await prisma.emailMessage.create({
			data: {
				messageId,
				recipient,
				subject: opts.subject || null,
				fromEmail: opts.from?.email?.toLowerCase() || null,
				tags: opts.tags ?? [],
				status: typeof queued?.status === 'string' ? queued.status : 'queued'
			}
		});
	} catch (error) {
		console.error('mailer: could not record queued message', error);
	}
}

/** Escape user-supplied text before placing it in an HTML email. */
export function esc(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/* ───────────────────────── template primitives ─────────────────────────
   Ported from the Axene system-email design (v3). */

const MAX_WIDTH = 560;

/*
 * Brand fonts, with the fallback doing the real work.
 *
 * Most mail clients strip web fonts: Gmail on every platform, Outlook on
 * Windows (it renders through Word), Yahoo and AOL all drop @font-face and any
 * stylesheet link. Apple Mail, iOS Mail, Outlook for Mac, Samsung Mail and
 * Thunderbird honour them. So Google Sans is requested for the clients that
 * will use it, and the stack behind it is chosen to look right on its own,
 * because that is what most recipients will actually see.
 *
 * The fallbacks are deliberately sans, not the old Georgia: falling back from a
 * geometric sans to a serif changes the look of the mail far more than the
 * difference between two sans faces.
 */
export const BODY_FONT =
	"'Google Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
export const HEADING_FONT =
	"'Google Sans Display','Google Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
export const MONO_FONT =
	"'Google Sans Mono','SFMono-Regular',Menlo,Consolas,'Courier New',monospace";

/** Only the clients that support web fonts ever fetch this. */
const FONT_STYLESHEET =
	'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700' +
	'&family=Google+Sans+Display:wght@400;500;700' +
	'&family=Google+Sans+Mono:wght@400;500&display=swap';
const LOGO_URL = 'https://stevetom.vercel.app/logo-dark.png';

/** Body paragraph. */
export function p(text: string, bottomMargin = 16): string {
	return `<p style="margin:0 0 ${bottomMargin}px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:#111">${text}</p>`;
}

/** Monospace label for technical / field info. */
export function label(text: string): string {
	return `<div style="font-family:${MONO_FONT};font-size:12px;color:#999;margin:0 0 4px 0;letter-spacing:.05em">${text}</div>`;
}

/** Display value. */
export function value(text: string, bottomMargin = 16): string {
	return `<div style="font-family:${BODY_FONT};font-size:15px;color:#111;line-height:1.6;margin:0 0 ${bottomMargin}px 0">${text}</div>`;
}

/** Label + value pair. */
export function labelValue(lbl: string, val: string): string {
	return label(lbl) + value(val);
}

/** Subtle line divider. */
export function divider(): string {
	return (
		'<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:20px 0">' +
		'<tr><td style="border-top:1px solid #e2e2e0;height:0;font-size:0;line-height:0">&nbsp;</td></tr></table>'
	);
}

/** Solid dark button. */
export function buttonDark(text: string, url: string): string {
	return (
		'<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:20px 0">' +
		'<tr><td bgcolor="#111" style="background:#111;border-radius:3px">' +
		`<a href="${url}" target="_blank" style="display:block;padding:12px 24px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#fff;text-decoration:none;text-align:center;letter-spacing:.05em">${text}</a>` +
		'</td></tr></table>'
	);
}

/** One-time-code block: large monospace code on a soft panel. */
export function otpBlock(code: string): string {
	return (
		`<div style="margin:22px 0;padding:24px;background:#f9f8f5;border-radius:6px;text-align:center">` +
		`<div style="font-family:${BODY_FONT};font-size:13px;color:#666;margin:0 0 14px">Your verification code</div>` +
		`<div style="font-family:${MONO_FONT};font-size:34px;font-weight:700;letter-spacing:9px;color:#111;padding-left:9px">${code}</div>` +
		`<div style="font-family:${BODY_FONT};font-size:12px;color:#999;margin-top:14px">Expires in 10 minutes. Don't share this code.</div>` +
		`</div>`
	);
}

/**
 * Master email template: dark kenTom logo, left-aligned content,
 * a subtle footer. `bodyHtml` is composed from the primitives above.
 */
export function renderEmail(opts: {
	title?: string;
	heading: string;
	bodyHtml: string;
	preheader?: string;
	footerNote?: string;
}): string {
	const docTitle = opts.title || opts.heading || 'kenTom';
	const preheader = opts.preheader
		? `<div style="display:none;font-size:0;color:#fff;opacity:0">${opts.preheader}</div>`
		: '';
	const footerNote =
		opts.footerNote || 'You received this email because you contacted kenTom.';

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${docTitle}</title>
<!--[if mso]>
<style type="text/css">table, td, div, h1, h2, p, a { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }</style>
<![endif]-->
<link href="${FONT_STYLESHEET}" rel="stylesheet" type="text/css">
<style>
@import url('${FONT_STYLESHEET}');
@media only screen and (max-width:600px){
  .content{width:100%!important;max-width:100%!important;padding:20px 16px!important;}
  h1{font-size:20px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:#fff;font-family:${BODY_FONT};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
${preheader}
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse">
<tr><td align="left" style="padding:40px 20px">
<table width="100%" cellpadding="0" cellspacing="0" border="0" class="content" style="max-width:${MAX_WIDTH}px;margin:0 auto;border-collapse:collapse">
<tr><td style="padding:0;font-family:${BODY_FONT};color:#111">
<img src="${LOGO_URL}" width="34" alt="kenTom" style="display:block;width:34px;height:auto;border:0;margin-bottom:20px">
<h1 style="margin:0 0 20px 0;font-family:${HEADING_FONT};font-size:24px;line-height:1.3;font-weight:600;color:#111">${opts.heading}</h1>
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:20px 0 0 0;border-top:1px solid #e2e2e0">
<p style="margin:0 0 12px 0;font-family:${BODY_FONT};font-size:13px">
<a href="https://www.kentom.co.ke" target="_blank" style="color:#111;text-decoration:underline;font-weight:500">kentom.co.ke</a>
</p>
<p style="margin:0;font-family:${BODY_FONT};font-size:12px;color:#999;line-height:1.6">${footerNote}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
