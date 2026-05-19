<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import NewsletterSignup from '$lib/components/kenfolio/NewsletterSignup.svelte';

	// ── about · rotating facts ──────────────────────────────────────────
	// Each theme has four variations that mean the same thing — kept to a
	// similar length so the line box (and the reload button) never shift.
	const facts = [
		// coding since 2019, before AI
		'A guy who codes. Started back in 2019, before the machines learned the trick.',
		'Been writing software since 2019, well before the machines started writing back.',
		'I learned to code in 2019, back when the keyboard only ever answered to me.',
		'Started coding in 2019, in the quiet years before AI began finishing the sentence.',
		// Steve is kenTom
		'I am Steve. kenTom is the same person, one name for the work and one for me.',
		'Steve, kenTom, Raccoon254 — three names you might see, all of them just me.',
		'kenTom is not a studio or a team. It is me, Steve, and the work that I sign.',
		'There is no team here. kenTom is one person, Steve, and everything that he ships.',
		// schooling
		'I studied at Chuka University, and at Maranda High School in the years before that.',
		'Maranda High School first, then Chuka University, the long way into the craft.',
		'School ran through Maranda and then Chuka University; the rest I taught myself.',
		'Chuka University handed me the degree; Maranda High School handed me the start.',
		// fast, loves Java
		'I move fast and I love Java, give me a problem and a runtime and I am happy.',
		'Fast is a habit, not a sprint, and Java is still the language I reach for first.',
		'I like to ship fast, and I have a soft spot for Java that has never worn off.',
		'Quick hands, steady taste, and a love of Java that outlived every new framework.',
		// design first
		'The first thing I ever did was graphic design, and I am still very good at it.',
		'I came up through graphic design long before code, and that eye never left me.',
		'Design was the first craft I learned; I still draw about as well as I write code.',
		'Before a single line of code there was graphic design, and that hand stays sharp.',
		// fascinated by AI
		'I am fascinated by AI: what it quietly changes, and the parts it still cannot touch.',
		'AI keeps me curious, less the hype and more what it shifts in how we actually build.',
		'I watch AI closely. The interesting question is always what it cannot do for you.',
		'Fascinated by AI, and just as interested in where its honest limits really sit.',
		// video games
		'I play video games, partly for the fun and mostly to study how good interfaces feel.',
		'Video games are a quiet research habit; I read their design the whole time I play.',
		'I love video games, half of it play and half a lesson in pacing, feedback and feel.',
		'When I am not building, I am playing video games and noticing just why they work.'
	];
	let factIdx = 0;
	let spins = 0;
	function reloadFact() {
		let n = factIdx;
		while (n === factIdx && facts.length > 1) n = Math.floor(Math.random() * facts.length);
		factIdx = n;
		spins += 1;
	}

	// a clean blur "dissolve" — text scatters into / settles out of a haze
	const dustIn = (_node: Element) => ({
		duration: 560,
		easing: cubicOut,
		css: (t: number) => {
			const u = 1 - t;
			return `opacity:${t};filter:blur(${u * 12}px);transform:scale(${1 + u * 0.04});`;
		}
	});
	const dustOut = (_node: Element) => ({
		duration: 420,
		easing: cubicOut,
		css: (t: number) => {
			const u = 1 - t;
			return `position:absolute;left:0;right:0;opacity:${t};filter:blur(${u * 16}px);transform:scale(${1 + u * 0.08}) translateY(${u * -6}px);`;
		}
	});

	const works = [
		{ name: 'Axene.io', href: 'https://axene.io', quip: 'Send, build, ship' },
		{ name: 'Chiromo', href: 'https://chiromo.tech', quip: 'Builders find shelter' },
		{ name: 'Qailly', href: 'https://qailly.com', quip: 'Strangers break apps' },
		{ name: 'Pixen', href: 'https://pixen.cc', quip: 'Pixels meet desktop' }
	];

	const sections = [
		{ id: 'hero', label: 'Pulse' },
		{ id: 'about', label: 'About' },
		{ id: 'work', label: 'Work' },
		{ id: 'tutoring', label: 'Tutoring' },
		{ id: 'partnerships', label: 'Partners' },
		{ id: 'lab', label: 'Lab' },
		{ id: 'contact', label: 'Contact' }
	];

	// kept in sync with the /contact page
	const socials = [
		{ label: 'TikTok', href: 'https://www.tiktok.com/@raccoon.254', icon: 'tiktok', external: true },
		{ label: 'GitHub', href: 'https://github.com/Raccoon254', icon: 'github', external: true },
		{ label: 'YouTube', href: 'https://www.youtube.com/@iamkentom', icon: 'youtube-logo', external: true },
		{ label: 'WhatsApp', href: 'https://wa.link/w1774n', icon: 'whatsapp-logo', external: true },
		{ label: 'More', href: '/contact', icon: 'messages', external: false }
	];

	onMount(() => {
		let alive = true;
		const cleanups: Array<() => void> = [];
		document.documentElement.classList.add('kf-snap');
		cleanups.push(() => document.documentElement.classList.remove('kf-snap'));

		const onResize = (fn: () => void) => {
			window.addEventListener('resize', fn);
			cleanups.push(() => window.removeEventListener('resize', fn));
		};

		/* ── shared helpers ── */
		const DPR_CAP = 1.5;
		const readCssVar = (n: string) =>
			getComputedStyle(document.documentElement).getPropertyValue(n).trim();
		const bgColor = () => readCssVar('--bg') || '#050505';
		const waveColor = () => readCssVar('--wave') || '207, 238, 230';
		const rippleColor = () => readCssVar('--ripple') || '111, 168, 156';
		function fitCanvas(cv: HTMLCanvasElement) {
			const r = cv.getBoundingClientRect();
			const dpr = Math.min(DPR_CAP, devicePixelRatio || 1);
			cv.width = Math.max(2, Math.floor(r.width * dpr));
			cv.height = Math.max(2, Math.floor(r.height * dpr));
		}
		function makeVisible(el: Element) {
			const state = { in: false };
			const io = new IntersectionObserver(
				(entries) => {
					for (const e of entries) state.in = e.isIntersecting;
				},
				{ threshold: 0.02 }
			);
			io.observe(el);
			cleanups.push(() => io.disconnect());
			return state;
		}

		/* ── hero fit ── */
		(function () {
			function setHeroFit() {
				const svg = document.querySelector('.stage--hero svg.ecg');
				if (!svg) return;
				svg.setAttribute(
					'preserveAspectRatio',
					innerWidth < 700 ? 'xMidYMid meet' : 'xMidYMid slice'
				);
			}
			setHeroFit();
			onResize(setHeroFit);
		})();

		/* ── hero · paint/erase ECG ribbon ── */
		(function () {
			const SVGNS = 'http://www.w3.org/2000/svg';
			const pathEl = document.getElementById('ecgPath') as unknown as SVGPathElement;
			const ribbonG = document.getElementById('ribbon');
			const paintRect = document.getElementById('paintRect');
			if (!pathEl || !ribbonG || !paintRect) return;

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
				u.setAttribute('href', '#ecgPath');
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
			function updateMask(progress: number, passIdx: number) {
				const p = Math.min(1, progress);
				const x = pathEl.getPointAtLength(p * TOTAL).x;
				if (passIdx % 2 === 0) {
					paintRect!.setAttribute('x', '0');
					paintRect!.setAttribute('width', x.toFixed(2));
				} else {
					paintRect!.setAttribute('x', x.toFixed(2));
					paintRect!.setAttribute('width', (1280 - x).toFixed(2));
				}
			}

			let elapsed = 0,
				last = performance.now(),
				playing = true;
			function render() {
				const passIdx = Math.floor(elapsed / DURATION);
				const tInPass = elapsed - passIdx * DURATION;
				drawRibbon(tInPass / DURATION);
				updateMask(tInPass / DURATION, passIdx);
			}
			function loop(now: number) {
				if (!alive) return;
				const dt = now - last;
				last = now;
				if (playing) {
					elapsed += dt;
					render();
				}
				requestAnimationFrame(loop);
			}
			requestAnimationFrame((n) => {
				last = n;
				render();
				requestAnimationFrame(loop);
			});

			const heroSec = document.getElementById('hero')!;
			const io = new IntersectionObserver(
				(entries) => {
					for (const e of entries) {
						if (!e.isIntersecting) playing = false;
						else {
							playing = true;
							last = performance.now();
						}
					}
				},
				{ threshold: 0.05 }
			);
			io.observe(heroSec);
			cleanups.push(() => io.disconnect());
		})();

		/* ── about · halftone wave ── */
		(function () {
			const cv = document.getElementById('bgWave') as HTMLCanvasElement | null;
			if (!cv) return;
			const ctx = cv.getContext('2d')!;
			fitCanvas(cv);
			onResize(() => fitCanvas(cv));
			const vis = makeVisible(cv);
			const COLS = 180,
				STEP = 13,
				GAIN = 1.0,
				SMOOTH = 0.85;
			const colAmp = new Array(COLS).fill(0);
			function draw() {
				if (!alive) return;
				const W = cv!.width,
					H = cv!.height,
					cy = H / 2;
				ctx.fillStyle = bgColor();
				ctx.fillRect(0, 0, W, H);
				if (!vis.in) {
					requestAnimationFrame(draw);
					return;
				}
				const t = performance.now() / 1000;
				const margin = W * 0.06,
					useW = W - margin * 2,
					sp = useW / (COLS - 1);
				const baseR = Math.min(sp * 0.42, STEP * 0.55 * (H / 800));
				for (let c = 0; c < COLS; c++) {
					const x = c / (COLS - 1);
					const env = 0.18 + 0.5 * Math.exp(-Math.pow((x - 0.5) * 2.3, 2));
					const wob = 0.5 + 0.5 * Math.sin(x * 18 - t * 1.8) * Math.sin(x * 4 + t * 0.6);
					const target = env * Math.abs(wob) * GAIN * 0.55;
					colAmp[c] = colAmp[c] * SMOOTH + target * (1 - SMOOTH);
				}
				const STEP_PX = STEP * (H / 800);
				const maxHalf = H * 0.46;
				ctx.fillStyle = `rgba(${waveColor()}, 0.45)`;
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
				requestAnimationFrame(draw);
			}
			requestAnimationFrame(draw);
		})();

		/* ── work · ripple dot grid ── */
		(function () {
			const cv = document.getElementById('bgRipple') as HTMLCanvasElement | null;
			if (!cv) return;
			const ctx = cv.getContext('2d')!;
			fitCanvas(cv);
			onResize(() => fitCanvas(cv));
			const vis = makeVisible(cv);
			const drops: Array<{ x: number; y: number; t: number }> = [];
			let lastDrop = 0;
			function maybeDrop(t: number) {
				if (t - lastDrop > 1800 + Math.random() * 1400) {
					drops.push({ x: 0.15 + 0.7 * Math.random(), y: 0.3 + 0.55 * Math.random(), t });
					if (drops.length > 5) drops.shift();
					lastDrop = t;
				}
			}
			function draw() {
				if (!alive) return;
				const W = cv!.width,
					H = cv!.height;
				ctx.fillStyle = bgColor();
				ctx.fillRect(0, 0, W, H);
				if (!vis.in) {
					requestAnimationFrame(draw);
					return;
				}
				const t = performance.now();
				maybeDrop(t);
				const cols = 48,
					rows = 28;
				for (let j = 0; j < rows; j++) {
					const yv = j / (rows - 1);
					const persp = 0.4 + 0.6 * yv;
					const yPx = (0.1 + 0.84 * yv) * H;
					const dotR = 0.5 + 1.4 * persp;
					for (let i = 0; i < cols; i++) {
						const xv = i / (cols - 1);
						const xPx = (0.04 + 0.92 * xv) * W;
						let disp = 0;
						for (const d of drops) {
							const dt = (t - d.t) / 1000;
							if (dt < 0 || dt > 2.8) continue;
							const dx = xv - d.x,
								dy = yv - d.y;
							const dist = Math.sqrt(dx * dx + dy * dy);
							const r = dt * 0.42;
							const env = Math.exp(-Math.pow((dist - r) * 9, 2)) * Math.exp(-dt * 1.15);
							disp += env;
						}
						const a = 0.1 + 0.85 * Math.min(1, disp * 1.4);
						ctx.fillStyle = `rgba(${rippleColor()},${a * 0.55})`;
						ctx.beginPath();
						ctx.arc(xPx, yPx - disp * 18 * persp, dotR * persp, 0, Math.PI * 2);
						ctx.fill();
					}
				}
				requestAnimationFrame(draw);
			}
			requestAnimationFrame(draw);
		})();

		/* ── lab · rain ── */
		(function () {
			const cv = document.getElementById('bgRain') as HTMLCanvasElement | null;
			if (!cv) return;
			const ctx = cv.getContext('2d')!;
			fitCanvas(cv);
			onResize(() => fitCanvas(cv));
			const vis = makeVisible(cv);
			const N = 35;
			const streaks: Array<{
				x: number;
				v: number;
				len: number;
				ground: number;
				y: number;
			}> = [];
			const ripples: Array<{ x: number; y: number; t: number; persp: number }> = [];
			function respawn(s: (typeof streaks)[number]) {
				s.x = Math.random();
				s.v = 0.32 + Math.random() * 0.32;
				s.len = 0.04 + Math.random() * 0.05;
				s.ground = 0.52 + Math.random() * 0.46;
				s.y = -0.05 - Math.random() * 0.35;
			}
			for (let i = 0; i < N; i++) {
				const s = {} as (typeof streaks)[number];
				respawn(s);
				s.y = s.ground - 0.05 - Math.random() * 1.4;
				streaks.push(s);
			}
			let last = performance.now();
			function draw() {
				if (!alive) return;
				const W = cv!.width,
					H = cv!.height;
				const now = performance.now();
				const dt = Math.min(40, now - last) / 1000;
				last = now;
				ctx.fillStyle = bgColor();
				ctx.fillRect(0, 0, W, H);
				if (!vis.in) {
					requestAnimationFrame(draw);
					return;
				}
				const horizon = H * 0.5;
				const g = ctx.createLinearGradient(0, horizon, 0, H);
				g.addColorStop(0, `rgba(${waveColor()},0.10)`);
				g.addColorStop(1, `rgba(${waveColor()},0)`);
				ctx.fillStyle = g;
				ctx.fillRect(0, horizon, W, H - horizon);
				ctx.strokeStyle = `rgba(${waveColor()},0.35)`;
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
					const px = s.x * W,
						py = s.y * H;
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
					ctx.strokeStyle = `rgba(${waveColor()},${alpha})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.ellipse(r.x, r.y, rr, rr * 0.35, 0, 0, Math.PI * 2);
					ctx.stroke();
				}
				requestAnimationFrame(draw);
			}
			requestAnimationFrame(draw);
		})();

		/* ── contact · slow heartbeat ── */
		(function () {
			const SVGNS = 'http://www.w3.org/2000/svg';
			const pathEl = document.getElementById('ecgPath2') as unknown as SVGPathElement;
			const ribbonG = document.getElementById('ribbon2');
			if (!pathEl || !ribbonG) return;
			const TOTAL = pathEl.getTotalLength();
			const DURATION = 9200;
			const HEAD_W = 4.0;
			const TAIL_LEN = 1200;
			const LIFETIME = 1 + TAIL_LEN / TOTAL;
			const SEGS = 60;
			function widthAt(d: number) {
				if (d <= 0) return HEAD_W;
				if (d >= TAIL_LEN) return 0;
				const t = d / TAIL_LEN;
				return HEAD_W * (1 - t) * (1 - t);
			}
			const segs: SVGUseElement[] = [];
			for (let i = 0; i < SEGS; i++) {
				const u = document.createElementNS(SVGNS, 'use');
				u.setAttribute('href', '#ecgPath2');
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
			let elapsed = 0,
				last = performance.now(),
				playing = false;
			const sec = document.getElementById('contact')!;
			const io = new IntersectionObserver(
				(es) => {
					for (const e of es) {
						playing = e.isIntersecting;
						if (playing) last = performance.now();
					}
				},
				{ threshold: 0.05 }
			);
			io.observe(sec);
			cleanups.push(() => io.disconnect());
			function loop(now: number) {
				if (!alive) return;
				const dt = now - last;
				last = now;
				if (playing) {
					elapsed += dt;
					const tInPass = elapsed % DURATION;
					drawRibbon(tInPass / DURATION);
				}
				requestAnimationFrame(loop);
			}
			requestAnimationFrame(loop);
		})();

		/* ── tutoring · broadcasting rings ── */
		(function () {
			const cv = document.getElementById('bgPulse') as HTMLCanvasElement | null;
			if (!cv) return;
			const ctx = cv.getContext('2d')!;
			fitCanvas(cv);
			onResize(() => fitCanvas(cv));
			const vis = makeVisible(cv);
			const rings: Array<{ t: number }> = [];
			let lastSpawn = 0;
			let nodePulse = 0;
			function draw() {
				if (!alive) return;
				const W = cv!.width,
					H = cv!.height;
				ctx.fillStyle = bgColor();
				ctx.fillRect(0, 0, W, H);
				if (!vis.in) {
					requestAnimationFrame(draw);
					return;
				}
				const now = performance.now();
				if (now - lastSpawn > 1900) {
					rings.push({ t: now });
					if (rings.length > 7) rings.shift();
					lastSpawn = now;
					nodePulse = now;
				}
				const cx = W * 1.0,
					cy = H * 0.5;
				const maxR = Math.hypot(W, H) * 0.55;
				const wc = waveColor();
				const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.5);
				grad.addColorStop(0, `rgba(${wc},0.08)`);
				grad.addColorStop(1, `rgba(${wc},0)`);
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, W, H);
				for (const r of rings) {
					const age = (now - r.t) / 1000;
					if (age > 6) continue;
					const rad = age * (W * 0.18);
					const alpha = Math.max(0, 1 - age / 6) * 0.55;
					ctx.strokeStyle = `rgba(${wc},${alpha * 0.5})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.arc(cx, cy, rad, 0, Math.PI * 2);
					ctx.stroke();
					ctx.strokeStyle = `rgba(${wc},${alpha * 0.18})`;
					ctx.beginPath();
					ctx.arc(cx, cy, rad * 0.92, 0, Math.PI * 2);
					ctx.stroke();
				}
				const np = Math.max(0, 1 - (now - nodePulse) / 700);
				const nodeR = (3 + np * 4) * (H / 800) * 2;
				ctx.fillStyle = `rgba(${wc},${0.55 + np * 0.4})`;
				ctx.beginPath();
				ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
				ctx.fill();
				requestAnimationFrame(draw);
			}
			requestAnimationFrame(draw);
		})();

		/* ── partnerships · hexagon lattice pulses ── */
		(function () {
			const cv = document.getElementById('bgPartners') as HTMLCanvasElement | null;
			if (!cv) return;
			const ctx = cv.getContext('2d')!;
			const vis = makeVisible(cv);

			let R: number, HEX_DX: number, HEX_DY: number;
			let centers: Array<{ cx: number; cy: number }>;
			let gridPath: Path2D;
			let verts: Array<{ x: number; y: number; n: number[] }>;
			let edges: Array<{ a: number; b: number; hexes: number[] }>;
			let edgeKey: Map<string, number>;
			function rebuild() {
				fitCanvas(cv!);
				const W = cv!.width,
					H = cv!.height;
				R = Math.max(28, Math.min(58, Math.round(H / 16)));
				HEX_DX = 1.5 * R;
				HEX_DY = Math.sqrt(3) * R;
				centers = [];
				const cols = Math.ceil(W / HEX_DX) + 2;
				const rows = Math.ceil(H / HEX_DY) + 2;
				for (let c = -1; c < cols; c++) {
					for (let r = -1; r < rows; r++) {
						const cx = c * HEX_DX;
						const cy = r * HEX_DY + (Math.abs(c) % 2 === 0 ? 0 : HEX_DY / 2);
						centers.push({ cx, cy });
					}
				}
				verts = [];
				const vertMap = new Map<string, number>();
				edges = [];
				edgeKey = new Map();
				const Q = 10;
				const vKey = (x: number, y: number) => `${Math.round(x * Q)},${Math.round(y * Q)}`;
				function addVertex(x: number, y: number) {
					const k = vKey(x, y);
					let i = vertMap.get(k);
					if (i !== undefined) return i;
					i = verts.length;
					verts.push({ x, y, n: [] });
					vertMap.set(k, i);
					return i;
				}
				function addEdge(a: number, b: number, hexIdx: number) {
					const lo = Math.min(a, b),
						hi = Math.max(a, b);
					const k = `${lo},${hi}`;
					let i = edgeKey.get(k);
					if (i === undefined) {
						i = edges.length;
						edges.push({ a: lo, b: hi, hexes: [] });
						edgeKey.set(k, i);
						if (!verts[a].n.includes(b)) verts[a].n.push(b);
						if (!verts[b].n.includes(a)) verts[b].n.push(a);
					}
					if (!edges[i].hexes.includes(hexIdx)) edges[i].hexes.push(hexIdx);
					return i;
				}
				for (let ci = 0; ci < centers.length; ci++) {
					const c = centers[ci];
					const ids: number[] = [];
					for (let i = 0; i < 6; i++) {
						const ang = (i * Math.PI) / 3;
						ids.push(addVertex(c.cx + R * Math.cos(ang), c.cy + R * Math.sin(ang)));
					}
					for (let i = 0; i < 6; i++) addEdge(ids[i], ids[(i + 1) % 6], ci);
				}
				gridPath = new Path2D();
				const hr = R * 0.92;
				for (const c of centers) {
					for (let i = 0; i < 6; i++) {
						const a = (i * Math.PI) / 3;
						const x = c.cx + hr * Math.cos(a);
						const y = c.cy + hr * Math.sin(a);
						if (i === 0) gridPath.moveTo(x, y);
						else gridPath.lineTo(x, y);
					}
					gridPath.closePath();
				}
			}
			rebuild();
			onResize(rebuild);

			function hexAt(cx: number, cy: number, scale: number) {
				ctx.beginPath();
				const hr = R * scale;
				for (let i = 0; i < 6; i++) {
					const a = (i * Math.PI) / 3;
					const x = cx + hr * Math.cos(a);
					const y = cy + hr * Math.sin(a);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
			}
			function edgeBetween(a: number, b: number) {
				const lo = Math.min(a, b),
					hi = Math.max(a, b);
				const i = edgeKey.get(`${lo},${hi}`);
				return i === undefined ? null : edges[i];
			}

			const MAX_PULSES = 2;
			const EDGE_MS = 620;
			const FADE_MS = 700;
			const active: Array<{
				from: number;
				to: number;
				t: number;
				hops: number;
				fading: boolean;
				fadeT: number;
			}> = [];
			let lastSpawn = -2000;
			function spawn() {
				if (!verts || verts.length === 0) return;
				const W = cv!.width,
					H = cv!.height;
				let tries = 0,
					fromIdx = -1;
				while (tries++ < 60) {
					const idx = Math.floor(Math.random() * verts.length);
					const v = verts[idx];
					if (
						v.n.length >= 2 &&
						v.x > W * 0.08 &&
						v.x < W * 0.92 &&
						v.y > H * 0.2 &&
						v.y < H * 0.82
					) {
						fromIdx = idx;
						break;
					}
				}
				if (fromIdx < 0) return;
				const v = verts[fromIdx];
				const toIdx = v.n[Math.floor(Math.random() * v.n.length)];
				const hops = 4 + Math.floor(Math.random() * 3);
				active.push({ from: fromIdx, to: toIdx, t: 0, hops, fading: false, fadeT: 0 });
			}
			let lastFrame = performance.now();
			function update(now: number) {
				const dt = Math.min(60, now - lastFrame);
				lastFrame = now;
				for (let i = active.length - 1; i >= 0; i--) {
					const p = active[i];
					if (p.fading) {
						p.fadeT += dt / FADE_MS;
						if (p.fadeT >= 1) active.splice(i, 1);
						continue;
					}
					p.t += dt / EDGE_MS;
					if (p.t >= 1) {
						if (p.hops <= 1) {
							p.t = 1;
							p.fading = true;
							p.fadeT = 0;
							continue;
						}
						p.hops -= 1;
						p.t = p.t - 1;
						const v = verts[p.to];
						let next = v.n.filter((x) => x !== p.from);
						if (next.length === 0) next = v.n.slice();
						const newTo = next[Math.floor(Math.random() * next.length)];
						p.from = p.to;
						p.to = newTo;
					}
				}
				if (active.length < MAX_PULSES && now - lastSpawn > 1600 + Math.random() * 1200) {
					spawn();
					lastSpawn = now;
				}
			}
			function draw() {
				if (!alive) return;
				const W = cv!.width,
					H = cv!.height;
				ctx.fillStyle = bgColor();
				ctx.fillRect(0, 0, W, H);
				if (!vis.in) {
					lastFrame = performance.now();
					requestAnimationFrame(draw);
					return;
				}
				const wc = waveColor();
				const now = performance.now();
				update(now);
				ctx.lineWidth = 1;
				ctx.strokeStyle = `rgba(${wc},0.06)`;
				ctx.stroke(gridPath);
				const vig = ctx.createRadialGradient(
					W * 0.5,
					H * 0.5,
					0,
					W * 0.5,
					H * 0.5,
					Math.hypot(W, H) * 0.6
				);
				vig.addColorStop(0, `rgba(${wc},0.04)`);
				vig.addColorStop(1, `rgba(${wc},0)`);
				ctx.fillStyle = vig;
				ctx.fillRect(0, 0, W, H);
				for (const p of active) {
					const vF = verts[p.from],
						vT = verts[p.to];
					const edge = edgeBetween(p.from, p.to);
					if (!edge) continue;
					const alpha = p.fading ? Math.max(0, 1 - p.fadeT) : 1;
					const env = Math.sin(p.t * Math.PI) * alpha;
					ctx.strokeStyle = `rgba(${wc},${env * 0.45})`;
					ctx.lineWidth = 1.1;
					for (const ci of edge.hexes) {
						const c = centers[ci];
						hexAt(c.cx, c.cy, 0.92);
						ctx.stroke();
					}
					ctx.strokeStyle = `rgba(${wc},${0.28 * alpha})`;
					ctx.lineWidth = 1.2;
					ctx.beginPath();
					ctx.moveTo(vF.x, vF.y);
					ctx.lineTo(vT.x, vT.y);
					ctx.stroke();
					const head = p.t;
					const tail = Math.max(0, p.t - 0.55);
					const hx = vF.x + (vT.x - vF.x) * head;
					const hy = vF.y + (vT.y - vF.y) * head;
					const tx = vF.x + (vT.x - vF.x) * tail;
					const ty = vF.y + (vT.y - vF.y) * tail;
					ctx.strokeStyle = `rgba(${wc},${0.85 * alpha})`;
					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.moveTo(tx, ty);
					ctx.lineTo(hx, hy);
					ctx.stroke();
					ctx.fillStyle = `rgba(${wc},${alpha})`;
					ctx.beginPath();
					ctx.arc(hx, hy, 1.9, 0, Math.PI * 2);
					ctx.fill();
				}
				requestAnimationFrame(draw);
			}
			requestAnimationFrame(draw);
		})();

		/* ── index dots · active section tracking ── */
		(function () {
			const links = [...document.querySelectorAll<HTMLAnchorElement>('.index a')];
			const secs = links.map((a) => document.getElementById(a.dataset.id!));
			function update() {
				const probe = window.innerHeight * 0.4;
				let best: HTMLElement | null = secs[0];
				let bestD = Infinity;
				for (const s of secs) {
					if (!s) continue;
					const r = s.getBoundingClientRect();
					const d = Math.abs(r.top - probe);
					if (r.top < window.innerHeight && r.bottom > 0 && d < bestD) {
						best = s;
						bestD = d;
					}
				}
				links.forEach((a) => a.classList.toggle('active', a.dataset.id === (best && best.id)));
			}
			window.addEventListener('scroll', update, { passive: true });
			window.addEventListener('resize', update);
			cleanups.push(() => window.removeEventListener('scroll', update));
			cleanups.push(() => window.removeEventListener('resize', update));
			update();
		})();

		return () => {
			alive = false;
			cleanups.forEach((fn) => fn());
		};
	});
