<script lang="ts">
	import { sessionId, visitorId } from '$lib/analytics';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	type Currency = 'KES' | 'USD';
	type Status = 'idle' | 'loading' | 'success' | 'error';

	const suggested: Record<Currency, number[]> = {
		KES: [100, 250, 500, 1000, 2500],
		USD: [5, 10, 25, 50, 100]
	};

	let currency: Currency = 'USD';
	let amount = 10;
	let email = '';

	// Listing details. Off by default: a donation is a donation, and appearing
	// on the partners page is a separate, explicit choice.
	let listed = false;
	let anonymous = false;
	let displayName = '';
	let orgName = '';
	let websiteUrl = '';
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
			if (data.country_code === 'KE') {
				currency = 'KES';
				amount = 1000;
			}
		} catch {
			/* default to USD */
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
				body: JSON.stringify({
					amount,
					email,
					currency,
					// Ties the payment to the visit that produced it.
					sessionId: sessionId(),
					visitorId: visitorId(),
					sponsor: {
						listed,
						anonymous,
						displayName: displayName || null,
						orgName: orgName || null,
						websiteUrl: websiteUrl || null
					}
				})
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

<Seo
	title="Support"
	description="Support Steve Tom's work with a one-off gift that goes straight back into tools, tutoring, and open-source."
	path="/donate"
	breadcrumbs={[{ name: 'Support', path: '/donate' }]}
/>

<main class="page">
	<div class="support">
		<div class="eyebrow"><Icon name="heart" size={13} /> support</div>

		{#if status === 'success'}
			<h1>Thank you.</h1>
			<p class="lede">{message}</p>
			<div class="cta-row">
				<a class="pill pill--solid" href="/">
					<span>Back home</span>
					<span class="ar" aria-hidden="true"><Icon name="home" size={14} /></span>
				</a>
			</div>
		{:else}
			<div class="body">
				<!-- intro -->
				<div class="intro">
					<h1>A one-off gift, <em>when the work earns it</em>.</h1>
					<p class="lede">
						No tiers, no pressure. If something here was useful, this goes straight back into
						tools, tutoring, and the next few things on the bench.
					</p>
					<ul class="goes">
						<li><Icon name="code" size={15} /> Open-source upkeep</li>
						<li><Icon name="book" size={15} /> SkillKenya tutoring</li>
						<li><Icon name="cpu" size={15} /> Infra &amp; tools</li>
					</ul>
					<p class="ongoing">
						Looking to support long-term? See <a class="inline-link" href="/partners">partners</a>.
					</p>
				</div>

				<!-- donation card -->
				<div class="card">
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
						<div class="amount-input">
							<span class="cur">{currency === 'KES' ? 'KSh' : '$'}</span>
							<input id="amount" type="number" min="1" bind:value={amount} />
						</div>
						{#if currency === 'USD'}
							<p class="fx-note">Charged in KES at today's exchange rate, via Paystack.</p>
						{/if}
					</div>
					<div class="field">
						<label for="email">Email for the receipt</label>
						<input
							id="email"
							type="email"
							autocomplete="email"
							bind:value={email}
							placeholder="your@email"
						/>
					</div>

					<div class="listing">
						<label class="check">
							<input type="checkbox" bind:checked={listed} />
							<span>List me on the partners page</span>
						</label>

						{#if listed}
							<div class="field">
								<label for="displayName">Name to show</label>
								<input
									id="displayName"
									type="text"
									bind:value={displayName}
									placeholder="Your name or your brand"
								/>
							</div>
							<div class="field">
								<label for="orgName">Company (optional)</label>
								<input id="orgName" type="text" bind:value={orgName} placeholder="Acme Ltd" />
							</div>
							<div class="field">
								<label for="websiteUrl">Link (optional)</label>
								<input
									id="websiteUrl"
									type="url"
									bind:value={websiteUrl}
									placeholder="https://example.com"
								/>
							</div>
							<label class="check">
								<input type="checkbox" bind:checked={anonymous} />
								<span>Show me as Anonymous instead</span>
							</label>
							<p class="listing-note">
								Listings start at $25 one-off. Below that you are thanked, not listed. A logo
								needs the Workshop tier. You can ask to be removed at any time.
							</p>
						{/if}
					</div>

					{#if status === 'error'}
						<p class="err">{message}</p>
					{/if}

					<button
						class="pill pill--solid give"
						type="button"
						on:click={donate}
						disabled={status === 'loading'}
					>
						<span>{status === 'loading' ? 'Redirecting' : 'Continue to payment'}</span>
						<span class="ar" aria-hidden="true"><Icon name="card-send" size={15} /></span>
					</button>
					<span class="secured"><Icon name="shield-tick" size={13} /> Secured by Paystack</span>
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	.support {
		width: 100%;
		max-width: var(--page-w);
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
		font-size: clamp(32px, 4.6vw, 52px);
		line-height: 1.08;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(16px, 3vh, 22px);
		text-wrap: balance;
	}
	h1 em {
		font-style: normal;
		color: var(--mute);
	}
	.lede {
		font-size: clamp(16px, 1.5vw, 18px);
		line-height: 1.55;
		color: var(--ink-2);
		margin: 0 0 clamp(24px, 4vh, 32px);
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

	/* two-column body */
	.body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(32px, 5vw, 64px);
		align-items: start;
	}

	/* intro column */
	.goes {
		list-style: none;
		padding: 0;
		margin: 0 0 clamp(22px, 3.5vh, 30px);
		display: grid;
		gap: 12px;
	}
	.goes li {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-2);
	}
	.goes li :global(svg) {
		color: var(--spark);
		flex: 0 0 auto;
	}
	.ongoing {
		font-size: 14px;
		line-height: 1.5;
		color: var(--mute);
		margin: 0;
	}

	/* donation card */
	.card {
		border: 1px solid var(--hairline-2);
		border-radius: 16px;
		padding: clamp(22px, 3vw, 32px);
		background: rgba(var(--bg-rgb), 0.4);
	}

	/* currency segmented toggle */
	.seg {
		display: flex;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		padding: 3px;
		margin: 0 0 18px;
	}
	.seg button {
		flex: 1;
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

	/* amount grid */
	.amounts {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin: 0 0 clamp(20px, 3vh, 26px);
	}
	.amt {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		color: var(--ink-2);
		background: transparent;
		border: 1px solid var(--hairline-2);
		border-radius: 10px;
		padding: 12px 8px;
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
		margin-bottom: clamp(16px, 2.4vh, 20px);
	}
	.field label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.listing {
		border-top: 1px solid var(--hairline, rgba(127, 127, 127, 0.2));
		margin-top: 6px;
		padding-top: 16px;
		display: grid;
		gap: 12px;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 14px;
		color: var(--ink-2);
		cursor: pointer;
	}
	.check input {
		width: 16px;
		height: 16px;
		accent-color: var(--spark);
		flex: 0 0 auto;
	}
	.listing-note {
		font-size: 12px;
		line-height: 1.55;
		color: var(--mute);
		margin: 2px 0 0;
	}
	.amount-input {
		display: flex;
		align-items: baseline;
		gap: 8px;
		border-bottom: 1px solid var(--hairline-2);
		transition: border-color 0.25s;
	}
	.amount-input:focus-within {
		border-bottom-color: var(--spark);
	}
	.amount-input .cur {
		font-family: var(--mono);
		font-size: 13px;
		color: var(--mute);
		flex: 0 0 auto;
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
	.amount-input input {
		border-bottom: none;
	}
	.field input::placeholder {
		color: var(--mute);
	}
	.field input:focus {
		border-bottom-color: var(--spark);
	}

	.err {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--error);
		margin: 6px 0 0;
	}

	.fx-note {
		font-size: 12px;
		line-height: 1.45;
		color: var(--mute);
		margin: 8px 0 0;
	}

	.give {
		width: 100%;
		justify-content: center;
		margin-top: 14px;
		font: inherit;
		cursor: pointer;
	}
	.give:disabled {
		cursor: progress;
		opacity: 0.7;
	}
	.secured {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin-top: 14px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.secured :global(svg) {
		color: var(--mute);
	}

	/* success-state cta */
	.cta-row {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
		margin-top: clamp(28px, 4vh, 40px);
	}

	@media (max-width: 720px) {
		.body {
			grid-template-columns: 1fr;
			gap: clamp(28px, 5vh, 40px);
		}
	}
</style>
