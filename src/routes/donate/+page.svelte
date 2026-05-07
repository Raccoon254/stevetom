<script lang="ts">
	import { onMount } from 'svelte'
	import { fade, fly, scale } from 'svelte/transition'
	import {
		Heart,
		DollarSign,
		CheckCircle,
		XCircle,
		Loader2,
		Star as Sparkles,
		Star,
		Zap,
		Gift,
	} from 'lucide-svelte'

	let email = ''
	let amount = 1000
	let currency: 'KES' | 'USD' = 'KES'
	let status: 'idle' | 'loading' | 'success' | 'error' = 'idle'
	let errorMsg = ''
	let successMsg = ''

	const suggestedAmounts = {
		KES: [100, 250, 500, 1000, 2500],
		USD: [5, 10, 25, 50, 100],
	}

	onMount(async () => {
		// Check if returning from successful payment
		const urlParams = new URLSearchParams(window.location.search)
		const reference = urlParams.get('reference')
		const trxref = urlParams.get('trxref')

		if (reference || trxref) {
			verifyPayment(reference || trxref || '')
			return
		}

		// Detect user location
		try {
			const res = await fetch('https://ipapi.co/json/')
			const data = await res.json()
			if (data.country_code !== 'KE') {
				currency = 'USD'
				amount = 10 // Default USD amount
			}
		} catch (e) {
			console.error('Failed to detect location, defaulting to KES')
		}
	})

	async function verifyPayment(reference: string) {
		status = 'loading'
		try {
			const res = await fetch(`/api/paystack-donations?reference=${reference}`)
			const data = await res.json()

			if (res.ok && data.status === 'success') {
				status = 'success'
				successMsg = `Thank you for your ${data.currency} ${data.amount} donation! Your support means the world.`
			} else {
				status = 'error'
				errorMsg = 'Payment verification failed. Please contact support if you were charged.'
			}
		} catch (e) {
			status = 'error'
			errorMsg = 'Failed to verify payment.'
		}
	}

	async function initiateDonation() {
		if (!email || !email.includes('@')) {
			errorMsg = 'Please enter a valid email address.'
			status = 'error'
			return
		}

		if (!amount || amount < 1) {
			errorMsg = 'Please enter a valid amount (minimum 1).'
			status = 'error'
			return
		}

		status = 'loading'
		errorMsg = ''

		try {
			const res = await fetch('/api/paystack-donations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount, email, currency }),
			})

			const data = await res.json()

			if (res.ok && data.authorizationUrl) {
				// Redirect to Paystack payment page
				window.location.href = data.authorizationUrl
			} else {
				status = 'error'
				errorMsg = data.error || 'Failed to initialize payment.'
			}
		} catch (e) {
			status = 'error'
			errorMsg = 'Network error. Please try again.'
		}
	}

	function setAmount(value: number) {
		amount = value
		errorMsg = ''
	}

	function toggleCurrency() {
		currency = currency === 'KES' ? 'USD' : 'KES'
		amount = currency === 'KES' ? 1000 : 10
	}
</script>

<svelte:head>
	<title>Support & Donate | SteveForge</title>
	<meta
		name="description"
		content="Support my work with a donation. Your contribution helps me create more amazing projects."
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://stevetom.vercel.app/donate" />
	<meta property="og:title" content="Support & Donate | SteveForge" />
	<meta
		property="og:description"
		content="Support my work with a donation. Your contribution helps me create more amazing projects."
	/>
	<meta property="og:image" content="https://stevetom.vercel.app/kentom_website_banner.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://stevetom.vercel.app/donate" />
	<meta name="twitter:title" content="Support & Donate | SteveForge" />
	<meta
		name="twitter:description"
		content="Support my work with a donation. Your contribution helps me create more amazing projects."
	/>
	<meta name="twitter:image" content="https://stevetom.vercel.app/kentom_website_banner.jpg" />
</svelte:head>

