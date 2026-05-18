<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// Triple-tap Shift from anywhere jumps to the admin login.
	onMount(() => {
		let count = 0;
		let timer: ReturnType<typeof setTimeout>;
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Shift') return;
			count++;
			clearTimeout(timer);
			if (count === 3) {
				count = 0;
				goto('/login');
				return;
			}
			timer = setTimeout(() => (count = 0), 1000);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<slot />
