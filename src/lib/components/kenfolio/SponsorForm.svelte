<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { sessionId, visitorId } from '$lib/analytics';

	/** Preselected tier, set when someone clicks a specific tier card. */
	type TierKey = 'standard' | 'workshop';
	export let tier: TierKey = 'standard';

	/**
	 * Svelte's markup parser cannot handle a TypeScript `as` assertion carrying a
	 * union type inside a template expression, so the cast lives here instead.
	 */
	function pick(key: string) {
		tier = key as TierKey;
	}

	type Status = 'idle' | 'loading' | 'error';

	// Monthly prices in USD, matching the thresholds in server/sponsors.ts.
	// Listed sponsorship starts at Standard; anything below is thanked, not shown.
	const TIERS = {
		standard: { label: 'Standard', monthly: 5, oneTime: 25 },
		workshop: { label: 'Workshop', monthly: 15, oneTime: 100 }
	} as const;

	let cadence: 'RECURRING' | 'ONE_TIME' = 'RECURRING';
	let email = '';
	let displayName = '';
	let orgName = '';
	let websiteUrl = '';
	let anonymous = false;
	let status: Status = 'idle';
	let message = '';

	$: preset = TIERS[tier];
	$: amount = cadence === 'RECURRING' ? preset.monthly : preset.oneTime;

	async function submit() {
		if (status === 'loading') return;
		if (!email.includes('@')) {
			status = 'error';
			message = 'Enter a valid email address.';
			return;
		}
		if (!anonymous && !displayName.trim()) {
			status = 'error';
			message = 'Tell us the name to list you under, or choose to stay anonymous.';
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
					currency: 'USD',
					cadence,
					sessionId: sessionId(),
					visitorId: visitorId(),
					sponsor: {
						listed: !anonymous,
						anonymous,
						displayName: displayName.trim() || null,
						orgName: orgName.trim() || null,
						websiteUrl: websiteUrl.trim() || null
					}
				})
			});
			const data = await res.json();
			if (res.ok && data.authorizationUrl) {
				window.location.href = data.authorizationUrl;
			} else {
				status = 'error';
				message = data.error || 'Could not start the payment.';
			}
		} catch {
			status = 'error';
			message = 'Network error. Please try again.';
		}
	}
</script>

<div class="join">
	<div class="row tiers">
		{#each Object.entries(TIERS) as [key, t]}
			<button
				type="button"
				class="tier-pick"
				class:on={tier === key}
				on:click={() => pick(key)}
			>
				<span class="t-name">{t.label}</span>
				<span class="t-price">
					${cadence === 'RECURRING' ? t.monthly : t.oneTime}
					<span class="t-per">{cadence === 'RECURRING' ? '/ month' : 'once'}</span>
				</span>
			</button>
		{/each}
	</div>

	<div class="row seg">
		<button type="button" class:on={cadence === 'RECURRING'} on:click={() => (cadence = 'RECURRING')}>
			Monthly
		</button>
		<button type="button" class:on={cadence === 'ONE_TIME'} on:click={() => (cadence = 'ONE_TIME')}>
			One-off
		</button>
	</div>

	<div class="field">
		<label for="sp-email">Email</label>
		<input id="sp-email" type="email" autocomplete="email" bind:value={email} placeholder="you@company.com" />
	</div>

	{#if !anonymous}
		<div class="field">
			<label for="sp-name">Name to list you under</label>
			<input id="sp-name" type="text" bind:value={displayName} placeholder="Your name or your brand" />
		</div>
		<div class="field">
			<label for="sp-org">Company (optional)</label>
			<input id="sp-org" type="text" bind:value={orgName} placeholder="Acme Ltd" />
		</div>
		<div class="field">
			<label for="sp-url">Link (optional)</label>
			<input id="sp-url" type="url" bind:value={websiteUrl} placeholder="https://example.com" />
		</div>
	{/if}

	<label class="check">
		<input type="checkbox" bind:checked={anonymous} />
		<span>Sponsor anonymously, do not list me</span>
	</label>

	{#if status === 'error'}
		<p class="err">{message}</p>
	{/if}

	<button class="pill pill--solid go" type="button" on:click={submit} disabled={status === 'loading'}>
		<span>
			{status === 'loading'
				? 'Redirecting'
				: `Continue, $${amount}${cadence === 'RECURRING' ? ' a month' : ''}`}
		</span>
		<span class="ar" aria-hidden="true"><Icon name="card-send" size={15} /></span>
	</button>

	<p class="fine">
		Charged in KES at today's rate, through Paystack.
		{#if cadence === 'RECURRING'}
			Repeats monthly until you stop it, and you can stop it by replying to any email from us.
		{:else}
			Your listing runs for 12 months.
		{/if}
		A logo needs the Workshop tier.
	</p>
	<span class="secured"><Icon name="shield-tick" size={13} /> Secured by Paystack</span>
</div>

<style>
	.join {
		display: grid;
		gap: 14px;
		max-width: 460px;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.tier-pick {
		flex: 1;
		display: grid;
		gap: 4px;
		padding: 13px 14px;
		text-align: left;
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.25));
		border-radius: 10px;
		background: none;
		color: var(--ink-2);
		cursor: pointer;
		font: inherit;
	}
	.tier-pick.on {
		border-color: var(--ink-2);
		color: var(--ink);
	}
	.t-name {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.t-price {
		font-size: 19px;
	}
	.t-per {
		font-size: 12px;
		color: var(--mute);
	}
	.seg button {
		flex: 1;
		padding: 8px 10px;
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.25));
		border-radius: 999px;
		background: none;
		color: var(--mute);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}
	.seg button.on {
		border-color: var(--ink-2);
		color: var(--ink);
	}
	.field {
		display: grid;
		gap: 6px;
	}
	.field label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.field input {
		padding: 10px 12px;
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.25));
		border-radius: 8px;
		background: none;
		color: var(--ink);
		font: inherit;
		font-size: 15px;
	}
	.field input:focus {
		outline: none;
		border-color: var(--ink-2);
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
	.err {
		margin: 0;
		font-size: 13px;
		color: var(--error, #d64545);
	}
	.go {
		justify-content: center;
	}
	.ar {
		display: inline-flex;
		line-height: 0;
	}
	.fine {
		margin: 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--mute);
	}
	.secured {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 11px;
		color: var(--mute);
	}
</style>
