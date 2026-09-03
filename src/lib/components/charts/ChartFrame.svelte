<script lang="ts">
	/** The container every chart on this site sits in.
	 *
	 *  It owns the four things a chart card must never be missing: a
	 *  title, the legend slot, an honest empty state, and the table view
	 *  that is the chart's accessible twin. The table is always in the
	 *  DOM (visually hidden until the toggle is pressed) so a screen
	 *  reader reaches every value without the SVG having to describe
	 *  itself, and so a value a mark is too small to label is never gated
	 *  behind a hover.
	 *
	 *  The empty state lives here rather than in each chart because the
	 *  charts on this dashboard are empty far more often than they are
	 *  full: the business is young and most of these tables have single
	 *  digits in them. "Nothing here yet" is the default rendering, not
	 *  an afterthought, and it says what would put something there. */
	import Icon from '$lib/components/Icon.svelte';
	import './chart-tokens.css';

	export let title: string;
	/** One line under the title: the caveat, the source, the window. */
	export let note = '';
	/** True when there is genuinely nothing to draw. Never faked away. */
	export let empty = false;
	export let emptyIcon = 'graph';
	export let emptyTitle = 'Nothing recorded yet';
	export let emptyText = '';
	/** Table view. Leave columns empty to omit the toggle entirely. */
	export let columns: string[] = [];
	export let rows: (string | number)[][] = [];
	/** Extra footnote under the plot, e.g. what a number excludes. */
	export let footnote = '';

	let showTable = false;
</script>

<figure class="frame a-card">
	<figcaption class="frame-head">
		<div class="frame-titles">
			<h3 class="frame-title">{title}</h3>
			{#if note}<p class="frame-note">{note}</p>{/if}
		</div>
		<div class="frame-tools">
			<slot name="legend" />
			{#if columns.length > 0 && !empty}
				<button
					type="button"
					class="frame-toggle"
					aria-pressed={showTable}
					on:click={() => (showTable = !showTable)}
				>
					<Icon name={showTable ? 'graph' : 'document-text'} size={11} />
					{showTable ? 'Chart' : 'Table'}
				</button>
			{/if}
		</div>
	</figcaption>

	{#if empty}
		<div class="frame-empty">
			<span class="frame-empty-icon"><Icon name={emptyIcon} size={26} /></span>
			<p class="frame-empty-title">{emptyTitle}</p>
			{#if emptyText}<p class="frame-empty-text">{emptyText}</p>{/if}
		</div>
	{:else}
		<div class="frame-plot" class:hidden={showTable}>
			<slot />
		</div>

		{#if columns.length > 0}
			<div class="frame-table" class:sr-only={!showTable}>
				<table>
					<caption class="sr-only">{title}{note ? `. ${note}` : ''}</caption>
					<thead>
						<tr>
							{#each columns as col, i}
								<th scope="col" class:num={i > 0}>{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each rows as row}
							<tr>
								{#each row as cell, i}
									{#if i === 0}
										<th scope="row">{cell}</th>
									{:else}
										<td class="num">{cell}</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}

	{#if footnote}
		<p class="frame-foot">{footnote}</p>
	{/if}
</figure>

<style>
	.frame {
		margin: 0;
		padding: 16px 16px 12px;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.frame-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px 16px;
		margin-bottom: 14px;
	}
	.frame-titles {
		min-width: 0;
	}
	.frame-title {
		margin: 0;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
		font-weight: 400;
	}
	.frame-note {
		margin: 6px 0 0;
		font-size: 12px;
		line-height: 1.45;
		color: var(--mute);
		max-width: 54ch;
	}
	.frame-tools {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}

	.frame-toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		background: transparent;
		border: 1px solid var(--hairline);
		border-radius: 7px;
		padding: 5px 9px;
		cursor: pointer;
		transition:
			color 0.2s,
			border-color 0.2s;
	}
	.frame-toggle:hover,
	.frame-toggle[aria-pressed='true'] {
		color: var(--ink);
		border-color: var(--hairline-2, var(--hairline));
	}

	.frame-plot {
		min-width: 0;
	}
	.frame-plot.hidden {
		display: none;
	}

	/* empty state: says what is missing and what would fill it */
	.frame-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 8px;
		padding: 42px 18px 46px;
	}
	.frame-empty-icon {
		color: var(--mute-2, var(--mute));
		display: inline-flex;
	}
	.frame-empty-title {
		margin: 4px 0 0;
		font-size: 14px;
		color: var(--ink);
	}
	.frame-empty-text {
		margin: 0;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--mute);
		max-width: 44ch;
	}

	/* table view: the WCAG-clean twin of every chart */
	.frame-table {
		overflow-x: auto;
		margin-top: 2px;
	}
	.frame-table table {
		width: 100%;
		border-collapse: collapse;
		font-size: 12.5px;
	}
	.frame-table th,
	.frame-table td {
		padding: 7px 10px;
		text-align: left;
		border-bottom: 1px solid var(--hairline);
		white-space: nowrap;
	}
	.frame-table thead th {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		font-weight: 400;
	}
	.frame-table tbody th {
		font-weight: 400;
		color: var(--ink);
	}
	.frame-table td.num,
	.frame-table th.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: var(--ink-2, var(--ink));
	}
	.frame-table tbody tr:last-child th,
	.frame-table tbody tr:last-child td {
		border-bottom: 0;
	}

	.frame-foot {
		margin: 12px 0 2px;
		font-size: 11.5px;
		line-height: 1.5;
		color: var(--mute);
		max-width: 62ch;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
