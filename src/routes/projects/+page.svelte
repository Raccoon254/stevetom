<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import Cursor from "../components/Cursor.svelte";
    import { ExternalLink, Github, Calendar, Sparkles, Star } from 'lucide-svelte';

    type Project = {
        id: string
        title: string
        description: string
        image: string
        projectUrl: string
        githubUrl: string
        tech: string[]
        year: string
        category: string
        features: string[]
        status: 'LIVE' | 'DEVELOPMENT' | 'ARCHIVED'
    }

    let projects: Project[] = [];
    let loading = true;

    onMount(async () => {
        await fetchProjects();
    });

    async function fetchProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            if (data.success) {
                projects = data.data;
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            loading = false;
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'LIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'DEVELOPMENT': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'ARCHIVED': return 'bg-white/5 text-white/40 border-white/20';
            default: return 'bg-white/5 text-white/40 border-white/20';
        }
    }

    function getTechName(name: string) {
        if (name === "Tailwind") return 'tailwindcss';
        if (name === "HTML") return 'html5';
        if (name === "Material Design") return 'materialui';
        return name.toLowerCase().replace(/\s+/g, '');
    }
</script>

<svelte:head>
    <title>Projects | Portfolio</title>
    <meta name="description" content="Explore my portfolio of projects." />
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
	/>
</svelte:head>

<Cursor />

<div class="bg-[#252525]/10 min-h-screen relative overflow-x-hidden">
    <main class="hero-section mx-auto min-h-screen pb-20">
        <!-- Background decoration -->
        <div
            class="hidden lg:block absolute rotate-[65deg] top-20 -left-20 opacity-10"
            style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
        ></div>

        <div class="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <!-- Header -->
            <div class="text-center mb-16" in:fly={{ y: 30, duration: 800, easing: cubicInOut }}>
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-white/80 mb-6">
                    <Star size="16" class="animate-pulse" />
                    <span class="text-sm font-semibold uppercase tracking-wider">Portfolio</span>
                </div>
                <h1 class="text-5xl md:text-7xl font-bold mb-6 text-white">
                    Featured <span class="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.8)]">Projects</span>
                </h1>
                <p class="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                    A showcase of innovative solutions, creative designs, and powerful applications
                </p>
            </div>

            {#if loading}
                <div class="flex flex-col items-center justify-center py-20" in:fade>
                    <div class="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                    <p class="mt-6 text-white/50 text-lg">Loading amazing projects...</p>
                </div>
            {:else if projects.length === 0}
                <div class="text-center py-20" in:fade>
                    <p class="text-white/50 text-xl">No projects found</p>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {#each projects as project, index (project.id)}
                        <article
                            class="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5"
                            in:fly={{
                                y: 50,
                                duration: 600,
                                delay: index * 100,
                                easing: cubicInOut
                            }}
                        >
                            <!-- Image Container -->
                            <div class="relative overflow-hidden aspect-video">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />

                                <!-- Gradient Overlay -->
                                <div class="absolute inset-0 bg-gradient-to-t from-[#252525] via-[#252525]/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                                <!-- Action Buttons Overlay -->
                                <div class="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <a
                                        href={project.projectUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="px-6 py-3 bg-white text-[#252525] rounded-full flex items-center gap-2 font-bold hover:bg-white/90 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        <ExternalLink size="18" />
                                        <span>View Live</span>
                                    </a>
                                    {#if project.githubUrl !== '#'}
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="p-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/20 hover:border-white/50 transition-all transform translate-y-4 group-hover:translate-y-0 delay-75 shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            <Github size="20" />
                                        </a>
                                    {/if}
                                </div>

                                <!-- Status Badge -->
                                <div class="absolute top-4 left-4 flex items-center gap-2">
                                    <span class="px-3 py-1.5 text-xs font-bold rounded-full border backdrop-blur-md {getStatusColor(project.status)} uppercase tracking-wider">
                                        {project.status}
                                    </span>
                                </div>

                                <!-- Year Badge -->
                                <div class="absolute top-4 right-4">
                                    <span class="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#252525]/80 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5">
                                        <Calendar size="12" />
                                        {project.year}
                                    </span>
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="p-6">
                                <h2 class="text-2xl font-bold mb-3 text-white group-hover:text-white/90 transition-colors">
                                    {project.title}
                                </h2>
                                <p class="text-white/60 text-sm mb-4 line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>

                                <!-- Category -->
                                {#if project.category}
                                    <div class="mb-4">
                                        <span class="text-xs font-medium text-white/40 uppercase tracking-widest">
                                            {project.category}
                                        </span>
                                    </div>
                                {/if}

                                <!-- Tech Stack -->
                                <div class="flex flex-wrap gap-2">
                                    {#each project.tech.slice(0, 5) as tech}
                                        <div class="group/tech relative">
                                            <div class="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                                                <i class={`devicon-${getTechName(tech)}-plain colored text-base`}></i>
                                            </div>
                                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#252525] border border-white/20 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover/tech:opacity-100 transition-opacity pointer-events-none">
                                                {tech}
                                            </div>
                                        </div>
                                    {/each}
                                    {#if project.tech.length > 5}
                                        <div class="flex items-center px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 font-medium">
                                            +{project.tech.length - 5}
                                        </div>
                                    {/if}
                                </div>
                            </div>

                            <!-- Bottom Gradient Border -->
                            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </article>
                    {/each}
                </div>
            {/if}
        </div>
    </main>
</div>
