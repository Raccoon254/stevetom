<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	const services = [
		{ label: 'Web app', icon: 'monitor' },
		{ label: 'Mobile app', icon: 'mobile' },
		{ label: 'Infrastructure / APIs', icon: 'cloud-connection' },
		{ label: 'Custom software', icon: 'code' },
		{ label: 'Design', icon: 'magicpen' },
		{ label: 'Something else', icon: 'category' }
	];

	let brief = '';
	let email = '';
	let service = '';
	let status: 'idle' | 'sending' | 'sent' | 'error' = 'idle';

	async function submit() {
		if (status === 'sending' || status === 'sent') return;
		status = 'sending';
		try {
			const res = await fetch('/api/send-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, message: brief, service, mode: 'quote' })
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

		<div class="send-row">
			<button class="pill pill--solid" type="submit" disabled={status === 'sending'}>
				<span>{label}</span>
				<span class="ar" aria-hidden="true"><Icon name="direct-send" size={14} /></span>
			</button>
			<span class="alt">or <a href="mailto:tomsteve187@gmail.com">email</a></span>
		</div>
	</form>
</main>

<style>
	.ask {
		max-width: var(--page-w);
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
