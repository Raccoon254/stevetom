<script lang="ts" context="module">
	/** Svelte 4 has no $props.id(); gradient ids only have to be unique
	 *  within the document, so a module-scoped counter is enough. */
	let uidSeq = 0;

	/** Geometry helpers take every input explicitly rather than closing
	 *  over reactive state. In Svelte 4 the dirty mask for a template
	 *  expression is built from the identifiers that literally appear in
	 *  it, so a helper that quietly reads `band` from the component scope
	 *  would not re-run on resize whenever the other arguments happened
	 *  to land on the same numbers. Passing them in keeps the dependency
	 *  visible to the compiler. */
	export function xAt(i: number, left: number, band: number): number {
		return left + band * (i + 0.5);
	}
	export function yAt(v: number, top: number, plotH: number, axisMax: number): number {
		return top + plotH - (v / axisMax) * plotH;
	}
</script>

<script lang="ts">
	/** N series over one shared time axis, as bars, lines, or both.
	 *
	 *  Ported from the taifa-ai console's TimeSeriesChart and rewritten
	 *  for Svelte 4. Two deliberate departures from the original:
	 *
	 *  1. One axis, always. The original's sibling LineChart normalised
	 *     every series against its own maximum, which is a dual axis
	 *     wearing a disguise: it invents a correlation the data does not
	 *     contain. Everything drawn here shares one scale, so heights are
	 *     comparable, and two quantities of different magnitude get two
	 *     charts rather than two scales.
	 *  2. Band positioning rather than i/(n-1). Bars sit inside their own
	 *     slot instead of straddling the plot edges, and a one-bucket
	 *     window renders as one centred bar rather than a full-width
	 *     smear.
	 *
	 *  Measured to the container's pixel width, so one user unit is one
	 *  CSS pixel and text and strokes are the size they claim. */
	import './chart-tokens.css';

	type Series = {
		name: string;
		color: string;
		values: number[];
		/** Bars by default; 'line' draws a 2px stroke on the same axis. */
		kind?: 'bar' | 'line';
	};

	export let labels: string[] = [];
	export let series: Series[] = [];
	export let height = 260;
	/** Stack the bar series instead of grouping them side by side. */
	export let stacked = false;
	export let formatValue: (n: number) => string = (n) => String(n);
	/** Longer text for the tooltip header, e.g. a full date. */
	export let tooltipLabels: string[] = [];
	export let ariaLabel = '';

	const uid = `ts${++uidSeq}`;
	const PAD = { top: 16, right: 14, bottom: 28, left: 54 };
	const GRID_LINES = 4;
	const GAP = 2; // the surface gap: white does the separating, not a stroke
	const gridRatios = Array.from({ length: GRID_LINES + 1 }, (_, i) => i / GRID_LINES);

	let width = 640;
	let hover: number | null = null;

	function measure(node: HTMLElement) {
		const observer = new ResizeObserver(() => (width = node.clientWidth));
		observer.observe(node);
		width = node.clientWidth;
		return { destroy: () => observer.disconnect() };
	}

	$: count = labels.length;
	$: plotW = Math.max(0, width - PAD.left - PAD.right);
	$: plotH = Math.max(0, height - PAD.top - PAD.bottom);
	$: band = count > 0 ? plotW / count : plotW;

	$: barIdx = series.map((s, i) => (s.kind === 'line' ? -1 : i)).filter((i) => i >= 0);
	$: lineIdx = series.map((s, i) => (s.kind === 'line' ? i : -1)).filter((i) => i >= 0);

	/** Axis ticks land on round numbers, so the values you did not label
	 *  directly are still readable off the grid.
	 *
	 *  When every value is a whole number the step is floored at 1. A
	 *  near-empty window is the normal case on this site, and without the
	 *  floor a single subscriber produced an axis reading 0, 0.25, 0.5,
	 *  0.75, 1 — which the integer formatter then rendered as
	 *  0, 0, 1, 1, 1. */
	function niceMax(raw: number, ticks: number, wholeNumbers: boolean): number {
		if (!(raw > 0)) return wholeNumbers ? ticks : 1;
		const rough = raw / ticks;
		const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
		const norm = rough / magnitude;
		let step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * magnitude;
		if (wholeNumbers) step = Math.max(1, Math.round(step));
		return step * ticks;
	}

	$: rawMax = (() => {
		let max = 0;
		for (let i = 0; i < count; i++) {
			if (stacked) {
				let sum = 0;
				for (const s of barIdx) sum += series[s].values[i] ?? 0;
				max = Math.max(max, sum);
			} else {
				for (const s of barIdx) max = Math.max(max, series[s].values[i] ?? 0);
			}
			for (const s of lineIdx) max = Math.max(max, series[s].values[i] ?? 0);
		}
		return max;
	})();
	$: wholeNumbers = series.every((s) => s.values.every((v) => Number.isInteger(v)));
	$: axisMax = niceMax(rawMax, GRID_LINES, wholeNumbers);

	// Thin marks: capped at 24px however wide the slot gets, so a
	// three-bucket window draws three bars and not three billboards.
	$: groupCount = stacked ? 1 : Math.max(1, barIdx.length);
	$: barW = Math.max(1.5, Math.min(24, (band * 0.68) / groupCount - (groupCount > 1 ? GAP : 0)));

	function barX(cx: number, slot: number, w: number, groups: number): number {
		const total = w * groups + GAP * (groups - 1);
		return cx - total / 2 + slot * (w + GAP);
	}

	/** Rounded at the data end, square at the baseline. */
	function barPath(px: number, py: number, w: number, h: number, round: boolean): string {
		const r = round ? Math.min(4, w / 2, h) : 0;
		if (r <= 0.5) return `M${px},${py} h${w} v${h} h${-w} Z`;
		return (
			`M${px},${py + h} L${px},${py + r} Q${px},${py} ${px + r},${py} ` +
			`L${px + w - r},${py} Q${px + w},${py} ${px + w},${py + r} L${px + w},${py + h} Z`
		);
	}

	function stackBase(i: number, upto: number, bars: number[], all: Series[]): number {
		let sum = 0;
		for (const s of bars) {
			if (s === upto) break;
			sum += all[s].values[i] ?? 0;
		}
		return sum;
	}

	/** Only the topmost segment that actually has a value gets the
	 *  rounded end, so a stack whose last series is empty in this bucket
	 *  still reads as one bar rather than a clipped block. */
	function isTopSegment(i: number, si: number, bars: number[], all: Series[]): boolean {
		let seen = false;
		for (const s of bars) {
			if (s === si) {
				seen = true;
				continue;
			}
			if (seen && (all[s].values[i] ?? 0) > 0) return false;
		}
		return true;
	}

	function linePath(
		values: number[],
		n: number,
		left: number,
		top: number,
		band_: number,
		plotH_: number,
		max: number
	): string {
		let d = '';
		for (let i = 0; i < n; i++) {
			d += `${i === 0 ? 'M' : 'L'}${xAt(i, left, band_)},${yAt(values[i] ?? 0, top, plotH_, max)}`;
		}
		return d;
	}

	function areaPath(
		values: number[],
		n: number,
		left: number,
		top: number,
		band_: number,
		plotH_: number,
		max: number
	): string {
		if (n === 0) return '';
		const base = top + plotH_;
		return (
			`${linePath(values, n, left, top, band_, plotH_, max)} ` +
			`L${xAt(n - 1, left, band_)},${base} L${xAt(0, left, band_)},${base} Z`
		);
	}

	/* How many x labels fit, measured rather than assumed. A fixed
	   "every nth bucket" rule reads fine on a desktop card and collides
	   into "Aug 4Aug 9" at 390px, so the stride is derived from the plot
	   width: roughly 64px per label, never more than eight. */
	$: maxLabels = Math.max(2, Math.min(8, Math.floor(plotW / 64)));
	$: labelStride = Math.max(1, Math.ceil(count / maxLabels));

	function onMove(event: MouseEvent) {
		if (count === 0 || band <= 0) return;
		const box = (event.currentTarget as SVGElement).getBoundingClientRect();
		const i = Math.floor((event.clientX - box.left - PAD.left) / band);
		hover = Math.max(0, Math.min(count - 1, i));
	}

	$: hoverTotal =
		hover === null ? 0 : series.reduce((sum, s) => sum + (s.values[hover as number] ?? 0), 0);
	$: describedBy = ariaLabel || `${series.map((s) => s.name).join(' and ')} over time`;
