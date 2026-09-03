<script lang="ts">
	/**
	 * Mounts the first-party page-view tracker. Drop it once inside a layout.
	 *
	 * afterNavigate fires for the first render and for every client-side
	 * navigation after it, so one call site covers both. Nothing renders and
	 * nothing blocks: the beacon is queued after the page is already on screen.
	 */
	import { afterNavigate } from '$app/navigation';
	import { trackPageview } from '$lib/analytics';

	afterNavigate(({ to }) => {
		trackPageview(to?.url);
	});
</script>
