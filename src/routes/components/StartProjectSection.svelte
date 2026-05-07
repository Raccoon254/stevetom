<script lang="ts">
	import { ArrowRight, Sparkles, Code2, Palette, Zap, WandSparkles } from 'lucide-svelte'
</script>

<section class="py-20 md:py-32 relative overflow-hidden">
	<!-- Animated Background Circles -->
	<div
		class="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"
	></div>
	<div
		class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow-delay"
	></div>

	<div class="max-w-7xl mx-auto md:px-6 relative z-10">
		<div
			class="bg-black/5 rounded-3xl overflow-hidden md:border border-white/10 relative group"
		>
			<!-- Background Pattern -->
			<div class="absolute inset-0 opacity-5">
				<div
					class="w-full h-full"
					style="background-image: repeating-linear-gradient(
						45deg,
						transparent,
						transparent 35px,
						rgba(255, 255, 255, 0.1) 35px,
						rgba(255, 255, 255, 0.1) 36px
					);"
				></div>
			</div>

			<div class="relative z-10 p-8 md:p-16 lg:p-24">
				<!-- Badge -->
				<div class="flex mb-8">
					<div
						class="inline-flex md:items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm text-white border border-white/20 hover:border-white/40 transition-colors duration-300"
					>
						<WandSparkles size="16" class="animate-pulse" />
						<span class="text-sm font-bold uppercase tracking-widest">Let's Create Together</span>
					</div>
				</div>

				<!-- Title -->
				<h2 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight ">
					Ready to Start Your
					<br />
					<span class="highlight-gradient">Next Project?</span>
				</h2>

				<!-- Description -->
				<p class="text-lg md:text-xl text-white/70 mb-12 leading-relaxed md:">
					Whether you need a stunning website, a powerful web app, or captivating animations,
					I'm here to bring your ideas to life with clean code and creative design.
				</p>

				<!-- Feature Pills -->
				<div class="flex flex-wrap gap-4 mb-12">
					<div
						class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
					>
						<Code2 size="16" />
						<span class="text-sm font-medium">Clean Code</span>
					</div>
					<div
						class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
					>
						<Palette size="16" />
						<span class="text-sm font-medium">Creative Design</span>
					</div>
					<div
						class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
					>
						<Zap size="16" />
						<span class="text-sm font-medium">Fast Delivery</span>
					</div>
				</div>

				<!-- CTA Buttons -->
				<div class="flex flex-col w-full sm:flex-row gap-4 ">
					<a
						href="/quote"
						class="group bg-white text-[#252525] px-8 w-fit py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 hover:shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)] transition-all duration-300"
					>
						<span>Start a Project</span>
						<ArrowRight size="20" class="transition-transform duration-300 group-hover:translate-x-1" />
					</a>
					<a
						href="/contact"
						class="group bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 w-fit py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
					>
						<span>Get in Touch</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.glass-card {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(20px);
	}

	.highlight-gradient {
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
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
		height: 3px;
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
</style>
