/**
 * Axene Mailer — transactional email for kenTom.
 * Docs: https://axene.io/docs/mailer/sending/api
 *
 * Sending goes through the Axene REST API with AXENE_MAILER_API_KEY.
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

/** Where internal notifications land. */
export const NOTIFY_TO: Addr = { email: 'tomsteve187@gmail.com', name: 'Steve Tom' };

export type SendOptions = {
	from: Addr;
	to: Addr[];
	subject: string;
	html?: string;
	text?: string;
	replyTo?: Addr;
	tags?: string[];
};

/**
 * Send one email through Axene Mailer. Resolves with the queued message
 * info (202). Throws on a missing key or a non-2xx response — callers
 * should decide whether an email failure is fatal.
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
			...(opts.tags ? { tags: opts.tags } : {})
		})
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Axene Mailer ${res.status}: ${body}`);
	}
	return res.json().catch(() => ({}));
}

/** Escape user-supplied text before placing it in an HTML email. */
export function esc(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Wrap body content in the shared kenTom email shell. */
export function emailShell(heading: string, inner: string): string {
	return `<!doctype html>
<html>
<body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#0e110f;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6a8a82;margin-bottom:18px;">kenTom</div>
    <h1 style="font-size:22px;font-weight:600;margin:0 0 18px;line-height:1.25;">${heading}</h1>
    ${inner}
    <div style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(14,17,15,.12);font-size:12px;color:#6a8a82;">
      kentom.co.ke
    </div>
  </div>
</body>
</html>`;
}
