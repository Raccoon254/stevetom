import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize transaction endpoint
export const POST: RequestHandler = async ({ request }) => {
  const { amount, email, currency } = await request.json();

  if (!amount || isNaN(amount) || amount < 1) {
    return json({ error: 'Invalid donation amount.' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return json({ error: 'Valid email is required.' }, { status: 400 });
  }

  // Paystack (this account) only settles in KES. USD donations are converted
  // at today's live rate before the charge; the original USD amount and the
  // rate used are kept on the donation record.
  const originalCurrency: string = currency || 'KES';
  let kesAmount = amount;
  let fxRate: number | null = null;

  if (originalCurrency === 'USD') {
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const fxData = await fxRes.json();
      const rate = fxData?.rates?.KES;
      if (!fxRes.ok || typeof rate !== 'number' || rate <= 0) {
        throw new Error('Bad exchange-rate response');
      }
      fxRate = rate;
      kesAmount = Math.round(amount * rate);
    } catch (fxErr) {
      console.error('USD to KES conversion failed:', fxErr);
      return json(
        { error: 'Could not get an exchange rate, please try again.' },
        { status: 502 }
      );
    }
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
        amount: Math.round(kesAmount * 100), // Paystack expects the amount in kobo
        currency: 'KES',
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

    if (!response.ok || !data.status) {
      return json({ error: data.message || 'Failed to initialize payment.' }, { status: 500 });
    }

    // Create donation record in database. `amount`/`currency` reflect what is
    // actually charged (KES); the original USD figure and FX rate are kept in
    // metadata for reconciliation.
    await prisma.donation.create({
      data: {
        email,
        amount: kesAmount,
        currency: 'KES',
        paystackReference: data.data.reference,
        status: 'PENDING',
        metadata: JSON.stringify({
          accessCode: data.data.access_code,
          authorizationUrl: data.data.authorization_url,
          originalCurrency,
          originalAmount: amount,
          fxRate
        })
      }
    });

    return json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code
    });
  } catch (err: any) {
    console.error('Paystack donation error:', err);
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

    if (!response.ok || !data.status) {
      return json({ error: data.message || 'Verification failed.' }, { status: 500 });
    }

    // Update donation status in database
    const transactionStatus = data.data.status;
    let donationStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED' = 'PENDING';

    if (transactionStatus === 'success') {
      donationStatus = 'SUCCESS';
    } else if (transactionStatus === 'failed') {
      donationStatus = 'FAILED';
    } else if (transactionStatus === 'abandoned') {
      donationStatus = 'CANCELLED';
    }

    await prisma.donation.update({
      where: {
        paystackReference: reference
      },
      data: {
        status: donationStatus,
        metadata: JSON.stringify({
          verificationData: data.data,
          verifiedAt: new Date().toISOString()
        })
      }
    });

    return json({
      status: data.data.status,
      amount: data.data.amount / 100, // Convert from kobo to major units
      currency: data.data.currency,
      email: data.data.customer.email,
      reference: data.data.reference
    });
  } catch (err: any) {
    console.error('Verification error:', err);
    return json({ error: err.message || 'Verification error.' }, { status: 500 });
  }
};
