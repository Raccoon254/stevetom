<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/kenfolio.css';
	import Nav from '$lib/components/kenfolio/Nav.svelte';
	import Footer from '$lib/components/kenfolio/Footer.svelte';

	onMount(() => {
		document.body.classList.add('kenfolio');
		return () => document.body.classList.remove('kenfolio');
	});
</script>

<div class="kenfolio">
	<Nav />
	<slot />
	<Footer />
</div>
