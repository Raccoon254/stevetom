<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { trackEvent } from '$lib/analytics';
	import type { PageData } from './$types';

	export let data: PageData;

	$: d = data.donation;
	$: s = data.sponsor;

	// Ties the receipt back to the visit that produced it, so the funnel in the
	// admin dashboard can see the whole journey rather than a payment appearing
	// from nowhere.
	onMount(() => {
		if (data.outcome === 'success') trackEvent('donation.thank_you.viewed');
	});

	function money(amount: number, currency: string): string {
		try {
			return new Intl.NumberFormat('en-KE', {
				style: 'currency',
				currency,
				maximumFractionDigits: 2
			}).format(amount);
		} catch {
			return `${currency} ${amount.toFixed(2)}`;
		}
	}

	const TIER_LABEL: Record<string, string> = {
		SUPPORTER: 'Supporter',
		STANDARD: 'Standard',
		WORKSHOP: 'Workshop',
		CUSTOM: 'Custom'
	};
</script>

<Seo
	title="Thank you"
	description="Your support has been received."
	path="/thank-you"
	noindex={true}
	breadcrumbs={[{ name: 'Thank you', path: '/thank-you' }]}
/>

<div class="page">
	<div class="wrap">
		{#if data.outcome === 'success'}
			<div class="mark ok"><Icon name="tick-circle" size={22} /></div>
			<h1>Thank you.</h1>
			<p class="lede">
				That went through, and it goes straight into tools, tutoring, and the open-source work.
			</p>

			{#if d}
				<dl class="receipt">
					<div>
						<dt>Amount</dt>
						<dd>
							{money(d.amount, d.currency)}
							{#if d.originalCurrency && d.originalCurrency !== d.currency && d.originalAmount}
								<span class="sub">charged as {money(d.originalAmount, d.originalCurrency)}</span>
							{/if}
						</dd>
					</div>
					<div>
						<dt>Type</dt>
						<dd>{d.cadence === 'RECURRING' ? 'Monthly' : 'One-time'}</dd>
					</div>
					{#if d.reference}
						<div>
							<dt>Reference</dt>
							<dd><code>{d.reference}</code></dd>
						</div>
					{/if}
				</dl>
				<p class="note">A receipt is on its way to the address you paid with.</p>
			{/if}

			{#if s?.listed}
				<div class="panel">
					<p class="panel-title">You are on the partners page.</p>
					<p>
						Listed as <strong>{s.displayName}</strong> at the {TIER_LABEL[s.tier] ?? s.tier} tier.
						{#if s.expiresAt}
							Your listing runs to {new Date(s.expiresAt).toLocaleDateString('en-GB', {
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							})}.
						{/if}
					</p>
					<a class="pill" href="/partners/{s.slug}">
						<span>See your page</span>
						<span class="ar" aria-hidden="true"><Icon name="arrow-right4" size={14} /></span>
					</a>
				</div>
			{:else if s?.pendingReview}
				<div class="panel">
					<p class="panel-title">Your listing is being checked.</p>
					<p>It appears on the partners page once it has been looked at. Nothing else is needed from you.</p>
				</div>
			{/if}

			<div class="onward">
				<a href="/partners">Partners</a>
				<a href="/blog">Notes</a>
				<a href="/">Home</a>
			</div>
		{:else if data.outcome === 'pending'}
			<div class="mark wait"><Icon name="clock" size={22} /></div>
			<h1>Still confirming.</h1>
			<p class="lede">
				Your bank has not confirmed this one settled yet. Nothing is wrong and there is
				nothing to do: it usually lands within a minute or two, and the receipt follows once it
				does. You will not be charged twice.
			</p>
			<div class="onward"><a href="/">Home</a></div>
		{:else if data.outcome === 'failed'}
			<div class="mark bad"><Icon name="close-circle" size={22} /></div>
			<h1>That did not go through.</h1>
			<p class="lede">The payment was not completed, so you have not been charged.</p>
			<div class="onward">
				<a href="/donate">Try again</a>
				<a href="/contact">Get in touch</a>
			</div>
		{:else}
			<div class="mark wait"><Icon name="info-circle" size={22} /></div>
			<h1>Nothing to show here.</h1>
			<p class="lede">
				This page confirms a payment, and there is no reference on it. If you have just paid and
				landed here, your receipt will still reach you by email.
			</p>
			<div class="onward">
				<a href="/donate">Support</a>
				<a href="/">Home</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.wrap {
		max-width: 560px;
	}
	.mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.25));
		margin-bottom: 22px;
	}
	.mark.ok {
		color: var(--spark);
	}
	.mark.bad,
	.mark.wait {
		color: var(--mute);
	}
	h1 {
		font-size: clamp(30px, 5vw, 44px);
		line-height: 1.05;
		letter-spacing: -0.02em;
		margin: 0 0 14px;
		color: var(--ink);
	}
	.lede {
		font-size: 16px;
		line-height: 1.6;
		color: var(--ink-2);
		margin: 0 0 30px;
		max-width: 46ch;
	}
	.receipt {
		display: grid;
		gap: 1px;
		background: var(--hairline, rgba(127, 127, 127, 0.2));
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.2));
		border-radius: 10px;
		overflow: hidden;
		margin: 0 0 14px;
	}
	.receipt > div {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 18px;
		padding: 14px 16px;
		background: var(--bg);
	}
	dt {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	dd {
		margin: 0;
		text-align: right;
		color: var(--ink);
		font-size: 15px;
	}
	dd .sub {
		display: block;
		font-size: 12px;
		color: var(--mute);
		margin-top: 3px;
	}
	code {
		font-family: var(--mono);
		font-size: 12px;
		color: var(--ink-2);
		word-break: break-all;
	}
	.note {
		font-size: 13px;
		color: var(--mute);
		margin: 0 0 30px;
	}
	.panel {
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.25));
		border-radius: 10px;
		padding: 20px;
		margin: 0 0 30px;
	}
	.panel-title {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 10px;
	}
	.panel p {
		margin: 0 0 14px;
		color: var(--ink-2);
		font-size: 15px;
		line-height: 1.6;
	}
	.panel strong {
		color: var(--ink);
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 9px 16px;
		border-radius: 999px;
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.3));
		color: var(--ink);
		text-decoration: none;
		font-size: 14px;
	}
	.pill:hover {
		border-color: var(--ink-2);
	}
	.ar {
		display: inline-flex;
		line-height: 0;
	}
	.onward {
		display: flex;
		flex-wrap: wrap;
		gap: 22px;
		padding-top: 26px;
		border-top: 1px solid var(--hairline, rgba(127, 127, 127, 0.2));
	}
	.onward a {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
		text-decoration: none;
	}
	.onward a:hover {
		color: var(--ink);
	}
</style>
