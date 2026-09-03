<script lang="ts">
	/**
	 * Hand-drawn preview of the embeddable "Sponsoring kenTom" badge, shown
	 * sitting in the footer of the sponsor's own site.
	 *
	 * Nothing here links anywhere: the badge endpoint (/api/badge) does not
	 * exist yet, so this is a picture of what a sponsor gets, not a download.
	 */
	export let label =
		'Preview of the sponsor badge: a small card carrying the kenTom mark and the words "Sponsoring kenTom", drawn sitting in the footer of your own website.';
</script>

<svg class="art" viewBox="0 0 360 180" role="img" aria-label={label}>
	<g aria-hidden="true">
		<!-- their page -->
		<rect x="6" y="6" width="348" height="168" rx="14" class="s-dash" />
		<text class="mono" x="22" y="30">YOUR SITE</text>
		<rect x="22" y="42" width="200" height="7" rx="3.5" class="f-3" />
		<rect x="22" y="58" width="140" height="7" rx="3.5" class="f-3" />
		<line x1="22" y1="84" x2="338" y2="84" class="s-hair" />

		<!-- the badge -->
		<rect x="22" y="100" width="200" height="58" rx="12" class="s-hair2 f-bg" />
		<rect x="38" y="114" width="30" height="30" rx="8" class="f-3" />
		<g class="f-ink" transform="translate(43.4 119) scale(0.03356)">
			<path
				d="M 0 0 L 319.02 -1 L 318.946 402.932 L 158 595 L 158 183 L -1 183 L 0 0 Z"
				transform="translate(1,1)"
			/>
			<path
				d="M 0 0 C 110.421 0 191.846 0 191.846 0 L 0 183.628 C 0 183.628 0 65.96 0 0 Z"
				transform="translate(384,0)"
			/>
		</g>
		<text class="mono" x="80" y="123">SPONSORING</text>
		<text class="name" x="80" y="142">kenTom</text>
		<circle cx="206" cy="113" r="3" class="f-spark" />

		<!-- rest of the footer -->
		<rect x="250" y="112" width="70" height="6" rx="3" class="f-3" />
		<rect x="250" y="126" width="54" height="6" rx="3" class="f-3" />
		<rect x="250" y="140" width="62" height="6" rx="3" class="f-3" />
	</g>
</svg>

<style>
	.art {
		display: block;
		width: 100%;
		height: auto;
	}
	.s-dash {
		fill: none;
		stroke: var(--hairline-2);
		stroke-dasharray: 4 5;
	}
	.s-hair {
		fill: none;
		stroke: var(--hairline);
	}
	.s-hair2 {
		stroke: var(--hairline-2);
	}
	.f-bg {
		fill: var(--bg);
	}
	.f-3 {
		fill: var(--mute-3);
	}
	.f-ink {
		fill: var(--ink);
	}
	.f-spark {
		fill: var(--spark);
	}
	.mono {
		font-family: var(--mono);
		font-size: 7.5px;
		letter-spacing: 2.2px;
		fill: var(--mute);
	}
	.name {
		font-family: var(--sans);
		font-size: 17px;
		fill: var(--ink);
	}
</style>
