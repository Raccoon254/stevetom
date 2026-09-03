<script lang="ts">
	/** Identity is never colour alone: every key is labelled, and the
	 *  swatch mirrors the mark it stands for (a block for bars and area
	 *  fills, a short rule for lines). */
	import './chart-tokens.css';

	export let items: { name: string; color: string; kind?: 'bar' | 'line' }[] = [];
</script>

{#if items.length > 1}
	<ul class="legend">
		{#each items as item (item.name)}
			<li class="key">
				<span
					class="swatch"
					class:line={item.kind === 'line'}
					style="background:{item.color}"
				></span>
				{item.name}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 15px;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		white-space: nowrap;
	}
	.swatch {
		width: 9px;
		height: 9px;
		border-radius: 2px;
		flex: 0 0 auto;
	}
	.swatch.line {
		height: 2px;
		width: 13px;
	}
</style>
