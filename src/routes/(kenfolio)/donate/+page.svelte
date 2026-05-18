<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	type Currency = 'KES' | 'USD';
	type Status = 'idle' | 'loading' | 'success' | 'error';

	const suggested: Record<Currency, number[]> = {
		KES: [100, 250, 500, 1000, 2500],
		USD: [5, 10, 25, 50, 100]
	};

	let currency: Currency = 'KES';
	let amount = 1000;
	let email = '';
	let status: Status = 'idle';
	let message = '';

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const ref = params.get('reference') || params.get('trxref');
		if (ref) {
			verify(ref);
			return;
		}
		try {
			const res = await fetch('https://ipapi.co/json/');
			const data = await res.json();
			if (data.country_code && data.country_code !== 'KE') {
				currency = 'USD';
				amount = 10;
			}
		} catch {
			/* default to KES */
		}
	});

	async function verify(reference: string) {
		status = 'loading';
		try {
			const res = await fetch(`/api/paystack-donations?reference=${reference}`);
			const data = await res.json();
			if (res.ok && data.status === 'success') {
				status = 'success';
				message = `Thank you for your ${data.currency} ${data.amount} gift. It goes straight into the work.`;
			} else {
				status = 'error';
				message = 'We could not verify that payment. If you were charged, please get in touch.';
			}
		} catch {
			status = 'error';
			message = 'Failed to verify the payment.';
		}
	}

	function pickCurrency(c: Currency) {
		currency = c;
		amount = c === 'KES' ? 1000 : 10;
	}

	async function donate() {
		if (status === 'loading') return;
		if (!email.includes('@')) {
			status = 'error';
			message = 'Enter a valid email address.';
			return;
		}
		if (!amount || amount < 1) {
			status = 'error';
			message = 'Enter an amount of at least 1.';
			return;
		}
		status = 'loading';
		message = '';
		try {
			const res = await fetch('/api/paystack-donations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount, email, currency })
			});
			const data = await res.json();
			if (res.ok && data.authorizationUrl) {
				window.location.href = data.authorizationUrl;
			} else {
				status = 'error';
				message = data.error || 'Failed to start the payment.';
			}
		} catch {
			status = 'error';
			message = 'Network error. Please try again.';
		}
	}
</script>

<svelte:head>
	<title>kenTom · Support</title>
	<meta name="description" content="Support Steve Tom's work with a one-off gift." />
</svelte:head>

<main class="page">
	<div class="support">
		<div class="eyebrow"><Icon name="heart" size={13} /> support</div>

		{#if status === 'success'}
			<h1>Thank you.</h1>
			<p class="lede">{message}</p>
			<div class="cta-row">
				<a class="pill pill--solid" href="/">
					<span>Back home</span>
					<span class="ar" aria-hidden="true"><Icon name="arrow-left" size={13} /></span>
				</a>
			</div>
		{:else}
			<h1>A one-off gift, <em>when the work earns it</em>.</h1>
			<p class="lede">
				No tiers, no pressure. If something here was useful, this goes straight back into tools,
				tutoring, and the next few things on the bench. For ongoing support, see
				<a class="inline-link" href="/partners">partners</a>.
			</p>

			<div class="seg" role="group" aria-label="Currency">
				<button class:on={currency === 'KES'} type="button" on:click={() => pickCurrency('KES')}
					>KES</button
				>
				<button class:on={currency === 'USD'} type="button" on:click={() => pickCurrency('USD')}
					>USD</button
				>
			</div>

			<div class="amounts">
				{#each suggested[currency] as a}
					<button
						type="button"
						class="amt"
						class:on={amount === a}
						on:click={() => (amount = a)}>{currency === 'KES' ? '' : '$'}{a}</button
					>
				{/each}
			</div>

			<div class="field">
				<label for="amount">Amount ({currency})</label>
				<input id="amount" type="number" min="1" bind:value={amount} />
			</div>
			<div class="field">
				<label for="email">Email — for the receipt</label>
				<input id="email" type="email" autocomplete="email" bind:value={email} placeholder="your@email" />
			</div>

			{#if status === 'error'}
				<p class="err">{message}</p>
			{/if}

			<div class="cta-row">
				<button class="pill pill--solid" type="button" on:click={donate} disabled={status === 'loading'}>
					<span>{status === 'loading' ? 'Redirecting' : 'Continue to payment'}</span>
					<span class="ar" aria-hidden="true"><Icon name="export-arrow" size={13} /></span>
				</button>
				<span class="alt">secured by Paystack</span>
			</div>
		{/if}
	</div>
</main>

<style>
	.page {
		place-items: center !important;
	}
	.support {
		width: 100%;
		max-width: 600px;
	}
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 clamp(20px, 4vh, 32px);
	}
	.eyebrow :global(svg) {
		stroke-width: 1.5;
	}
	h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(32px, 4.6vw, 56px);
		line-height: 1.08;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(16px, 3vh, 24px);
		text-wrap: balance;
	}
	h1 em {
		font-style: normal;
		color: var(--mute);
	}
	.lede {
		font-size: clamp(16px, 1.5vw, 19px);
		line-height: 1.55;
		color: var(--ink-2);
		margin: 0 0 clamp(32px, 5vh, 44px);
		text-wrap: pretty;
	}
	.inline-link {
		color: var(--ink);
		border-bottom: 1px solid var(--mute-2);
	}
	.inline-link:hover {
		color: var(--spark);
		border-color: var(--spark);
	}

	/* currency segmented toggle */
	.seg {
		display: inline-flex;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		padding: 3px;
		margin: 0 0 20px;
	}
	.seg button {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
		background: transparent;
		border: none;
		padding: 8px 18px;
		border-radius: 999px;
		cursor: pointer;
		transition: color 0.2s, background 0.2s;
	}
	.seg button.on {
		color: var(--bg);
		background: var(--ink);
	}

	/* amount pills */
	.amounts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0 0 clamp(24px, 4vh, 32px);
	}
	.amt {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		color: var(--ink-2);
		background: transparent;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		padding: 9px 16px;
		cursor: pointer;
		transition: color 0.2s, border-color 0.2s, background 0.2s;
	}
	.amt:hover {
		border-color: var(--mute);
	}
	.amt.on {
		color: var(--ink);
		border-color: var(--spark);
		background: rgba(var(--bg-rgb), 0.6);
	}

	.field {
		display: grid;
		gap: 6px;
		margin-bottom: clamp(18px, 2.4vh, 24px);
	}
	.field label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.field input {
		font: inherit;
		font-family: var(--sans);
		font-size: 18px;
		color: var(--ink);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--hairline-2);
		padding: 9px 0;
		width: 100%;
		outline: none;
		transition: border-color 0.25s;
	}
	.field input::placeholder {
		color: var(--mute);
	}
	.field input:focus {
		border-bottom-color: var(--ink-2);
	}

	.err {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--spark);
		margin: 4px 0 0;
	}

	.cta-row {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
		margin-top: clamp(28px, 4vh, 40px);
	}
	.cta-row button {
		font: inherit;
		cursor: pointer;
	}
	.cta-row button:disabled {
		cursor: progress;
		opacity: 0.7;
	}
	.alt {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
	}
</style>