</script>

<Seo
	title="kenTom — Steve Tom · Full-Stack Developer in Kenya"
	description="Steve Tom (kenTom) is a full-stack developer in Kenya building web apps, mobile apps, and custom software. Selected work, field notes, and a lab of interface experiments."
	path="/"
	type="profile"
	keywords="kenTom, Steve Tom, full-stack developer Kenya, web developer Nairobi, software engineer, custom software, mobile app developer, Raccoon254"
/>

<nav class="index" aria-label="sections">
	{#each sections as s}
		<a href="#{s.id}" data-id={s.id} data-label={s.label} aria-label={s.label}></a>
	{/each}
</nav>

<!-- 00 / HERO -->
<section id="hero" class="stage stage--hero" data-screen-label="00 Hero">
	<div class="bg">
		<svg class="ecg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			<defs>
				<path
					id="ecgPath"
					d="M0,400 H560 q10,0 14,-14 q5,-14 10,0 q4,14 10,14 H630 L660,420 L700,170 L740,560 L770,400 q10,0 16,-22 q6,-22 12,0 q6,22 14,22 H1280"
				/>
				<linearGradient id="paintEdge" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stop-color="#fff" stop-opacity="0" />
					<stop offset="0.18" stop-color="#fff" stop-opacity="1" />
					<stop offset="0.82" stop-color="#fff" stop-opacity="1" />
					<stop offset="1" stop-color="#fff" stop-opacity="0" />
				</linearGradient>
				<mask id="paintMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="720">
					<rect id="paintRect" x="0" y="0" width="0" height="720" fill="url(#paintEdge)" />
				</mask>
				<pattern
					id="codeFill"
					patternUnits="userSpaceOnUse"
					width="118"
					height="82"
					patternTransform="rotate(-9)"
				>
					<g class="code-tile" font-size="13" font-weight="600">
						<text x="3" y="13" style="fill: var(--syn-key)">const</text>
						<text x="37" y="13" style="fill: var(--syn-fn)">ken</text>
						<text x="58" y="13" style="fill: var(--syn-pun)">=()=&gt;</text>
						<text x="3" y="28" style="fill: var(--syn-cmt)">// build slow</text>
						<text x="3" y="43" style="fill: var(--syn-str)">'❤'</text>
						<text x="22" y="43" style="fill: var(--syn-pun)">.map(</text>
						<text x="55" y="43" style="fill: var(--syn-fn)">Code</text>
						<text x="78" y="43" style="fill: var(--syn-pun)">)</text>
						<text x="3" y="58" style="fill: var(--syn-num)">01101</text>
						<text x="40" y="58" style="fill: var(--syn-key)">&amp;&amp;</text>
						<text x="60" y="58" style="fill: var(--syn-fn)">λ()</text>
						<text x="82" y="58" style="fill: var(--syn-num)">;;</text>
						<text x="3" y="73" style="fill: var(--syn-pun)">&lt;/</text>
						<text x="17" y="73" style="fill: var(--syn-fn)">Java</text>
						<text x="40" y="73" style="fill: var(--syn-pun)">&gt;</text>
						<text x="50" y="73" style="fill: var(--syn-cmt)">/*·*/</text>
					</g>
				</pattern>
			</defs>

			<rect class="ecg-bg" width="1280" height="720" />

			<text
				class="wm wm-ghost"
				x="640"
				y="430"
				text-anchor="middle"
				font-weight="700"
				font-size="280"
				letter-spacing="-14">ken<tspan class="wm-em-a">Tom</tspan><tspan class="wm-stop">.</tspan></text
			>

			<text
				class="wm wm-bright"
				x="640"
				y="430"
				text-anchor="middle"
				font-weight="700"
				font-size="280"
				letter-spacing="-14"
				mask="url(#paintMask)"
				>ken<tspan class="wm-em">Tom</tspan><tspan class="wm-stop">.</tspan></text
			>

			<g id="ribbon" class="ribbon-stroke" fill="none" stroke-linecap="round" stroke-linejoin="round"
			></g>
		</svg>
	</div>

	<div class="hero-foot">
		<div class="scroll-cue" aria-hidden="true">
			<span class="scroll-line"><span class="scroll-track"></span></span>
			<span class="scroll-ripple"></span>
		</div>
	</div>
</section>

<!-- 01 / ABOUT -->
<section id="about" class="stage stage--about" data-screen-label="01 About">
	<div class="bg"><canvas id="bgWave"></canvas></div>
	<div class="content">
		<div class="eyebrow"><Icon name="user" size={13} /> about</div>
		<div class="line-wrap">
			{#key factIdx}
				<p class="line" in:dustIn out:dustOut>{facts[factIdx]}</p>
			{/key}
		</div>
		<button class="reload" type="button" on:click={reloadFact} aria-label="Another fact">
			<span class="reload-ic" style="transform:rotate({spins * 180}deg)">
				<Icon name="refresh" size={14} />
			</span>
			<span>Another</span>
		</button>
	</div>
</section>

<!-- 02 / WORK -->
<section id="work" class="stage stage--work" data-screen-label="02 Work">
	<div class="bg"><canvas id="bgRipple"></canvas></div>
	<div class="content">
		<div class="eyebrow"><Icon name="coffee" size={13} /> selected work</div>
		<ul class="works">
			{#each works as w}
				<li>
					<a class="ttl" href={w.href} target="_blank" rel="noopener">{w.name}</a>
					<span class="rule"></span>
					<span class="yr">{w.quip}</span>
				</li>
			{/each}
		</ul>
		<div class="works-foot">
			<a
				class="see-all"
				href="https://github.com/Raccoon254?tab=repositories"
				target="_blank"
				rel="noopener"
			>
				<span>See all work</span>
				<span class="ar" aria-hidden="true"><Icon name="star2" size={13} /></span>
			</a>
		</div>
	</div>
</section>

<!-- 02b / TUTORING -->
<section id="tutoring" class="stage stage--tutoring" data-screen-label="02b Tutoring">
	<div class="bg"><canvas id="bgPulse"></canvas></div>
	<div class="content">
		<div class="eyebrow"><Icon name="mirroring-screen" size={13} /> tutoring</div>
		<p class="line">
			One-on-one tutoring on <em>whatever you want to learn</em>. Pick a subject, we go deep on it
			together. I also own
			<a class="skilink" href="https://skillkenya.com" target="_blank" rel="noopener">SkillKenya</a>.
		</p>
	</div>
</section>

<!-- 02c / PARTNERSHIPS -->
<section id="partnerships" class="stage stage--partnerships" data-screen-label="02c Partnerships">
	<div class="bg"><canvas id="bgPartners"></canvas></div>
	<div class="content">
		<div class="eyebrow"><Icon name="ai-shape-triangle" size={13} /> partnerships</div>
		<p class="line">
			Open to building things together. <em>Especially the kind that take a while to become
				obvious.</em>
		</p>
		<div class="partner-row">
			<a class="partner-pill" href="/partners">
				<span>Start a conversation</span>
				<span class="ar" aria-hidden="true"><Icon name="email" size={13} /></span>
			</a>
		</div>
	</div>
</section>

<!-- 03 / LAB -->
<section id="lab" class="stage stage--lab" data-screen-label="03 Lab">
	<div class="bg"><canvas id="bgRain"></canvas></div>
	<div class="content">
		<div class="eyebrow"><Icon name="flash" size={13} /> lab</div>
		<p class="line">
			<a href="/lab" class="skilink">Side rigs</a>. Things that
			<em>move for the joy of it</em>.
		</p>
	</div>
</section>

<!-- 04 / CONTACT -->
<section id="contact" class="stage stage--contact" data-screen-label="04 Contact">
	<div class="bg">
		<svg id="bgContactEcg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			<defs>
				<path
					id="ecgPath2"
					d="M0,400 H560 q10,0 14,-14 q5,-14 10,0 q4,14 10,14 H630 L660,420 L700,170 L740,560 L770,400 q10,0 16,-22 q6,-22 12,0 q6,22 14,22 H1280"
				/>
			</defs>
			<g
				id="ribbon2"
				fill="none"
				stroke="currentColor"
				stroke-opacity="0.35"
				style="color: var(--ink-2)"
				stroke-linecap="round"
				stroke-linejoin="round"
			></g>
		</svg>
	</div>
	<div class="content">
		<div class="eyebrow"><Icon name="messages" size={13} /> contact</div>
		<a class="email" href="mailto:me@kentom.co.ke">me@kentom.co.ke</a>
		<div class="socials">
			{#each socials as s}
				<a
					href={s.href}
					target={s.external ? '_blank' : undefined}
					rel={s.external ? 'noopener' : undefined}
				>
					<Icon name={s.icon} size={15} />
					<span>{s.label}</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- ─────────── 05 / NEWSLETTER ─────────── -->
<section class="news-band">
	<div class="news-inner">
		<NewsletterSignup framed={false} />
	</div>
</section>

<style>
	/* newsletter band: a normal-flow section after the snap stages */
	.news-band {
		padding: clamp(64px, 13vh, 130px) clamp(20px, 5vw, 80px);
		display: grid;
		place-items: center;
	}
	.news-inner {
		width: 100%;
		max-width: 720px;
	}

	/* soft scroll-snap, only while the landing page is mounted */
	:global(html.kf-snap) {
		scroll-snap-type: y proximity;
	}
	@media (prefers-reduced-motion: reduce) {
		:global(html.kf-snap) {
			scroll-snap-type: none;
		}
	}

	/* dot index: fixed right, hover reveals label */
	.index {
		position: fixed;
		z-index: 60;
		right: clamp(16px, 2vw, 28px);
		top: 50%;
		transform: translateY(-50%);
		display: grid;
		gap: 14px;
		padding: 6px;
	}
	.index a {
		position: relative;
		display: block;
		width: 10px;
		height: 10px;
		border: 1px solid var(--hairline-2);
		border-radius: 50%;
		transition:
			background 0.25s ease,
			border-color 0.25s ease,
			transform 0.25s ease;
	}
	.index a::after {
		content: attr(data-label);
		position: absolute;
		right: 22px;
		top: 50%;
		transform: translateY(-50%);
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--ink-2);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.25s ease;
		white-space: nowrap;
	}
	.index a:hover::after,
	.index a.active::after {
		opacity: 1;
	}
	.index a:hover {
		border-color: var(--ink-2);
	}
	.index a.active {
		background: var(--ink-2);
		border-color: var(--ink-2);
		transform: scale(1.15);
	}
	@media (max-width: 700px) {
		.index {
			display: none;
		}
	}

	/* ── stage ── */
	.stage {
		position: relative;
		min-height: 100vh;
		min-height: 100svh;
		display: grid;
		place-items: center;
		overflow: hidden;
		padding: clamp(88px, 12vh, 140px) clamp(20px, 5vw, 80px);
		scroll-snap-align: start;
		scroll-snap-stop: normal;
	}
	.stage > .bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}
	.stage > .bg :global(canvas),
	.stage > .bg :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}
	.stage::before,
	.stage::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 18vh;
		z-index: 1;
		pointer-events: none;
	}
	.stage::before {
		top: 0;
		background: linear-gradient(to bottom, var(--bg), transparent);
	}
	.stage::after {
		bottom: 0;
		background: linear-gradient(to top, var(--bg), transparent);
	}
	.stage > .content {
		position: relative;
		z-index: 2;
		text-align: center;
		max-width: min(90vw, 900px);
	}

	/* type helpers */
	.stage .eyebrow {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 clamp(24px, 4vh, 40px);
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.stage .eyebrow :global(svg) {
		stroke-width: 1.5;
	}
	.line {
		font-size: clamp(26px, 3.4vw, 44px);
		line-height: 1.32;
		font-weight: 400;
		letter-spacing: -0.012em;
		color: var(--ink);
		max-width: 22ch;
		margin: 0 auto;
		text-wrap: pretty;
	}
	.line :global(em) {
		font-style: normal;
		color: var(--mute);
	}
	.line :global(.skilink) {
		color: var(--ink);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 5px;
		text-decoration-color: var(--mute-2);
		transition:
			color 0.25s,
			text-decoration-color 0.25s;
	}
	.line :global(.skilink):hover {
		color: var(--spark);
		text-decoration-color: var(--spark);
	}

	/* about — rotating facts */
	.stage--about .line-wrap {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		/* fixed slot so swapping facts never shifts the button below */
	}
	.stage--about .line-wrap .line {
		margin: 0;
	}
	.stage--about .reload {
		margin-top: clamp(22px, 3.5vh, 36px);
		display: inline-flex;
		align-items: center;
		gap: 9px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--mute);
		background: transparent;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		padding: 9px 16px;
		cursor: pointer;
		transition:
			color 0.25s,
			border-color 0.25s;
	}
	.stage--about .reload:hover {
		color: var(--ink);
		border-color: var(--ink-2);
	}
	.stage--about .reload-ic {
		display: inline-flex;
		color: var(--spark);
		transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* 00 hero */
	.stage--hero {
		padding: 0;
	}
	.stage--hero::before,
	.stage--hero::after {
		display: none;
	}
	.stage--hero :global(svg.ecg) {
		width: 100%;
		height: 100%;
		position: absolute;
		inset: 0;
	}
	.wm {
		font-family: 'Google Sans Display', 'Google Sans', system-ui, sans-serif;
	}
	.wm-em {
		fill: inherit;
	}
	.wm-stop {
		fill: var(--spark);
	}
	.wm-ghost {
		fill: none;
		stroke: var(--ink-2);
		stroke-width: 1.4;
		stroke-opacity: 0.55;
		paint-order: stroke;
		vector-effect: non-scaling-stroke;
	}
	.wm-ghost .wm-em {
		fill: none;
		stroke: var(--ink-2);
	}
	.wm-ghost .wm-stop {
		fill: none;
		stroke: var(--spark);
		stroke-opacity: 0.85;
	}
	.wm-bright {
		fill: url(#codeFill);
	}
	.wm-bright .wm-em {
		fill: url(#codeFill);
	}
	.wm-bright .wm-stop {
		fill: var(--spark);
	}
	.code-tile {
		font-family: 'Google Sans Mono', 'DM Mono', ui-monospace, Menlo, monospace;
	}
	.ribbon-stroke {
		stroke: var(--ink);
	}
	.ecg-bg {
		fill: var(--bg);
	}

	.hero-foot {
		position: absolute;
		bottom: clamp(24px, 5vh, 56px);
		left: 0;
		right: 0;
		z-index: 3;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 14px;
		align-items: center;
	}
	/* minimal scroll indicator: spark glides down a hairline, then
	   a clean ripple blooms from the foot of the line */
	.scroll-cue {
		--cue-dur: 3.6s;
		--cue-ease: cubic-bezier(0.65, 0, 0.35, 1);
		/* drop accelerates as it falls, never eases out */
		--drop-ease: cubic-bezier(0.42, 0, 1, 1);
		/* ripples decelerate as they spread, natural surface feel */
		--ripple-ease: cubic-bezier(0.12, 0.78, 0.28, 1);
		--ripple-peak: 0.85;
		position: relative;
		width: 48px;
		height: 48px;
		display: flex;
		justify-content: center;
	}
	/* invisible track: clips the falling drop, no visible guide line */
	.scroll-line {
		position: relative;
		width: 1px;
		height: 100%;
		overflow: hidden;
	}
	.scroll-track {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 42%;
		background: linear-gradient(to bottom, transparent, var(--spark));
		animation: scroll-cue-travel var(--cue-dur) var(--drop-ease) infinite;
	}
	@keyframes scroll-cue-travel {
		0% {
			transform: translateY(-110%);
			opacity: 0;
		}
		18% {
			opacity: 1;
		}
		52% {
			transform: translateY(138%);
			opacity: 1;
		}
		60%,
		100% {
			transform: translateY(138%);
			opacity: 0;
		}
	}

	/* ripple: oval, foreshortened like a ripple on a surface,
	   sits at the bottom point of the line, unclipped */
	.scroll-ripple {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 21px;
		height: 8px;
		margin: 0 0 -4px -10.5px;
		border-radius: 50%;
		border: 0.5px solid var(--spark);
		transform: scale(0);
		opacity: 0;
		animation: scroll-cue-ripple var(--cue-dur) var(--ripple-ease) infinite;
	}
	@keyframes scroll-cue-ripple {
		0%,
		50% {
			transform: scale(0);
			opacity: 0;
		}
		54% {
			transform: scale(0.4);
			opacity: var(--ripple-peak);
		}
		100% {
			transform: scale(4.4);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scroll-track {
			animation: none;
			transform: translateY(70%);
		}
		.scroll-ripple {
			display: none;
		}
	}

	/* 02 work */
	.stage--work .works {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: clamp(22px, 3.4vh, 40px);
	}
	.stage--work .works li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 100px minmax(0, 1fr);
		gap: clamp(20px, 3vw, 36px);
		align-items: center;
		transition: opacity 0.3s;
	}
	.stage--work .works .ttl {
		font-size: clamp(28px, 4.6vw, 56px);
		font-weight: 500;
		letter-spacing: -0.025em;
		color: var(--ink);
		text-align: right;
		line-height: 1;
		cursor: pointer;
	}
	.stage--work .works .rule {
		display: block;
		height: 1px;
		background: var(--mute-2);
		align-self: center;
		transition: background 0.3s;
	}
	.stage--work .works .yr {
		font-family: var(--mono);
		font-size: 11.5px;
		letter-spacing: 0.24em;
		color: var(--mute);
		text-align: left;
		text-transform: uppercase;
		cursor: pointer;
	}
	.stage--work .works li:hover .ttl {
		color: var(--ink);
	}
	.stage--work .works li:hover .yr {
		color: var(--ink-2);
	}
	.stage--work .works .ttl:hover {
		color: var(--spark);
	}
	.stage--work .works li:hover .rule {
		background: var(--ink-2);
	}
	.stage--work .works:has(li:hover) li:not(:hover) {
		opacity: 0.35;
	}
	.stage--work .works-foot {
		display: flex;
		justify-content: center;
		margin-top: clamp(28px, 4.5vh, 44px);
	}
	.stage--work .see-all {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--ink-2);
		border: 1px solid var(--hairline-2);
		padding: 11px 20px;
		border-radius: 999px;
		background: rgba(var(--bg-rgb), 0.35);
		backdrop-filter: blur(6px);
		transition:
			color 0.25s,
			border-color 0.25s,
			background 0.25s;
	}
	.stage--work .see-all .ar {
		color: var(--spark);
		transition: transform 0.3s;
	}
	.stage--work .see-all:hover {
		color: var(--ink);
		border-color: var(--ink-2);
	}
	.stage--work .see-all:hover .ar {
		transform: scale(1.2);
	}

	/* 02c partnerships */
	.stage--partnerships .partner-row {
		margin-top: clamp(24px, 4.5vh, 44px);
		display: flex;
		justify-content: center;
	}
	.stage--partnerships .partner-pill {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--ink-2);
		border: 1px solid var(--hairline-2);
		padding: 12px 22px;
		border-radius: 999px;
		background: rgba(var(--bg-rgb), 0.35);
		backdrop-filter: blur(6px);
		transition:
			color 0.25s,
			border-color 0.25s;
	}
	.stage--partnerships .partner-pill .ar {
		color: var(--spark);
		transition: transform 0.3s;
	}
	.stage--partnerships .partner-pill:hover {
		color: var(--ink);
		border-color: var(--ink-2);
	}
	.stage--partnerships .partner-pill:hover .ar {
		transform: scale(1.2);
	}

	/* 04 contact */
	/* eyebrow on its own row, above the email (not inline beside it) */
	.stage--contact .eyebrow {
		display: flex;
		justify-content: center;
	}
	.stage--contact .email {
		display: inline-block;
		font-size: clamp(24px, 5.2vw, 64px);
		font-weight: 500;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(28px, 5vh, 48px);
		border-bottom: 1px solid var(--mute-2);
		padding-bottom: 4px;
		transition:
			color 0.25s,
			border-color 0.25s;
		word-break: break-word;
		max-width: 100%;
	}
	.stage--contact .email:hover {
		color: var(--spark);
		border-color: var(--spark);
	}
	.stage--contact .socials {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 12px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.stage--contact .socials a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border: 1px solid var(--hairline);
		padding: 10px 16px;
		border-radius: 999px;
		transition:
			border-color 0.25s,
			color 0.25s,
			background 0.25s;
		background: rgba(var(--bg-rgb), 0.4);
		backdrop-filter: blur(6px);
	}
	.stage--contact .socials a:hover {
		border-color: var(--mute);
		color: var(--ink-2);
	}

	@media (max-width: 600px) {
		.stage > .content {
			text-align: left;
			max-width: 100%;
		}
		.line {
			max-width: 28ch;
			margin: 0;
			font-size: clamp(23px, 6vw, 31px);
			line-height: 1.38;
			letter-spacing: -0.006em;
		}
		.stage--work .works li {
			grid-template-columns: 1fr;
			gap: 2px;
			text-align: left;
		}
		.stage--work .works .ttl {
			text-align: left;
			font-size: clamp(26px, 7vw, 34px);
		}
		.stage--work .works .yr {
			text-align: left;
		}
		.stage--work .works .rule {
			display: none;
		}
		.stage--work .works-foot {
			justify-content: flex-start;
			margin-top: 28px;
		}
		.stage--partnerships .partner-row {
			justify-content: flex-start;
		}
		/* contact: left-aligned, socials pinned to the bottom of the screen */
		.stage--contact .content {
			text-align: left;
			align-self: stretch;
			display: flex;
			flex-direction: column;
		}
		.stage--contact .eyebrow {
			justify-content: flex-start;
		}
		.stage--contact .socials {
			justify-content: flex-start;
			margin-top: auto;
		}
		.stage--contact .email {
			font-size: clamp(22px, 6.4vw, 32px);
		}
		.stage--hero .content {
			text-align: center;
		}
		.hero-foot {
			align-items: center;
		}
	}
</style>
