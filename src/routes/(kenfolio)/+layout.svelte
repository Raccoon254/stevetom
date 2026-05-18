<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/kenfolio.css';
	import Brand from '$lib/components/kenfolio/Brand.svelte';
	import ThemeToggle from '$lib/components/kenfolio/ThemeToggle.svelte';
	import Colophon from '$lib/components/kenfolio/Colophon.svelte';

	onMount(() => {
		document.body.classList.add('kenfolio');
		return () => document.body.classList.remove('kenfolio');
	});
</script>

<div class="kenfolio">
	<Brand />
	<ThemeToggle />
	<Colophon />
	<slot />
</div>
