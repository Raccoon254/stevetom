<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		let alive = true;
		let raf = 0;
		const ctx = canvas.getContext('2d')!;
		const root = document.documentElement;
		const cssVar = (n: string, f: string) =>
			getComputedStyle(root).getPropertyValue(n).trim() || f;

		function fit() {
			const r = canvas.getBoundingClientRect();
			const dpr = Math.min(1.5, devicePixelRatio || 1);
			canvas.width = Math.max(2, Math.floor(r.width * dpr));
			canvas.height = Math.max(2, Math.floor(r.height * dpr));
		}
		fit();
		const onResize = () => fit();
		window.addEventListener('resize', onResize);

		const COLS = 140;
		const STEP = 13;
		const SMOOTH = 0.85;
		const colAmp = new Array(COLS).fill(0);

		function draw() {
			if (!alive) return;
			const W = canvas.width;
			const H = canvas.height;
			const cy = H / 2;
			ctx.fillStyle = cssVar('--bg', '#050505');
			ctx.fillRect(0, 0, W, H);

			const t = performance.now() / 1000;
			const margin = W * 0.06;
			const useW = W - margin * 2;
			const sp = useW / (COLS - 1);
			const baseR = Math.min(sp * 0.42, STEP * 0.55 * (H / 800));

			for (let c = 0; c < COLS; c++) {
				const x = c / (COLS - 1);
				const env = 0.18 + 0.5 * Math.exp(-Math.pow((x - 0.5) * 2.3, 2));
				const wob = 0.5 + 0.5 * Math.sin(x * 18 - t * 1.8) * Math.sin(x * 4 + t * 0.6);
				const target = env * Math.abs(wob) * 0.55;
				colAmp[c] = colAmp[c] * SMOOTH + target * (1 - SMOOTH);
			}

			const STEP_PX = STEP * (H / 800);
			const maxHalf = H * 0.46;
			ctx.fillStyle = `rgba(${cssVar('--wave', '207, 238, 230')}, 0.5)`;
			for (let c = 0; c < COLS; c++) {
				const xs = margin + c * sp;
				const amp = colAmp[c];
				if (amp <= 0.015) continue;
				const half = amp * maxHalf;
				const rows = Math.ceil(half / STEP_PX);
				for (let r = 0; r <= rows; r++) {
					const dy = r * STEP_PX;
					if (dy > half) break;
					const rel = dy / half;
					const rad = baseR * Math.sqrt(Math.max(0, 1 - rel * rel)) * (0.55 + 0.45 * amp);
					if (rad < 0.3) continue;
					ctx.beginPath();
					ctx.arc(xs, cy - dy, rad, 0, Math.PI * 2);
					if (r !== 0) ctx.arc(xs, cy + dy, rad, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			raf = requestAnimationFrame(draw);
		}
		raf = requestAnimationFrame(draw);

		return () => {
			alive = false;
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
