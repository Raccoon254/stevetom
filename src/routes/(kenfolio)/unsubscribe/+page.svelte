<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>kenTom · Unsubscribe</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="page">
	<div class="unsub">
		<div class="mark" class:ok={data.ok} aria-hidden="true">
			<Icon name={data.ok ? 'tick-circle' : 'close-circle'} size={22} />
		</div>
		{#if data.ok}
			<h1>You're unsubscribed.</h1>
			<p class="lede">
				{#if data.email}<strong>{data.email}</strong> won't{:else}You won't{/if} get any more newsletter
				emails. No hard feelings — you can subscribe again any time from the blog.
			</p>
		{:else}
			<h1>That link didn't work.</h1>
			<p class="lede">
				The unsubscribe link looks invalid or expired. Use the link in a recent email, or email
				<a class="inline" href="mailto:me@kentom.co.ke">me@kentom.co.ke</a> and I'll remove you.
			</p>
		{/if}
		<a class="pill pill--solid" href="/blog">
			<span>Back to notes</span>
			<span class="ar" aria-hidden="true"><Icon name="arrow-left" size={13} /></span>
		</a>
	</div>
</main>

<style>
	.page {
		place-items: center !important;
	}
	.unsub {
		width: 100%;
		max-width: 480px;
		text-align: center;
	}
	.mark {
		display: inline-flex;
		padding: 14px;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		color: var(--error);
		margin-bottom: clamp(18px, 3vh, 26px);
	}
	.mark.ok {
		color: var(--ink);
		border-color: var(--ink-2);
	}
	h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(28px, 4vw, 44px);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 14px;
		text-wrap: balance;
	}
	.lede {
		font-size: clamp(15px, 1.5vw, 17px);
		line-height: 1.6;
		color: var(--ink-2);
		margin: 0 0 clamp(28px, 4vh, 38px);
		text-wrap: pretty;
	}
	.lede strong {
		color: var(--ink);
		font-weight: 500;
	}
	.inline {
		color: var(--ink);
		border-bottom: 1px solid var(--mute-2);
	}
	.pill {
		justify-content: center;
	}
</style>
