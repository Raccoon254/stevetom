import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import fs from 'fs';
import path from 'path';

// Debug: Log if key is loaded (first 10 chars only for security)
console.log('Paystack key loaded:', PAYSTACK_SECRET_KEY ? `${PAYSTACK_SECRET_KEY.substring(0, 10)}...` : 'NOT FOUND');

function logDonationEvent(event: string, details: any) {
  const logMsg = `[${new Date().toISOString()}] PAYSTACK ${event}: ${JSON.stringify(details)}\n`;
  console.log(logMsg);
  const logPath = path.resolve(process.cwd(), 'donation.log');
  fs.appendFileSync(logPath, logMsg);
}

// Initialize transaction endpoint
export const POST: RequestHandler = async ({ request }) => {
  const { amount, email, currency } = await request.json();

  logDonationEvent('Received donation request', { amount, email, currency });

  if (!amount || isNaN(amount) || amount < 1) {
    logDonationEvent('Invalid donation amount', { amount });
    return json({ error: 'Invalid donation amount.' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    logDonationEvent('Invalid email', { email });
    return json({ error: 'Valid email is required.' }, { status: 400 });
  }

  try {
    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in kobo (cents)
        currency: currency || 'KES',
        callback_url: `${process.env.ORIGIN || 'http://localhost:5173'}/donate?success=true`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Donation Type',
              variable_name: 'donation_type',
              value: 'Support Donation'
            }
          ]
        }
      })
    });

    const data = await response.json();

    logDonationEvent('Paystack initialization response', data);

    if (!response.ok || !data.status) {
      logDonationEvent('Paystack initialization failed', data);
      return json({ error: data.message || 'Failed to initialize payment.' }, { status: 500 });
    }

    return json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code
    });
  } catch (err: any) {
    logDonationEvent('Paystack error', { error: err.message, stack: err.stack });
    return json({ error: err.message || 'Payment initialization error.' }, { status: 500 });
  }
};

// Verify transaction endpoint
export const GET: RequestHandler = async ({ url }) => {
  const reference = url.searchParams.get('reference');

  if (!reference) {
    return json({ error: 'Transaction reference is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    logDonationEvent('Paystack verification response', data);

    if (!response.ok || !data.status) {
      return json({ error: data.message || 'Verification failed.' }, { status: 500 });
    }

    return json({
      status: data.data.status,
      amount: data.data.amount / 100, // Convert from kobo to major units
      currency: data.data.currency,
      email: data.data.customer.email,
      reference: data.data.reference
    });
  } catch (err: any) {
    logDonationEvent('Verification error', { error: err.message });
    return json({ error: err.message || 'Verification error.' }, { status: 500 });
  }
};
