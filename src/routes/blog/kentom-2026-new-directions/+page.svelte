<script lang="ts">
	import { ArrowLeft, TrendingUp, Target, Calendar, DollarSign, Users, Wrench } from 'lucide-svelte'
	import { fade, fly } from 'svelte/transition'
</script>

<svelte:head>
	<title>Kentom 2026: Charting New Creative Directions | Business Strategy</title>
	<meta
		name="description"
		content="Exploring realistic paths for Kentom's expansion into physical creative services, from apparel printing to digital marketing."
	/>
	<meta name="author" content="Steve Osoro Tom" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://stevetom.vercel.app/blog/kentom-2026-new-directions" />
	<meta
		property="og:title"
		content="Kentom 2026: Charting New Creative Directions | Business Strategy"
	/>
	<meta
		property="og:description"
		content="Exploring realistic paths for Kentom's expansion into physical creative services, from apparel printing to digital marketing."
	/>
	<meta property="og:image" content="https://stevetom.vercel.app/blog/plan.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://stevetom.vercel.app/blog/kentom-2026-new-directions" />
	<meta
		name="twitter:title"
		content="Kentom 2026: Charting New Creative Directions | Business Strategy"
	/>
	<meta
		name="twitter:description"
		content="Exploring realistic paths for Kentom's expansion into physical creative services, from apparel printing to digital marketing."
	/>
	<meta name="twitter:image" content="https://stevetom.vercel.app/blog/plan.jpg" />
</svelte:head>

