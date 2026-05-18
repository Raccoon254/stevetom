<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	export let status: number = 404;
	export let message: string = '';

	$: headline = status === 404 ? 'No pulse here.' : 'Something flatlined.';
	$: detail =
		message ||
		(status === 404
			? 'The page you were looking for does not exist, or it has moved.'
			: 'An unexpected error stopped this page. Try again in a moment.');
</script>

<main class="page">
	<div class="err">
		<div class="eyebrow">error · {status}</div>
		<h1>{headline}</h1>

		<div class="flat" aria-hidden="true">
			<svg viewBox="0 0 600 80" preserveAspectRatio="none">
				<line class="base" x1="0" y1="40" x2="600" y2="40" />
				<line class="draw" x1="0" y1="40" x2="600" y2="40" />
			</svg>
			<span class="scan"></span>
		</div>

		<p class="detail">{detail}</p>

		<div class="cta-row">
			<a class="pill pill--solid" href="/">
				<span>Back home</span>
				<span class="ar" aria-hidden="true"><Icon name="arrow-left" size={13} /></span>
			</a>
			<a class="alt" href="/contact">or get in touch</a>
		</div>
	</div>
</main>

<style>
	.page {
		min-height: 100vh;
		min-height: 100svh;
		display: grid;
		place-items: center;
		padding: clamp(96px, 14vh, 160px) clamp(20px, 5vw, 80px);
	}
	.err {
		width: 100%;
		max-width: 560px;
		text-align: center;
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 clamp(18px, 3vh, 26px);
	}
	h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(34px, 5.4vw, 60px);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(28px, 5vh, 44px);
		text-wrap: balance;
	}

	/* flatline — the heartbeat stopped */
	.flat {
		position: relative;
		height: 64px;
		margin: 0 auto clamp(28px, 5vh, 44px);
	}
	.flat svg {
		width: 100%;
		height: 100%;
		display: block;
		overflow: visible;
	}
	.flat .base {
		stroke: var(--hairline-2);
		stroke-width: 1.5;
	}
	.flat .draw {
		stroke: var(--ink-2);
		stroke-width: 1.5;
		stroke-dasharray: 600;
		stroke-dashoffset: 600;
		animation: draw 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}
	.flat .scan {
		position: absolute;
		top: 50%;
		left: 0;
		width: 7px;
		height: 7px;
		margin-top: -3.5px;
		border-radius: 50%;
		background: var(--spark);
		box-shadow: 0 0 12px var(--spark-glow);
		animation: scan 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes scan {
		0% {
			left: 0;
			opacity: 0;
		}
		8%,
		92% {
			opacity: 1;
		}
		100% {
			left: 100%;
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.flat .draw {
			stroke-dashoffset: 0;
			animation: none;
		}
		.flat .scan {
			animation: none;
			opacity: 0;
		}
	}

	.detail {
		font-size: clamp(15px, 1.4vw, 18px);
		line-height: 1.6;
		color: var(--ink-2);
		margin: 0 0 clamp(32px, 5vh, 44px);
		text-wrap: pretty;
	}

	.cta-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 18px;
		flex-wrap: wrap;
	}
	.cta-row .alt {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
	}
	.cta-row .alt:hover {
		color: var(--spark);
		border-color: var(--spark);
	}
</style>
