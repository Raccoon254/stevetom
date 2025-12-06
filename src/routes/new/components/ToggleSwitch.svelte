<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let checked = false
	export let leftLabel = 'Auto'
	export let rightLabel = 'Manual'

	const dispatch = createEventDispatcher()

	function handleChange() {
		dispatch('change', { checked })
	}
</script>

<label class="flex items-center gap-3 cursor-pointer select-none">
	<span
		class="text-sm font-medium uppercase tracking-wide transition-opacity duration-300"
		class:opacity-100={!checked}
		class:opacity-40={checked}
	>
		{leftLabel}
	</span>

	<input type="checkbox" bind:checked on:change={handleChange} class="sr-only peer" />

	<span
		class="relative w-24 h-12 bg-[#252525]/15 rounded-full border border-[#252525]/20 transition-all duration-300 peer-checked:bg-[#252525]/25 after:content-[''] after:absolute after:top-1 after:left-1 after:w-10 after:h-10 after:bg-[#252525] after:rounded-full after:shadow-lg after:transition-all after:duration-300 peer-checked:after:translate-x-12"
	></span>

	<span
		class="text-sm font-medium uppercase tracking-wide transition-opacity duration-300"
		class:opacity-100={checked}
		class:opacity-40={!checked}
	>
		{rightLabel}
	</span>
</label>
