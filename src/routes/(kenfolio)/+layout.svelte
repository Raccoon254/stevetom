<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/kenfolio.css';
	import Nav from '$lib/components/kenfolio/Nav.svelte';
	import Footer from '$lib/components/kenfolio/Footer.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import NudgeHost from '$lib/components/kenfolio/NudgeHost.svelte';

	onMount(() => {
		document.body.classList.add('kenfolio');
		return () => document.body.classList.remove('kenfolio');
	});
</script>

<!-- first-party page-view tracker: no cookies, no third-party beacon -->
<Analytics />

<div class="kenfolio">
	<Nav />
	<slot />
	<Footer />
	<!-- bottom-right nudge: shows at most one panel, after real engagement -->
	<NudgeHost />
</div>