<div class="min-h-screen bg-[#252525]/10 text-white">
	<!-- Hero Section -->
	<section class="relative overflow-hidden py-20 md:py-32">
		<!-- Animated Background Circles -->
		<div
			class="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-[#ff6b35]/10 blur-[100px]"
		></div>
		<div
			class="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse-slow-delay rounded-full bg-[#ff8c5a]/10 blur-[100px]"
		></div>

		<div class="container relative z-10 mx-auto px-6 text-center">
			<div class="mb-6 inline-flex items-center gap-3" in:fly={{ y: -20, duration: 600 }}>
				<div
					class="rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-5 py-2.5 backdrop-blur-sm"
				>
					<div class="flex items-center gap-2">
						<Heart size="16" class="animate-pulse text-[#ff6b35]" />
						<span class="text-sm font-bold uppercase tracking-widest">Support My Work</span>
					</div>
				</div>
			</div>

			<h1
				class="mb-6 text-5xl font-bold leading-tight md:text-7xl lg:text-8xl"
				in:fly={{ y: -20, duration: 600, delay: 100 }}
			>
				Love What I Do?
				<br />
				<span class="highlight-gradient">Help Keep It Going!</span>
			</h1>

			<p
				class="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
				in:fly={{ y: -20, duration: 600, delay: 200 }}
			>
				Your contribution helps me continue creating innovative projects, open-source tools, and
				sharing knowledge with the community.
			</p>

			<!-- Impact Stats -->
			<div
				class="mx-auto mb-16 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3"
				in:fly={{ y: 20, duration: 600, delay: 300 }}
			>
				<div
					class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#ff6b35]/30 hover:bg-white/10"
				>
					<Sparkles size="24" class="mb-3 text-[#ff6b35]" />
					<div class="mb-2 text-3xl font-bold text-white">10+</div>
					<div class="text-sm text-white/70">Projects Delivered</div>
				</div>
				<div
					class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#ff6b35]/30 hover:bg-white/10"
				>
					<Zap size="24" class="mb-3 text-[#ff6b35]" />
					<div class="mb-2 text-3xl font-bold text-white">100%</div>
					<div class="text-sm text-white/70">Open Source</div>
				</div>
				<div
					class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#ff6b35]/30 hover:bg-white/10"
				>
					<Star size="24" class="mb-3 text-[#ff6b35]" />
					<div class="mb-2 text-3xl font-bold text-white">24/7</div>
					<div class="text-sm text-white/70">Learning & Building</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Donation Form Section -->
	<section class="container mx-auto px-6 pb-20">
		<div class="mx-auto max-w-4xl">
			{#if status === 'success'}
				<div
					class="rounded-3xl border border-green-500/20 bg-green-500/10 p-12 text-center backdrop-blur-md"
					in:scale={{ duration: 400 }}
				>
					<div
						class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
					>
						<CheckCircle class="text-green-500" size={48} />
					</div>
					<h2 class="mb-4 text-3xl font-bold">Thank You!</h2>
					<p class="mb-8 text-lg text-white/80">{successMsg}</p>
					<button
						on:click={() => (window.location.href = '/')}
						class="rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#ff6b35]/30"
					>
						Return Home
					</button>
				</div>
			{:else}
				<!-- Form Content -->
				<div in:fade={{ duration: 400 }}>
					{#if errorMsg}
						<div
							class="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-md"
							in:fly={{ x: -20, duration: 300 }}
						>
							<XCircle class="flex-shrink-0 text-red-500" size={24} />
							<p class="text-red-200">{errorMsg}</p>
						</div>
					{/if}

					<!-- Suggested Amounts -->
					<div class="mb-12">
						<div class="mb-6 flex items-center justify-between gap-3">
							<div class="flex items-center gap-3">
								<Gift size="24" class="text-[#ff6b35]" />
								<h3 class="text-2xl font-bold">Choose Your Support Level</h3>
							</div>
							<button
								on:click={toggleCurrency}
								class="text-sm text-[#ff6b35] hover:text-[#ff8c5a] underline"
							>
								Switch to {currency === 'KES' ? 'USD' : 'KES'}
							</button>
						</div>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
							{#each suggestedAmounts[currency] as suggestedAmount}
								<button
									on:click={() => setAmount(suggestedAmount)}
									class="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-6 font-semibold backdrop-blur-sm transition-all hover:scale-105 hover:border-[#ff6b35] hover:bg-[#ff6b35]/20 {amount ===
									suggestedAmount
										? 'scale-105 border-[#ff6b35] bg-[#ff6b35]/20'
										: ''}"
								>
									<div
										class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
										style="background: linear-gradient(135deg, transparent 0%, rgba(255, 107, 53, 0.1) 100%);"
									></div>
									<div class="top-0 left-0 z-10 flex opacity-30 items-center justify-center">
										{currency}
									</div>
									<span class="relative block text-2xl font-bold">{suggestedAmount}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Email Input -->
					<div class="mb-8">
						<label
							for="email"
							class="mb-3 flex items-center gap-2 text-lg font-medium text-white/90"
						>
							<span>Email Address</span>
							<span class="text-[#ff6b35]">*</span>
						</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="your.email@example.com"
							class="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-lg text-white placeholder-white/40 outline-none backdrop-blur-sm transition-all focus:border-[#ff6b35] focus:bg-white/10 focus:ring-2 focus:ring-[#ff6b35]/20 hover:bg-white/8"
							disabled={status === 'loading'}
						/>
					</div>

					<!-- Amount Input -->
					<div class="mb-12">
						<label
							for="amount"
							class="mb-3 flex items-center gap-2 text-lg font-medium text-white/90"
						>
							<span>Custom Amount ({currency})</span>
							<span class="text-[#ff6b35]">*</span>
						</label>
						<div class="relative">
							{#if currency === 'USD'}
								<DollarSign
									size="24"
									class="absolute z-[9999] left-6 top-1/2 -translate-y-1/2 text-white/40"
								/>
							{:else}
								<span
									class="absolute z-[9999] left-6 top-1/2 -translate-y-1/2 text-white/40 font-bold"
									>KSh</span
								>
							{/if}
							<input
								id="amount"
								type="number"
								min="1"
								step="0.01"
								bind:value={amount}
								placeholder={currency === 'USD' ? '10.00' : '1000'}
								class="w-full rounded-2xl border border-white/20 bg-white/5 py-4 pl-16 pr-6 text-lg text-white placeholder-white/40 outline-none backdrop-blur-sm transition-all focus:border-[#ff6b35] focus:bg-white/10 focus:ring-2 focus:ring-[#ff6b35]/20 hover:bg-white/8"
								disabled={status === 'loading'}
							/>
						</div>
					</div>

					<!-- Donate Button -->
					<button
						on:click={initiateDonation}
						disabled={status === 'loading'}
						class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] px-8 py-6 text-xl font-bold text-white transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#ff6b35]/40 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<div
							class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
							style="background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);"
						></div>
						<div class="relative flex items-center justify-center gap-3">
							{#if status === 'loading'}
								<Loader2 class="animate-spin" size={24} />
								<span>Processing...</span>
							{:else}
								<Heart size={24} />
								<span>Donate {currency} {amount} with Paystack</span>
							{/if}
						</div>
					</button>

					<!-- Security Note -->
					<p class="mt-6 text-center text-sm text-white/50">
						🔒 Secured by Paystack. Your payment information is encrypted and secure.
					</p>
				</div>

				<!-- Why Support Section -->
				<div
					class="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md md:p-12"
				>
					<h3 class="mb-6 text-2xl font-bold">Why Your Support Matters</h3>
					<ul class="space-y-4 text-white/70">
						<li class="flex gap-4">
							<CheckCircle class="flex-shrink-0 text-[#ff6b35]" size={24} />
							<span class="text-lg">Helps me dedicate more time to open-source projects</span>
						</li>
						<li class="flex gap-4">
							<CheckCircle class="flex-shrink-0 text-[#ff6b35]" size={24} />
							<span class="text-lg">Supports ongoing maintenance and updates</span>
						</li>
						<li class="flex gap-4">
							<CheckCircle class="flex-shrink-0 text-[#ff6b35]" size={24} />
							<span class="text-lg">Enables creation of educational content and tutorials</span>
						</li>
						<li class="flex gap-4">
							<CheckCircle class="flex-shrink-0 text-[#ff6b35]" size={24} />
							<span class="text-lg">Funds development tools and infrastructure costs</span>
						</li>
					</ul>
				</div>
			{/if}
		</div>
	</section>
</div>

<style>
	/* Animated background pattern matching homepage */
	.min-h-screen {
		position: relative;
	}

	.min-h-screen::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 0;
	}

	/* Ensure content is above animated background */
	.min-h-screen > * {
		position: relative;
		z-index: 1;
	}

	.highlight-gradient {
		background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 50%, #ffaa7f 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
		display: inline-block;
	}

	.highlight-gradient::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 4px;
		background: linear-gradient(90deg, transparent, #ff6b35, #ff8c5a, transparent);
		opacity: 0.6;
		animation: shimmer 3s ease-in-out infinite;
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.4;
			transform: scaleX(0.8);
		}
		50% {
			opacity: 0.8;
			transform: scaleX(1);
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

	/* Custom scrollbar */
	:global(body) {
		scrollbar-width: thin;
		scrollbar-color: #ff6b35 #252525;
	}

	:global(body::-webkit-scrollbar) {
		width: 8px;
	}

	:global(body::-webkit-scrollbar-track) {
		background: #252525;
	}

	:global(body::-webkit-scrollbar-thumb) {
		background-color: #ff6b35;
		border-radius: 4px;
	}
</style>
