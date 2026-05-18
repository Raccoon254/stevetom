<script lang="ts">
	import { getIcon } from '$lib/icons';

	export let name: string;
	export let size: number | string = 18;
	let className = '';
	export { className as class };

	$: svg = getIcon(name);
	$: dim = typeof size === 'number' ? size + 'px' : size;
</script>

<span
	class={className}
	style="width:{dim};height:{dim}"
	aria-hidden="true"
>
	{@html svg}
</span>

<style>
	span {
		display: inline-flex;
		flex: 0 0 auto;
		line-height: 0;
		/* align with the text it sits beside in inline (non-flex) contexts */
		vertical-align: middle;
	}
	span :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
