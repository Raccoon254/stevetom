import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { newCode, makeToken } from '$lib/server/otp';
import { sendEmail, renderEmail, p, otpBlock, SENDERS } from '$lib/server/mailer';
import { EMAIL_TAGS } from '$lib/emailTags';

/** Step 1: issue a verification code to the email on a contact/quote form. */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const email = String(data.email || '').trim();
		if (!email.includes('@') || email.length < 5) {
			return json({ success: false, error: 'Enter a valid email address.' }, { status: 400 });
		}

		const code = newCode();
		const token = makeToken(email, code, data);

		await sendEmail({
			from: SENDERS.hq,
			to: [{ email }],
			subject: 'Your kenTom verification code',
			tags: [EMAIL_TAGS.OTP, 'verification'],
			html: renderEmail({
				heading: 'Confirm your email',
				preheader: `Your code is ${code}`,
				footerNote:
					'This address was entered on kentom.co.ke. If that was not you, you can ignore this email.',
				bodyHtml:
					p('Enter this code on the page to confirm I can reach you at this address:') +
					otpBlock(code)
			})
		});

		return json({ success: true, token });
	} catch (error) {
		console.error('verify/start failed:', error);
		return json(
			{ success: false, error: 'Could not send the code. Please try again.' },
			{ status: 500 }
		);
	}
};
