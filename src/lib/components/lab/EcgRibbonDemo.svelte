<script lang="ts">
	import { onMount } from 'svelte';

	let ribbon: SVGGElement;
	let pathEl: SVGPathElement;

	onMount(() => {
		let alive = true;
		let raf = 0;
		const SVGNS = 'http://www.w3.org/2000/svg';

		const TOTAL = pathEl.getTotalLength();
		const DURATION = 5200;
		const HEAD_W = 6.2;
		const TAIL_LEN = 980;
		const LIFETIME = 1 + TAIL_LEN / TOTAL;
		const SEGS = 70;

		function widthAt(d: number) {
			if (d <= 0) return HEAD_W;
			if (d >= TAIL_LEN) return 0;
			const t = d / TAIL_LEN;
			return HEAD_W * (1 - t) * (1 - t);
		}

		const segs: SVGUseElement[] = [];
		for (let i = 0; i < SEGS; i++) {
			const u = document.createElementNS(SVGNS, 'use');
			u.setAttribute('href', '#labEcgPath');
			u.setAttribute('stroke-width', '0');
			u.setAttribute('stroke-dasharray', '0 99999');
			ribbon.appendChild(u);
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

		const CYCLE = DURATION * LIFETIME;
		let elapsed = 0;
		let last = performance.now();
		function loop(now: number) {
			if (!alive) return;
			elapsed += now - last;
			last = now;
			drawRibbon(((elapsed % CYCLE) / DURATION));
			raf = requestAnimationFrame(loop);
		}
		raf = requestAnimationFrame((n) => {
			last = n;
			raf = requestAnimationFrame(loop);
		});

		return () => {
			alive = false;
			cancelAnimationFrame(raf);
		};
	});
</script>

<svg viewBox="0 130 1280 470" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
	<defs>
		<path
			bind:this={pathEl}
			id="labEcgPath"
			d="M0,400 H560 q10,0 14,-14 q5,-14 10,0 q4,14 10,14 H630 L660,420 L700,170 L740,560 L770,400 q10,0 16,-22 q6,-22 12,0 q6,22 14,22 H1280"
		/>
	</defs>
	<g bind:this={ribbon} fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></g>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		color: var(--spark);
	}
</style>
