<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '$lib/styles/kenfolio.css';
	import ErrorView from '$lib/components/kenfolio/ErrorView.svelte';

	onMount(() => {
		document.body.classList.add('kenfolio');
		return () => document.body.classList.remove('kenfolio');
	});
</script>

<svelte:head>
	<title>kenTom · {$page.status}</title>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="kenfolio">
	<ErrorView status={$page.status} message={$page.error?.message ?? ''} />
</div>
