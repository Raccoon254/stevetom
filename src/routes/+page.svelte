<script lang="ts">
    import {onMount} from 'svelte'
    import Projects from './components/Projects.svelte'
    import ContactQuote from "./components/ContactQuote.svelte";
    import Cursor from './components/Cursor.svelte';
    import InteractiveSphere from './components/InteractiveSphere.svelte'
    import MusicWave from './components/MusicWave.svelte'
    import {Repeat, Rotate3D} from 'lucide-svelte';

    let showSphere = true;

    function toggleVisualization() {
        showSphere = !showSphere;
    }

    interface Skill {
        name: string
    }

    let skills: Skill[] = [
        {name: 'javascript'},
        {name: 'python'},
        {name: 'react'},
        {name: 'nodejs'},
        {name: 'java'},
        {name: 'php'},
        {name: 'css3'},
        {name: 'html5'},
        {name: 'git'},
        {name: 'mongodb'},
        {name: 'postgresql'},
        {name: 'nextjs'},
        {name: 'docker'},
        {name: 'linux'},
        {name: 'typescript'},
        {name: 'svelte'},
        {name: 'rust'},
        {name: 'kotlin'},
        {name: 'android'},
        {name: 'firebase'},
        {name: 'azure'},
        {name: 'heroku'},
        {name: 'netlify'},
        {name: 'vercel'},
        {name: 'nginx'},
        {name: 'apache'},
        {name: 'spring'},
        {name: 'laravel'},
        {name: 'wordpress'},
        {name: 'bootstrap'},
        {name: 'tailwindcss'},
        {name: 'vuetify'},
        {name: 'nuxtjs'},
    ]

    skills = [...skills, ...skills]

    let scrollBar: HTMLElement

    onMount(() => {
        scrollBar.addEventListener('mouseenter', () => {
            scrollBar.style.animationPlayState = 'paused'
        })
        scrollBar.addEventListener('mouseleave', () => {
            scrollBar.style.animationPlayState = 'running'
        })
    })
</script>

<main class="min-h-screen bg-base-100 text-base-content">
    <Cursor/>

    <!-- Hero Section -->
    <div class="min-h-screen flex flex-col justify-center items-center px-4">
        <div class="max-w-6xl w-full flex flex-col md:flex-row gap-2 items-center justify-between mb-12">
            <!-- Text Content -->
            <div class="w-full md:w-1/2 md:mt-0 space-y-6">
                <div class="flex gap-2 items-center">
                    <img src="/logo-light.png" alt="Steve Tom" class="w-10 interactive h-10 object-cover"/>
                    <h1 class="text-3xl text-interactive font-bold">kenTom</h1>
                    <span class="text-xs opacity-50 font-thin">v2.1.5</span>
                </div>

                <p class="text-xl font-light text-base-content/80">
                    I am an indie developer with a passion for programming and technology. I am skilled in
                    Java, Rust, JavaScript and many other programming languages.
                </p>

                <div class="flex gap-4">
                    <a
                        href="#contact"
                        class="text-interactive flex items-center justify-center gap-2 rounded-full ring-1 ring-offset-2 border border-base-300 ring-gray-500/10 px-4 md:px-6 dark:ring-offset-base-100 py-1 md:py-2 hover:bg-gray-100 transition-all duration-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white hover:ring-gray-500/20 dark:hover:ring-gray-400/20"
                    >
                        <i class="fas fa-paper-plane"></i>
                        Hire Me
                    </a>
                    <a
                        href="https://github.com/Raccoon254"
                        target="_blank"
                        rel="noopener"
                        class="text-interactive bg-emerald-900 dark:bg-purple-900 text-white flex items-center justify-center gap-2 rounded-full ring-1 ring-offset-2 border border-base-300 ring-gray-500/10 px-4 md:px-6 py-2 hover:bg-emerald-800 dark:hover:bg-purple-800 transition-all duration-200 hover:ring-gray-500/20 dark:hover:ring-gray-100/80 dark:ring-offset-base-100"
                    >
                        <i class="devicon-github-original"></i>
                        GitHub
                    </a>
                </div>
            </div>

            <!-- Logo Image -->
            <div class="w-96 h-96 hidden md:w-[30rem] md:h-[30rem] relative md:flex items-center justify-center">
                <button
                    on:click={toggleVisualization}
                    class="absolute bottom-4 right-4 border border-gray-700/20 z-10 btn btn-circle btn-sm btn-ghost"
                    aria-label="Toggle visualization"
                >
                    <Rotate3D size="16" />
                </button>

                {#if showSphere}
                    <InteractiveSphere/>
                {:else}
                    <MusicWave/>
                {/if}
            </div>
        </div>

        <!-- Skills Scroll -->
        <div class="w-full overflow-hidden mt-16 md:mt-32">
            <div class="flex animate-scroll py-3" bind:this={scrollBar}>
                {#each skills as skill}
                    <div class="flex-shrink-0 ring-gray-900/5 dark:ring-gray-100/5 ring-1 ring-offset-2 text-interactive aspect-square mx-3 flex items-center justify-center px-3 border border-base-300 dark:border-white/10 dark:ring-offset-base-100 rounded-lg hover:scale-105 transition-transform cursor-pointer">
                        <i class={'devicon-' + skill.name + '-plain text-2xl'}></i>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- Projects Section -->
    <div class="mb-32">
        <Projects/>
    </div>

    <!-- Contact Section -->
    <div id="contact">
        <ContactQuote/>
    </div>
</main>

<style>
    @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }

    .animate-scroll {
        animation: scroll 40s linear infinite;
    }

    .animate-scroll:hover {
        animation-play-state: paused;
    }
</style>