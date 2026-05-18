<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Icon from '$lib/components/Icon.svelte';
	import '$lib/styles/kenfolio.css';

	export let form: ActionData;
</script>

<svelte:head>
	<title>Admin Login · kenTom</title>
	<meta name="description" content="Authorized access only. Please sign in to continue." />
</svelte:head>

<div class="login">
	<main class="wrap">
		<a class="back" href="/">
			<Icon name="arrow-left" size={13} /> Back to site
		</a>

		<div class="card">
			<div class="lock"><Icon name="lock" size={22} /></div>
			<h1>Admin access</h1>
			<p class="sub">Enter your credentials to continue.</p>

			<form method="POST" use:enhance>
				<div class="field">
					<label for="password">Password</label>
					<input
						type="password"
						name="password"
						id="password"
						placeholder="Enter your password"
						required
						autocomplete="current-password"
					/>
				</div>

				{#if form?.error}
					<p class="err">{form.error}</p>
				{/if}

				<button type="submit" class="submit">Sign in</button>
			</form>
		</div>

		<p class="hint">Protected area · authorized access only</p>
	</main>
</div>

<style>
	.login {
		/* always dark, like the admin */
		--bg: #050505;
		--ink: #f4fffc;
		--ink-2: #cfeee6;
		--mute: #6fa89c;
		--spark: #ff7a1a;
		--danger: #ff5a52;
		--hairline: rgba(255, 255, 255, 0.1);
		--hairline-2: rgba(255, 255, 255, 0.22);

		min-height: 100vh;
		background: var(--bg);
		color: var(--ink);
		font-family: var(--sans);
		display: grid;
		place-items: center;
		padding: 40px 20px;
	}
	.wrap {
		width: 100%;
		max-width: 380px;
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 24px;
		transition: color 0.2s;
	}
	.back:hover {
		color: var(--ink);
	}
	.card {
		border: 1px solid var(--hairline);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.025);
		padding: 32px 28px;
	}
	.lock {
		display: inline-flex;
		padding: 12px;
		border: 1px solid var(--hairline);
		border-radius: 999px;
		color: var(--spark);
		margin-bottom: 18px;
	}
	h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: 26px;
		letter-spacing: -0.02em;
		color: var(--ink);
		margin: 0 0 6px;
	}
	.sub {
		font-size: 13px;
		color: var(--mute);
		margin: 0 0 26px;
	}
	.field {
		display: grid;
		gap: 8px;
		margin-bottom: 18px;
	}
	.field label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.field input {
		font: inherit;
		font-size: 15px;
		color: var(--ink);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--hairline-2);
		border-radius: 9px;
		padding: 11px 13px;
		outline: none;
		transition: border-color 0.2s;
	}
	.field input:focus {
		border-color: var(--spark);
	}
	.err {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--danger);
		margin: 0 0 14px;
	}
	.submit {
		width: 100%;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--bg);
		background: var(--ink);
		border: 1px solid var(--ink);
		border-radius: 9px;
		padding: 12px;
		cursor: pointer;
		transition:
			background 0.2s,
			border-color 0.2s;
	}
	.submit:hover {
		background: var(--spark);
		border-color: var(--spark);
		color: #fff;
	}
	.hint {
		text-align: center;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		margin-top: 22px;
		opacity: 0.6;
	}
</style>
