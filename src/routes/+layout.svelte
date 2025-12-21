<script lang="ts">
	import '../app.css'
	import Navbar from './components/Navbar.svelte'
	import { Briefcase, Mail, Github, Linkedin, MessageCircle } from 'lucide-svelte'
	import { onMount, onDestroy } from 'svelte'
	import { fly } from 'svelte/transition'
	import { goto } from '$app/navigation'

	let year = new Date().getFullYear()

	// Shift key tracking for admin navigation
	let shiftPressCount = 0
	let shiftResetTimeout: ReturnType<typeof setTimeout>

	// Text rotation logic
	const footerWords = [
		'code',
		'pull',
		'push',
		'test',
		'loop',
		'hash',
		'bind',
		'read',
		'write',
		'ship',
		'scan',
		'send',
		'edit',
		'load',
		'exec',
		'back',
		'move',
		'build',
	]

	let currentFooterWordIndex = 0
	let footerInterval: ReturnType<typeof setInterval>

	onMount(() => {
		startFooterInterval()

		// Add shift key listener for admin navigation
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Shift') {
				shiftPressCount++

				// Clear any existing timeout
				if (shiftResetTimeout) clearTimeout(shiftResetTimeout)

				// If shift pressed 3 times, navigate to admin
				if (shiftPressCount === 3) {
					goto('/login')
					shiftPressCount = 0
					return
				}

				// Reset count after 1 second of no shift presses
				shiftResetTimeout = setTimeout(() => {
					shiftPressCount = 0
				}, 1000)
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	})

	onDestroy(() => {
		stopFooterInterval()
	})

	function startFooterInterval() {
		stopFooterInterval()
		footerInterval = setInterval(() => {
			currentFooterWordIndex = (currentFooterWordIndex + 1) % footerWords.length
		}, 2500)
	}

	function stopFooterInterval() {
		if (footerInterval) clearInterval(footerInterval)
	}
</script>

<svelte:head>
	<meta name="theme-color" content="#252525" />
</svelte:head>

<Navbar />

<div class="relative z-0 main-component min-h-screen mt-20">
	<main>
		<slot />
	</main>

	<footer
		class="footer-section bg-[#151515] text-white pt-24 pb-12 border-t border-white/5 relative overflow-hidden font-sans"
	>
		<!-- Background Elements -->
		<div
			class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
		></div>
		<div
			class="absolute -top-40 -right-40 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-3xl pointer-events-none"
		></div>
		<div
			class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
		></div>

		<div class="max-w-7xl mx-auto px-6 relative z-10">
			<!-- Top Section: CTA -->
			<div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
				<div class="max-w-2xl">
					<h2 class="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
						Have an idea? <br />
						<span
							role="none"
							class="inline-flex gap-2 items-center cursor-pointer select-none text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
							on:mouseenter={stopFooterInterval}
							on:mouseleave={startFooterInterval}
						>
							<span
								class="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a]"
								>Let's</span
							>

							<!-- Fixed width container - tightened to fit "design" without excess space -->
							<span
								class="relative h-[1em] w-[4ch] overflow-hidden block text-center top-1/2 transform"
							>
								{#key currentFooterWordIndex}
									<span
										class="absolute top-0 left-0 w-full text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-100 to-blue-400"
										in:fly={{ y: 20, duration: 400, opacity: 0 }}
										out:fly={{ y: -20, duration: 400, opacity: 0 }}
									>
										{footerWords[currentFooterWordIndex]}
									</span>
								{/key}
							</span>

							<span
								class="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a]"
								>it.</span
							>
						</span>
					</h2>
					<p class="text-lg text-white/50 max-w-md">
						Turning complex problems into elegant, interactive web experiences.
					</p>
				</div>

				<div class="flex flex-col gap-4">
					<a
						href="mailto:tomsteve187@gmail.com"
						class="group flex items-center gap-3 text-2xl font-light hover:text-[#ff6b35] transition-colors duration-300"
					>
						<span>tomsteve187@gmail.com</span>
						<div
							class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#ff6b35] group-hover:border-[#ff6b35] group-hover:text-black transition-all duration-300"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300"
								><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
							>
						</div>
					</a>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/5 pt-16">
				<!-- Brand Column -->
				<div class="md:col-span-4 flex flex-col justify-between h-full">
					<div class="flex items-center gap-4 mb-6">
						<div class="relative w-12 h-12 overflow-hidden rounded-full border border-white/10">
							<img src="/ken.HEIC" alt="Ken Tom" class="object-cover w-full h-full" />
						</div>
						<div>
							<h3 class="font-bold text-lg">Ken Tom</h3>
							<p class="text-xs text-white/40 uppercase tracking-widest">Full Stack Developer</p>
						</div>
					</div>
				</div>

				<!-- Navigation Column -->
				<div class="md:col-span-3">
					<h4 class="text-xs font-bold text-white/30 uppercase tracking-widest mb-6">Explore</h4>
					<ul class="space-y-4">
						{#each ['Home', 'Projects', 'About', 'Contact', 'Get a Quote'] as item}
							<li>
								<a
									href={item === 'Home'
										? '/'
										: item === 'Get a Quote'
											? '/quote'
											: `/${item.toLowerCase()}`}
									class="text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
								>
									<span
										class="w-1 h-1 bg-[#ff6b35] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									></span>
									{item}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Social Column -->
				<div class="md:col-span-3">
					<h4 class="text-xs font-bold text-white/30 uppercase tracking-widest mb-6">Connect</h4>
					<div class="flex flex-col gap-4">
						<a
							href="https://github.com/Raccoon254"
							target="_blank"
							class="flex items-center gap-3 text-white/60 hover:text-[#ff6b35] transition-colors group"
						>
							<Github size="18" />
							<span>GitHub</span>
						</a>
						<a
							href="https://www.linkedin.com/in/steve-tom-822a81230/"
							target="_blank"
							class="flex items-center gap-3 text-white/60 hover:text-[#0077b5] transition-colors group"
						>
							<Linkedin size="18" />
							<span>LinkedIn</span>
						</a>
						<a
							href="https://wa.link/w1774n"
							target="_blank"
							class="flex items-center gap-3 text-white/60 hover:text-[#25D366] transition-colors group"
						>
							<MessageCircle size="18" />
							<span>WhatsApp</span>
						</a>
					</div>
				</div>

				<!-- Status/Time Column -->
				<div class="md:col-span-2 flex flex-col justify-between">
					<div>
						<h4 class="text-xs font-bold text-white/30 uppercase tracking-widest mb-6">Status</h4>
						<div
							class="flex items-center gap-2 text-green-400 text-sm bg-green-900/10 px-3 py-1.5 rounded-full w-fit"
						>
							<span class="relative flex h-2 w-2">
								<span
									class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
								></span>
								<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
							</span>
							Available
						</div>
					</div>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div
				class="flex flex-col md:flex-row justify-between items-center mt-20 pt-8 border-t border-white/5 text-sm text-white/30"
			>
				<p>&copy; {year} KenTom.</p>
				<div class="flex gap-6 mt-4 md:mt-0">
					<a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
					<a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
				</div>
			</div>
		</div>
	</footer>
</div>
