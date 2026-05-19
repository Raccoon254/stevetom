<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	const services = [
		{ label: 'Web app', icon: 'monitor' },
		{ label: 'Mobile app', icon: 'mobile' },
		{ label: 'Infrastructure / APIs', icon: 'cloud-connection' },
		{ label: 'Custom software', icon: 'code' },
		{ label: 'Design', icon: 'magicpen' },
		{ label: 'Something else', icon: 'category' }
	];

	let step: 'form' | 'verify' | 'done' = 'form';
	let brief = '';
	let email = '';
	let service = '';
	let busy = false;
	let error = '';

	// verification
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
				body: JSON.stringify({ email, message: brief, service, mode: 'quote' })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				token = data.token;
				digits = ['', '', '', '', '', ''];
				step = 'verify';
				await tick();
				inputs[0]?.focus();
			} else {
				error = data.error || 'Could not send the code. Please try again.';
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

<Seo
	title="Quote"
	description="Tell Steve Tom what you're building — a sentence and an email is enough to start a project quote."
	path="/quote"
	keywords="hire developer Kenya, project quote, custom software quote, web app development"
	breadcrumbs={[{ name: 'Quote', path: '/quote' }]}
/>

<main class="page">
	{#if step === 'form'}
		<form class="ask" on:submit|preventDefault={start}>
			<h1 class="prompt">Tell me what you're <em>building</em>.</h1>

			<div class="field">
				<input type="text" placeholder="A sentence about it" aria-label="Brief" bind:value={brief} />
			</div>

			<div class="pick">
				<span class="pick-label">What is it</span>
				<div class="choices">
					{#each services as s}
						<label class="choice" class:selected={service === s.label}>
							<input type="radio" name="service" value={s.label} bind:group={service} />
							<span class="choice-ic"><Icon name={s.icon} size={18} /></span>
							<span class="choice-txt">{s.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="field">
				<input
					type="email"
					placeholder="your@email"
					autocomplete="email"
					required
					aria-label="Email"
					bind:value={email}
				/>
			</div>

			{#if error}<p class="err">{error}</p>{/if}

			<div class="send-row">
				<button class="pill pill--solid" type="submit" disabled={busy}>
					<span>{busy ? 'Sending code' : 'Continue'}</span>
					<span class="ar" aria-hidden="true"><Icon name="arrow-right" size={14} /></span>
				</button>
				<span class="alt">or <a href="mailto:me@kentom.co.ke">email</a></span>
			</div>
		</form>
	{:else if step === 'verify'}
		<div class="ask verify">
			<div class="vmark" aria-hidden="true"><Icon name="sms" size={20} /></div>
			<h1 class="prompt">Quick check. <em>Can I reach you?</em></h1>
			<p class="vnote">
				I sent a 6-digit code to <strong>{email}</strong>. Enter it below so I know this inbox is
				yours, that way my reply actually lands.
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

			<div class="send-row">
				<button class="pill pill--solid" on:click={confirm} disabled={busy || code.length !== 6}>
					<span>{busy ? 'Verifying' : 'Verify & send'}</span>
					<span class="ar" aria-hidden="true"><Icon name="tick-circle" size={14} /></span>
				</button>
			</div>
			<div class="vlinks">
				<button type="button" class="link" on:click={resend} disabled={busy}>Resend code</button>
				<span class="dot">·</span>
				<button type="button" class="link" on:click={() => ((step = 'form'), (error = ''))}>
					Wrong email?
				</button>
			</div>
		</div>
	{:else}
		<div class="ask done">
			<div class="vmark ok" aria-hidden="true"><Icon name="tick-circle" size={22} /></div>
			<h1 class="prompt">That's <em>through</em>.</h1>
			<p class="vnote">
				Your email is verified and your request is in. I read everything myself and will reply,
				usually within a day. Check your inbox for a confirmation.
			</p>
			<div class="send-row">
				<a class="pill pill--solid" href="/">
					<span>Back home</span>
					<span class="ar" aria-hidden="true"><Icon name="ai-homepage" size={14} /></span>
				</a>
			</div>
		</div>
	{/if}
</main>

<style>
	.ask {
		max-width: var(--page-w);
		width: 100%;
	}
	.ask .prompt {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(34px, 5vw, 60px);
		line-height: 1.15;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(34px, 5vh, 56px);
		text-wrap: balance;
	}
	.ask .prompt em {
		font-style: normal;
		color: var(--mute);
	}
	.ask .field {
		margin: 0 0 clamp(28px, 4vh, 36px);
		display: grid;
		gap: 8px;
	}
	.ask .field input {
		font: inherit;
		font-family: var(--sans);
		font-size: clamp(18px, 1.8vw, 22px);
		color: var(--ink);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--hairline-2);
		padding: 8px 0;
		width: 100%;
		outline: none;
		transition: border-color 0.25s;
	}
	.ask .field input::placeholder {
		color: var(--mute);
	}
	.ask .field input:focus {
		border-bottom-color: var(--ink-2);
	}
	.ask .pick {
		margin: 0 0 clamp(28px, 4vh, 36px);
		display: grid;
		gap: 12px;
	}
	.ask .pick-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.ask .choices {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.ask .choice {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 13px 14px;
		border: 1px solid var(--hairline-2);
		border-radius: 12px;
		cursor: pointer;
		color: var(--ink-2);
		background: rgba(var(--bg-rgb), 0.35);
		transition:
			border-color 0.2s ease,
			color 0.2s ease,
			background 0.2s ease;
	}
	.ask .choice input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.ask .choice-ic {
		display: inline-flex;
		color: var(--mute);
		transition:
			color 0.2s ease,
			transform 0.2s ease;
	}
	.ask .choice-txt {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		line-height: 1.25;
	}
	.ask .choice:hover {
		border-color: var(--mute);
		color: var(--ink);
	}
	.ask .choice:hover .choice-ic {
		color: var(--ink-2);
	}
	.ask .choice.selected {
		border-color: var(--spark);
		color: var(--ink);
	}
	.ask .choice.selected .choice-ic {
		color: var(--spark);
		transform: scale(1.1);
	}
	.ask .choice:focus-within {
		outline: 1px solid var(--mute);
		outline-offset: 2px;
	}
	@media (max-width: 640px) {
		.ask .choices {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 400px) {
		.ask .choices {
			grid-template-columns: 1fr;
		}
	}
	.err {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--spark);
		margin: 0 0 4px;
	}
	.ask .send-row {
		margin-top: clamp(32px, 5vh, 44px);
		display: flex;
		align-items: baseline;
		gap: 18px;
		flex-wrap: wrap;
	}
	.ask .send-row button {
		font: inherit;
		cursor: pointer;
	}
	.ask .send-row button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.ask .send-row .alt {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.ask .send-row .alt a {
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
	}

	/* ── verify / done ── */
	.vmark {
		display: inline-flex;
		padding: 14px;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		color: var(--spark);
		margin-bottom: clamp(20px, 3.5vh, 30px);
	}
	.vmark.ok {
		color: var(--ink);
		border-color: var(--ink-2);
	}
	.verify .prompt,
	.done .prompt {
		margin-bottom: clamp(14px, 2.5vh, 20px);
	}
	.vnote {
		font-size: clamp(15px, 1.5vw, 18px);
		line-height: 1.6;
		color: var(--ink-2);
		max-width: 52ch;
		margin: 0 0 clamp(28px, 4vh, 38px);
		text-wrap: pretty;
	}
	.vnote strong {
		color: var(--ink);
		font-weight: 500;
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
		animation: shake 0.32s ease;
	}
	@keyframes shake {
		25% {
			transform: translateX(-6px);
		}
		75% {
			transform: translateX(6px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.otp.shake {
			animation: none;
		}
	}

	.vlinks {
		margin-top: 18px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
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
	.link:hover:not(:disabled) {
		color: var(--ink);
	}
	.link:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
