<script lang="ts">
	/**
	 * How a sponsorship links back. Three nodes, left to right:
	 * your site -> the kenTom partners wall -> your own sponsor page, and then
	 * the outbound link from that page back to you.
	 *
	 * That last edge is labelled rel="sponsored" on purpose. Outbound links on
	 * the partners pages carry that attribute, so the honest claim is referral
	 * traffic and visibility, never SEO link equity.
	 */
	export let label =
		'Diagram of how a sponsorship links back. The badge on your own site points to kenTom. The kenTom partners wall points to your own sponsor page. That page points back out to your site with a rel="sponsored" link, which passes visitors, not search ranking.';
</script>

<svg class="art" viewBox="0 0 560 212" role="img" aria-label={label}>
	<g aria-hidden="true">
		<!-- captions -->
		<text class="cap" x="83" y="28">YOUR SITE</text>
		<text class="cap" x="280" y="28">KENTOM PARTNERS</text>
		<text class="cap" x="477" y="28">YOUR SPONSOR PAGE</text>

		<!-- 1 · their site, with the badge in it -->
		<rect x="8" y="40" width="150" height="112" rx="12" class="s-hair2" />
		<rect x="24" y="60" width="90" height="6" rx="3" class="f-3" />
		<rect x="24" y="74" width="64" height="6" rx="3" class="f-3" />
		<rect x="24" y="100" width="118" height="32" rx="8" class="s-hair" />
		<rect x="32" y="108" width="16" height="16" rx="4" class="f-3" />
		<text class="tiny" x="56" y="113">SPONSORING</text>
		<text class="tinyname" x="56" y="126">kenTom</text>

		<line x1="162" y1="96" x2="194" y2="96" class="s-hair2" />
		<path d="M 193 90 L 199 96 L 193 102" class="chev" />

		<!-- 2 · the partners wall, one slot theirs -->
		<rect x="205" y="40" width="150" height="112" rx="12" class="s-hair2" />
		<rect x="221" y="58" width="58" height="6" rx="3" class="f-3" />
		<rect x="221" y="74" width="38" height="24" rx="6" class="s-hair" />
		<rect x="263" y="74" width="38" height="24" rx="6" class="s-spark" />
		<circle cx="282" cy="86" r="3" class="f-spark" />
		<rect x="305" y="74" width="38" height="24" rx="6" class="s-hair" />
		<rect x="221" y="106" width="38" height="24" rx="6" class="s-hair" />
		<rect x="263" y="106" width="38" height="24" rx="6" class="s-hair" />
		<rect x="305" y="106" width="38" height="24" rx="6" class="s-hair" />

		<line x1="359" y1="96" x2="391" y2="96" class="s-hair2" />
		<path d="M 390 90 L 396 96 L 390 102" class="chev" />

		<!-- 3 · their own page -->
		<rect x="402" y="40" width="150" height="112" rx="12" class="s-hair2" />
		<rect x="418" y="56" width="56" height="10" rx="5" class="f-ink2" />
		<rect x="418" y="74" width="112" height="5" rx="2.5" class="f-3" />
		<rect x="418" y="86" width="88" height="5" rx="2.5" class="f-3" />
		<rect x="418" y="100" width="118" height="36" rx="6" class="s-hair" />
		<line x1="418" y1="112" x2="536" y2="112" class="s-hair" />
		<line x1="418" y1="124" x2="536" y2="124" class="s-hair" />

		<!-- the outbound link, back to them -->
		<path
			d="M 477 156 L 477 182 Q 477 190 469 190 L 91 190 Q 83 190 83 182 L 83 162"
			class="s-dash"
		/>
		<path d="M 77 168 L 83 162 L 89 168" class="chev" />
		<rect x="236" y="182" width="128" height="15" class="f-bg" />
		<text class="tag" x="300" y="193">rel="sponsored"</text>
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
	.s-spark {
		fill: none;
		stroke: var(--spark);
	}
	.s-dash {
		fill: none;
		stroke: var(--hairline-2);
		stroke-dasharray: 3 5;
	}
	.chev {
		fill: none;
		stroke: var(--mute);
		stroke-width: 1.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.f-3 {
		fill: var(--mute-3);
	}
	.f-ink2 {
		fill: var(--ink-2);
	}
	.f-spark {
		fill: var(--spark);
	}
	.f-bg {
		fill: var(--bg);
	}
	.cap,
	.tag {
		font-family: var(--mono);
		fill: var(--mute);
		text-anchor: middle;
	}
	.cap {
		font-size: 8px;
		letter-spacing: 2.2px;
	}
	.tag {
		font-size: 8px;
		letter-spacing: 0.6px;
	}
	.tiny {
		font-family: var(--mono);
		font-size: 5.6px;
		letter-spacing: 1.4px;
		fill: var(--mute);
	}
	.tinyname {
		font-family: var(--sans);
		font-size: 9px;
		fill: var(--ink);
	}
</style>
