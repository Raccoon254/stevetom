<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	const links = [
		{ label: 'TikTok', handle: '@raccoon.254', href: 'https://www.tiktok.com/@raccoon.254', icon: 'tiktok' },
		{ label: 'GitHub', handle: 'Raccoon254', href: 'https://github.com/Raccoon254', icon: 'github' },
		{ label: 'YouTube', handle: '@iamkentom', href: 'https://www.youtube.com/@iamkentom', icon: 'youtube-logo' },
		{ label: 'WhatsApp', handle: 'Message me', href: 'https://wa.link/w1774n', icon: 'whatsapp-logo' }
	];

	let step: 'form' | 'verify' | 'done' = 'form';
	let name = '';
	let email = '';
	let message = '';
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
		if (message.trim().length < 2) {
			error = 'Add a short message first.';
			return;
		}
		busy = true;
		try {
			const res = await fetch('/api/verify/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, mode: 'contact' })
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

<svelte:head>
	<title>kenTom · Contact</title>
	<meta
		name="description"
		content="Get in touch with Steve Tom. Start a conversation or find me on TikTok, GitHub, YouTube and WhatsApp."
	/>
</svelte:head>

<main class="page">
	<div class="contact">
		<div class="eyebrow"><Icon name="messages" size={13} /> contact</div>

		{#if step === 'form'}
			<h1 class="headline">Start a <em>conversation</em>.</h1>
			<p class="lede">
				A project, a question, or just hello. Tell me what's on your mind. Every message lands in
				my inbox and I usually reply within a day.
			</p>

			<div class="body">
				<form class="form" on:submit|preventDefault={start}>
					<div class="field">
						<label for="c-name">Name</label>
						<input id="c-name" type="text" placeholder="Your name" bind:value={name} />
					</div>
					<div class="field">
						<label for="c-email">Email</label>
						<input
							id="c-email"
							type="email"
							placeholder="your@email"
							autocomplete="email"
							required
							bind:value={email}
						/>
					</div>
					<div class="field">
						<label for="c-msg">Message</label>
						<textarea
							id="c-msg"
							rows="4"
							placeholder="What would you like to talk about?"
							bind:value={message}
						></textarea>
					</div>

					{#if error}<p class="note note--err">{error}</p>{/if}

					<div class="send-row">
						<button class="pill pill--solid" type="submit" disabled={busy}>
							<span>{busy ? 'Sending code' : 'Continue'}</span>
							<span class="ar" aria-hidden="true"><Icon name="arrow-right" size={14} /></span>
						</button>
						<span class="alt">or email <a href="mailto:me@kentom.co.ke">directly</a></span>
					</div>
				</form>

				<aside class="aside">
					<span class="aside-label">Find me elsewhere</span>
					<ul class="lines">
						{#each links as l}
							<li>
								<a href={l.href} target="_blank" rel="noopener">
									<span class="mark"><Icon name={l.icon} size={16} /></span>
									<span class="text">
										<span class="lbl">{l.label}</span>
										<span class="handle">{l.handle}</span>
									</span>
									<span class="ar"><Icon name="paperclip" size={14} /></span>
								</a>
							</li>
						{/each}
					</ul>
				</aside>
			</div>
		{:else if step === 'verify'}
			<div class="vmark" aria-hidden="true"><Icon name="sms" size={20} /></div>
			<h1 class="headline">Quick check — <em>can I reach you?</em></h1>
			<p class="vnote">
				I sent a 6-digit code to <strong>{email}</strong>. Enter it below so I know this inbox is
				yours — that way my reply actually lands.
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

			{#if error}<p class="note note--err">{error}</p>{/if}

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
		{:else}
			<div class="vmark ok" aria-hidden="true"><Icon name="tick-circle" size={22} /></div>
			<h1 class="headline">Message <em>sent</em>.</h1>
			<p class="vnote">
				Your email is verified and your message is in. I read everything myself and will reply,
				usually within a day — check your inbox for a confirmation.
			</p>
			<div class="send-row">
				<a class="pill pill--solid" href="/">
					<span>Back home</span>
					<span class="ar" aria-hidden="true"><Icon name="arrow-left" size={14} /></span>
				</a>
			</div>
		{/if}
	</div>
</main>

<style>
	.contact {
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
		margin: 0 0 clamp(18px, 3vh, 26px);
	}
	.eyebrow :global(svg) {
		stroke-width: 1.5;
	}

	.headline {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(36px, 5vw, 60px);
		line-height: 1.1;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 16px;
		text-wrap: balance;
	}
	.headline em {
		font-style: normal;
		color: var(--mute);
	}
	.lede {
		font-size: clamp(15px, 1.5vw, 18px);
		line-height: 1.55;
		color: var(--ink-2);
		max-width: 52ch;
		margin: 0 0 clamp(36px, 5vh, 52px);
		text-wrap: pretty;
	}

	/* two-column body */
	.body {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: clamp(32px, 5vw, 64px);
		align-items: start;
	}

	/* form */
	.field {
		display: grid;
		gap: 7px;
		margin-bottom: clamp(18px, 3vh, 24px);
	}
	.field label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.field input,
	.field textarea {
		font: inherit;
		font-family: var(--sans);
		font-size: 16px;
		color: var(--ink);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--hairline-2);
		padding: 9px 0;
		width: 100%;
		outline: none;
		resize: vertical;
		transition: border-color 0.25s;
	}
	.field textarea {
		min-height: 96px;
		line-height: 1.5;
	}
	.field input::placeholder,
	.field textarea::placeholder {
		color: var(--mute);
	}
	.field input:focus,
	.field textarea:focus {
		border-bottom-color: var(--spark);
	}

	.note {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		line-height: 1.5;
		margin: 4px 0 0;
	}
	.note--err {
		color: var(--error);
	}

	.send-row {
		margin-top: clamp(24px, 3.5vh, 32px);
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
	}
	.send-row button {
		font: inherit;
		cursor: pointer;
	}
	.send-row button:disabled {
		cursor: not-allowed;
		opacity: 0.65;
	}
	.send-row .alt {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.send-row .alt a {
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
	}
	.send-row .alt a:hover {
		color: var(--spark);
		border-color: var(--spark);
	}

	/* aside: social links */
	.aside-label {
		display: block;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 6px;
	}
	ul.lines {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	ul.lines li {
		border-bottom: 1px solid var(--hairline);
	}
	ul.lines li:first-child {
		border-top: 1px solid var(--hairline);
	}
	ul.lines a {
		display: flex;
		align-items: center;
		gap: 13px;
		padding: 14px 2px;
		color: var(--ink-2);
		transition: color 0.25s;
	}
	ul.lines a:hover {
		color: var(--spark);
	}
	.mark {
		display: inline-flex;
		flex: 0 0 auto;
		color: var(--ink);
		transition: color 0.25s;
	}
	ul.lines a:hover .mark {
		color: var(--spark);
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.lbl {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.handle {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.04em;
		color: var(--mute);
	}
	.aside .ar {
		margin-left: auto;
		color: var(--mute);
		transition:
			transform 0.25s,
			color 0.25s;
	}
	ul.lines a:hover .ar {
		color: var(--spark);
		transform: scale(1.2);
	}

	/* verify / done */
	.vmark {
		display: inline-flex;
		padding: 14px;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		color: var(--spark);
		margin-bottom: clamp(18px, 3vh, 26px);
	}
	.vmark.ok {
		color: var(--ink);
		border-color: var(--ink-2);
	}
	.vnote {
		font-size: clamp(15px, 1.5vw, 18px);
		line-height: 1.6;
		color: var(--ink-2);
		max-width: 52ch;
		margin: 0 0 clamp(26px, 4vh, 36px);
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

	@media (max-width: 720px) {
		.body {
			grid-template-columns: 1fr;
			gap: clamp(36px, 6vh, 56px);
		}
	}
</style>
