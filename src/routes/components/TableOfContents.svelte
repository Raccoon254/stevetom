<script lang="ts">
	import { onMount } from 'svelte'

	export let sections: { id: string; title: string }[] = []
	export let activeSection: string = ''

	function scrollToSection(id: string) {
		const element = document.getElementById(id)
		if (element) {
			const offset = 100 // Adjust for header height
			const elementPosition = element.getBoundingClientRect().top
			const offsetPosition = elementPosition + window.pageYOffset - offset

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth',
			})
			activeSection = id
		}
	}
</script>

<nav class="hidden lg:block sticky top-32 w-64 h-fit">
	<h3 class="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">On this page</h3>
	<ul class="space-y-1 border-l border-white/10">
		{#each sections as section}
			<li>
				<button
					on:click={() => scrollToSection(section.id)}
					class="text-left py-2 pl-4 text-sm border-l-2 transition-all duration-300 w-full hover:text-[#ff6b35] {activeSection ===
					section.id
						? 'border-[#ff6b35] text-[#ff6b35]'
						: 'border-transparent text-white/60 hover:border-white/20'}"
				>
					{section.title}
				</button>
			</li>
		{/each}
	</ul>
</nav>
