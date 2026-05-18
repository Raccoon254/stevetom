<script lang="ts">
	import { page } from '$app/stores';
	import ErrorView from '$lib/components/kenfolio/ErrorView.svelte';
</script>

<svelte:head>
	<title>kenTom · {$page.status}</title>
</svelte:head>

<ErrorView status={$page.status} message={$page.error?.message ?? ''} />
