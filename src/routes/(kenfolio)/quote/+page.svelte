<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	let brief = '';
	let email = '';
	let status: 'idle' | 'sending' | 'sent' | 'error' = 'idle';

	async function submit() {
		if (status === 'sending' || status === 'sent') return;
		status = 'sending';
		try {
			const res = await fetch('/api/send-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, message: brief, mode: 'quote' })
			});
			status = res.ok ? 'sent' : 'error';
		} catch {
			status = 'error';
		}
	}

	$: label =
		status === 'sent'
			? 'Sent ✓'
			: status === 'sending'
				? 'Sending'
				: status === 'error'
					? 'Try again'
					: 'Send';
</script>

<svelte:head>
	<title>kenTom · Quote</title>
	<meta name="description" content="Tell Steve Tom what you're building — a sentence and an email." />
</svelte:head>

<main class="page">
	<form class="ask" on:submit|preventDefault={submit}>
		<h1 class="prompt">Tell me what you're <em>building</em>.</h1>

		<div class="field">
			<input type="text" placeholder="A sentence about it" aria-label="Brief" bind:value={brief} />
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

		<div class="send-row">
			<button class="pill pill--solid" type="submit" disabled={status === 'sending'}>
				<span>{label}</span>
				<span class="ar" aria-hidden="true"><Icon name="export-arrow" size={13} /></span>
			</button>
			<span class="alt">or <a href="mailto:tomsteve187@gmail.com">email</a></span>
		</div>
	</form>
</main>

<style>
	.page {
		place-items: center !important;
	}
	.ask {
		max-width: 640px;
		width: 100%;
	}
	.ask .prompt {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(36px, 5vw, 60px);
		line-height: 1.15;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(40px, 6vh, 64px);
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
	.ask .send-row {
		margin-top: clamp(36px, 5vh, 48px);
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 18px;
		flex-wrap: wrap;
	}
	.ask .send-row button {
		font: inherit;
		cursor: pointer;
	}
	.ask .send-row button:disabled {
		cursor: progress;
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
</style>
