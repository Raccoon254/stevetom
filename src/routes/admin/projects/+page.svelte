<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import { Plus, Edit, Trash2, X, ExternalLink, Github } from 'lucide-svelte';

    let projects: any[] = [];
    let loading = true;
    let showAddForm = false;
    let editingProject: any = null;
    let formData = {
        title: '',
        description: '',
        image: '',
        projectUrl: '',
        githubUrl: '',
        tech: [],
        year: new Date().getFullYear().toString(),
        category: '',
        features: [],
        status: 'DEVELOPMENT',
        featured: false
    };

    let techInput = '';
    let featureInput = '';

    onMount(() => {
        fetchProjects();
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

    function openAddForm() {
        resetForm();
        showAddForm = true;
        editingProject = null;
    }

    function openEditForm(project: any) {
        formData = { ...project, tech: [...project.tech], features: [...project.features] };
        editingProject = project;
        showAddForm = true;
    }

    function resetForm() {
        formData = {
            title: '',
            description: '',
            image: '',
            projectUrl: '',
            githubUrl: '',
            tech: [],
            year: new Date().getFullYear().toString(),
            category: '',
            features: [],
            status: 'DEVELOPMENT',
            featured: false
        };
        techInput = '';
        featureInput = '';
    }

    function addTech() {
        if (techInput.trim() && !formData.tech.includes(techInput.trim())) {
            formData.tech = [...formData.tech, techInput.trim()];
            techInput = '';
        }
    }
    function removeTech(tech: string) {
        formData.tech = formData.tech.filter((t) => t !== tech);
    }
    function addFeature() {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            formData.features = [...formData.features, featureInput.trim()];
            featureInput = '';
        }
    }
    function removeFeature(feature: string) {
        formData.features = formData.features.filter((f) => f !== feature);
    }

    async function saveProject() {
        try {
            const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
            const method = editingProject ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showAddForm = false;
                await fetchProjects();
                resetForm();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error saving project');
        }
    }

    async function deleteProject(project: any) {
        if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
            try {
                const response = await fetch(`/api/projects/${project.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) await fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'LIVE':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'DEVELOPMENT':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'ARCHIVED':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            default:
                return 'bg-white/5 text-white/40 border-white/20';
        }
    }
</script>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-4xl font-bold text-white">Projects</h1>
            <p class="text-white/60">Manage your portfolio projects</p>
        </div>
        <button
            on:click={openAddForm}
            class="px-6 py-3 bg-white text-[#252525] rounded-full font-bold flex items-center gap-2 hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg"
        >
            <Plus size="20" />
            <span>Add Project</span>
        </button>
    </div>

    <!-- Loader -->
    {#if loading}
        <div class="flex justify-center items-center min-h-[60vh] py-12" in:fade>
            <div class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p class="text-white/50">Loading projects...</p>
            </div>
        </div>
    {:else}
        <!-- Projects grid -->
        <div class="space-y-6">
            {#each projects as project, i (project.id)}
                <div
                    class="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300"
                    in:fly={{ y: 20, duration: 500, delay: i * 50, easing: cubicInOut }}
                >
                    <div class="flex flex-col lg:flex-row">
                        <!-- Image -->
                        <div class="lg:w-2/5 h-64 lg:h-auto relative overflow-hidden {i % 2 === 0 ? 'lg:order-last' : ''}">
                            <img
                                src={project.image}
                                alt={project.title}
                                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-[#252525] via-transparent to-transparent opacity-60"></div>
                        </div>

                        <!-- Content -->
                        <div class="lg:w-3/5 p-6 lg:p-8 flex flex-col">
                            <!-- Header -->
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-2xl font-bold text-white">{project.title}</h3>
                                <div class="flex gap-2">
                                    {#if project.featured}
                                        <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                            Featured
                                        </span>
                                    {/if}
                                    <span class="px-3 py-1 text-xs font-semibold rounded-full border {getStatusColor(project.status)}">
                                        {project.status}
                                    </span>
                                </div>
                            </div>

                            <!-- Description -->
                            <p class="text-white/60 mb-4 flex-grow">{project.description}</p>

                            <!-- Tech Stack -->
                            <div class="flex flex-wrap gap-2 mb-6">
                                {#each project.tech as tech}
                                    <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80">
                                        {tech}
                                    </span>
                                {/each}
                            </div>

                            <!-- Actions -->
                            <div class="flex flex-wrap gap-3">
                                <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="px-4 py-2 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <ExternalLink size="16" />
                                    <span>View Live</span>
                                </a>
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="px-4 py-2 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <Github size="16" />
                                    <span>GitHub</span>
                                </a>
                                <div class="flex-1"></div>
                                <button
                                    on:click={() => openEditForm(project)}
                                    class="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <Edit size="16" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    on:click={() => deleteProject(project)}
                                    class="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <Trash2 size="16" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Modal -->
{#if showAddForm}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252525]/90 backdrop-blur-sm"
        on:click={() => (showAddForm = false)}
        transition:fade={{ duration: 200 }}
    >
        <div
            class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            on:click|stopPropagation
            transition:fly={{ y: 20, duration: 300 }}
        >
            <!-- Modal Header -->
            <div class="sticky top-0 bg-[#252525]/80 backdrop-blur-lg border-b border-white/10 p-6 flex justify-between items-center">
                <h3 class="text-2xl font-bold text-white">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
                <button
                    on:click={() => (showAddForm = false)}
                    class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size="24" class="text-white/60" />
                </button>
            </div>

            <!-- Modal Body -->
            <form on:submit|preventDefault={saveProject} class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Title</label>
                        <input
                            type="text"
                            bind:value={formData.title}
                            required
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                            placeholder="Project title"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Category</label>
                        <input
                            type="text"
                            bind:value={formData.category}
                            required
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                            placeholder="e.g., Web Application"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-white/80 mb-2">Description</label>
                    <textarea
                        bind:value={formData.description}
                        required
                        rows="3"
                        class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none"
                        placeholder="Project description"
                    ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Image URL</label>
                        <input
                            type="url"
                            bind:value={formData.image}
                            required
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Year</label>
                        <input
                            type="text"
                            bind:value={formData.year}
                            required
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                            placeholder="2024"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Project URL</label>
                        <input
                            type="url"
                            bind:value={formData.projectUrl}
                            required
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">GitHub URL</label>
                        <input
                            type="url"
                            bind:value={formData.githubUrl}
                            required
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                            placeholder="https://github.com/..."
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Status</label>
                        <select
                            bind:value={formData.status}
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        >
                            <option value="DEVELOPMENT">Development</option>
                            <option value="LIVE">Live</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>
                    <div class="flex items-center pt-8">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={formData.featured}
                                class="w-5 h-5 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/40"
                            />
                            <span class="text-sm font-semibold text-white/80">Featured Project</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-white/80 mb-2">Technologies</label>
                    <div class="flex gap-2 mb-3">
                        <input
                            type="text"
                            bind:value={techInput}
                            on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                            placeholder="Add technology..."
                            class="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        />
                        <button
                            type="button"
                            on:click={addTech}
                            class="px-6 py-3 bg-white text-[#252525] rounded-xl font-bold hover:bg-white/90 transition-all"
                        >
                            Add
                        </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each formData.tech as tech}
                            <span class="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white flex items-center gap-2">
                                {tech}
                                <button
                                    type="button"
                                    on:click={() => removeTech(tech)}
                                    class="text-red-400 hover:text-red-300 font-bold"
                                >
                                    ×
                                </button>
                            </span>
                        {/each}
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-white/80 mb-2">Features</label>
                    <div class="flex gap-2 mb-3">
                        <input
                            type="text"
                            bind:value={featureInput}
                            on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            placeholder="Add feature..."
                            class="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        />
                        <button
                            type="button"
                            on:click={addFeature}
                            class="px-6 py-3 bg-white text-[#252525] rounded-xl font-bold hover:bg-white/90 transition-all"
                        >
                            Add
                        </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each formData.features as feature}
                            <span class="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white flex items-center gap-2">
                                {feature}
                                <button
                                    type="button"
                                    on:click={() => removeFeature(feature)}
                                    class="text-red-400 hover:text-red-300 font-bold"
                                >
                                    ×
                                </button>
                            </span>
                        {/each}
                    </div>
                </div>

                <!-- Modal Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        on:click={() => (showAddForm = false)}
                        class="px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-6 py-3 bg-white text-[#252525] rounded-xl font-bold hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
                    >
                        {editingProject ? 'Update' : 'Create'} Project
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