</script>

<div class="ts" use:measure>
	{#if count > 0 && series.length > 0}
		<svg
			{width}
			{height}
			role="img"
			aria-label={describedBy}
			on:mousemove={onMove}
			on:mouseleave={() => (hover = null)}
		>
			<defs>
				{#each series as s, si (s.name)}
					<linearGradient id="{uid}-a{si}" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color={s.color} stop-opacity="0.16" />
						<stop offset="100%" stop-color={s.color} stop-opacity="0" />
					</linearGradient>
				{/each}
			</defs>

			<!-- recessive grid: solid hairlines, one step off the surface -->
			{#each gridRatios as ratio (ratio)}
				{@const gy = PAD.top + plotH - ratio * plotH}
				<line x1={PAD.left} y1={gy} x2={PAD.left + plotW} y2={gy} class="grid" />
				<text x={PAD.left - 9} y={gy + 3.5} text-anchor="end" class="axis">
					{formatValue(axisMax * ratio)}
				</text>
			{/each}

			{#if hover !== null}
				{@const hx = xAt(hover, PAD.left, band)}
				<line x1={hx} y1={PAD.top} x2={hx} y2={PAD.top + plotH} class="crosshair" />
			{/if}

			{#each barIdx as si, slot (si)}
				{#each labels as _, i (i)}
					{@const value = series[si].values[i] ?? 0}
					{@const base = stacked ? stackBase(i, si, barIdx, series) : 0}
					{@const topY = yAt(base + value, PAD.top, plotH, axisMax)}
					{@const bottomY = yAt(base, PAD.top, plotH, axisMax) - (stacked && base > 0 ? GAP : 0)}
					{@const left = barX(xAt(i, PAD.left, band), stacked ? 0 : slot, barW, groupCount)}
					{#if value > 0 && bottomY - topY > 0}
						<path
							d={barPath(
								left,
								topY,
								barW,
								Math.max(1, bottomY - topY),
								!stacked || isTopSegment(i, si, barIdx, series)
							)}
							fill={series[si].color}
							opacity={hover === null || hover === i ? 1 : 0.42}
							class="bar"
						/>
					{/if}
				{/each}
			{/each}

			{#each lineIdx as si (si)}
				{#if series.length === 1}
					<path
						d={areaPath(series[si].values, count, PAD.left, PAD.top, band, plotH, axisMax)}
						fill="url(#{uid}-a{si})"
					/>
				{/if}
				<path
					d={linePath(series[si].values, count, PAD.left, PAD.top, band, plotH, axisMax)}
					fill="none"
					stroke={series[si].color}
					class="line"
				/>
				{#if count <= 24}
					{#each labels as _, i (i)}
						<circle
							cx={xAt(i, PAD.left, band)}
							cy={yAt(series[si].values[i] ?? 0, PAD.top, plotH, axisMax)}
							r="4"
							fill={series[si].color}
							class="dot"
						/>
					{/each}
				{/if}
			{/each}

			{#if hover !== null}
				{#each lineIdx as si (si)}
					<circle
						cx={xAt(hover, PAD.left, band)}
						cy={yAt(series[si].values[hover] ?? 0, PAD.top, plotH, axisMax)}
						r="4.5"
						fill={series[si].color}
						class="dot"
					/>
				{/each}
			{/if}

			{#each labels as label, i (i)}
				<!-- the last bucket always gets a label; a stride label that
				     would land on top of it is dropped instead of overlapping -->
				{#if i === count - 1 || (i % labelStride === 0 && count - 1 - i >= labelStride * 0.5)}
					<text
						x={xAt(i, PAD.left, band)}
						y={height - 8}
						text-anchor={i === 0 ? 'start' : i === count - 1 ? 'end' : 'middle'}
						class="axis"
					>
						{label}
					</text>
				{/if}
			{/each}
		</svg>

		{#if hover !== null}
			<!-- Every series at this instant, not just the one under the
			     cursor: the question a time series invites is "what was the
			     mix here", and reading it off N separate hovers is worse.

			     Past 60% of the plot the readout flips to the other side of
			     the crosshair, and either way its max width is whatever is
			     actually left between it and the card edge, so on a phone it
			     narrows instead of being clipped by the wrapper. -->
			{@const hx = xAt(hover, PAD.left, band)}
			{@const flip = hx > PAD.left + plotW * 0.6}
			{@const offset = Math.max(6, flip ? width - hx + 12 : hx + 12)}
			<div
				class="tip"
				style="{flip ? 'right' : 'left'}:{offset}px;max-width:{Math.max(
					60,
					width - offset - 6
				)}px"
			>
				<span class="tip-when">{tooltipLabels[hover] ?? labels[hover]}</span>
				{#each series as s (s.name)}
					<span class="tip-row">
						<span class="tip-key" class:line={s.kind === 'line'} style="background:{s.color}"></span>
						<span class="tip-value">{formatValue(s.values[hover] ?? 0)}</span>
						<span class="tip-name">{s.name}</span>
					</span>
				{/each}
				{#if series.length > 1 && stacked}
					<span class="tip-row total">
						<span class="tip-key blank"></span>
						<span class="tip-value">{formatValue(hoverTotal)}</span>
						<span class="tip-name">Total</span>
					</span>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.ts {
		position: relative;
		width: 100%;
		min-width: 0;
		/* the measured SVG is exact after hydration; this keeps the first
		   server-rendered frame from pushing the page sideways on a phone */
		overflow: hidden;
	}
	.ts svg {
		display: block;
		max-width: 100%;
	}

	line.grid {
		stroke: var(--hairline);
		stroke-width: 1;
	}
	line.crosshair {
		stroke: var(--mute);
		stroke-width: 1;
		opacity: 0.55;
	}
	text.axis {
		fill: var(--mute);
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.04em;
	}
	path.bar {
		transition: opacity 0.15s ease;
	}
	path.line {
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	/* the 2px surface ring keeps a marker legible where it crosses a line */
	circle.dot {
		stroke: var(--chart-surface);
		stroke-width: 2;
	}

	.tip {
		position: absolute;
		top: 8px;
		z-index: 3;
		display: grid;
		gap: 4px;
		padding: 9px 11px;
		background: var(--panel, var(--bg));
		border: 1px solid var(--hairline-2, var(--hairline));
		border-radius: 9px;
		pointer-events: none;
		min-width: 0;
	}
	.tip-when {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	/* values lead, labels follow: here the reader already has the series
	   and wants the number, which is the legend's hierarchy inverted */
	.tip-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12.5px;
		min-width: 0;
		white-space: nowrap;
	}
	.tip-row.total {
		border-top: 1px solid var(--hairline);
		padding-top: 5px;
		margin-top: 1px;
	}
	.tip-key {
		width: 9px;
		height: 9px;
		border-radius: 2px;
		flex: 0 0 auto;
	}
	.tip-key.line {
		height: 2px;
		width: 12px;
	}
	.tip-key.blank {
		background: transparent;
	}
	.tip-value {
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	/* the series name gives way before the number does: the reader
	   already knows which series they are on */
	.tip-name {
		color: var(--mute);
		font-size: 11.5px;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
