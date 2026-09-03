<script lang="ts">
	/**
	 * Miniature wireframe of the real /partners/[slug] page: optional logo, name,
	 * blurb, the Tier / Since / Status facts list, and the outbound button.
	 * Nothing is drawn that a sponsor would not actually get, and everything the
	 * live page shows is drawn, the outbound link included: that button is the
	 * whole point of the page for a sponsor, so leaving it out would undersell
	 * what they are buying.
	 *
	 * No browser chrome and no back link. Those were decoration and carried
	 * nothing a sponsor cares about. The viewBox stays close to the badge art's
	 * so the pair sit at similar heights beside each other.
	 */
	export let name = 'Your name';
	export let tierLabel = 'Standard';
	export let showLogo = false;
	export let slug = 'your-name';

	function clip(s: string, n: number): string {
		const v = s.trim();
		return v.length > n ? v.slice(0, n - 1) + '…' : v;
	}

	$: shownName = clip(name || 'Your name', 16);
	$: btnName = clip(name || 'Your name', 12);
	$: shownSlug = clip(slug || 'your-name', 18);
	$: since = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

	$: rows = [
		{ k: 'TIER', v: tierLabel },
		{ k: 'SINCE', v: since },
		{ k: 'STATUS', v: 'Active' }
	];

	/* one offset keeps the two variants from colliding: without a logo the
	   whole stack simply moves up by the height the logo block would take */
	$: off = showLogo ? 0 : -22;
	$: yName = 62 + off;
	$: yB1 = 74 + off;
	$: yB2 = 86 + off;
	$: yF = 100 + off;
	$: yBtn = 178 + off;

	$: label =
		`Wireframe of the sponsor page you get at /partners/${shownSlug}: ` +
		(showLogo ? 'your logo, ' : '') +
		`the name "${shownName}", a short blurb, a facts list reading Tier ${tierLabel}, ` +
		`Since ${since}, Status Active, and a button linking out to your own site.`;
</script>

<svg class="art" viewBox="0 0 360 210" role="img" aria-label={label}>
	<g aria-hidden="true">
		<rect x="3" y="3" width="354" height="204" rx="12" class="s-hair" />

		{#if showLogo}
			<rect x="22" y="18" width="52" height="20" rx="4" class="s-hair f-3" />
			<text class="mono mid" x="48" y="31">LOGO</text>
		{/if}

		<text class="h1" x="22" y={yName}>{shownName}</text>
		<rect x="22" y={yB1} width="250" height="5" rx="2.5" class="f-3" />
		<rect x="22" y={yB2} width="188" height="5" rx="2.5" class="f-3" />

		<!-- Tier / Since / Status, the same three the live page shows -->
		<rect x="22" y={yF} width="316" height="66" rx="7" class="s-hair" />
		<line x1="22" y1={yF + 22} x2="338" y2={yF + 22} class="s-hair" />
		<line x1="22" y1={yF + 44} x2="338" y2={yF + 44} class="s-hair" />
		{#each rows as r, i}
			<text class="mono" x="36" y={yF + 14 + i * 22}>{r.k}</text>
			<text class="val" x="324" y={yF + 14 + i * 22}>{r.v}</text>
		{/each}

		<!-- the outbound link the live page ends on -->
		<rect x="22" y={yBtn} width="134" height="24" rx="12" class="s-hair2" />
		<text class="btn" x="38" y={yBtn + 16}>Visit {btnName}</text>
		<path d="M 138 {yBtn + 7} L 144 {yBtn + 12} L 138 {yBtn + 17}" class="chev" />
	</g>
</svg>

<style>
	.art {
		display: block;
		width: 100%;
		height: auto;
	}
	.s-hair {
		fill: none;
		stroke: var(--hairline);
	}
	.s-hair2 {
		fill: none;
		stroke: var(--hairline-2);
	}
	.f-3 {
		fill: var(--mute-3);
	}
	.s-hair.f-3 {
		fill: var(--mute-3);
	}
	.chev {
		fill: none;
		stroke: var(--mute);
		stroke-width: 1.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.mono {
		font-family: var(--mono);
		font-size: 7px;
		letter-spacing: 2px;
		fill: var(--mute);
	}
	.mid {
		text-anchor: middle;
		letter-spacing: 1.4px;
	}
	.h1 {
		font-family: var(--sans);
		font-size: 21px;
		letter-spacing: -0.5px;
		fill: var(--ink);
	}
	.val {
		font-family: var(--sans);
		font-size: 9.5px;
		fill: var(--ink);
		text-anchor: end;
	}
	.btn {
		font-family: var(--sans);
		font-size: 9px;
		fill: var(--ink);
	}
</style>
