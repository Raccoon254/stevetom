<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	const marks = [
		{
			file: '/logo-dark.png',
			download: 'kentom-logo-dark.png',
			panel: '#f4f1ea',
			caption: 'For light backgrounds',
			name: 'logo-dark.png',
			meta: 'PNG · 576 × 596 · transparent'
		},
		{
			file: '/logo-light.png',
			download: 'kentom-logo-light.png',
			panel: '#050505',
			caption: 'For dark backgrounds',
			name: 'logo-light.png',
			meta: 'PNG · 576 × 596 · transparent'
		}
	];

	const wordmark = {
		file: '/namelogo.jpg',
		download: 'kentom-wordmark.jpg',
		name: 'namelogo.jpg',
		meta: 'JPG · 5279 × 1754'
	};

	const specs = [
		{
			label: 'Clear space',
			value: 'One notch',
			note: 'Keep an empty margin at least as tall as the small triangular notch cut into the mark, on all four sides.'
		},
		{
			label: 'Minimum size',
			value: '24px',
			note: "Don't render it smaller than that on screen. Below that the notch stops reading and it's just a black square."
		}
	];

	const donts = [
		'Recolour the mark. Black or white only, never a tint, gradient, or fill in the accent colour.',
		'Stretch, skew, or rotate it. The proportions are locked.',
		'Add drop shadows, outlines, glows, or bevels.',
		'Put the light mark on a light surface, or the dark mark on a dark one. If contrast is unclear, use the wordmark instead.',
		"Redraw the wordmark in another typeface. Use namelogo.jpg as supplied."
	];

	const naming = [
		{
			label: 'The brand',
			value: 'kenTom',
			note: 'Lowercase k, capital T, no space. Not Kentom, KenTom, Ken Tom, or kentom.'
		},
		{
			label: 'The person',
			value: 'Steve Osoro Tom',
			note: 'Commonly shortened to Steve Tom on first or later reference.'
		}
	];

	// Straight from src/lib/seo.ts SITE.description, the site-wide description
	// used in <meta name="description"> and the OG tags. Not rewritten.
	const boilerplate = {
		line: 'Steve Tom (kenTom) is a full-stack developer in Kenya building web apps, mobile apps, and custom software.',
		paragraph:
			'Steve Tom (kenTom) is a full-stack developer in Kenya building web apps, mobile apps, and custom software. Selected work, field notes, and a lab of interface experiments.'
	};

	const palette: { theme: string; swatches: { label: string; token: string; hex: string }[] }[] = [
		{
			theme: 'Dark',
			swatches: [
				{ label: 'Surface', token: '--bg', hex: '#050505' },
				{ label: 'Ink', token: '--ink', hex: '#f4fffc' },
				{ label: 'Ink, dim', token: '--ink-2', hex: '#cfeee6' },
				{ label: 'Mute', token: '--mute', hex: '#6fa89c' },
				{ label: 'Accent', token: '--spark', hex: '#ff7a1a' }
			]
		},
		{
			theme: 'Light',
			swatches: [
				{ label: 'Surface', token: '--bg', hex: '#f4f1ea' },
				{ label: 'Ink', token: '--ink', hex: '#0e110f' },
				{ label: 'Ink, dim', token: '--ink-2', hex: '#2a3d38' },
				{ label: 'Mute', token: '--mute', hex: '#6a8a82' },
				{ label: 'Accent', token: '--spark', hex: '#d85f00' }
			]
		}
	];

	let copied = '';
	let copyTimer: ReturnType<typeof setTimeout>;

	async function copyText(value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copied = value;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = ''), 1600);
		} catch {
			// Clipboard API unavailable or blocked (older Safari, permissions).
			// The value is still on screen to select and copy by hand.
		}
	}
</script>

<Seo
	title="Brand"
	description="Logo files, brand colours, and the facts press need to write about kenTom (Steve Tom), no email required."
	path="/brand"
	keywords="kenTom logo, kenTom press kit, kenTom brand assets, Steve Tom media kit"
	breadcrumbs={[{ name: 'Brand', path: '/brand' }]}
/>

