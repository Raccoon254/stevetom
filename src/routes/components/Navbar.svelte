<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { Menu, X, Star as Sparkles } from 'lucide-svelte'

	let scrollY = 0
	let lastScrollY = 0
	let isScrollingDown = false
	let isScrolled = false
	let mobileMenuOpen = false

	const navLinks = [
		{ name: 'Home', href: '/' },
		{ name: 'Projects', href: '/projects' },
		{ name: 'About', href: '/about' },
		{ name: 'Contact', href: '/contact' },
		{ name: 'Donate', href: '/donate' },
	]

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY
			isScrolled = scrollY > 50
			isScrollingDown = scrollY > lastScrollY && scrollY > 100
			lastScrollY = scrollY
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	})

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen
		// Prevent body scroll when menu is open
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false
		document.body.style.overflow = ''
	}

	// Check if link is active
	$: isActive = (href: string) => {
		if (href === '/') {
			return $page.url.pathname === '/'
		}
		return $page.url.pathname.startsWith(href)
	}
</script>

<nav
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {isScrollingDown
		? '-translate-y-full'
		: 'translate-y-0'}"
>
	<div
		class="navbar-container transition-all duration-300 {isScrolled
			? 'bg-[#252525]/90 backdrop-blur-sm shadow-xs shadow-black/20'
			: 'bg-transparent'}"
	>
		<div class="mx-auto max-w-7xl px-6">
			<div class="flex h-20 items-center justify-between">
				<!-- Logo Section -->
				<a href="/" class="group relative flex items-center gap-3 z-10">
					<div
						class="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 transition-all duration-300 group-hover:border-[#ff6b35] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#ff6b35]/30"
					>
						<img src="/ken.HEIC" alt="Ken Tom" class="h-full w-full object-cover" />
						<div
							class="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
					</div>
					<div class="hidden md:block">
						<div
							class="text-lg font-bold text-white transition-all duration-300 group-hover:text-[#ff6b35]"
						>
							Ken Tom
						</div>
						<div class="text-xs text-white/50 uppercase tracking-widest">Full Stack Dev</div>
					</div>
				</a>

				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center gap-1">
					{#each navLinks as link}
						<a
							href={link.href}
							class="nav-link group relative px-4 py-2 text-sm font-medium text-white/80 transition-all duration-300 hover:text-white {isActive(
								link.href
							)
								? 'active'
								: ''}"
						>
							<span class="relative z-10">{link.name}</span>

							<!-- Hover background -->
							<div
								class="absolute inset-0 rounded-lg bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							></div>

							<!-- Active indicator -->
							{#if isActive(link.href)}
								<div
									class="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a]"
								></div>
							{/if}

							<!-- Magnetic effect on hover -->
							<div
								class="absolute inset-0 rounded-lg border border-white/0 transition-all duration-300 group-hover:border-white/10"
							></div>
						</a>
					{/each}
				</div>

				<!-- CTA Button (Desktop) -->
				<a
					href="/quote"
					class="hidden md:flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#ff6b35]/30"
				>
					<Sparkles size={16} />
					<span>Get a Quote</span>
				</a>

				<!-- Mobile Menu Button -->
				<button
					on:click={toggleMobileMenu}
					class="md:hidden relative z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white transition-all duration-300 hover:border-[#ff6b35] hover:bg-[#ff6b35]/20"
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<X size={20} />
					{:else}
						<Menu size={20} />
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div
			class="mobile-menu fixed inset-0 z-[9999] md:hidden overflow-y-auto"
			on:click={closeMobileMenu}
			on:keydown={(e) => e.key === 'Escape' && closeMobileMenu()}
		>
			<!-- Backdrop -->
			<div class="absolute inset-0 bg-[#252525] backdrop-blur-xl"></div>

			<!-- Animated background circles -->
			<div
				class="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-[#ff6b35]/10 blur-[100px]"
			></div>
			<div
				class="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse-slow-delay rounded-full bg-[#ff8c5a]/10 blur-[100px]"
			></div>

			<!-- Menu Content -->
			<div class="relative z-10 min-h-full flex flex-col items-center justify-center gap-4 px-8 py-20 sm:py-24">
				{#each navLinks as link, i}
					<a
						href={link.href}
						on:click={closeMobileMenu}
						class="mobile-nav-link group relative text-3xl sm:text-4xl font-bold text-white transition-all duration-300 hover:text-[#ff6b35] {isActive(
							link.href
						)
							? 'active'
							: ''}"
						style="animation-delay: {i * 50}ms"
					>
						<span class="relative z-10">{link.name}</span>
						{#if isActive(link.href)}
							<div
								class="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a]"
							></div>
						{/if}
					</a>
				{/each}

				<!-- Mobile CTA -->
				<a
					href="/quote"
					on:click={closeMobileMenu}
					class="mt-8 flex items-center gap-3 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#ff6b35]/30"
					style="animation-delay: {navLinks.length * 50}ms"
				>
					<Sparkles size={20} />
					<span>Get a Quote</span>
				</a>
			</div>
		</div>
	{/if}
</nav>

<style>
	.navbar-container {
		position: relative;
	}

	.nav-link {
		position: relative;
	}

	/* Mobile menu animations */
	.mobile-menu {
		animation: fadeIn 0.3s ease-out;
	}

	.mobile-nav-link {
		animation: slideInUp 0.5s ease-out backwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-pulse-slow {
		animation: pulse-slow 8s ease-in-out infinite;
	}

	.animate-pulse-slow-delay {
		animation: pulse-slow 8s ease-in-out infinite 4s;
	}

	@keyframes pulse-slow {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.1);
		}
	}

	/* Smooth transitions */
	* {
		-webkit-tap-highlight-color: transparent;
	}
</style>
