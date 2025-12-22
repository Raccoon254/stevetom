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

    if (!response.ok || !data.status) {
      return json({ error: data.message || 'Failed to initialize payment.' }, { status: 500 });
    }

    // Create donation record in database
    await prisma.donation.create({
      data: {
        email,
        amount,
        currency: currency || 'KES',
        paystackReference: data.data.reference,
        status: 'PENDING',
        metadata: JSON.stringify({
          accessCode: data.data.access_code,
          authorizationUrl: data.data.authorization_url
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