<main class="page">
	<div class="brand-kit">
		<h1>The logo, the colours, <em>the facts</em>.</h1>
		<p class="lede">
			Writing about kenTom, putting a logo on a slide, or building a partner page? Everything
			below is safe to use as-is: real files, the actual brand colours, and the two names to get
			right. If what you need isn't here, the address at the bottom reaches me directly.
		</p>

		<!-- 1 · logo -->
		<section class="block">
			<div class="section-label">Logo</div>
			<div class="marks">
				{#each marks as m}
					<div class="mark-card">
						<div
							class="mark-panel"
							style="background:{m.panel}"
							role="img"
							aria-label="kenTom mark, {m.caption.toLowerCase()}"
						>
							<span class="mark-glyph" style="background-image:url({m.file})" aria-hidden="true"
						></span>
						</div>
						<div class="mark-row">
							<div class="mark-info">
								<span class="mark-caption">{m.caption}</span>
								<span class="mark-meta">{m.name} · {m.meta}</span>
							</div>
							<a class="dl" href={m.file} download={m.download}>
								<Icon name="document-download" size={14} />
								<span>Download</span>
							</a>
						</div>
					</div>
				{/each}

				<div class="mark-card mark-card--wide">
					<div class="mark-panel mark-panel--wordmark">
						<img src={wordmark.file} alt="kenTom wordmark, split black and white" loading="lazy" />
					</div>
					<div class="mark-row">
						<div class="mark-info">
							<span class="mark-caption">Full wordmark</span>
							<span class="mark-meta">{wordmark.name} · {wordmark.meta}</span>
						</div>
						<a class="dl" href={wordmark.file} download={wordmark.download}>
							<Icon name="document-download" size={14} />
							<span>Download</span>
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- 2 · usage -->
		<section class="block">
			<div class="section-label">Usage</div>
			<div class="specs">
				{#each specs as s}
					<div class="spec">
						<span class="spec-label">{s.label}</span>
						<span class="spec-value">{s.value}</span>
						<span class="spec-note">{s.note}</span>
					</div>
				{/each}
			</div>
			<ul class="donts">
				{#each donts as d}
					<li>Don't {d}</li>
				{/each}
			</ul>
		</section>

		<!-- 3 · colour -->
		<section class="block">
			<div class="section-label">Colour</div>
			<p class="block-note">
				The real values from the site's design tokens. Click a hex to copy it.
			</p>
			<div class="palette">
				{#each palette as group}
					<div class="palette-group">
						<span class="palette-theme">{group.theme}</span>
						<div class="swatches">
							{#each group.swatches as s}
								<button
									type="button"
									class="swatch"
									on:click={() => copyText(s.hex)}
									aria-label="Copy {s.hex}"
								>
									<span class="chip" style="background:{s.hex}"></span>
									<span class="swatch-meta">
										<span class="swatch-label">{s.label} <span class="swatch-token">{s.token}</span></span>
										<span class="swatch-hex">{copied === s.hex ? 'Copied' : s.hex}</span>
									</span>
									<Icon name={copied === s.hex ? 'copy-success' : 'copy'} size={13} />
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- 4 · naming -->
		<section class="block">
			<div class="section-label">Naming</div>
			<div class="naming-grid">
				{#each naming as n}
					<div class="naming-item">
						<span class="n-label">{n.label}</span>
						<span class="n-value">{n.value}</span>
						<span class="n-note">{n.note}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- 5 · boilerplate -->
		<section class="block">
			<div class="section-label">Boilerplate</div>
			<div class="boiler">
				<div class="boiler-item">
					<div class="boiler-head">
						<span class="b-label">One line</span>
						<button type="button" class="copy-btn" on:click={() => copyText(boilerplate.line)}>
							<Icon name={copied === boilerplate.line ? 'copy-success' : 'copy'} size={13} />
							<span>{copied === boilerplate.line ? 'Copied' : 'Copy'}</span>
						</button>
					</div>
					<p>{boilerplate.line}</p>
				</div>
				<div class="boiler-item">
					<div class="boiler-head">
						<span class="b-label">Short paragraph</span>
						<button type="button" class="copy-btn" on:click={() => copyText(boilerplate.paragraph)}>
							<Icon name={copied === boilerplate.paragraph ? 'copy-success' : 'copy'} size={13} />
							<span>{copied === boilerplate.paragraph ? 'Copied' : 'Copy'}</span>
						</button>
					</div>
					<p>{boilerplate.paragraph}</p>
				</div>
			</div>
		</section>

		<!-- 6 · press contact -->
		<section class="block block--last">
			<div class="section-label">Press contact</div>
			<div class="cta-row">
				<a class="pill pill--solid" href="mailto:me@kentom.co.ke?subject=Press%20enquiry">
					<span>Email for press</span>
					<span class="ar" aria-hidden="true"><Icon name="email" size={14} /></span>
				</a>
				<span class="alt">interviews, quotes, or an asset that isn't here</span>
			</div>
		</section>
	</div>
</main>

<style>
	.brand-kit {
		width: 100%;
		max-width: var(--page-w);
	}

	.brand-kit h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(36px, 5vw, 64px);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(18px, 3vh, 28px);
		text-wrap: balance;
	}
	.brand-kit h1 em {
		font-style: normal;
		color: var(--mute);
	}
	.brand-kit .lede {
		font-size: clamp(17px, 1.6vw, 20px);
		line-height: 1.55;
		color: var(--ink-2);
		max-width: 60ch;
		margin: 0 0 clamp(44px, 7vh, 64px);
		text-wrap: pretty;
	}

	/* section scaffolding, matches /partners */
	.block {
		margin-bottom: clamp(44px, 7vh, 68px);
	}
	.block--last {
		margin-bottom: 0;
	}
	.section-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		padding-bottom: 14px;
		margin-bottom: clamp(20px, 3vh, 28px);
		border-bottom: 1px solid var(--hairline);
	}
	.block-note {
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
		margin: -8px 0 20px;
	}

	/* 1 · logo */
	.marks {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(14px, 2vw, 20px);
	}
	.mark-card--wide {
		grid-column: 1 / -1;
	}
	.mark-panel {
		border: 1px solid var(--hairline);
		border-radius: 14px;
		aspect-ratio: 16 / 10;
		display: grid;
		place-items: center;
		overflow: hidden;
	}
	.mark-glyph {
		width: 34%;
		height: 34%;
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
	}
	.mark-panel--wordmark {
		aspect-ratio: auto;
		padding: 0;
	}
	.mark-panel--wordmark img {
		display: block;
		width: 100%;
		height: auto;
	}
	.mark-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-top: 12px;
	}
	.mark-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.mark-caption {
		font-size: 14px;
		color: var(--ink);
	}
	.mark-meta {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		color: var(--mute);
	}
	.dl {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-2);
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		padding: 8px 13px;
		transition: color 0.25s, border-color 0.25s;
	}
	.dl:hover {
		color: var(--ink);
		border-color: var(--spark);
	}

	@media (max-width: 640px) {
		.marks {
			grid-template-columns: 1fr;
		}
	}

	/* 2 · usage */
	.specs {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		border-top: 1px solid var(--hairline);
		border-bottom: 1px solid var(--hairline);
		margin-bottom: clamp(20px, 3vh, 28px);
	}
	.spec {
		padding: clamp(20px, 3vh, 26px) clamp(16px, 2.2vw, 24px);
		border-right: 1px solid var(--hairline);
		display: grid;
		gap: 8px;
		align-content: start;
	}
	.spec:last-child {
		border-right: none;
	}
	.spec-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.spec-value {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(22px, 2.4vw, 28px);
		letter-spacing: -0.015em;
		color: var(--ink);
	}
	.spec-note {
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--ink-2);
	}
	@media (max-width: 640px) {
		.specs {
			grid-template-columns: 1fr;
		}
		.spec {
			border-right: none;
			border-bottom: 1px solid var(--hairline);
		}
		.spec:last-child {
			border-bottom: none;
		}
	}

	.donts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}
	.donts li {
		position: relative;
		padding-left: 20px;
		font-size: 14.5px;
		line-height: 1.55;
		color: var(--ink-2);
	}
	.donts li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.65em;
		width: 6px;
		height: 1px;
		background: var(--spark);
	}

	/* 3 · colour */
	.palette {
		display: grid;
		gap: clamp(24px, 3.5vh, 32px);
	}
	.palette-theme {
		display: block;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--ink);
		margin-bottom: 12px;
	}
	.swatches {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 10px;
	}
	.swatch {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		border: 1px solid var(--hairline);
		border-radius: 10px;
		padding: 10px;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: border-color 0.25s;
	}
	.swatch:hover {
		border-color: var(--mute-2);
	}
	.chip {
		width: 100%;
		aspect-ratio: 1.6 / 1;
		border-radius: 6px;
		border: 1px solid var(--hairline);
	}
	.swatch-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.swatch-label {
		font-size: 12.5px;
		color: var(--ink);
	}
	.swatch-token {
		font-family: var(--mono);
		font-size: 9.5px;
		color: var(--mute);
	}
	.swatch-hex {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.04em;
		color: var(--mute);
	}
	.swatch :global(svg) {
		color: var(--mute);
	}
	@media (max-width: 720px) {
		.swatches {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* 4 · naming */
	.naming-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: clamp(20px, 3vw, 40px);
	}
	.naming-item {
		display: grid;
		gap: 8px;
		padding-top: clamp(18px, 2.5vh, 24px);
		border-top: 1px solid var(--hairline);
	}
	.n-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.n-value {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(22px, 2.4vw, 28px);
		letter-spacing: -0.015em;
		color: var(--ink);
	}
	.n-note {
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--ink-2);
	}
	@media (max-width: 640px) {
		.naming-grid {
			grid-template-columns: 1fr;
		}
	}

	/* 5 · boilerplate */
	.boiler {
		display: grid;
		gap: clamp(20px, 3vh, 28px);
	}
	.boiler-item {
		border: 1px solid var(--hairline);
		border-radius: 12px;
		padding: clamp(18px, 2.4vw, 24px);
	}
	.boiler-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}
	.b-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-2);
		background: transparent;
		border: 1px solid var(--hairline-2);
		border-radius: 999px;
		padding: 6px 12px;
		cursor: pointer;
		transition: color 0.25s, border-color 0.25s;
	}
	.copy-btn:hover {
		color: var(--ink);
		border-color: var(--spark);
	}
	.boiler-item p {
		margin: 0;
		font-size: 15px;
		line-height: 1.6;
		color: var(--ink-2);
	}

	/* 6 · press contact */
	.cta-row {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
	}
	.cta-row .alt {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
	}
</style>
