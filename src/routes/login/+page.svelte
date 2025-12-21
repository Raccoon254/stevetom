<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Lock, ArrowLeft } from 'lucide-svelte';

	export let form: ActionData;
</script>

<svelte:head>
	<title>Admin Login | KenTom</title>
</svelte:head>

<div class="bg-[#252525] min-h-screen relative overflow-x-hidden flex items-center justify-center p-6">
	<!-- Background Decorations -->
	<div
		class="hidden lg:block absolute rotate-[65deg] top-20 -left-20 opacity-10"
		style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
	></div>
	<div
		class="hidden lg:block absolute rotate-[-65deg] bottom-20 -right-20 opacity-10"
		style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-left: 80px solid white;"
	></div>

	<!-- Background Pattern -->
	<div class="hero-section absolute inset-0"></div>

	<!-- Login Container -->
	<main class="relative z-10 w-full max-w-md">
		<!-- Back Button -->
		<a
			href="/"
			class="group inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
		>
			<ArrowLeft size="20" class="transition-transform group-hover:-translate-x-1" />
			<span>Back to Home</span>
		</a>

		<!-- Login Card -->
		<div class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
			<!-- Header -->
			<div class="bg-white/5 border-b border-white/10 p-8 text-center">
				<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
					<Lock size="32" class="text-white" />
				</div>
				<h1 class="text-3xl font-bold text-white mb-2">Admin Access</h1>
				<p class="text-white/60 text-sm">Enter your credentials to continue</p>
			</div>

			<!-- Form -->
			<div class="p-8">
				<form method="POST" use:enhance class="space-y-6">
					<div>
						<label for="password" class="block text-sm font-semibold text-white/80 mb-2">
							Password
						</label>
						<input
							type="password"
							name="password"
							id="password"
							class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all"
							placeholder="Enter your password"
							required
							autocomplete="current-password"
						/>
					</div>

					{#if form?.error}
						<div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
							<p class="text-red-400 text-sm font-medium text-center">{form.error}</p>
						</div>
					{/if}

					<button
						type="submit"
						class="w-full bg-white text-[#252525] px-6 py-3 rounded-full font-bold text-lg hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
					>
						Sign In
					</button>
				</form>

				<!-- Footer Info -->
				<div class="mt-6 text-center">
					<p class="text-white/40 text-xs">
						Protected area • Authorized access only
					</p>
				</div>
			</div>
		</div>

		<!-- Hint Text -->
		<div class="mt-6 text-center">
			<p class="text-white/30 text-sm">
				Tip: Press <kbd class="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs">Shift</kbd> three times from anywhere to access this page
			</p>
		</div>
	</main>
</div>

<style>

		100% {
			background-position: 100% 100%;
		}
	}
</style>
