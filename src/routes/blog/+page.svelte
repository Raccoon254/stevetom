<script lang="ts">
	import { BookOpen, Calendar, ArrowRight, TrendingUp, Check, AlertCircle } from 'lucide-svelte'
	import { fade, fly } from 'svelte/transition'
	import { enhance } from '$app/forms'

	export let form
	let loading = false

	const blogPosts = [
		{
			title: 'Kentom 2026: Charting New Creative Directions',
			slug: 'kentom-2026-new-directions',
			excerpt:
				"A realistic roadmap for expanding beyond digital services into physical creative production—exploring what AI can't replace: craftsmanship, local relationships, and tangible value.",
			date: 'December 21, 2025',
			readTime: '15 min read',
			category: 'Business Strategy',
			featured: true,
			image: '/blog/plan.jpg'
		},
		{
			title: "Skill Kenya's Pivot: From Pre-Recorded Courses to Live Interactive Sessions",
			slug: 'skillkenya-pivot-to-live-sessions',
			excerpt:
				"Why we're abandoning the traditional course model and embracing real-time, interactive learning sessions that actually work for Kenyan learners.",
			date: 'December 21, 2025',
			readTime: '8 min read',
			category: 'EdTech Strategy',
			featured: false,
			image: '/blog/skillkenya-1.jpg'
		},
	]
</script>

<svelte:head>
	<title>Blog | Ken Tom - Insights on Development & Business</title>
	<meta
		name="description"
		content="Read about web development, business strategy, and creative entrepreneurship from Ken Tom."
	/>
</svelte:head>

