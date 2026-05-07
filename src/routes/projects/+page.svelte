<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import Cursor from "../components/Cursor.svelte";
    import { ExternalLink, Github } from 'lucide-svelte';

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
            case 'LIVE': return 'bg-secondary/20 text-secondary border-secondary/30';
            case 'DEVELOPMENT': return 'bg-accent/20 text-accent border-accent/30';
            case 'ARCHIVED': return 'bg-base-content/20 text-base-content/60 border-base-content/30';
            default: return 'bg-base-content/20 text-base-content/60 border-base-content/30';
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
</svelte:head>

<Cursor />

<main class="min-h-screen bg-base-100 text-base-content">
    <div class="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div class="text-center mb-16" in:fly={{ y: 30, duration: 800, easing: cubicInOut }}>
            <h1 class="text-4xl md:text-6xl font-bold mb-4">
                <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Projects</span>
            </h1>
            <p class="text-lg text-base-content/70 max-w-2xl mx-auto">
                A collection of my work showcasing web development, design, and creative solutions
            </p>
        </div>

        {#if loading}
            <div class="flex flex-col items-center justify-center py-20" in:fade>
                <div class="w-12 h-12 border-4 border-base-300 border-t-primary rounded-full animate-spin"></div>
                <p class="mt-4 text-base-content/60">Loading projects...</p>
            </div>
        {:else if projects.length === 0}
            <div class="text-center py-20" in:fade>
                <p class="text-base-content/60 text-lg">No projects found</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each projects as project, index (project.id)}
                    <article
                        class="group bg-base-200/50 border border-base-300 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10"
                        in:fly={{
                            y: 50,
                            duration: 500,
                            delay: index * 100,
                            easing: cubicInOut
                        }}
                    >
                        <div class="relative overflow-hidden">
                            <img
                                src={project.image}
                                alt={project.title}
                                class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                >
                                    <ExternalLink size="16" />
                                    <span>View</span>
                                </a>
                                {#if project.githubUrl !== '#'}
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="px-4 py-2 bg-base-100 border border-base-300 rounded-lg flex items-center gap-2 hover:border-primary transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                                    >
                                        <Github size="16" />
                                        <span>Code</span>
                                    </a>
                                {/if}
                            </div>
                            <div class="absolute top-3 left-3 right-3 flex justify-between items-start">
                                <span class="px-3 py-1 text-xs font-medium rounded-full border {getStatusColor(project.status)}">
                                    {project.status}
                                </span>
                                <span class="px-3 py-1 text-xs font-medium rounded-full bg-base-100/80 backdrop-blur-sm border border-base-300">
                                    {project.year}
                                </span>
                            </div>
                        </div>

                        <div class="p-6">
                            <h2 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {project.title}
                            </h2>
                            <p class="text-base-content/70 text-sm mb-4 line-clamp-2">
                                {project.description}
                            </p>

                            <div class="flex flex-wrap gap-2 mb-4">
                                {#each project.tech.slice(0, 4) as tech}
                                    <div class="flex items-center gap-2 px-3 py-1 bg-base-100 border border-base-300 rounded-lg text-xs hover:border-primary/50 transition-colors">
                                        <i class={`devicon-${getTechName(tech)}-plain text-sm`}></i>
                                        <span class="hidden sm:inline">{tech}</span>
                                    </div>
                                {/each}
                                {#if project.tech.length > 4}
                                    <div class="px-3 py-1 bg-base-100 border border-base-300 rounded-lg text-xs text-base-content/60">
                                        +{project.tech.length - 4}
                                    </div>
                                {/if}
                            </div>

                            {#if project.category}
                                <div class="text-xs text-base-content/50 font-medium">
                                    {project.category}
                                </div>
                            {/if}
                        </div>
                    </article>
                {/each}
            </div>
        {/if}
    </div>
</main>