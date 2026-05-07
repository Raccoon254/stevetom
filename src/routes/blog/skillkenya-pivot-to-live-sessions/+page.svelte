<script lang="ts">
	import {
		ArrowLeft,
		Video,
		BookOpen,
		Users,
		Calendar,
		Zap,
		AlertCircle,
		CheckCircle2,
		Lightbulb,
		Code,
		Palette,
		TrendingUp,
		Film,
	} from 'lucide-svelte'
	import { fade, fly } from 'svelte/transition'
</script>

<svelte:head>
	<title>Skill Kenya's Pivot: From Courses to Live Sessions | Business Strategy</title>
	<meta
		name="description"
		content="Why we're transitioning from pre-recorded courses to interactive live sessions for better engagement and real-time learning."
	/>
</svelte:head>

<div class="min-h-screen bg-[#252525]/10 -mt-28 text-white">
	<!-- Header -->
	<div class="border-b border-white/10 bg-[#151515]">
		<div class="container mx-auto px-6 py-6">
			<a
				href="/blog"
				class="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
			>
				<ArrowLeft size={20} />
				<span>Back to Blog</span>
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
				<span>8 min read</span>
				<span>•</span>
				<span class="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-blue-300">
					EdTech Strategy
				</span>
			</div>

			<!-- Title -->
			<h1
				class="mb-6 text-4xl font-bold leading-tight md:text-6xl"
				in:fly={{ y: -20, duration: 600 }}
			>
				Skill Kenya's Pivot: From Pre-Recorded Courses to Live Interactive Sessions
			</h1>

			<p
				class="mb-12 text-xl leading-relaxed text-white/70"
				in:fly={{ y: -20, duration: 600, delay: 100 }}
			>
				Why we're abandoning the traditional course model and embracing real-time, interactive
				learning sessions that actually work for Kenyan learners.
			</p>

			<!-- Featured Image -->
			<div class="mb-16 overflow-hidden rounded-2xl border border-white/10">
				<img
					src="/blog/skillkenya-1.jpg"
					alt="Skill Kenya Live Learning Sessions"
					class="w-full h-auto"
				/>
			</div>

			<!-- Content -->
			<div class="prose prose-invert max-w-none">
				<!-- Introduction -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Lightbulb class="text-blue-400" size={32} />
						What is Skill Kenya?
					</h2>

					<p class="mb-4 text-lg leading-relaxed text-white/80">
						<a
							href="https://skillkenya.com"
							target="_blank"
							class="text-blue-400 hover:text-blue-300 underline">Skill Kenya</a
						>
						is our professional online learning platform designed to offer high-quality education in
						<strong class="text-white">programming, design, marketing, and animation</strong> to Kenyan
						learners and beyond.
					</p>

					<p class="mb-4 text-lg leading-relaxed text-white/80">
						When we launched the platform, we followed the traditional online course model: create
						pre-recorded video courses, build course modules, set them up for self-paced learning,
						and let students work through them independently.
					</p>

					<div class="my-8 rounded-2xl border border-white/10 bg-white/5 p-6">
						<h3 class="mb-4 text-xl font-semibold">Current Platform Coverage</h3>
						<div class="grid gap-4 md:grid-cols-2">
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-blue-400">
									<Code size={20} />
									<span>Programming</span>
								</h4>
								<p class="text-sm text-white/70">Web development, mobile apps, backend systems</p>
							</div>
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-purple-400">
									<Palette size={20} />
									<span>Design</span>
								</h4>
								<p class="text-sm text-white/70">UI/UX, graphic design, brand identity</p>
							</div>
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-green-400">
									<TrendingUp size={20} />
									<span>Marketing</span>
								</h4>
								<p class="text-sm text-white/70">
									Digital marketing, social media, content strategy
								</p>
							</div>
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-orange-400">
									<Film size={20} />
									<span>Animation</span>
								</h4>
								<p class="text-sm text-white/70">Motion graphics, 2D/3D animation, video editing</p>
							</div>
						</div>
					</div>

					<p class="text-lg italic text-white/70">
						But here's the problem: <strong class="text-red-400"
							>the traditional course model isn't working</strong
						> for us—or our students.
					</p>
				</section>

				<!-- The Problem -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<AlertCircle class="text-red-400" size={32} />
						Why Pre-Recorded Courses Are Failing
					</h2>

					<div class="my-6 rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-8">
						<h3 class="mb-6 text-2xl font-semibold text-red-300">The Harsh Reality</h3>

						<div class="space-y-6">
							<div class="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-red-300">
									<span>1.</span>
									<span>Low Completion Rates</span>
								</h4>
								<p class="text-white/80">
									Students start courses with enthusiasm but rarely finish. Without live
									accountability, motivation drops after the first few lessons. The average
									completion rate for online courses is under 15%.
								</p>
							</div>

							<div class="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-red-300">
									<span>2.</span>
									<span>No Real-Time Support</span>
								</h4>
								<p class="text-white/80">
									When students get stuck, they wait hours or days for email responses. By the time
									help arrives, they've lost momentum or given up entirely. Learning happens best
									when questions are answered immediately.
								</p>
							</div>

							<div class="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-red-300">
									<span>3.</span>
									<span>Content Creation Bottleneck</span>
								</h4>
								<p class="text-white/80">
									Creating high-quality pre-recorded courses is <strong
										>extremely time-consuming</strong
									>. Each hour of final video requires 5-10 hours of scripting, recording, editing,
									and polishing. We can't scale content creation fast enough to meet demand.
								</p>
							</div>

							<div class="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-red-300">
									<span>4.</span>
									<span>Outdated Content Problem</span>
								</h4>
								<p class="text-white/80">
									Tech moves fast. By the time a course is fully edited and published, frameworks
									have updated, tools have changed, and best practices have evolved. Pre-recorded
									courses become outdated quickly.
								</p>
							</div>

							<div class="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-red-300">
									<span>5.</span>
									<span>Lack of Community & Networking</span>
								</h4>
								<p class="text-white/80">
									Students learn in isolation. They miss out on peer learning, collaboration,
									networking opportunities, and the energy that comes from learning together with
									others.
								</p>
							</div>

							<div class="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
								<h4 class="mb-2 flex items-center gap-2 font-semibold text-red-300">
									<span>6.</span>
									<span>Complex Technical Setup</span>
								</h4>
								<p class="text-white/80">
									Managing course platforms, payment systems, video hosting, student dashboards,
									progress tracking—it's technically complex and expensive. We spend more time
									maintaining infrastructure than teaching.
								</p>
							</div>
						</div>
					</div>

					<div class="my-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
						<p class="text-lg font-semibold text-yellow-300">The Core Issue:</p>
						<p class="mt-2 text-white/90">
							We built a system optimized for content creation and distribution, not for actual <strong
								>learning outcomes</strong
							> and student success. The method simply doesn't work for the way people actually learn.
						</p>
					</div>
				</section>

				<!-- The Solution -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Video class="text-green-400" size={32} />
						The New Model: Live Interactive Sessions
					</h2>

					<!-- Section Image -->
					<div class="my-8 overflow-hidden rounded-xl border border-white/10">
						<img
							src="https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg"
							alt="Online Learning Setup"
							class="w-full h-auto"
						/>
					</div>

					<p class="mb-6 text-lg leading-relaxed text-white/80">
						Instead of fighting the limitations of pre-recorded courses, we're embracing what
						actually works: <strong class="text-green-400"
							>live, scheduled, interactive learning sessions</strong
						>.
					</p>

					<div class="my-8 rounded-2xl border-2 border-green-500/30 bg-green-500/10 p-8">
						<h3 class="mb-6 text-2xl font-semibold text-green-300">How Live Sessions Work</h3>

						<div class="space-y-6">
							<div class="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
								<div class="mb-3 flex items-center gap-3">
									<CheckCircle2 class="text-green-400" size={24} />
									<h4 class="text-xl font-semibold text-green-300">Scheduled Live Classes</h4>
								</div>
								<p class="text-white/80">
									Classes happen at specific times (e.g., "Web Development - Every Saturday
									2pm-5pm"). Students join via Google Meet, Zoom, or similar platforms. It's like
									attending a real class, but from anywhere.
								</p>
							</div>

							<div class="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
								<div class="mb-3 flex items-center gap-3">
									<CheckCircle2 class="text-green-400" size={24} />
									<h4 class="text-xl font-semibold text-green-300">Real-Time Interaction</h4>
								</div>
								<p class="text-white/80">
									Students can ask questions immediately. Instructors can see confusion on faces,
									adjust pacing, share screens for live coding, and provide instant feedback.
									Learning becomes a conversation, not a monologue.
								</p>
							</div>

							<div class="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
								<div class="mb-3 flex items-center gap-3">
									<CheckCircle2 class="text-green-400" size={24} />
									<h4 class="text-xl font-semibold text-green-300">Cohort-Based Learning</h4>
								</div>
								<p class="text-white/80">
									Students learn together in small groups (15-25 people). They build relationships,
									collaborate on projects, hold each other accountable, and create a support network
									that extends beyond classes.
								</p>
							</div>

							<div class="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
								<div class="mb-3 flex items-center gap-3">
									<CheckCircle2 class="text-green-400" size={24} />
									<h4 class="text-xl font-semibold text-green-300">Flexible Content Delivery</h4>
								</div>
								<p class="text-white/80">
									No need to spend weeks producing perfect videos. Instructors prepare slides and
									demos, teach live, and adapt content based on student needs in real-time. Much
									faster to launch and iterate.
								</p>
							</div>

							<div class="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
								<div class="mb-3 flex items-center gap-3">
									<CheckCircle2 class="text-green-400" size={24} />
									<h4 class="text-xl font-semibold text-green-300">Optional Recordings</h4>
								</div>
								<p class="text-white/80">
									Sessions are recorded and shared with enrolled students for review. But the focus
									is on attending live—recordings are supplementary, not the primary learning
									method.
								</p>
							</div>

							<div class="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
								<div class="mb-3 flex items-center gap-3">
									<CheckCircle2 class="text-green-400" size={24} />
									<h4 class="text-xl font-semibold text-green-300">Simpler Infrastructure</h4>
								</div>
								<p class="text-white/80">
									We don't need complex course platforms. Just a simple website for scheduling and
									payments, plus Google Meet or Zoom for sessions. Lower overhead means we can focus
									on teaching quality.
								</p>
							</div>
						</div>
					</div>

					<div class="my-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
						<h4 class="mb-3 text-xl font-semibold text-blue-300">Example Session Structure</h4>
						<div class="space-y-3 text-white/80">
							<p><strong>Course:</strong> Full-Stack Web Development Bootcamp</p>
							<p><strong>Schedule:</strong> Every Tuesday & Thursday, 6pm-8pm EAT (8 weeks)</p>
							<p>
								<strong>Format:</strong> Live teaching (60 mins) + Q&A + Live coding (40 mins) + Homework
								assignment
							</p>
							<p><strong>Platform:</strong> Google Meet</p>
							<p><strong>Cohort Size:</strong> 20 students max</p>
							<p><strong>Price:</strong> KES 15,000 for the full 8-week program</p>
						</div>
					</div>
				</section>

				<!-- Hybrid Approach -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Zap class="text-purple-400" size={32} />
						The Hybrid Future (If We Manage)
					</h2>

					<p class="mb-6 text-lg leading-relaxed text-white/80">
						We're not completely abandoning courses—we're just being realistic about priorities.
						Live sessions come first because they deliver better results and are faster to launch.
					</p>

					<p class="mb-6 text-lg leading-relaxed text-white/80">
						<strong class="text-white">If we manage</strong> to build momentum and create systems
						that work, we can add pre-recorded courses as <strong>supplementary content</strong> alongside
						the live sessions.
					</p>

					<div class="my-8 rounded-xl border border-white/10 bg-white/5 p-6">
						<h3 class="mb-4 text-xl font-semibold">Potential Hybrid Model</h3>
						<div class="grid gap-4 md:grid-cols-2">
							<div class="rounded-lg border border-purple-500/20 bg-purple-500/5 p-5">
								<h4 class="mb-2 font-semibold text-purple-300">Live Sessions (Primary)</h4>
								<ul class="space-y-2 text-sm text-white/70">
									<li>• Scheduled weekly classes</li>
									<li>• Real-time teaching & interaction</li>
									<li>• Cohort-based accountability</li>
									<li>• Project-based learning</li>
									<li>• Premium pricing</li>
								</ul>
							</div>
							<div class="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5">
								<h4 class="mb-2 font-semibold text-blue-300">Courses (Supplementary)</h4>
								<ul class="space-y-2 text-sm text-white/70">
									<li>• Self-paced video lessons</li>
									<li>• Pre-work for live sessions</li>
									<li>• Reference material</li>
									<li>• Lower-cost entry point</li>
									<li>• Upsell to live cohorts</li>
								</ul>
							</div>
						</div>
					</div>

					<p class="text-white/70">
						For example: A student might take a "JavaScript Fundamentals" course (self-paced, KES
						3,000) to build basics, then join a live "React Bootcamp" cohort (8 weeks, KES 15,000)
						for structured, interactive learning.
					</p>
				</section>

				<!-- Technical Implementation -->
				<section class="mb-16">
					<h2 class="mb-6 flex items-center gap-3 text-3xl font-bold">
						<Users class="text-orange-400" size={32} />
						How We'll Implement This
					</h2>

					<!-- Section Image -->
					<div class="my-8 overflow-hidden rounded-xl border border-white/10">
						<img
							src="https://images.pexels.com/photos/39578/imac-ipad-computer-tablet-39578.jpeg"
							alt="Digital Workspace Setup"
							class="w-full h-auto"
						/>
					</div>

					<div class="my-6 space-y-6">
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-4 text-xl font-semibold text-orange-300">
								Phase 1: Immediate (Weeks 1-4)
							</h3>
							<ul class="space-y-3 text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-orange-400">•</span>
									<span
										><strong>Simplify the website:</strong> Remove complex course infrastructure, add
										simple session calendar and booking system</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-orange-400">•</span>
									<span
										><strong>Choose platform:</strong> Google Meet (free for 60 mins) or Zoom (affordable
										for longer sessions)</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-orange-400">•</span>
									<span
										><strong>Launch pilot sessions:</strong> Start with 2-3 beginner classes (Web Dev,
										Design, Marketing)</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-orange-400">•</span>
									<span><strong>Set up payment:</strong> M-Pesa integration for session fees</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-orange-400">•</span>
									<span
										><strong>Market heavily:</strong> Instagram, TikTok, WhatsApp—emphasize live interaction
										benefit</span
									>
								</li>
							</ul>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-4 text-xl font-semibold text-green-300">
								Phase 2: Growth (Months 2-3)
							</h3>
							<ul class="space-y-3 text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span
										><strong>Expand offerings:</strong> Add more specialized sessions based on demand</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span
										><strong>Build community:</strong> WhatsApp/Discord groups for each cohort</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span
										><strong>Hire instructors:</strong> Bring on specialists for subjects we can't cover</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span
										><strong>Record & archive:</strong> Build library of session recordings for enrolled
										students</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span
										><strong>Collect testimonials:</strong> Document student success stories</span
									>
								</li>
							</ul>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-4 text-xl font-semibold text-blue-300">Phase 3: Scale (Months 4-6)</h3>
							<ul class="space-y-3 text-white/80">
								<li class="flex items-start gap-2">
									<span class="text-blue-400">•</span>
									<span
										><strong>Multiple cohorts:</strong> Run same course with different schedules (morning/evening,
										weekday/weekend)</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-400">•</span>
									<span
										><strong>Advanced programs:</strong> Multi-week bootcamps for serious learners</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-400">•</span>
									<span
										><strong>Corporate training:</strong> Offer live sessions to companies for employee
										upskilling</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-400">•</span>
									<span
										><strong>Consider courses:</strong> If bandwidth allows, start creating self-paced
										courses from recorded sessions</span
									>
								</li>
							</ul>
						</div>
					</div>
				</section>

				<!-- Revenue Model -->
				<section class="mb-16">
					<h2 class="mb-6 text-3xl font-bold">Realistic Revenue Projections</h2>

					<div class="my-8 rounded-2xl border border-white/10 bg-white/5 p-8">
						<h3 class="mb-6 text-2xl font-semibold">Month 1-2 (Pilot Phase)</h3>

						<div class="mb-6 grid gap-6 md:grid-cols-2">
							<div class="rounded-xl border border-white/10 bg-white/5 p-6">
								<p class="mb-2 text-sm text-white/60">Sessions Per Week</p>
								<p class="text-3xl font-bold">3-4 sessions</p>
								<p class="mt-2 text-xs text-white/50">Testing different subjects and times</p>
							</div>

							<div class="rounded-xl border border-white/10 bg-white/5 p-6">
								<p class="mb-2 text-sm text-white/60">Students Per Session</p>
								<p class="text-3xl font-bold">8-12 students</p>
								<p class="mt-2 text-xs text-white/50">Small cohorts for quality teaching</p>
							</div>
						</div>

						<div class="rounded-xl border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-6">
							<div class="grid gap-4 md:grid-cols-3">
								<div>
									<p class="text-sm text-white/60">Price Per Session</p>
									<p class="text-2xl font-bold">KES 1,000-2,000</p>
								</div>
								<div>
									<p class="text-sm text-white/60">Weekly Revenue</p>
									<p class="text-2xl font-bold">KES 30,000-55,000</p>
								</div>
								<div>
									<p class="text-sm text-white/60">Monthly Revenue</p>
									<p class="text-2xl font-bold text-[#ff6b35]">KES 120,000-220,000</p>
								</div>
							</div>
						</div>
					</div>

					<div class="my-8 rounded-2xl border border-white/10 bg-white/5 p-8">
						<h3 class="mb-6 text-2xl font-semibold">Month 3-6 (Growth Phase)</h3>

						<div class="mb-6 grid gap-6 md:grid-cols-2">
							<div class="rounded-xl border border-white/10 bg-white/5 p-6">
								<p class="mb-2 text-sm text-white/60">Sessions Per Week</p>
								<p class="text-3xl font-bold">8-12 sessions</p>
								<p class="mt-2 text-xs text-white/50">Multiple cohorts & subjects</p>
							</div>

							<div class="rounded-xl border border-white/10 bg-white/5 p-6">
								<p class="mb-2 text-sm text-white/60">Average Students</p>
								<p class="text-3xl font-bold">15 per session</p>
								<p class="mt-2 text-xs text-white/50">Optimized cohort size</p>
							</div>
						</div>

						<div class="rounded-xl border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-6">
							<div class="grid gap-4 md:grid-cols-2">
								<div>
									<p class="text-sm text-white/60">Weekly Revenue</p>
									<p class="text-2xl font-bold">KES 120,000-180,000</p>
								</div>
								<div>
									<p class="text-sm text-white/60">Monthly Revenue</p>
									<p class="text-2xl font-bold text-[#ff6b35]">KES 480,000-720,000</p>
								</div>
							</div>
						</div>
					</div>

					<div class="rounded-lg border border-blue-500/30 bg-blue-500/10 p-5">
						<p class="mb-2 text-sm font-semibold text-blue-300">Key Assumptions:</p>
						<ul class="space-y-1 text-sm text-white/70">
							<li>• No expensive course production costs</li>
							<li>• Minimal platform fees (just Meet/Zoom subscription)</li>
							<li>• Instructors paid per session (30-40% of revenue)</li>
							<li>• Marketing through organic social media + word of mouth</li>
							<li>• Focus on completion rates and student success for referrals</li>
						</ul>
					</div>
				</section>

				<!-- Why This Will Work -->
				<section class="mb-16">
					<h2 class="mb-6 text-3xl font-bold">Why This Model Will Succeed</h2>

					<div class="grid gap-6 md:grid-cols-2">
						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-green-400">Higher Completion Rates</h3>
							<p class="text-white/80">
								Live accountability + scheduled classes = students actually finish. Cohort-based
								learning has 60-80% completion rates vs. 5-15% for self-paced courses.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-blue-400">Better Learning Outcomes</h3>
							<p class="text-white/80">
								Real-time Q&A, personalized feedback, and hands-on projects lead to deeper
								understanding and actual skill development.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-purple-400">Faster to Market</h3>
							<p class="text-white/80">
								We can launch a new session in days, not months. Test topics, iterate quickly, focus
								on what students actually want.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-orange-400">Community Building</h3>
							<p class="text-white/80">
								Students build real relationships. They network, collaborate on projects, and create
								a support system that lasts beyond the course.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-yellow-400">Premium Positioning</h3>
							<p class="text-white/80">
								Live instruction justifies higher prices. Students pay for access to expert time and
								personalized attention, not just content.
							</p>
						</div>

						<div class="rounded-xl border border-white/10 bg-white/5 p-6">
							<h3 class="mb-3 text-xl font-semibold text-red-400">Always Current</h3>
							<p class="text-white/80">
								Teaching live means content updates happen in real-time. No outdated videos—every
								session reflects the latest tools and techniques.
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
							We're not giving up on Skill Kenya—we're pivoting to a model that actually serves our
							students and makes business sense. Pre-recorded courses sound great in theory, but
							live sessions deliver real results.
						</p>

						<p class="mb-6 text-lg leading-relaxed text-white/90">
							This transition won't happen overnight, but it will happen strategically:
						</p>

						<ol class="mb-8 space-y-3 text-white/90">
							<li class="flex gap-3">
								<span class="font-bold text-[#ff6b35]">1.</span>
								<span
									><strong>Launch live sessions immediately</strong> with simple infrastructure</span
								>
							</li>
							<li class="flex gap-3">
								<span class="font-bold text-[#ff6b35]">2.</span>
								<span><strong>Focus on student success</strong> and completion rates</span>
							</li>
							<li class="flex gap-3">
								<span class="font-bold text-[#ff6b35]">3.</span>
								<span><strong>Build community and referral loops</strong> for organic growth</span>
							</li>
							<li class="flex gap-3">
								<span class="font-bold text-[#ff6b35]">4.</span>
								<span><strong>Scale what works</strong> before adding complexity</span>
							</li>
							<li class="flex gap-3">
								<span class="font-bold text-[#ff6b35]">5.</span>
								<span
									><strong>Add courses only if/when</strong> we have proven systems in place</span
								>
							</li>
						</ol>

						<p class="text-lg italic text-white/80">
							"The best learning happens in conversation, not in isolation. We're choosing real
							connection over perfect production."
						</p>
					</div>
				</section>

				<!-- Call to Action -->
				<section class="text-center">
					<div class="rounded-2xl border border-white/10 bg-white/5 p-12">
						<h2 class="mb-4 text-3xl font-bold">Interested in Live Learning?</h2>
						<p class="mb-8 text-lg text-white/70">
							Visit Skill Kenya to see our upcoming live sessions and join a cohort.
						</p>
						<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
							<a
								href="https://skillkenya.com"
								target="_blank"
								class="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 l hover:shadow-blue-500/30"
							>
								<BookOpen size={20} />
								<span>Visit Skill Kenya</span>
							</a>
							<a
								href="/donate"
								class="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
							>
								<span>Support Our Growth</span>
							</a>
						</div>
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
		color: #fff;
		text-decoration: none;
	}

	.prose a:hover {
		text-decoration: underline;
	}
</style>
