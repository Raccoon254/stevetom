<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	/** framed = bordered card (blog); unframed = bare, like a landing section */
	export let framed = true;

	let step: 'idle' | 'verify' | 'done' = 'idle';
	let email = '';
	let busy = false;
	let error = '';

	let token = '';
	let digits: string[] = ['', '', '', '', '', ''];
	let inputs: HTMLInputElement[] = [];
	$: code = digits.join('');

	async function start() {
		if (busy) return;
		error = '';
		if (!email.includes('@')) {
			error = 'Enter a valid email address.';
			return;
		}
		busy = true;
		try {
			const res = await fetch('/api/verify/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, mode: 'newsletter' })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				token = data.token;
				digits = ['', '', '', '', '', ''];
				step = 'verify';
				await tick();
				inputs[0]?.focus();
			} else {
				error = data.error || 'Could not send the code. Try again.';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			busy = false;
		}
	}

	async function confirm() {
		if (busy || code.length !== 6) return;
		busy = true;
		error = '';
		try {
			const res = await fetch('/api/verify/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, code })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				step = 'done';
			} else {
				error = data.error || 'That code is not correct.';
				digits = ['', '', '', '', '', ''];
				await tick();
				inputs[0]?.focus();
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			busy = false;
		}
	}

	async function resend() {
		digits = ['', '', '', '', '', ''];
		await start();
	}

	function onDigit(i: number, e: Event) {
		const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		if (raw.length > 1) {
			const chars = raw.slice(0, 6).split('');
			digits = Array.from({ length: 6 }, (_, k) => chars[k] ?? '');
			inputs[Math.min(chars.length, 5)]?.focus();
		} else {
			digits[i] = raw;
			digits = digits;
			if (raw && i < 5) inputs[i + 1]?.focus();
		}
		if (digits.join('').length === 6) confirm();
	}
	function onDigitKey(i: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !digits[i] && i > 0) inputs[i - 1]?.focus();
	}
</script>

<section class="nl" class:framed>
	<div class="nl-label"><Icon name="sms" size={12} /> Newsletter</div>

	{#if step === 'idle'}
		<h2>New notes, <em>in your inbox</em>.</h2>
		<p class="nl-note">
			When I publish a note, you get a short email with a link. Nothing else. One-click
			unsubscribe, always.
		</p>
		<form class="row" on:submit|preventDefault={start}>
			<input
				type="email"
				placeholder="your@email"
				autocomplete="email"
				required
				aria-label="Email"
				bind:value={email}
			/>
			<button class="pill pill--solid" type="submit" disabled={busy}>
				<span>{busy ? 'Sending' : 'Subscribe'}</span>
				<span class="ar" aria-hidden="true"><Icon name="arrow-right" size={13} /></span>
			</button>
		</form>
		{#if error}<p class="err">{error}</p>{/if}
	{:else if step === 'verify'}
		<h2>Confirming <em>I can reach you</em>.</h2>
		<p class="nl-note">
			I sent a 6-digit code to <strong>{email}</strong>. Enter it below. It just confirms this
			inbox is reachable before I add you to the list.
		</p>
		<div class="otp" class:shake={error}>
			{#each digits as d, i}
				<input
					bind:this={inputs[i]}
					bind:value={digits[i]}
					on:input={(e) => onDigit(i, e)}
					on:keydown={(e) => onDigitKey(i, e)}
					inputmode="numeric"
					autocomplete={i === 0 ? 'one-time-code' : 'off'}
					maxlength="6"
					aria-label="Digit {i + 1}"
				/>
			{/each}
		</div>
		{#if error}<p class="err">{error}</p>{/if}
		<div class="vlinks">
			<button type="button" class="link" on:click={confirm} disabled={busy || code.length !== 6}>
				{busy ? 'Verifying' : 'Verify'}
			</button>
			<span class="dot">·</span>
			<button type="button" class="link" on:click={resend} disabled={busy}>Resend code</button>
			<span class="dot">·</span>
			<button type="button" class="link" on:click={() => ((step = 'idle'), (error = ''))}>
				Change email
			</button>
		</div>
	{:else}
		<h2>You're <em>subscribed</em>.</h2>
		<p class="nl-note">
			Thanks. Check your inbox for a welcome note. New posts will land there as they go up.
		</p>
	{/if}
</section>

<style>
	.nl.framed {
		border-top: 1px solid var(--hairline);
		border-bottom: 1px solid var(--hairline);
		padding: clamp(28px, 5vh, 48px) 0;
	}
	.nl-label {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 14px;
	}
	.nl h2 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(22px, 2.8vw, 32px);
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: var(--ink);
		margin: 0 0 10px;
		text-wrap: balance;
	}
	.nl h2 em {
		font-style: normal;
		color: var(--mute);
	}
	.nl-note {
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
		margin: 0 0 20px;
		max-width: 52ch;
		text-wrap: pretty;
	}
	.nl-note strong {
		color: var(--ink);
		font-weight: 500;
	}

	.row {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		align-items: center;
	}
	.row input {
		flex: 1;
		min-width: 200px;
		font: inherit;
		font-family: var(--sans);
		font-size: 16px;
		color: var(--ink);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--hairline-2);
		padding: 10px 0;
		outline: none;
		transition: border-color 0.25s;
	}
	.row input::placeholder {
		color: var(--mute);
	}
	.row input:focus {
		border-bottom-color: var(--spark);
	}
	.row button {
		font: inherit;
		cursor: pointer;
		flex: 0 0 auto;
	}
	.row button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.otp {
		display: flex;
		gap: clamp(8px, 1.6vw, 14px);
		flex-wrap: wrap;
	}
	.otp input {
		width: clamp(44px, 9vw, 60px);
		height: clamp(54px, 11vw, 72px);
		text-align: center;
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(22px, 3vw, 30px);
		color: var(--ink);
		background: rgba(var(--bg-rgb), 0.5);
		border: 1px solid var(--hairline-2);
		border-radius: 12px;
		outline: none;
		transition:
			border-color 0.2s,
			background 0.2s;
	}
	.otp input:focus {
		border-color: var(--spark);
		background: rgba(var(--bg-rgb), 0.85);
	}
	.otp.shake {
		animation: nl-shake 0.32s ease;
	}
	@keyframes nl-shake {
		25% {
			transform: translateX(-5px);
		}
		75% {
			transform: translateX(5px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.otp.shake {
			animation: none;
		}
	}

	.err {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--spark);
		margin: 10px 0 0;
	}
	.vlinks {
		margin-top: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		flex-wrap: wrap;
	}
	.vlinks .dot {
		color: var(--mute-2);
	}
	.link {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: var(--mute);
		cursor: pointer;
		transition: color 0.2s;
	}
	.link:first-child {
		color: var(--ink);
	}
	.link:hover:not(:disabled) {
		color: var(--spark);
	}
	.link:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