<div class="min-h-screen bg-[#252525]/10 --28 text-white">
	<!-- Header -->
	<div class="border-b border-white/10 bg-[#151515]">
		<div class="container mx-auto px-6 py-6">
			<a
				href="/"
				class="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
			>
				<ArrowLeft size={20} />
				<span>Back to Home</span>
			</a>
		</div>
	</div>

	<!-- Hero Section -->
	<article class="container mx-auto px-6 py-20">
		<div class="mx-auto max-w-4xl">
			<!-- Meta Info -->
			<div class="mb-8 flex flex-wrap items-center gap-4 text-sm text-white/60">
				<div class="flex items-center gap-2">
					<Calendar size={16} />
					<span>December 21, 2025</span>
				</div>
				<span>•</span>
				<span>15 min read</span>
				<span>•</span>
				<span
					class="rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-3 py-1 text-[#ff6b35]"
				>
					Business Strategy
				</span>
			</div>

			<!-- Title -->
			<h1
				class="mb-6 text-4xl font-bold leading-tight md:text-6xl"
				in:fly={{ y: -20, duration: 600 }}
			>
				Kentom 2026: Charting New Creative Directions
			</h1>

			<p
				class="mb-12 text-xl leading-relaxed text-white/70"
				in:fly={{ y: -20, duration: 600, delay: 100 }}
			>
				A realistic roadmap for expanding beyond digital services into physical creative production
				exploring what AI can't replace: craftsmanship, local relationships, and tangible value.
			</p>

			<!-- Featured Image -->
			<div class="mb-16 overflow-hidden rounded-2xl border border-white/10">
				<img src="/blog/plan.jpg" alt="Kentom 2026 Strategic Plan" class="w-full h-auto" />
			</div>

			<!-- Content -->
			<div class="prose prose-invert max-w-none">
				<!-- Current State -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Users class="text-[#ff6b35]" size={32} />
						Where We Are Today
					</h2>

					<p class="mb-4 text-lg leading-relaxed text-white/80">
						Currently, Kentom operates as a freelance creative studio, taking on projects through a
						combination of <strong class="text-white">Fiverr gigs</strong> and
						<strong class="text-white">direct client relationships</strong>. While this model
						generates revenue, it's far from optimized for maximum earnings or sustainable growth.
					</p>

					<div class="my-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
						<h4 class="mb-3 text-xl font-semibold text-yellow-300">The Current Reality</h4>
						<ul class="space-y-3 text-white/80">
							<li class="flex items-start gap-2">
								<span class="text-yellow-400">⚠</span>
								<span
									><strong>Platform Dependency:</strong> Fiverr takes 20% commission on every project,
									limiting profit margins</span
								>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-yellow-400">⚠</span>
								<span
									><strong>Unoptimized Workflow:</strong> Ad-hoc project management leads to inefficiencies
									and missed opportunities</span
								>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-yellow-400">⚠</span>
								<span
									><strong>Undocumented Projects:</strong> Significant work on projects like dishpoa.com
									(food delivery), Chezapay (payment platform), and qailly.com (quality assurance) remains
									largely undocumented and undermonetized</span
								>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-yellow-400">⚠</span>
								<span
									><strong>No Scalable Systems:</strong> Growth is limited by available hours rather
									than systems and processes</span
								>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-yellow-400">⚠</span>
								<span
									><strong>Service-Only Revenue:</strong> 100% active income if we don't work, we don't
									earn</span
								>
							</li>
						</ul>
					</div>

					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<h4 class="mb-3 text-xl font-semibold">Current Project Portfolio (Undocumented)</h4>
						<div class="space-y-4">
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h5 class="mb-1 font-semibold text-[#ff6b35]">dishpoa.com</h5>
								<p class="text-sm text-white/70">
									Food delivery platform development full-stack web application with restaurant
									management, order tracking, and payment integration
								</p>
							</div>
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h5 class="mb-1 font-semibold text-[#ff6b35]">Chezapay</h5>
								<p class="text-sm text-white/70">
									Earn from your playing skills by playing games against other players
								</p>
							</div>
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h5 class="mb-1 font-semibold text-[#ff6b35]">qailly.com</h5>
								<p class="text-sm text-white/70">
									Quality assurance platform automated testing and quality management system
								</p>
							</div>
						</div>
						<p class="mt-4 text-sm italic text-white/60">
							These projects represent significant value and expertise, but without proper
							documentation, case studies, and strategic positioning, they don't contribute to brand
							building or attract new opportunities.
						</p>
					</div>

					<div class="my-8 rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-6">
						<h4 class="mb-3 text-xl font-bold text-red-300">The Problem</h4>
						<p class="text-lg text-white/90">
							This reactive, platform-dependent model leaves money on the table. We're trading time
							for dollars with no leverage, no product lines, and no passive income. The expertise
							exists, but the business structure doesn't maximize its value.
						</p>
					</div>
				</section>

				<!-- Introduction -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Target class="text-[#ff6b35]" size={32} />
						The Strategic Vision: A New Direction
					</h2>

					<p class="mb-4 text-lg leading-relaxed text-white/80">
						As we enter 2026, the creative industry faces a fundamental shift. AI tools have
						democratized digital content creation, making design, copywriting, and basic visual work
						accessible to everyone. But this shift reveals an opportunity: <strong
							class="text-white"
							>the growing value of physical, hands-on creativity that AI cannot replicate</strong
						>.
					</p>

					<p class="mb-4 text-lg leading-relaxed text-white/80">
						Kentom is positioned to pivot toward services that combine digital design expertise with
						physical production, local market understanding, and authentic human craftsmanship. This
						isn't about abandoning digital it's about expanding into spaces where our human touch
						creates irreplaceable value.
					</p>

					<div class="my-8 rounded-2xl border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-6">
						<p class="text-lg font-semibold text-[#ff6b35]">Core Philosophy:</p>
						<p class="mt-2 text-white/90">
							"While AI generates pixels, humans create products. While algorithms suggest designs,
							craftspeople deliver quality. While bots post content, people build relationships."
						</p>
					</div>
				</section>

				<!-- Path 1: Apparel & Print Production -->
				<section class="mb-16">
					<h2 class="mb-6 text-3xl font-bold text-white">
						Path 1: Custom Apparel & Print Production
					</h2>

					<h3 class="mb-4 text-2xl font-semibold text-[#ff6b35]">Why This Works</h3>
					<p class="mb-4 text-lg leading-relaxed text-white/80">
						Every business, school, church, and sports team in Kenya needs branded apparel. AI can
						suggest designs, but it can't operate a heat press, ensure color accuracy, or
						hand-deliver quality products to local customers.
					</p>

					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<h4 class="mb-3 text-xl font-semibold">Realistic Revenue Model</h4>
						<ul class="space-y-2 text-white/80">
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span
									><strong>Custom T-shirts:</strong> KES 600-1,200 per piece (profit margin: 40-50%)</span
								>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span
									><strong>Bulk orders:</strong> KES 400-700 per piece (schools, events, companies)</span
								>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span
									><strong>Premium work:</strong> KES 1,000-2,000 (embroidery, specialty prints)</span
								>
							</li>
						</ul>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">
						Realistic First Quarter Target
					</h3>
					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<div class="mb-4 grid gap-4 md:grid-cols-2">
							<div>
								<p class="text-sm text-white/60">Monthly Production</p>
								<p class="text-2xl font-bold">40-60 pieces</p>
							</div>
							<div>
								<p class="text-sm text-white/60">Expected Revenue</p>
								<p class="text-2xl font-bold">KES 35,000-55,000</p>
							</div>
						</div>
						<p class="text-sm text-white/60">
							*Based on conservative estimates, assuming part-time operation while building client
							base
						</p>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">Investment Required</h3>
					<div class="my-6 space-y-3">
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Heat press machine (quality entry-level)</span>
							<span class="font-semibold">KES 40,000-55,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Initial materials & supplies</span>
							<span class="font-semibold">KES 15,000-25,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Sample inventory (blank tees)</span>
							<span class="font-semibold">KES 10,000-15,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-4"
						>
							<span class="font-semibold">Total Investment</span>
							<span class="text-xl font-bold text-[#ff6b35]">KES 65,000-95,000</span>
						</div>
					</div>

					<p class="mt-6 text-white/70">
						<strong>ROI Timeline:</strong> Break-even expected in 2-3 months with consistent orders.
						Marketing through Instagram showcases and local events.
					</p>
				</section>

				<!-- Path 2: 3D Printing Services -->
				<section class="mb-16">
					<h2 class="mb-6 text-3xl font-bold text-white">Path 2: 3D Printing Services</h2>

					<!-- Section Image -->
					<div class="my-8 overflow-hidden rounded-xl border border-white/10">
						<img
							src="https://images.pexels.com/photos/3888151/pexels-photo-3888151.jpeg"
							alt="Technology and Innovation"
							class="w-full h-auto"
						/>
					</div>

					<h3 class="mb-4 text-2xl font-semibold text-[#ff6b35]">Market Opportunity</h3>
					<p class="mb-4 text-lg leading-relaxed text-white/80">
						Kenya's innovation ecosystem is growing, but affordable local 3D printing services
						remain scarce. From architects needing models to inventors prototyping ideas, the demand
						exists it just needs to be tapped.
					</p>

					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<h4 class="mb-3 text-xl font-semibold">Service Offerings</h4>
						<ul class="space-y-2 text-white/80">
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span
									><strong>Prototypes:</strong> KES 1,500-8,000 per project (based on size/complexity)</span
								>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Custom phone cases:</strong> KES 400-800 each</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Architectural models:</strong> KES 5,000-25,000</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Replacement parts:</strong> KES 300-3,000</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Custom gifts & decor:</strong> KES 250-1,500</span>
							</li>
						</ul>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">
						Realistic First Quarter Target
					</h3>
					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<div class="mb-4 grid gap-4 md:grid-cols-2">
							<div>
								<p class="text-sm text-white/60">Monthly Projects</p>
								<p class="text-2xl font-bold">12-20 projects</p>
							</div>
							<div>
								<p class="text-sm text-white/60">Expected Revenue</p>
								<p class="text-2xl font-bold">KES 25,000-45,000</p>
							</div>
						</div>
						<p class="text-sm text-white/60">
							*Averaging small to medium complexity projects, print time considered
						</p>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">Investment Required</h3>
					<div class="my-6 space-y-3">
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Entry 3D printer (Creality Ender 3 or similar)</span>
							<span class="font-semibold">KES 38,000-48,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Filament variety (PLA, ABS - 3kg)</span>
							<span class="font-semibold">KES 5,000-8,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Tools & post-processing supplies</span>
							<span class="font-semibold">KES 4,000-7,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-4"
						>
							<span class="font-semibold">Total Investment</span>
							<span class="text-xl font-bold text-[#ff6b35]">KES 47,000-63,000</span>
						</div>
					</div>

					<div class="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
						<p class="mb-2 font-semibold text-blue-300">Marketing Strategy:</p>
						<p class="text-white/80">
							Create YouTube channel "3D Print Kenya" with tutorials, project showcases, and
							time-lapses. Partner with innovation hubs (iHub, Nailab), architects, and inventors.
							Content creation doubles as both education and marketing.
						</p>
					</div>
				</section>

				<!-- Path 3: Digital Marketing Agency -->
				<section class="mb-16">
					<h2 class="mb-6 text-3xl font-bold text-white">Path 3: Full-Service Digital Marketing</h2>

					<h3 class="mb-4 text-2xl font-semibold text-[#ff6b35]">Why This Remains Valuable</h3>
					<p class="mb-4 text-lg leading-relaxed text-white/80">
						While AI can create content, it cannot understand local market nuances, build client
						relationships, or execute strategic campaigns. Small Kenyan businesses need more than
						templates they need partners who understand their customers.
					</p>

					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<h4 class="mb-4 text-xl font-semibold">Service Packages (Realistic Pricing)</h4>

						<div class="mb-6 rounded-lg border border-white/10 bg-white/5 p-5">
							<h5 class="mb-2 text-lg font-semibold text-[#ff6b35]">Starter Package</h5>
							<p class="mb-3 text-2xl font-bold">KES 18,000-28,000</p>
							<ul class="space-y-1 text-sm text-white/70">
								<li>• Logo design + brand colors</li>
								<li>• Social media setup (3 platforms)</li>
								<li>• Basic landing page</li>
								<li>• 2-week content calendar</li>
								<li>• Google My Business setup</li>
							</ul>
						</div>

						<div class="mb-6 rounded-lg border border-white/10 bg-white/5 p-5">
							<h5 class="mb-2 text-lg font-semibold text-[#ff6b35]">Growth Package</h5>
							<p class="mb-3 text-2xl font-bold">KES 35,000-55,000</p>
							<ul class="space-y-1 text-sm text-white/70">
								<li>• Everything in Starter</li>
								<li>• Professional website (WordPress)</li>
								<li>• 1 month content + posting</li>
								<li>• Basic SEO setup</li>
								<li>• Email marketing integration</li>
								<li>• Product photography session</li>
							</ul>
						</div>

						<div class="rounded-lg border border-white/10 bg-white/5 p-5">
							<h5 class="mb-2 text-lg font-semibold text-[#ff6b35]">Premium Package</h5>
							<p class="mb-3 text-2xl font-bold">KES 75,000-120,000</p>
							<ul class="space-y-1 text-sm text-white/70">
								<li>• Everything in Growth</li>
								<li>• Custom website development</li>
								<li>• 3 months managed social media</li>
								<li>• 2 professional videos</li>
								<li>• Paid ads management (Meta/Google)</li>
								<li>• Monthly analytics & strategy calls</li>
							</ul>
						</div>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">
						Realistic First Quarter Target
					</h3>
					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<div class="mb-4 grid gap-4 md:grid-cols-3">
							<div>
								<p class="text-sm text-white/60">Starter Clients</p>
								<p class="text-xl font-bold">2-3 clients</p>
							</div>
							<div>
								<p class="text-sm text-white/60">Growth Clients</p>
								<p class="text-xl font-bold">1-2 clients</p>
							</div>
							<div>
								<p class="text-sm text-white/60">Monthly Revenue</p>
								<p class="text-xl font-bold text-[#ff6b35]">KES 70,000-140,000</p>
							</div>
						</div>
						<p class="mt-4 text-sm text-white/60">
							*Focus on 3-5 quality clients initially, building case studies and referrals
						</p>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">Investment Required</h3>
					<div class="my-6 space-y-3">
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Software subscriptions (Canva Pro, tools)</span>
							<span class="font-semibold">KES 3,000-5,000/mo</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Portfolio website & hosting</span>
							<span class="font-semibold">KES 8,000-15,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
						>
							<span class="text-white/80">Marketing materials & samples</span>
							<span class="font-semibold">KES 5,000-10,000</span>
						</div>
						<div
							class="flex items-center justify-between rounded-lg border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-4"
						>
							<span class="font-semibold">Initial Setup Cost</span>
							<span class="text-xl font-bold text-[#ff6b35]">KES 16,000-30,000</span>
						</div>
					</div>

					<p class="mt-6 text-white/70">
						<strong>Advantage:</strong> Lowest startup cost, leverages existing laptop and skills. Can
						be started immediately while building other service lines.
					</p>
				</section>

				<!-- Path 4: Video Production -->
				<section class="mb-16">
					<h2 class="mb-6 text-3xl font-bold text-white">
						Path 4: Video Production & Content Creation
					</h2>

					<h3 class="mb-4 text-2xl font-semibold text-[#ff6b35]">The Opportunity</h3>
					<p class="mb-4 text-lg leading-relaxed text-white/80">
						Every business needs video content, but quality local production is expensive. By
						starting with smartphone setups and scaling gradually, we can offer affordable options
						while building a portfolio and YouTube presence.
					</p>

					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<h4 class="mb-3 text-xl font-semibold">Service Pricing (Realistic)</h4>
						<ul class="space-y-2 text-white/80">
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Social media reels/shorts:</strong> KES 3,000-8,000 per video</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Product videos:</strong> KES 8,000-25,000</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Corporate videos:</strong> KES 20,000-60,000</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Event coverage:</strong> KES 15,000-45,000</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-[#ff6b35]">•</span>
								<span><strong>Testimonial videos:</strong> KES 5,000-15,000</span>
							</li>
						</ul>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">
						Phased Equipment Investment
					</h3>

					<div class="my-6 space-y-4">
						<div class="rounded-lg border border-green-500/30 bg-green-500/10 p-5">
							<h5 class="mb-2 font-semibold text-green-300">Phase 1: Smartphone Setup</h5>
							<p class="mb-3 text-2xl font-bold">KES 18,000-30,000</p>
							<ul class="space-y-1 text-sm text-white/70">
								<li>• Smartphone gimbal stabilizer: KES 7,000-12,000</li>
								<li>• Lapel/shotgun mic: KES 4,000-8,000</li>
								<li>• Ring light: KES 2,500-4,000</li>
								<li>• Tripod: KES 2,000-3,500</li>
								<li>• Editing: DaVinci Resolve (Free) + laptop</li>
							</ul>
							<p class="mt-3 text-xs text-white/60">
								Start here. Can produce professional-looking content immediately.
							</p>
						</div>

						<div class="rounded-lg border border-white/10 bg-white/5 p-5">
							<h5 class="mb-2 font-semibold text-white">Phase 2: Semi-Pro Setup (Later)</h5>
							<p class="mb-3 text-2xl font-bold">KES 90,000-150,000</p>
							<ul class="space-y-1 text-sm text-white/70">
								<li>• Entry mirrorless camera: KES 55,000-95,000</li>
								<li>• Rode VideoMic: KES 10,000-15,000</li>
								<li>• LED panel lights: KES 12,000-22,000</li>
								<li>• Backdrop setup: KES 5,000-8,000</li>
							</ul>
							<p class="mt-3 text-xs text-white/60">
								Upgrade after 4-6 months once revenue justifies it.
							</p>
						</div>
					</div>

					<h3 class="mb-4 mt-8 text-2xl font-semibold text-[#ff6b35]">
						Realistic First Quarter Target
					</h3>
					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<div class="mb-4 grid gap-4 md:grid-cols-2">
							<div>
								<p class="text-sm text-white/60">Monthly Projects</p>
								<p class="text-2xl font-bold">3-5 videos</p>
							</div>
							<div>
								<p class="text-sm text-white/60">Expected Revenue</p>
								<p class="text-2xl font-bold">KES 20,000-45,000</p>
							</div>
						</div>
						<p class="text-sm text-white/60">
							*Starting with smaller projects (reels, testimonials) while building portfolio
						</p>
					</div>

					<div class="mt-6 rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">
						<p class="mb-2 font-semibold text-purple-300">YouTube Strategy:</p>
						<p class="text-white/80">
							Document every project. Create "Behind the Scenes" content. Share tips and tutorials.
							Build authority while marketing services. Target: 300-500 subscribers in Q1,
							monetization in Q3-Q4.
						</p>
					</div>
				</section>

				<!-- Realistic Financial Summary -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<DollarSign class="text-[#ff6b35]" size={32} />
						Realistic Financial Projections
					</h2>

					<div class="my-8 rounded-2xl border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-8">
						<h3 class="mb-6 text-2xl font-semibold text-white">Quarter 1 (Jan-Mar 2026)</h3>

						<div class="mb-6 grid gap-6 md:grid-cols-2">
							<div class="rounded-xl border border-white/10 bg-white/5 p-6">
								<p class="mb-2 text-sm text-white/60">Total Investment Needed</p>
								<p class="text-3xl font-bold text-[#ff6b35]">KES 80,000-150,000</p>
								<p class="mt-2 text-xs text-white/50">Choose 1-2 primary service lines to start</p>
							</div>

							<div class="rounded-xl border border-white/10 bg-white/5 p-6">
								<p class="mb-2 text-sm text-white/60">Expected Monthly Revenue</p>
								<p class="text-3xl font-bold text-white">KES 85,000-165,000</p>
								<p class="mt-2 text-xs text-white/50">By end of Q1, combining 2 service lines</p>
							</div>
						</div>

						<div class="rounded-xl border border-white/20 bg-white/10 p-6">
							<h4 class="mb-4 font-semibold">
								Conservative Revenue Breakdown (Monthly, Q1 Average)
							</h4>
							<div class="space-y-3">
								<div class="flex justify-between border-b border-white/10 pb-2">
									<span class="text-white/80">Digital Marketing (2-3 clients)</span>
									<span class="font-semibold">KES 40,000-65,000</span>
								</div>
								<div class="flex justify-between border-b border-white/10 pb-2">
									<span class="text-white/80">Apparel Printing (40-60 pieces)</span>
									<span class="font-semibold">KES 25,000-45,000</span>
								</div>
								<div class="flex justify-between border-b border-white/10 pb-2">
									<span class="text-white/80">Video Production (3-5 projects)</span>
									<span class="font-semibold">KES 15,000-35,000</span>
								</div>
								<div class="flex justify-between border-b border-white/10 pb-2">
									<span class="text-white/80">3D Printing (10-15 projects)</span>
									<span class="font-semibold">KES 18,000-32,000</span>
								</div>
								<div class="flex justify-between pt-2">
									<span class="font-bold text-white">TOTAL (pick 2-3 services)</span>
									<span class="text-xl font-bold text-[#ff6b35]">KES 85,000-165,000</span>
								</div>
							</div>
						</div>
					</div>

					<h3 class="mb-6 mt-12 text-2xl font-semibold text-[#ff6b35]">
						Quarter 2-3 Growth Projection
					</h3>

					<div class="my-6 rounded-xl border border-white/10 bg-white/5 p-6">
						<div class="mb-6 grid gap-6 md:grid-cols-3">
							<div>
								<p class="mb-2 text-sm text-white/60">Monthly Revenue (Q2)</p>
								<p class="text-2xl font-bold">KES 140,000-250,000</p>
							</div>
							<div>
								<p class="mb-2 text-sm text-white/60">Monthly Revenue (Q3)</p>
								<p class="text-2xl font-bold">KES 200,000-350,000</p>
							</div>
							<div>
								<p class="mb-2 text-sm text-white/60">Operating Costs</p>
								<p class="text-2xl font-bold">40-50%</p>
							</div>
						</div>

						<div class="rounded-lg border border-white/10 bg-white/5 p-5">
							<h4 class="mb-3 font-semibold">Key Assumptions</h4>
							<ul class="space-y-2 text-sm text-white/70">
								<li>• Start from home initially (no rent overhead)</li>
								<li>• You handle most work yourself initially</li>
								<li>• Hire freelancers only as needed (commission basis)</li>
								<li>• Marketing through organic social media + word of mouth</li>
								<li>• Equipment purchased gradually from profits</li>
								<li>• 30-40% profit reinvested for growth</li>
							</ul>
						</div>
					</div>

					<h3 class="mb-6 mt-12 text-2xl font-semibold text-[#ff6b35]">
						Year 1 Summary (Conservative)
					</h3>

					<div class="grid gap-6 md:grid-cols-2">
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<p class="mb-2 text-sm text-white/60">Total Annual Revenue</p>
							<p class="mb-1 text-3xl font-bold">KES 1.8M - 3.2M</p>
							<p class="text-xs text-white/50">Across all service lines</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<p class="mb-2 text-sm text-white/60">Net Profit (50-60%)</p>
							<p class="mb-1 text-3xl font-bold text-[#ff6b35]">KES 900K - 1.9M</p>
							<p class="text-xs text-white/50">After reinvestment & expenses</p>
						</div>
					</div>
				</section>

				<!-- Recommended Starting Path -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Wrench class="text-[#ff6b35]" size={32} />
						Recommended Starting Path
					</h2>

					<div
						class="my-8 rounded-2xl border-2 border-[#ff6b35] bg-gradient-to-br from-[#ff6b35]/20 to-[#ff8c5a]/20 p-8"
					>
						<h3 class="mb-4 text-2xl font-bold">
							Phase 1 Combo: Digital Marketing + One Physical Service
						</h3>

						<p class="mb-6 text-lg text-white/90">
							Start with <strong>digital marketing services</strong> (immediate cash flow, low
							investment) + <strong>either apparel printing OR video production</strong> (your choice
							based on interest and local demand).
						</p>

						<div class="mb-6 grid gap-4 md:grid-cols-2">
							<div class="rounded-xl border border-white/20 bg-white/10 p-5">
								<h4 class="mb-3 font-semibold text-[#ff6b35]">Option A: Marketing + Apparel</h4>
								<p class="mb-3 text-sm text-white/80">
									Best if you prefer tangible products and have space for equipment.
								</p>
								<div class="space-y-2 text-sm">
									<div class="flex justify-between">
										<span class="text-white/70">Initial Investment</span>
										<span class="font-semibold">KES 80K-120K</span>
									</div>
									<div class="flex justify-between">
										<span class="text-white/70">Q1 Revenue Target</span>
										<span class="font-semibold">KES 85K-135K/mo</span>
									</div>
									<div class="flex justify-between">
										<span class="text-white/70">Break-even</span>
										<span class="font-semibold">2-3 months</span>
									</div>
								</div>
							</div>

							<div class="rounded-xl border border-white/20 bg-white/10 p-5">
								<h4 class="mb-3 font-semibold text-[#ff6b35]">Option B: Marketing + Video</h4>
								<p class="mb-3 text-sm text-white/80">
									Best if you enjoy storytelling and want to build YouTube presence.
								</p>
								<div class="space-y-2 text-sm">
									<div class="flex justify-between">
										<span class="text-white/70">Initial Investment</span>
										<span class="font-semibold">KES 35K-65K</span>
									</div>
									<div class="flex justify-between">
										<span class="text-white/70">Q1 Revenue Target</span>
										<span class="font-semibold">KES 75K-125K/mo</span>
									</div>
									<div class="flex justify-between">
										<span class="text-white/70">Break-even</span>
										<span class="font-semibold">1-2 months</span>
									</div>
								</div>
							</div>
						</div>

						<div class="rounded-lg border border-white/20 bg-white/10 p-5">
							<h4 class="mb-3 font-semibold">Why This Works</h4>
							<ul class="space-y-2 text-sm text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">✓</span>
									<span
										>Digital marketing generates immediate cash flow with minimal investment</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">✓</span>
									<span>Physical service differentiates you from pure digital agencies</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">✓</span>
									<span>Cross-selling opportunity: offer branding + branded merchandise</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">✓</span>
									<span>Portfolio building through your own marketing showcases your services</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">✓</span>
									<span>Lower risk start from home, scale as revenue grows</span>
								</li>
							</ul>
						</div>
					</div>
				</section>

				<!-- Implementation Timeline -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Calendar class="text-[#ff6b35]" size={32} />
						Realistic Implementation Timeline
					</h2>

					<div class="space-y-6">
						<!-- Week 1-2 -->
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-xl font-bold">Week 1-2: Foundation</h3>
								<span
									class="rounded-full bg-[#ff6b35]/20 px-4 py-1 text-sm font-semibold text-[#ff6b35]"
									>Setup Phase</span
								>
							</div>
							<ul class="space-y-2 text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Business registration & bank account</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Domain purchase, email setup, social media handles</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Logo & basic branding (DIY with Canva or budget designer)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Research equipment options, compare suppliers</span>
								</li>
							</ul>
						</div>

						<!-- Week 3-4 -->
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-xl font-bold">Week 3-4: Launch Preparation</h3>
								<span
									class="rounded-full bg-blue-500/20 px-4 py-1 text-sm font-semibold text-blue-300"
									>Build Phase</span
								>
							</div>
							<ul class="space-y-2 text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Website launch (simple WordPress or portfolio site)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Purchase primary equipment (heat press OR video kit)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Create sample products/demo videos</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Prepare 20-30 social media posts</span>
								</li>
							</ul>
						</div>

						<!-- Month 2 -->
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-xl font-bold">Month 2: First Clients</h3>
								<span
									class="rounded-full bg-green-500/20 px-4 py-1 text-sm font-semibold text-green-300"
									>Launch Phase</span
								>
							</div>
							<ul class="space-y-2 text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Launch promotion (20% off for first 10 clients)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Fulfill first 5-10 orders, collect testimonials</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Post consistently on social media (daily stories, 3-5 posts/week)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Network actively reach out to 50+ potential clients</span>
								</li>
							</ul>
						</div>

						<!-- Month 3 -->
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-xl font-bold">Month 3: Scale & Refine</h3>
								<span
									class="rounded-full bg-purple-500/20 px-4 py-1 text-sm font-semibold text-purple-300"
									>Growth Phase</span
								>
							</div>
							<ul class="space-y-2 text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Target 20-30 completed projects</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Launch YouTube channel (if doing video) or tutorial content</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Evaluate Q1 performance what worked? What didn't?</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-[#ff6b35]">•</span>
									<span>Consider adding third service line if capacity allows</span>
								</li>
							</ul>
						</div>
					</div>
				</section>

				<!-- Success Factors -->
				<section class="mb-16">
					<h2 class="mb-6 text-3xl font-bold">Keys to Success</h2>

					<div class="grid gap-6 md:grid-cols-2">
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-[#ff6b35]">Quality Over Quantity</h3>
							<p class="text-white/80">
								Perfect 2-3 services before expanding. Every project should be portfolio-worthy.
								Under-promise, over-deliver.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-[#ff6b35]">Document Everything</h3>
							<p class="text-white/80">
								Before/after photos are mandatory. Collect video testimonials. Every project is
								marketing material for the next.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-[#ff6b35]">Build Relationships</h3>
							<p class="text-white/80">
								Personal touch with every client. Follow up after delivery. Referrals are your best
								marketing incentivize them.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-[#ff6b35]">Financial Discipline</h3>
							<p class="text-white/80">
								Track every expense. Require 50% deposit upfront. Build 3-month emergency fund
								before big equipment purchases.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-[#ff6b35]">Learn Continuously</h3>
							<p class="text-white/80">
								YouTube tutorials are free. Join creator communities. Test new techniques. Stay
								ahead of local competition.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-[#ff6b35]">Start Lean, Scale Smart</h3>
							<p class="text-white/80">
								Work from home initially. Hire freelancers before full-time staff. Let revenue
								dictate growth pace.
							</p>
						</div>
					</div>
				</section>

				<!-- Final Thoughts -->
				<section class="mb-16">
					<div
						class="rounded-2xl border-2 border-[#ff6b35] bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c5a]/10 p-8 md:p-12"
					>
						<h2 class="mb-6 text-3xl font-bold">The Path Forward</h2>

						<p class="mb-4 text-lg leading-relaxed text-white/90">
							These projections aren't dreams they're achievable targets based on conservative
							estimates and realistic market conditions. The key is starting <strong>now</strong>,
							starting <strong>small</strong>, and scaling based on actual results.
						</p>

						<p class="mb-6 text-lg leading-relaxed text-white/90">
							While AI reshapes digital content creation, physical craftsmanship, local service
							delivery, and authentic human relationships become more valuable. Kentom's opportunity
							lies at this intersection: <strong>digital expertise meeting physical reality</strong
							>.
						</p>

						<div class="my-8 rounded-xl border border-white/20 bg-white/10 p-6">
							<h3 class="mb-4 text-xl font-semibold">Next 48 Hours Action Plan</h3>
							<ol class="space-y-3 text-white/90">
								<li class="flex gap-3">
									<span class="font-bold text-[#ff6b35]">1.</span>
									<span>Choose your starting combination (Marketing + Physical service)</span>
								</li>
								<li class="flex gap-3">
									<span class="font-bold text-[#ff6b35]">2.</span>
									<span>Calculate exact startup capital needed for your choice</span>
								</li>
								<li class="flex gap-3">
									<span class="font-bold text-[#ff6b35]">3.</span>
									<span>Secure domain name and social media handles</span>
								</li>
								<li class="flex gap-3">
									<span class="font-bold text-[#ff6b35]">4.</span>
									<span>Reach out to 10 people in your network about your services</span>
								</li>
								<li class="flex gap-3">
									<span class="font-bold text-[#ff6b35]">5.</span>
									<span>Create a simple landing page (even a Google Doc works initially)</span>
								</li>
							</ol>
						</div>

						<p class="text-lg italic text-white/80">
							"The best time to start was yesterday. The second best time is now. Pick your path,
							take the first step, and adjust as you learn. The market rewards those who act."
						</p>
					</div>
				</section>

				<!-- Call to Action -->
				<section class="text-center">
					<div class="rounded-2xl border border-white/10 bg-white/5 p-12">
						<h2 class="mb-4 text-3xl font-bold">Ready to Support This Journey?</h2>
						<p class="mb-8 text-lg text-white/70">
							Every contribution helps us invest in equipment, skills, and growth. Your support
							makes these plans reality.
						</p>
						<a
							href="/donate"
							class="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105"
						>
							<span class="text-white">Support Kentom's Growth</span>
							<TrendingUp class="text-white" size={20} />
						</a>
					</div>
				</section>
			</div>
		</div>
	</article>
</div>

<style>
	.prose {
		color: rgba(255, 255, 255, 0.9);
	}

	.prose h2,
	.prose h3,
	.prose h4 {
		color: white;
	}

	.prose strong {
		color: white;
	}

	.prose a {
		text-decoration: none;
	}

	.prose a:hover {
		text-decoration: underline;
	}

	/* underline color */
	.prose a::after {
		background-color: #ffff;
	}
</style>
