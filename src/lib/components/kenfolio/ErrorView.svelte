<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	export let status: number = 404;
	export let message: string = '';

	$: headline = status === 404 ? 'Nothing here.' : 'Something broke.';
	$: detail =
		message ||
		(status === 404
			? 'The page you were looking for does not exist, or it has moved.'
			: 'An unexpected error stopped this page. Try again in a moment.');

	onMount(() => {
		const SVGNS = 'http://www.w3.org/2000/svg';
		const pathEl = document.getElementById('errEcgPath') as unknown as SVGPathElement | null;
		const ribbonG = document.getElementById('errRibbon');
		if (!pathEl || !ribbonG) return;

		const TOTAL = pathEl.getTotalLength();
		const DURATION = 4200;
		const HEAD_W = 5;
		const TAIL_LEN = 1100;
		const LIFETIME = 1 + TAIL_LEN / TOTAL;
		const SEGS = 64;
		let alive = true;

		function widthAt(d: number) {
			if (d <= 0) return HEAD_W;
			if (d >= TAIL_LEN) return 0;
			const t = d / TAIL_LEN;
			return HEAD_W * (1 - t) * (1 - t);
		}

		const segs: SVGUseElement[] = [];
		for (let i = 0; i < SEGS; i++) {
			const u = document.createElementNS(SVGNS, 'use');
			u.setAttribute('href', '#errEcgPath');
			u.setAttribute('stroke-width', '0');
			u.setAttribute('stroke-dasharray', '0 99999');
			ribbonG.appendChild(u);
			segs.push(u);
		}

		function drawRibbon(progress: number) {
			if (progress <= 0 || progress >= LIFETIME) {
				for (let i = 0; i < SEGS; i++) segs[i].setAttribute('stroke-width', '0');
				return;
			}
			const H = progress * TOTAL;
			const s0 = Math.max(0, H - TAIL_LEN);
			const s1 = Math.min(TOTAL, H);
			const span = s1 - s0;
			if (span < 1) {
				for (let i = 0; i < SEGS; i++) segs[i].setAttribute('stroke-width', '0');
				return;
			}
			const sl = span / SEGS;
			for (let i = 0; i < SEGS; i++) {
				const a = s0 + i * sl;
				const b = a + sl;
				const mid = (a + b) / 2;
				const w = widthAt(H - mid) * 2;
				const el = segs[i];
				if (w < 0.2) {
					el.setAttribute('stroke-width', '0');
					continue;
				}
				const pad = sl * 0.06;
				const showStart = Math.max(0, a - pad);
				const showLen = b + pad - showStart;
				el.setAttribute('stroke-width', w.toFixed(2));
				el.setAttribute(
					'stroke-dasharray',
					`0 ${showStart.toFixed(2)} ${showLen.toFixed(2)} 999999`
				);
			}
		}

		let elapsed = 0;
		let last = performance.now();
		function loop(now: number) {
			if (!alive) return;
			elapsed += now - last;
			last = now;
			drawRibbon((elapsed % DURATION) / DURATION);
			requestAnimationFrame(loop);
		}
		requestAnimationFrame((n) => {
			last = n;
			requestAnimationFrame(loop);
		});

		return () => {
			alive = false;
		};
	});
</script>

<main class="page">
	<div class="err">
		<!-- the ECG pulse, behind the text — red to signal an error -->
		<div class="pulse" aria-hidden="true">
			<svg viewBox="0 150 1280 470" preserveAspectRatio="xMidYMid meet">
				<defs>
					<path
						id="errEcgPath"
						d="M0,400 H560 q10,0 14,-14 q5,-14 10,0 q4,14 10,14 H630 L660,420 L700,170 L740,560 L770,400 q10,0 16,-22 q6,-22 12,0 q6,22 14,22 H1280"
					/>
				</defs>
				<use class="ghost" href="#errEcgPath" />
				<g id="errRibbon" class="ribbon" fill="none" stroke-linecap="round" stroke-linejoin="round"
				></g>
			</svg>
		</div>

		<div class="err-content">
			<div class="eyebrow">error · {status}</div>
			<h1>{headline}</h1>
			<p class="detail">{detail}</p>
			<div class="cta-row">
				<a class="pill pill--solid" href="/">
					<span>Back home</span>
					<span class="ar" aria-hidden="true"><Icon name="arrow-left" size={13} /></span>
				</a>
				<a class="alt" href="/contact">or get in touch</a>
			</div>
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
		position: relative;
		width: 100%;
		max-width: 600px;
		text-align: center;
	}

	/* pulse sits behind the text */
	.pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(980px, 94vw);
		z-index: 0;
		pointer-events: none;
	}
	.pulse svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.ghost {
		fill: none;
		stroke: var(--error);
		stroke-width: 1.5;
		stroke-opacity: 0.16;
		vector-effect: non-scaling-stroke;
	}
	.ribbon {
		stroke: var(--error);
	}

	/* text in front */
	.err-content {
		position: relative;
		z-index: 1;
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: var(--error);
		margin: 0 0 clamp(18px, 3vh, 26px);
	}
	h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(34px, 5.4vw, 60px);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(20px, 4vh, 36px);
		text-wrap: balance;
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
	/* keep the CTA on the error palette, not the spark orange */
	.cta-row :global(.pill--solid:hover) {
		background: var(--error);
		border-color: var(--error);
		color: #fff;
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
		color: var(--error);
		border-color: var(--error);
	}
</style>
