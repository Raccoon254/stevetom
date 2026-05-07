<script>
	import '../app.css'
	import { Briefcase, Mail, Github, Linkedin, MessageCircle, Moon, Sun } from 'lucide-svelte'
	import { onMount } from 'svelte'

	let theme = 'light'

	onMount(() => {
		theme = localStorage.getItem('theme') || 'light'
		document.documentElement.setAttribute('data-theme', theme)
	})

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light'
		document.documentElement.setAttribute('data-theme', theme)
		localStorage.setItem('theme', theme)
	}

	let year = new Date().getFullYear()
</script>

<button
	on:click={toggleTheme}
	class="fixed top-4 right-4 z-50 ring-1 ring-black/20 dark:ring-white/20 btn btn-circle btn-ghost"
	aria-label="Toggle theme"
>
	{#if theme === 'light'}
		<Moon size="20" />
	{:else}
		<Sun size="20" />
	{/if}
</button>

<div class="min-h-screen bg-base-100">
	<main>
		<slot />
	</main>

	<footer
		class="footer-section bg-[#151515] text-white py-16 border-t border-white/5 relative overflow-hidden"
	>
		<div class="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
			<!-- Logo/Brand -->
			<div class="mb-8 relative group">
				<div
					class="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] rounded-full opacity-0 group-hover:opacity-50 transition duration-500 blur"
				></div>
				<img
					src="/ken.HEIC"
					alt="Ken Tom"
					class="relative w-20 h-20 rounded-full object-cover border-2 border-[#252525] mx-auto"
				/>
			</div>

			<!-- Big Call to Action (Minimal) -->
			<h2 class="text-3xl md:text-4xl font-bold mb-4">
				Let's build something <span class="text-[#ff6b35]">amazing.</span>
			</h2>
			<a
				href="mailto:tomsteve187@gmail.com"
				class="text-white/60 hover:text-white transition-colors mb-12">tomsteve187@gmail.com</a
			>

			<!-- Navigation & Socials Grid -->
			<div class="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-12">
				<!-- Links -->
				<nav class="flex gap-8 text-sm font-medium tracking-wide">
					<a href="/" class="text-white/70 hover:text-[#ff6b35] transition-colors">Home</a>
					<a href="/projects" class="text-white/70 hover:text-[#ff6b35] transition-colors"
						>Projects</a
					>
					<a href="/about" class="text-white/70 hover:text-[#ff6b35] transition-colors">About</a>
					<a href="/contact" class="text-white/70 hover:text-[#ff6b35] transition-colors">Contact</a
					>
				</nav>

				<!-- Divider (Desktop) -->
				<div class="hidden md:block w-px h-6 bg-white/10"></div>

				<!-- Socials -->
				<div class="flex gap-5">
					<a
						href="https://github.com/Raccoon254"
						target="_blank"
						class="text-white/60 hover:text-[#ff6b35] transition-colors"><Github size="20" /></a
					>
					<a
						href="https://www.linkedin.com/in/steve-tom-822a81230/"
						target="_blank"
						class="text-white/60 hover:text-[#ff6b35] transition-colors"><Linkedin size="20" /></a
					>
					<a
						href="https://wa.link/w1774n"
						target="_blank"
						class="text-white/60 hover:text-[#ff6b35] transition-colors"
						><MessageCircle size="20" /></a
					>
				</div>
			</div>

			<!-- Copyright -->
			<div
				class="text-xs text-white/30 font-light border-t border-white/5 pt-8 w-full max-w-2xl text-center"
			>
				<p>&copy; {year} KenTom. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
