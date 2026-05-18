<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '$lib/styles/kenfolio.css';
	import Nav from '$lib/components/kenfolio/Nav.svelte';
	import Colophon from '$lib/components/kenfolio/Colophon.svelte';

	// The landing page renders its own dot-index nav + colophon.
	$: isHome = $page.route.id === '/(kenfolio)';

	onMount(() => {
		document.body.classList.add('kenfolio');
		return () => document.body.classList.remove('kenfolio');
	});
</script>

<div class="kenfolio">
	<Nav />
	{#if !isHome}
		<Colophon />
	{/if}
	<slot />
</div>
