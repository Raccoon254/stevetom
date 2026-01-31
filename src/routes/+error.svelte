<script lang="ts">
	import { page } from '$app/stores'
	import { Home, Search, ArrowLeft } from 'lucide-svelte'
</script>

<svelte:head>
	<title>{$page.status} - Page Not Found</title>
</svelte:head>

<div class="error-page bg-[#252525]/10 min-h-screen flex flex-col">
	<main class="hero-section min-h-screen flex items-center justify-center p-6 sm:p-12">
		<div class="text-center max-w-4xl mx-auto">
			<!-- Error Code -->
			<div class="mb-8 animate-fade-in">
				<h1
					class="text-[12rem] sm:text-[16rem] md:text-[20rem] lg:text-[24rem] font-bold leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.8)]"
				>
					{$page.status}
				</h1>
			</div>

			<!-- Error Message -->
			<div class="text-white mb-8 animate-fade-in-delay">
				<h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4">
					{#if $page.status === 404}
						<span class="highlight-word">Lost</span> in Space
					{:else}
						Something Went <span class="highlight-word">Wrong</span>
					{/if}
				</h2>
				<p class="text-lg sm:text-xl md:text-2xl font-light opacity-80 max-w-2xl mx-auto">
					{#if $page.status === 404}
						The page you're looking for doesn't exist or has been moved.
					{:else}
						{$page.error?.message || 'An unexpected error occurred.'}
					{/if}
				</p>
			</div>

			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-late">
				<a
					href="/"
					class="group bg-[#252525]/80 border border-white ring-1 ring-white ring-offset-2 ring-offset-[#252525] text-white pr-6 p-3 rounded-full flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
				>
					<span
						class="bg-white/20 p-3 ring-1 ring-white text-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-[-10deg]"
						style="background-image: repeating-linear-gradient(
							-45deg,
							#252525,
							#252525 2px,
							#3a3a3a 2px,
							#3a3a3a 4px
						);"
					>
						<Home class="w-5 h-5" />
					</span>
					<span class="text-xl font-semibold">Go Home</span>
				</a>

				<button
					on:click={() => window.history.back()}
					class="group bg-white/10 border border-white/30 text-white px-6 py-3 rounded-full flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:bg-white/20"
				>
					<ArrowLeft class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-[-4px]" />
					<span class="text-xl font-semibold">Go Back</span>
				</button>
			</div>
		</div>
	</main>
</div>

<style>
	.highlight-word {
		font-weight: 600;
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
		display: inline-block;
	}

	.highlight-word::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, transparent, #ffffff, transparent);
		opacity: 0.5;
		animation: shimmer 3s ease-in-out infinite;
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.3;
			transform: scaleX(0.8);
		}
		50% {
			opacity: 0.6;
			transform: scaleX(1);
		}
	}

	.animate-fade-in {
		animation: fadeInUp 0.8s ease-out;
	}

	.animate-fade-in-delay {
		animation: fadeInUp 1.1s ease-out 0.3s backwards;
	}

	.animate-fade-in-late {
		animation: fadeInUp 1.4s ease-out 0.6s backwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}
</style>
