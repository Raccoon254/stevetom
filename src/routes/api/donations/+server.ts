import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import paypal from '@paypal/checkout-server-sdk';
import fs from 'fs';
import path from 'path';

// TODO: Consider switching to @paypal/paypal-server-sdk as recommended by npm warning for future-proofing.

const clientId = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

function environment() {
  // Always pass strings, never undefined
  return process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId || '', clientSecret || '')
    : new paypal.core.SandboxEnvironment(clientId || '', clientSecret || '');
}

const paypalClient = new paypal.core.PayPalHttpClient(environment());

function logDonationEvent(event: string, details: any) {
  const logMsg = `[${new Date().toISOString()}] ${event}: ${JSON.stringify(details)}\n`;
  // Log to terminal
  console.log(logMsg);
  // Log to file
  const logPath = path.resolve(process.cwd(), 'donation.log');
  fs.appendFileSync(logPath, logMsg);
}

export const POST: RequestHandler = async ({ request }) => {
  const { amount, email } = await request.json();
  logDonationEvent('Received donation request', { amount, email });
  if (!amount || isNaN(amount) || amount < 1) {
    logDonationEvent('Invalid donation amount', { amount });
    return json({ error: 'Invalid donation amount.' }, { status: 400 });
  }

  const requestBody = {
    intent: 'CAPTURE', // Use string literal instead of SDK enum
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        },
        custom_id: email || undefined
      }
    ],
    application_context: {
      brand_name: 'Your Project',
      user_action: 'PAY_NOW',
      return_url: 'http://localhost:5173/api/donations/complete',
      cancel_url: 'http://localhost:5173/api/donations/cancel'
    }
  };

  logDonationEvent('Creating PayPal order', requestBody);
  const orderRequest = new paypal.orders.OrdersCreateRequest();
  orderRequest.requestBody(requestBody);

  try {
    const response = await paypalClient.execute(orderRequest);
    logDonationEvent('PayPal order response', response.result);
    const approvalUrl = response.result.links.find((l: any) => l.rel === 'approve')?.href;
    if (!approvalUrl) {
      logDonationEvent('Missing approval URL', response.result.links);
      return json({ error: 'Could not get PayPal approval URL.' }, { status: 500 });
    }
    logDonationEvent('Returning approval URL', { approvalUrl });
    return json({ approvalUrl });
  } catch (err: any) {
    logDonationEvent('PayPal error', { error: err.message, stack: err.stack });
    return json({ error: err.message || 'PayPal error.' }, { status: 500 });
  }
};
