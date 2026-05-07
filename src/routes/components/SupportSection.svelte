<script lang="ts">
  import { Heart, Coffee, Code2, BookOpen, Rocket, Sparkles, Star } from 'lucide-svelte';
</script>

<section class="relative overflow-hidden py-20 md:py-32">
  <!-- Animated Background Circles -->
  <div
    class="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-[#ff6b35]/10 blur-[100px]"
  ></div>
  <div
    class="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse-slow-delay rounded-full bg-[#ff8c5a]/10 blur-[100px]"
  ></div>

  <div class="relative z-10 mx-auto max-w-7xl md:px-6">
    <div class="group relative overflow-hidden rounded-3xl bg-black/5 md:border md:border-white/10">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div
          class="h-full w-full"
          style="background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(255, 107, 53, 0.2) 35px,
            rgba(255, 107, 53, 0.2) 36px
          );"
        ></div>
      </div>

      <div class="relative z-10 p-8 md:p-16 lg:p-24">
        <!-- Badge -->
        <div class="mb-8 flex">
          <div
            class="inline-flex gap-2 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-5 py-2.5 text-white backdrop-blur-sm transition-colors duration-300 hover:border-[#ff6b35]/50 md:items-center"
          >
            <Heart size="16" class="animate-pulse text-[#ff6b35]" />
            <span class="text-sm font-bold uppercase tracking-widest">Support My Work</span>
          </div>
        </div>

        <!-- Title -->
        <h2 class="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          Love What I Do?
          <br />
          <span class="highlight-gradient">Help Keep It Going!</span>
        </h2>

        <!-- Description -->
        <p class="mb-12 text-lg leading-relaxed text-white/70 md:text-xl">
          Your support enables me to dedicate more time to building amazing projects, creating
          educational content, and contributing to the open-source community.
        </p>

        <!-- Feature Pills -->
        <div class="mb-12 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div
            class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-2 md:pr-4 px-4 py-2 text-white/80 transition-all duration-300 hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/10"
          >
            <Code2 size="16" />
            <span class="text-[13px] md:text-sm font-medium">Open Source Projects</span>
          </div>
          <div
            class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-2 md:pr-4 px-4 py-2 text-white/80 transition-all duration-300 hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/10"
          >
            <BookOpen size="16" />
            <span class="text-[13px] md:text-sm font-medium">Educational Content</span>
          </div>
          <div
            class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-2 md:pr-4 px-4 py-2 text-white/80 transition-all duration-300 hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/10"
          >
            <Rocket size="16" />
            <span class="text-[13px] md:text-sm font-medium">Innovation & Tools</span>
          </div>
          <div
            class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-2 md:pr-4 px-4 py-2 text-white/80 transition-all duration-300 hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/10"
          >
            <Coffee size="16" />
            <span class="text-[13px] md:text-sm font-medium">Fuel for Late Nights</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex w-full flex-col gap-4 sm:flex-row">
          <a
            href="/donate"
            class="group flex w-fit items-center gap-3 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105"
          >
            <Heart size="20" class="transition-transform duration-300 group-hover:scale-110" />
            <span>Make a Donation</span>
            <Star
              size="20"
              class="transition-transform duration-300 group-hover:rotate-12"
            />
          </a>
          <a
            href="/projects"
            class="group flex w-fit items-center gap-3 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20"
          >
            <span>View My Work</span>
          </a>
        </div>

        <!-- Small Thank You Note -->
        <p class="mt-8 text-sm text-white/50">
          Every contribution, no matter the size, makes a huge difference. Thank you for believing
          in what I do! 🙏
        </p>
      </div>
    </div>
  </div>
</section>

<style>
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
    height: 3px;
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
</style>
