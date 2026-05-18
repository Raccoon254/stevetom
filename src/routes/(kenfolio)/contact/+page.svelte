<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	const links = [
		{ label: 'TikTok', handle: '@raccoon.254', href: 'https://www.tiktok.com/@raccoon.254', icon: 'tiktok' },
		{ label: 'GitHub', handle: 'Raccoon254', href: 'https://github.com/Raccoon254', icon: 'github' },
		{ label: 'YouTube', handle: '@iamkentom', href: 'https://www.youtube.com/@iamkentom', icon: 'youtube-logo' },
		{ label: 'WhatsApp', handle: 'Message me', href: 'https://wa.link/w1774n', icon: 'whatsapp-logo' }
	];

	let name = '';
	let email = '';
	let message = '';
	let status: 'idle' | 'sending' | 'sent' | 'error' = 'idle';

	async function submit() {
		if (status === 'sending' || status === 'sent') return;
		if (!email.includes('@') || message.trim().length < 2) {
			status = 'error';
			return;
		}
		status = 'sending';
		try {
			const res = await fetch('/api/send-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, mode: 'contact' })
			});
			status = res.ok ? 'sent' : 'error';
		} catch {
			status = 'error';
		}
	}

	$: sendLabel =
		status === 'sent'
			? 'Message sent'
			: status === 'sending'
				? 'Sending'
				: status === 'error'
					? 'Try again'
					: 'Send message';
</script>

<svelte:head>
	<title>kenTom · Contact</title>
	<meta name="description" content="Get in touch with Steve Tom — start a conversation or find me on TikTok, GitHub, YouTube and WhatsApp." />
</svelte:head>

<main class="page">
	<div class="contact">
		<div class="eyebrow"><Icon name="messages" size={13} /> contact</div>
		<h1 class="headline">Start a <em>conversation</em>.</h1>
		<p class="lede">
			A project, a question, or just hello — tell me what's on your mind. Every message lands in
			my inbox and I usually reply within a day.
		</p>

		<div class="body">
			<!-- form -->
			<form class="form" on:submit|preventDefault={submit}>
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

				{#if status === 'error'}
					<p class="note note--err">Something's off — check your email and message, then retry.</p>
				{:else if status === 'sent'}
					<p class="note note--ok">Got it. Thanks for reaching out — I'll be in touch shortly.</p>
				{/if}

				<div class="send-row">
					<button
						class="pill pill--solid"
						type="submit"
						disabled={status === 'sending' || status === 'sent'}
					>
						<span>{sendLabel}</span>
						<span class="ar" aria-hidden="true">
							<Icon name={status === 'sent' ? 'tick-circle' : 'direct-send'} size={14} />
						</span>
					</button>
					<span class="alt">or email <a href="mailto:tomsteve187@gmail.com">directly</a></span>
				</div>
			</form>

			<!-- elsewhere -->
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
	.note--ok {
		color: var(--spark);
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

	/* aside — social links */
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

	@media (max-width: 720px) {
		.body {
			grid-template-columns: 1fr;
			gap: clamp(36px, 6vh, 56px);
		}
	}
</style>
