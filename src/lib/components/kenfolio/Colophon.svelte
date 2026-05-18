<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	export let href = '/';
	export let label = 'kentom';
</script>

<div class="colophon">
	<a {href}><Icon name="arrow-left" size={11} /> {label}</a>
</div>

<style>
	.colophon a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
</style>
