<script lang="ts">
	/**
	 * Miniature wireframe of the real /partners/[slug] page: the logo beside the
	 * name, a short blurb, and the Tier / Since / Status list.
	 *
	 * Three things here are deliberate, and have each been reverted once already:
	 *  - The logo sits to the LEFT of the name, on the same line, never stacked
	 *    above it.
	 *  - There is no outbound button. It added a third band of chrome to a
	 *    thumbnail that is already dense.
	 *  - The viewBox is 2:1, matching SponsorBadgeArt. That is what keeps the two
	 *    illustrations the same height so their captions sit on one line.
	 */
	export let name = 'Your name';
	export let tierLabel = 'Standard';
	export let showLogo = false;

	function clip(s: string, n: number): string {
		const v = s.trim();
		return v.length > n ? v.slice(0, n - 1) + '…' : v;
	}

	$: shownName = clip(name || 'Your name', showLogo ? 13 : 16);
	$: since = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

	$: rows = [
		{ k: 'TIER', v: tierLabel },
		{ k: 'SINCE', v: since },
		{ k: 'STATUS', v: 'Active' }
	];

	/* The list runs to the bottom of the frame, so the three rows divide the
	   remaining height evenly instead of leaving a gap under the last one. */
	const F_TOP = 96;
	const F_BOTTOM = 164;
	const ROW = (F_BOTTOM - F_TOP) / 3;

	$: label =
		'Wireframe of the sponsor page you get: ' +
		(showLogo ? 'your logo beside ' : '') +
		`the name "${shownName}", a short blurb, and a list reading Tier ${tierLabel}, ` +
		`Since ${since}, Status Active.`;
</script>

<svg class="art" viewBox="0 0 360 180" role="img" aria-label={label}>
	<g aria-hidden="true">
		<rect x="3" y="3" width="354" height="174" rx="12" class="s-hair" />

		{#if showLogo}
			<rect x="22" y="28" width="42" height="30" rx="5" class="s-hair f-3" />
			<text class="mono mid" x="43" y="47">LOGO</text>
			<text class="h1" x="76" y="52">{shownName}</text>
		{:else}
			<text class="h1" x="22" y="52">{shownName}</text>
		{/if}

		<rect x="22" y="68" width="250" height="5" rx="2.5" class="f-3" />
		<rect x="22" y="80" width="188" height="5" rx="2.5" class="f-3" />

		<!-- Tier / Since / Status, the same three the live page shows -->
		<rect x="22" y={F_TOP} width="316" height={F_BOTTOM - F_TOP} rx="7" class="s-hair" />
		<line x1="22" y1={F_TOP + ROW} x2="338" y2={F_TOP + ROW} class="s-hair" />
		<line x1="22" y1={F_TOP + ROW * 2} x2="338" y2={F_TOP + ROW * 2} class="s-hair" />
		{#each rows as r, i}
			<text class="mono" x="36" y={F_TOP + ROW * i + ROW / 2 + 3}>{r.k}</text>
			<text class="val" x="324" y={F_TOP + ROW * i + ROW / 2 + 3}>{r.v}</text>
		{/each}
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
	.f-3 {
		fill: var(--mute-3);
	}
	.s-hair.f-3 {
		fill: var(--mute-3);
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
</style>
