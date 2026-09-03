import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import { prisma } from '$lib/db.js';
import { CONVERSIONS, recordEvent } from '$lib/server/analytics';
import { ensurePlan } from '$lib/server/paystackPlans';

// Initialize transaction endpoint
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const { amount, email, currency, sessionId, visitorId, sponsor, cadence } = await request.json();
  const wantsRecurring = cadence === 'RECURRING';

  // Who they are and whether they want to be seen. All optional: a plain
  // donation carries none of it. `listed` is the consent flag, and it is opt-in
  // by construction, because publishing someone's name because they paid is not
  // consent.
  const s = (sponsor ?? {}) as Record<string, unknown>;
  const text = (v: unknown, max = 120): string | null =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

  const sponsorMeta = {
    displayName: text(s.displayName, 80),
    orgName: text(s.orgName, 80),
    websiteUrl: text(s.websiteUrl, 200),
    logoUrl: text(s.logoUrl, 300),
    blurb: text(s.blurb, 160),
    visibility: s.listed === true ? 'PUBLIC' : s.anonymous === true ? 'ANONYMOUS' : 'PRIVATE'
  };

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
  let usdAmount: number | null = originalCurrency === 'USD' ? amount : null;

  // The rate is fetched for both directions, not just USD donations. Sponsor
  // tiers are priced in USD, so every donation needs a USD figure recorded at
  // the time of the charge. Deriving it later from a moving rate would silently
  // reclassify past sponsors.
  if (originalCurrency === 'USD' || originalCurrency === 'KES') {
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const fxData = await fxRes.json();
      const rate = fxData?.rates?.KES;
      if (!fxRes.ok || typeof rate !== 'number' || rate <= 0) {
        throw new Error('Bad exchange-rate response');
      }
      fxRate = rate;
      if (originalCurrency === 'USD') {
        kesAmount = Math.round(amount * rate);
      } else {
        usdAmount = Number((amount / rate).toFixed(2));
      }
    } catch (fxErr) {
      console.error('exchange rate lookup failed:', fxErr);
      // A KES donation does not need the rate to be charged correctly, so only
      // a USD donation is blocked here. Losing the USD figure on a KES gift is
      // recoverable; refusing the payment is not.
      if (originalCurrency === 'USD') {
        return json(
          { error: 'Could not get an exchange rate, please try again.' },
          { status: 502 }
        );
      }
    }
  }

  // A subscription needs a Plan attached at initialisation. Without one the
  // charge happens exactly once, so "monthly" would be a false promise.
  let planCode: string | null = null;
  if (wantsRecurring) {
    planCode = await ensurePlan(kesAmount, 'monthly');
  }
  const isRecurring = wantsRecurring && Boolean(planCode);

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
        // Points at a page that reports what actually happened. The old
        // /donate?success=true claimed success for anyone who reached the URL,
        // including someone who abandoned checkout and pressed back. Paystack
        // appends ?reference= and ?trxref= to this.
        callback_url: `${process.env.ORIGIN || 'http://localhost:5173'}/thank-you`,
        ...(planCode ? { plan: planCode } : {}),
        metadata: {
          // Read back by the webhook on charge.success. Paystack echoes
          // metadata verbatim, so this is how the listing details survive the
          // round trip through the checkout without us holding a half-finished
          // sponsor row for someone who never pays.
          sponsor: sponsorMeta,
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
        provider: 'PAYSTACK',
        cadence: isRecurring ? 'RECURRING' : 'ONE_TIME',
        // Promoted out of the metadata blob into real columns so they can be
        // queried and indexed rather than JSON-parsed row by row.
        usdAmount,
        fxRate,
        originalAmount: amount,
        originalCurrency,
        // Which visit produced this. Never required, see the schema comment.
        sessionId: typeof sessionId === 'string' ? sessionId.slice(0, 64) : null,
        visitorId: typeof visitorId === 'string' ? visitorId.slice(0, 64) : null,
        metadata: JSON.stringify({
          accessCode: data.data.access_code,
          authorizationUrl: data.data.authorization_url
        })
      }
    });

    await recordEvent({
      name: CONVERSIONS.DONATION_STARTED,
      path: '/donate',
      value: usdAmount,
      currency: 'USD',
      sessionId: typeof sessionId === 'string' ? sessionId : null
    });

    return json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
      // If a plan was wanted but could not be created, this comes back false and
      // the caller must not tell the sponsor they set up a monthly payment.
      recurring: isRecurring
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

    // Merge rather than replace. The old code overwrote metadata wholesale,
    // destroying the access code and authorization URL recorded when the
    // charge was created, so a donation could never be reconciled afterwards.
    const current = await prisma.donation.findUnique({
      where: { paystackReference: reference },
      select: { id: true, metadata: true, status: true }
    });

    let existingMeta: Record<string, unknown> = {};
    if (current?.metadata) {
      try {
        const parsed = JSON.parse(current.metadata);
        if (parsed && typeof parsed === 'object') existingMeta = parsed;
      } catch {
        existingMeta = {};
      }
    }

    if (current) {
      await prisma.donation.update({
        where: { id: current.id },
        data: {
          status: donationStatus,
          metadata: JSON.stringify({
            ...existingMeta,
            verifiedAt: new Date().toISOString(),
            channel: data.data?.channel ?? null,
            paidAt: data.data?.paid_at ?? null
          })
        }
      });
    }

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