<div class="min-h-screen text-white">
	<!-- Hero Section -->
	<section class="relative overflow-hidden border-b border-white/10 pb-20 md:pb-32">
		<div class="container relative z-10 mx-auto px-6">
			<div class="mx-auto max-w-4xl text-center">
				<div
					class="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 backdrop-blur-sm"
					in:fly={{ y: -20, duration: 600 }}
				>
					<BookOpen class="text-[#ff6b35]" size={24} />
					<span class="text-sm font-semibold uppercase tracking-widest">The Blog</span>
				</div>

				<h1
					class="mb-6 text-5xl font-bold leading-tight md:text-7xl"
					in:fly={{ y: -20, duration: 600, delay: 100 }}
				>
					Insights & Strategy
				</h1>

				<p
					class="mb-8 text-lg leading-relaxed text-white/70 md:text-xl"
					in:fly={{ y: -20, duration: 600, delay: 200 }}
				>
					Exploring web development, creative entrepreneurship, and building sustainable businesses
					in the age of AI.
				</p>
			</div>
		</div>
	</section>

	<!-- Blog Posts Grid -->
	<section class="container mx-auto px-6 py-20">
		<div class="mx-auto max-w-6xl">
			<!-- Featured Post -->
			{#each blogPosts.filter((post) => post.featured) as post}
				<article
					class="group mb-16 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 transition-all duration-300 hover:border-[#ff6b35]/30"
					in:fade={{ duration: 600 }}
				>
					<a href="/blog/{post.slug}" class="block flex">
						<!-- Featured Image -->
						<div class="relative overflow-hidden aspect-video md:aspect-[21/9]">
							<img
								src={post.image}
								alt={post.title}
								class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						</div>

						<div class="p-8 md:p-12">
							<!-- Featured Badge -->
							<div class="mb-6 flex flex-wrap items-center gap-4">
								<span
									class="inline-flex items-center gap-2 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b35]"
								>
									<TrendingUp size={14} />
									Featured
								</span>
								<span
									class="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70"
								>
									{post.category}
								</span>
							</div>

							<!-- Content -->
							<h2
								class="mb-4 text-3xl font-bold leading-tight transition-colors group-hover:text-[#ff6b35] md:text-5xl"
							>
								{post.title}
							</h2>

							<p class="mb-6 text-lg leading-relaxed text-white/70">
								{post.excerpt}
							</p>

							<!-- Meta -->
							<div class="flex flex-wrap items-center gap-6 text-sm text-white/60">
								<div class="flex items-center gap-2">
									<Calendar size={16} />
									<span>{post.date}</span>
								</div>
								<span>•</span>
								<span>{post.readTime}</span>
							</div>

							<!-- Read More -->
							<div
								class="mt-8 inline-flex items-center gap-2 text-[#ff6b35] transition-all group-hover:gap-4"
							>
								<span class="font-semibold">Read Full Article</span>
								<ArrowRight size={20} />
							</div>
						</div>
					</a>
				</article>
			{/each}

			<!-- More Posts (when available) -->
			{#if blogPosts.filter((post) => !post.featured).length > 0}
				<div class="mb-12">
					<h2 class="mb-8 text-3xl font-bold">More Articles</h2>
					<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{#each blogPosts.filter((post) => !post.featured) as post, i}
							<article
								class="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-[#ff6b35]/30 hover:shadow-lg hover:shadow-[#ff6b35]/10"
								in:fly={{ y: 20, duration: 600, delay: i * 100 }}
							>
								<a href="/blog/{post.slug}" class="block">
									<!-- Thumbnail Image -->
									<div class="relative overflow-hidden aspect-video">
										<img
											src={post.image}
											alt={post.title}
											class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
									</div>

									<div class="p-6">
										<span
											class="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
										>
											{post.category}
										</span>

									<h3
										class="mb-3 text-xl font-bold leading-tight transition-colors group-hover:text-[#ff6b35]"
									>
										{post.title}
									</h3>

									<p class="mb-4 text-sm leading-relaxed text-white/60">
										{post.excerpt}
									</p>

									<div class="flex items-center gap-4 text-xs text-white/50">
										<div class="flex items-center gap-1">
											<Calendar size={12} />
											<span>{post.date}</span>
										</div>
										<span>•</span>
										<span>{post.readTime}</span>
									</div>
									</div>
								</a>
							</article>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Coming Soon -->
				<div class="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
					<BookOpen class="mx-auto mb-4 text-white/40" size={48} />
					<h3 class="mb-2 text-xl font-semibold text-white/70">More Content Coming Soon</h3>
					<p class="text-white/50">
						Stay tuned for more insights on development, business, and creativity.
					</p>
				</div>
			{/if}

			<!-- Newsletter CTA (Optional for future) -->
			<div
				class="mt-16 rounded-2xl border border-[#ff6b35]/30 bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c5a]/10 p-8 text-center md:p-12"
			>
				<h3 class="mb-4 text-2xl font-bold md:text-3xl">Never Miss an Update</h3>

				{#if form?.success}
					<div class="flex flex-col items-center justify-center gap-2 py-4" in:fade>
						<div class="rounded-full bg-green-500/20 p-3 text-green-400">
							<Check size={32} />
						</div>
						<h4 class="text-xl font-bold text-white">You're Subscribed!</h4>
						<p class="text-white/70">Thank you for joining our newsletter.</p>
					</div>
				{:else}
					<p class="mb-6 text-lg text-white/70">
						Subscribe to get notified when new articles are published
					</p>
					<form
						method="POST"
						action="?/subscribe"
						use:enhance={() => {
							loading = true
							return async ({ update }) => {
								loading = false
								update()
							}
						}}
						class="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
					>
						<input
							type="email"
							name="email"
							placeholder="your.email@example.com"
							required
							class="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none placeholder-white/40 transition-all focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20"
							value={form?.email ?? ''}
						/>
						<button
							disabled={loading}
							class="rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ff6b35]/30 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? 'Subscribing...' : 'Subscribe'}
						</button>
					</form>
					{#if form?.missing}
						<p class="mt-4 text-xs text-red-400 flex items-center justify-center gap-1">
							<AlertCircle size={12} /> Email is required
						</p>
					{:else if form?.invalid}
						<p class="mt-4 text-xs text-red-400 flex items-center justify-center gap-1">
							<AlertCircle size={12} /> Please enter a valid email address
						</p>
					{:else}
						<p class="mt-4 text-xs text-white/50">No spam, ever. Unsubscribe anytime.</p>
					{/if}
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
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
