<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { Zap, Hand } from 'lucide-svelte'

	export let checked = false
	export let leftLabel = 'Auto'
	export let rightLabel = 'Manual'

	const dispatch = createEventDispatcher()

	function handleChange() {
		dispatch('change', { checked })
	}
</script>

<label class="flex items-center gap-4 cursor-pointer select-none group">
	<span
		class="text-sm font-semibold uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
		class:opacity-100={!checked}
		class:text-[#252525]={!checked}
		class:opacity-40={checked}
	>
		{leftLabel}
	</span>

	<div class="relative">
		<input type="checkbox" bind:checked on:change={handleChange} class="sr-only peer" />

		<!-- Track -->
		<div
			class="w-24 h-12 rounded-full border border-[#252525]/20 shadow-inner transition-colors duration-300 peer-checked:bg-[#252525]/5 bg-[#252525]/5"
		></div>

		<!-- Thumb -->
		<div
			class="absolute top-1 left-1 w-10 h-10 rounded-full shadow-md transition-all duration-300 transform peer-checked:translate-x-12 flex items-center justify-center
			bg-repeating-linear-gradient"
			style="
				background-image: repeating-linear-gradient(
					-45deg,
					#252525,
					#252525 2px,
					#3a3a3a 2px,
					#3a3a3a 4px
				);
			"
		>
		{#if checked}
			<Hand size={22} class={checked ? 'fill-[#ffffff] text-white' : ''} />
		{:else}
			<Zap size={22} class={!checked ? 'fill-[#ffffff] text-white' : ''} />
		{/if}
		</div>
	</div>

	<span
		class="text-sm font-semibold uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
		class:opacity-100={checked}
		class:text-[#252525]={checked}
		class:opacity-40={!checked}
	>
		{rightLabel}
	</span>
</label>
