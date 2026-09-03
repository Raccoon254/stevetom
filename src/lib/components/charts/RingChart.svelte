<script lang="ts">
	/** Concentric activity rings, the Apple Watch shape.
	 *
	 *  Ported from the taifa-ai console's RingChart, rewritten for Svelte
	 *  4 with plain scoped CSS.
	 *
	 *  One ring per item, each sweeping its share of the total, drawn
	 *  outside-in so the largest contributor owns the outer ring. Chosen
	 *  over a stacked bar for the "by tier" cut because that is a
	 *  composition: the question is "how much of the whole is this one",
	 *  and a ring answers it at a glance where a bar makes you compare
	 *  lengths against an invisible total.
	 *
	 *  Caps are rounded and the track is always drawn, so a 2% slice is
	 *  still visible as a dot on its own ring rather than vanishing. The
	 *  legend beside the rings carries every label and value, so identity
	 *  is never colour alone and no number is gated behind a hover. */
	import './chart-tokens.css';

	type Slice = { label: string; value: number; color: string; note?: string };

	export let slices: Slice[] = [];
	export let size = 168;
	export let thickness = 11;
	export let gap = 5;
	export let centerLabel = '';
	export let centerValue = '';
	export let formatValue: (n: number) => string = (n) => String(n);
	/** Below this total a share is noise dressed as a fact, so the legend
	 *  drops the percentages and shows counts only. */
	export let minSampleForShare = 0;

	let hovered: number | null = null;

	$: total = Math.max(1, slices.reduce((a, s) => a + s.value, 0));
	$: realTotal = slices.reduce((a, s) => a + s.value, 0);
	$: center = size / 2;
	// Below this the inner rings collapse into each other and the chart
	// stops being readable, so the remainder gets a line of text instead.
	$: maxRings = Math.max(1, Math.floor((center - thickness) / (thickness + gap)) + 1);
	$: rings = slices.slice(0, maxRings);
	$: showShare = realTotal >= minSampleForShare;
</script>

<div class="ring-wrap">
	<div class="rings" style="width:{size}px;height:{size}px">
		<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
			<!-- rotated so every ring starts at twelve o'clock rather than at
			     three, which is where SVG's zero angle actually is -->
			<g transform="rotate(-90 {center} {center})">
				{#each rings as slice, i (slice.label)}
					{@const r = center - thickness / 2 - i * (thickness + gap)}
					{@const circumference = 2 * Math.PI * r}
					{@const fraction = slice.value / total}
					{#if r > thickness / 2}
						<circle cx={center} cy={center} {r} fill="none" class="track" stroke-width={thickness} />
						<circle
							cx={center}
							cy={center}
							{r}
							fill="none"
							stroke={slice.color}
							stroke-width={thickness}
							stroke-linecap="round"
							stroke-dasharray="{circumference} {circumference}"
							stroke-dashoffset={circumference * (1 - fraction)}
							opacity={hovered === null || hovered === i ? 1 : 0.35}
							class="arc"
						/>
					{/if}
				{/each}
			</g>
		</svg>
		<div class="center">
			{#if hovered !== null && rings[hovered]}
				<span class="center-value">{formatValue(rings[hovered].value)}</span>
				<span class="center-label">{rings[hovered].label}</span>
			{:else}
				<span class="center-value">{centerValue}</span>
				<span class="center-label">{centerLabel}</span>
			{/if}
		</div>
	</div>

	<ul class="keys">
		{#each rings as slice, i (slice.label)}
			<li>
				<button
					type="button"
					class="key"
					class:on={hovered === i}
					on:mouseenter={() => (hovered = i)}
					on:mouseleave={() => (hovered = null)}
					on:focus={() => (hovered = i)}
					on:blur={() => (hovered = null)}
				>
					<span class="dot" style="background:{slice.color}"></span>
					<span class="key-label" title={slice.label}>{slice.label}</span>
					<span class="key-value">
						{formatValue(slice.value)}
						{#if showShare}
							<span class="key-share">{((slice.value / total) * 100).toFixed(0)}%</span>
						{/if}
					</span>
				</button>
				{#if slice.note}
					<p class="key-note">{slice.note}</p>
				{/if}
			</li>
		{/each}
		{#if slices.length > rings.length}
			<li class="more">+{slices.length - rings.length} more, not drawn</li>
		{/if}
	</ul>
</div>

<style>
	.ring-wrap {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 22px;
	}
	.rings {
		position: relative;
		flex: 0 0 auto;
	}
	.rings svg {
		display: block;
	}
	circle.track {
		stroke: var(--hairline);
	}
	circle.arc {
		transition:
			stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 150ms;
	}
	@media (prefers-reduced-motion: reduce) {
		circle.arc {
			transition: none;
		}
	}

	.center {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		gap: 3px;
	}
	.center-value {
		font-family: 'Google Sans Display', var(--sans);
		font-size: 22px;
		font-weight: 500;
		letter-spacing: -0.02em;
		color: var(--ink);
		line-height: 1;
	}
	.center-label {
		font-family: var(--mono);
		font-size: 9px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
		max-width: 82%;
		text-align: center;
	}

	.keys {
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1 1 190px;
		min-width: 0;
		display: grid;
		gap: 4px;
	}
	.key {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 6px 8px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;
		cursor: default;
		text-align: left;
		font: inherit;
		transition: border-color 0.18s ease;
	}
	.key.on {
		border-color: var(--hairline);
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 2px;
		flex: 0 0 auto;
	}
	.key-label {
		flex: 1;
		min-width: 0;
		font-size: 12.5px;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.key-value {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--ink-2, var(--ink));
		font-variant-numeric: tabular-nums;
	}
	.key-share {
		margin-left: 6px;
		color: var(--mute);
	}
	.key-note {
		margin: 0 0 4px 27px;
		font-size: 11px;
		color: var(--mute);
	}
	.more {
		padding: 4px 8px;
		font-size: 11.5px;
		color: var(--mute);
	}
</style>
