<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, scale, fly } from 'svelte/transition';
    import { Plus } from 'lucide-svelte';

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
        status: 'DEVELOPMENT'
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
            status: 'DEVELOPMENT'
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
                return 'badge-success';
            case 'DEVELOPMENT':
                return 'badge-warning';
            case 'ARCHIVED':
                return 'badge-error';
            default:
                return 'badge-ghost';
        }
    }
</script>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold">Projects</h1>
            <p>Manage your portfolio projects</p>
        </div>
        <button
                on:click={openAddForm}
                class="btn btn-primary"
        >
            <Plus size="16" class="mr-2" />Add Project
        </button>
    </div>

    <!-- Loader -->
    {#if loading}
        <div class="flex justify-center items-center min-h-[80vh] py-12">
            <div class="animate-spin rounded-full h-12 w-12 loading loading-ring"></div>
        </div>
    {:else}
        <!-- Projects grid -->
        <div class="space-y-12">
            {#each projects as project, i (project.id)}
                <div class="card lg:card-side bg-base-200/10 border-2 border-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                    <figure class="lg:w-1/2 {i % 2 === 0 ? 'lg:order-last' : ''}"><img src={project.image} alt={project.title} class="w-full h-full object-cover" /></figure>
                    <div class="card-body lg:w-1/2">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="card-title text-2xl">{project.title}</h3>
                            <div class={`badge ${getStatusColor(project.status)}`}>{project.status}</div>
                        </div>
                        <p class="text-sm mb-3">{project.description}</p>
                        <div class="card-actions justify-start">
                            {#each project.tech as tech}
                                <div class="badge badge-outline">{tech}</div>
                            {/each}
                        </div>
                        <div class="card-actions justify-end">
                            <button
                                    on:click={() => openEditForm(project)}
                                    class="btn btn-warning btn-sm"
                            >
                                Edit
                            </button>
                            <button
                                    on:click={() => deleteProject(project)}
                                    class="btn btn-error btn-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Modal -->
{#if showAddForm}
    <dialog class="modal modal-open">
        <div class="modal-box w-11/12 max-w-5xl">
            <h3 class="font-bold text-lg">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
            
            <form on:submit|preventDefault={saveProject} class="space-y-4 mt-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Title</span>
                        </label>
                        <input type="text" bind:value={formData.title} required class="input input-bordered" />
                    </div>
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Category</span>
                        </label>
                        <input type="text" bind:value={formData.category} required class="input input-bordered" />
                    </div>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Description</span>
                    </label>
                    <textarea bind:value={formData.description} required rows="3" class="textarea textarea-bordered"></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Image URL</span>
                        </label>
                        <input type="url" bind:value={formData.image} required class="input input-bordered" />
                    </div>
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Year</span>
                        </label>
                        <input type="text" bind:value={formData.year} required class="input input-bordered" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Project URL</span>
                        </label>
                        <input type="url" bind:value={formData.projectUrl} required class="input input-bordered" />
                    </div>
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">GitHub URL</span>
                        </label>
                        <input type="url" bind:value={formData.githubUrl} required class="input input-bordered" />
                    </div>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Status</span>
                    </label>
                    <select bind:value={formData.status} class="select select-bordered">
                        <option value="DEVELOPMENT">Development</option>
                        <option value="LIVE">Live</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Technologies</span>
                    </label>
                    <div class="flex gap-2 mb-2">
                        <input
                                type="text"
                                bind:value={techInput}
                                on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                                placeholder="Add technology..."
                                class="input input-bordered flex-1"
                        />
                        <button type="button" on:click={addTech} class="btn btn-primary">Add</button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each formData.tech as tech}
                            <div class="badge badge-outline gap-2">
                                {tech}
                                <button
                                        type="button"
                                        on:click={() => removeTech(tech)}
                                        class="text-red-400 hover:text-red-300"
                                >
                                    ×
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Features</span>
                    </label>
                    <div class="flex gap-2 mb-2">
                        <input
                                type="text"
                                bind:value={featureInput}
                                on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                placeholder="Add feature..."
                                class="input input-bordered flex-1"
                        />
                        <button type="button" on:click={addFeature} class="btn btn-primary">Add</button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each formData.features as feature}
                            <div class="badge badge-outline gap-2">
                                {feature}
                                <button
                                        type="button"
                                        on:click={() => removeFeature(feature)}
                                        class="text-red-400 hover:text-red-300"
                                >
                                    ×
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="modal-action">
                    <button
                            type="button"
                            on:click={() => (showAddForm = false)}
                            class="btn"
                    >
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        {editingProject ? 'Update' : 'Create'} Project
                    </button>
                </div>
            </form>
        </div>
    </dialog>
{/if}
