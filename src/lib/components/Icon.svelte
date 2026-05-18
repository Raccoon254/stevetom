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
	style="display:inline-flex;width:{dim};height:{dim};line-height:0"
	aria-hidden="true"
>
	{@html svg}
</span>

<style>
	span :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
