<script lang="ts">
    import { onMount } from 'svelte';
    
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
        formData = {
            title: project.title,
            description: project.description,
            image: project.image,
            projectUrl: project.projectUrl,
            githubUrl: project.githubUrl,
            tech: [...project.tech],
            year: project.year,
            category: project.category,
            features: [...project.features],
            status: project.status
        };
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
        formData.tech = formData.tech.filter(t => t !== tech);
    }

    function addFeature() {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            formData.features = [...formData.features, featureInput.trim()];
            featureInput = '';
        }
    }

    function removeFeature(feature: string) {
        formData.features = formData.features.filter(f => f !== feature);
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
                
                if (response.ok) {
                    await fetchProjects();
                }
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'LIVE': return 'bg-green-500';
            case 'DEVELOPMENT': return 'bg-yellow-500';
            case 'ARCHIVED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-white">Projects</h1>
            <p class="text-gray-400">Manage your portfolio projects</p>
        </div>
        <button 
            on:click={openAddForm}
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
            <i class="fas fa-plus mr-2"></i>Add Project
        </button>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each projects as project}
                <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <img src={project.image} alt={project.title} class="w-full h-48 object-cover" />
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-white font-semibold">{project.title}</h3>
                            <span class="px-2 py-1 rounded text-xs text-white {getStatusColor(project.status)}">
                                {project.status}
                            </span>
                        </div>
                        <p class="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                        <div class="flex flex-wrap gap-1 mb-3">
                            {#each project.tech.slice(0, 3) as tech}
                                <span class="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{tech}</span>
                            {/each}
                            {#if project.tech.length > 3}
                                <span class="text-gray-500 text-xs">+{project.tech.length - 3}</span>
                            {/if}
                        </div>
                        <div class="flex space-x-2">
                            <button 
                                on:click={() => openEditForm(project)}
                                class="flex-1 bg-yellow-600 text-white text-sm py-2 rounded hover:bg-yellow-700"
                            >
                                Edit
                            </button>
                            <button 
                                on:click={() => deleteProject(project)}
                                class="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700"
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

{#if showAddForm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-white">
                        {editingProject ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button 
                        on:click={() => showAddForm = false}
                        class="text-gray-400 hover:text-white"
                    >
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <form on:submit|preventDefault={saveProject} class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Title</label>
                            <input 
                                type="text" 
                                bind:value={formData.title}
                                required
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Category</label>
                            <input 
                                type="text" 
                                bind:value={formData.category}
                                required
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Description</label>
                        <textarea 
                            bind:value={formData.description}
                            required
                            rows="3"
                            class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Image URL</label>
                            <input 
                                type="url" 
                                bind:value={formData.image}
                                required
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Year</label>
                            <input 
                                type="text" 
                                bind:value={formData.year}
                                required
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Project URL</label>
                            <input 
                                type="url" 
                                bind:value={formData.projectUrl}
                                required
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">GitHub URL</label>
                            <input 
                                type="url" 
                                bind:value={formData.githubUrl}
                                required
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Status</label>
                        <select 
                            bind:value={formData.status}
                            class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                        >
                            <option value="DEVELOPMENT">Development</option>
                            <option value="LIVE">Live</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    <!-- Technologies -->
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Technologies</label>
                        <div class="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                bind:value={techInput}
                                on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                                placeholder="Add technology..."
                                class="flex-1 bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                            <button 
                                type="button"
                                on:click={addTech}
                                class="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            {#each formData.tech as tech}
                                <span class="bg-gray-700 text-white px-3 py-1 rounded flex items-center gap-2">
                                    {tech}
                                    <button 
                                        type="button"
                                        on:click={() => removeTech(tech)}
                                        class="text-red-400 hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </span>
                            {/each}
                        </div>
                    </div>

                    <!-- Features -->
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Features</label>
                        <div class="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                bind:value={featureInput}
                                on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                placeholder="Add feature..."
                                class="flex-1 bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                            <button 
                                type="button"
                                on:click={addFeature}
                                class="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            {#each formData.features as feature}
                                <span class="bg-gray-700 text-white px-3 py-1 rounded flex items-center gap-2">
                                    {feature}
                                    <button 
                                        type="button"
                                        on:click={() => removeFeature(feature)}
                                        class="text-red-400 hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </span>
                            {/each}
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-4">
                        <button 
                            type="button"
                            on:click={() => showAddForm = false}
                            class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {editingProject ? 'Update' : 'Create'} Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}