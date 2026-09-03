<script lang="ts">
	/** An ordered set of stages, each a horizontal bar, with the step
	 *  rate printed between them.
	 *
	 *  New for this dashboard rather than ported: the taifa-ai kit has no
	 *  funnel. It follows the same house rules as the ported components —
	 *  measured-free layout (plain flow, so it cannot overflow), direct
	 *  labels on every bar, and a one-hue ordinal ramp, because funnel
	 *  stages are a sequence and swapping two of them would change the
	 *  meaning.
	 *
	 *  Two honesty rules are baked in:
	 *
	 *  - Bars scale against the largest stage, not the first. Stages that
	 *    come from different tables are not guaranteed to shrink, and a
	 *    later stage that overtakes an earlier one has to be able to draw
	 *    itself rather than clip at 100%.
	 *  - A step rate is only printed when the stage above it clears the
	 *    sample floor. One session and one donation is not a 100%
	 *    conversion rate, so under the floor the row shows the two raw
	 *    counts and says the sample is too small. */
	import './chart-tokens.css';

	type Stage = {
		label: string;
		value: number;
		/** What the number counts, when it is not the same unit as the
		 *  stage above. Printed under the label. */
		note?: string;
	};

	export let stages: Stage[] = [];
	/** Below this, the previous stage cannot support a percentage. */
	export let minSample = 50;
	export let formatValue: (n: number) => string = (n) => String(n);
	export let colors: string[] = [
		'var(--chart-ord-1)',
		'var(--chart-ord-2)',
		'var(--chart-ord-3)',
		'var(--chart-ord-4)'
	];

	$: scale = Math.max(1, ...stages.map((s) => s.value));
</script>

<ol class="funnel">
	{#each stages as stage, i (stage.label)}
		{@const previous = i > 0 ? stages[i - 1].value : null}
		{@const inverted = previous !== null && stage.value > previous}
		{@const rate =
			previous !== null && previous >= minSample && !inverted
				? (stage.value / previous) * 100
				: null}
		<li class="stage">
			{#if i > 0}
				<p class="step">
					{#if rate !== null}
						<span class="step-rate">{rate.toFixed(1)}%</span> of the step above
					{:else if inverted}
						<!-- A later stage outrunning an earlier one is real, not a
						     bug: the stages come from tables that are not joined.
						     Say so rather than printing a rate over 100%. -->
						<span class="step-thin"
							>{formatValue(stage.value)} against {formatValue(previous ?? 0)} above, so not a
							subset of it</span
						>
					{:else if previous !== null && previous > 0}
						<span class="step-thin"
							>{formatValue(stage.value)} of {formatValue(previous)}, too few to rate</span
						>
					{:else}
						<span class="step-thin">nothing in the step above to rate against</span>
					{/if}
				</p>
			{/if}

			<div class="head">
				<span class="label">{stage.label}</span>
				<span class="value">{formatValue(stage.value)}</span>
			</div>
			<div class="track">
				{#if stage.value > 0}
					<div
						class="fill"
						style="width:{(stage.value / scale) * 100}%;background:{colors[
							Math.min(i, colors.length - 1)
						]}"
					></div>
				{/if}
			</div>
			{#if stage.note}
				<p class="note">{stage.note}</p>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.funnel {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 4px;
	}
	.stage {
		display: grid;
		gap: 6px;
		min-width: 0;
	}
	.step {
		display: flex;
		align-items: center;
		gap: 7px;
		margin: 6px 0 6px 1px;
		padding-left: 13px;
		border-left: 1px solid var(--hairline);
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mute);
		min-height: 20px;
	}
	.step-rate {
		color: var(--ink-2, var(--ink));
		font-variant-numeric: tabular-nums;
	}
	.step-thin {
		color: var(--mute);
	}
	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		min-width: 0;
	}
	.label {
		font-size: 13px;
		color: var(--ink);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.value {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--ink-2, var(--ink));
		font-variant-numeric: tabular-nums;
	}
	.track {
		height: 10px;
		border-radius: 5px;
		background: var(--hairline);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		/* square at the baseline, 4px rounded at the data end */
		border-radius: 0 4px 4px 0;
		min-width: 3px;
		transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}
	@media (prefers-reduced-motion: reduce) {
		.fill {
			transition: none;
		}
	}
	.note {
		margin: 2px 0 0;
		font-size: 11.5px;
		line-height: 1.45;
		color: var(--mute);
	}
</style>
