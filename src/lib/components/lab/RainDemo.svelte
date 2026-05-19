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

		type Streak = { x: number; v: number; len: number; ground: number; y: number };
		const N = 35;
		const streaks: Streak[] = [];
		const ripples: Array<{ x: number; y: number; t: number; persp: number }> = [];

		function respawn(s: Streak) {
			s.x = Math.random();
			s.v = 0.32 + Math.random() * 0.32;
			s.len = 0.04 + Math.random() * 0.05;
			s.ground = 0.52 + Math.random() * 0.46;
			s.y = -0.05 - Math.random() * 0.35;
		}
		for (let i = 0; i < N; i++) {
			const s = {} as Streak;
			respawn(s);
			s.y = s.ground - 0.05 - Math.random() * 1.4;
			streaks.push(s);
		}

		let last = performance.now();
		function draw() {
			if (!alive) return;
			const W = canvas.width;
			const H = canvas.height;
			const now = performance.now();
			const dt = Math.min(40, now - last) / 1000;
			last = now;

			ctx.fillStyle = cssVar('--bg', '#050505');
			ctx.fillRect(0, 0, W, H);

			const wave = cssVar('--wave', '207, 238, 230');
			const horizon = H * 0.5;
			const g = ctx.createLinearGradient(0, horizon, 0, H);
			g.addColorStop(0, `rgba(${wave}, 0.10)`);
			g.addColorStop(1, `rgba(${wave}, 0)`);
			ctx.fillStyle = g;
			ctx.fillRect(0, horizon, W, H - horizon);

			ctx.strokeStyle = `rgba(${wave}, 0.35)`;
			ctx.lineWidth = 1;
			for (const s of streaks) {
				s.y += s.v * dt;
				const tip = s.y + s.len;
				if (tip >= s.ground) {
					const groundY = s.ground * H;
					const persp = (groundY - horizon) / (H - horizon);
					ripples.push({ x: (s.x - s.len * 0.02) * W, y: groundY, t: now, persp });
					respawn(s);
					continue;
				}
				const px = s.x * W;
				const py = s.y * H;
				ctx.beginPath();
				ctx.moveTo(px, py);
				ctx.lineTo(px - 2, py + s.len * H);
				ctx.stroke();
			}

			for (let i = ripples.length - 1; i >= 0; i--) {
				const r = ripples[i];
				const age = (now - r.t) / 1000;
				if (age > 1.8) {
					ripples.splice(i, 1);
					continue;
				}
				const rr = age * (40 + 60 * r.persp);
				const alpha = (1 - age / 1.8) * 0.35;
				ctx.strokeStyle = `rgba(${wave}, ${alpha})`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.ellipse(r.x, r.y, rr, rr * 0.35, 0, 0, Math.PI * 2);
				ctx.stroke();
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
