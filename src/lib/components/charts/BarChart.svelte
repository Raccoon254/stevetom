<script lang="ts">
	/** A ranked breakdown, drawn as horizontal labelled rows.
	 *
	 *  Ported from the taifa-ai console's BarChart, rewritten for Svelte 4
	 *  and given plain scoped CSS in place of Tailwind, to match the rest
	 *  of this admin.
	 *
	 *  Horizontal on purpose: a status name like "IN PROGRESS" has
	 *  nowhere to go under a 60px column but sits comfortably at the head
	 *  of a row, and N rows make the list longer rather than the bars
	 *  thinner. Every row carries its value as a direct label, which is
	 *  also the relief channel the light-mode palette needs.
	 *
	 *  One hue for every bar unless the caller passes per-bar colours.
	 *  These categories have no natural order, so colouring them by value
	 *  would spend the identity channel re-encoding what bar length
	 *  already shows. */
	import './chart-tokens.css';

	type Bar = {
		label: string;
		value: number;
		/** Small trailing note, e.g. a share. Suppress it yourself when
		 *  the denominator is too small to carry a percentage. */
		hint?: string;
		color?: string;
		href?: string;
	};

	export let bars: Bar[] = [];
	export let max: number | undefined = undefined;
	export let color = 'var(--chart-1)';
	export let formatValue: (n: number) => string = (n) => String(n);

	// Never zero: a window where every value is 0 would divide by it and
	// render NaN-width bars.
	$: scale = Math.max(1, max ?? Math.max(0, ...bars.map((b) => b.value)));
</script>

<ul class="bars">
	{#each bars as bar (bar.label)}
		<li class="row">
			<span class="head">
				{#if bar.href}
					<a class="name" href={bar.href} title={bar.label}>{bar.label}</a>
				{:else}
					<span class="name" title={bar.label}>{bar.label}</span>
				{/if}
				<span class="value">
					{formatValue(bar.value)}{#if bar.hint}<span class="hint">{bar.hint}</span>{/if}
				</span>
			</span>
			<span class="track">
				<!-- a zero draws nothing at all: a min-width stub would read
				     as "a little" when the answer is "none" -->
				{#if bar.value > 0}
					<span
						class="fill"
						style="width:{(bar.value / scale) * 100}%;background:{bar.color ?? color}"
					></span>
				{/if}
			</span>
		</li>
	{/each}
</ul>

<style>
	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 13px;
	}
	.row {
		display: grid;
		gap: 6px;
		min-width: 0;
	}
	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		min-width: 0;
	}
	.name {
		font-size: 13px;
		color: var(--ink);
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	a.name:hover {
		text-decoration: underline;
	}
	.value {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--ink-2, var(--ink));
		font-variant-numeric: tabular-nums;
	}
	.hint {
		margin-left: 7px;
		color: var(--mute);
	}
	.track {
		display: block;
		height: 8px;
		border-radius: 4px;
		background: var(--hairline);
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		/* square at the baseline, 4px rounded at the data end */
		border-radius: 0 4px 4px 0;
		min-width: 2px;
		transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}
	@media (prefers-reduced-motion: reduce) {
		.fill {
			transition: none;
		}
	}
</style>
