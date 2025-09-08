<script lang="ts">
    import { onMount } from 'svelte';
    
    let services: any[] = [];
    let loading = true;
    let showAddForm = false;
    let editingService: any = null;
    let formData = {
        name: '',
        description: '',
        price: '',
        duration: '',
        technologies: [],
        isActive: true
    };
    
    let techInput = '';

    onMount(() => {
        fetchServices();
    });

    async function fetchServices() {
        try {
            const response = await fetch('/api/services');
            const data = await response.json();
            if (data.success) {
                services = data.data;
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            loading = false;
        }
    }

    function openAddForm() {
        resetForm();
        showAddForm = true;
        editingService = null;
    }

    function openEditForm(service: any) {
        formData = {
            name: service.name,
            description: service.description,
            price: service.price?.toString() || '',
            duration: service.duration || '',
            technologies: [...service.technologies],
            isActive: service.isActive
        };
        editingService = service;
        showAddForm = true;
    }

    function resetForm() {
        formData = {
            name: '',
            description: '',
            price: '',
            duration: '',
            technologies: [],
            isActive: true
        };
        techInput = '';
    }

    function addTech() {
        if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
            formData.technologies = [...formData.technologies, techInput.trim()];
            techInput = '';
        }
    }

    function removeTech(tech: string) {
        formData.technologies = formData.technologies.filter(t => t !== tech);
    }

    async function saveService() {
        try {
            const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
            const method = editingService ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                showAddForm = false;
                await fetchServices();
                resetForm();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Error saving service');
        }
    }

    async function deleteService(service: any) {
        if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
            try {
                const response = await fetch(`/api/services/${service.id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    await fetchServices();
                }
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        }
    }

    async function toggleServiceStatus(service: any) {
        try {
            const response = await fetch(`/api/services/${service.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...service,
                    isActive: !service.isActive
                })
            });

            if (response.ok) {
                await fetchServices();
            }
        } catch (error) {
            console.error('Error toggling service status:', error);
        }
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-white">Services</h1>
            <p class="text-gray-400">Manage your service offerings</p>
        </div>
        <button 
            on:click={openAddForm}
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
            <i class="fas fa-plus mr-2"></i>Add Service
        </button>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each services as service}
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-white font-semibold text-lg">{service.name}</h3>
                        <div class="flex items-center space-x-2">
                            <button 
                                on:click={() => toggleServiceStatus(service)}
                                class="text-sm px-2 py-1 rounded {service.isActive ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}"
                            >
                                {service.isActive ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                    </div>
                    
                    <p class="text-gray-400 text-sm mb-4 line-clamp-3">{service.description}</p>
                    
                    <div class="space-y-2 mb-4">
                        {#if service.price}
                            <div class="text-green-400 font-medium">${service.price}</div>
                        {/if}
                        {#if service.duration}
                            <div class="text-gray-300 text-sm">Duration: {service.duration}</div>
                        {/if}
                        <div class="text-gray-300 text-sm">Requests: {service._count?.requests || 0}</div>
                    </div>
                    
                    {#if service.technologies.length > 0}
                        <div class="flex flex-wrap gap-1 mb-4">
                            {#each service.technologies.slice(0, 3) as tech}
                                <span class="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{tech}</span>
                            {/each}
                            {#if service.technologies.length > 3}
                                <span class="text-gray-500 text-xs">+{service.technologies.length - 3}</span>
                            {/if}
                        </div>
                    {/if}
                    
                    <div class="flex space-x-2">
                        <button 
                            on:click={() => openEditForm(service)}
                            class="flex-1 bg-yellow-600 text-white text-sm py-2 rounded hover:bg-yellow-700"
                        >
                            Edit
                        </button>
                        <button 
                            on:click={() => deleteService(service)}
                            class="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

{#if showAddForm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-white">
                        {editingService ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <button 
                        on:click={() => showAddForm = false}
                        class="text-gray-400 hover:text-white"
                    >
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <form on:submit|preventDefault={saveService} class="space-y-4">
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Service Name</label>
                        <input 
                            type="text" 
                            bind:value={formData.name}
                            required
                            class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Description</label>
                        <textarea 
                            bind:value={formData.description}
                            required
                            rows="4"
                            class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Price (USD)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                bind:value={formData.price}
                                placeholder="Optional"
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Duration</label>
                            <input 
                                type="text" 
                                bind:value={formData.duration}
                                placeholder="e.g., 2-4 weeks"
                                class="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
                            />
                        </div>
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
                            {#each formData.technologies as tech}
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

                    <div class="flex items-center">
                        <input 
                            type="checkbox" 
                            id="isActive"
                            bind:checked={formData.isActive}
                            class="mr-2"
                        />
                        <label for="isActive" class="text-gray-300 text-sm">Service is active</label>
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
                            {editingService ? 'Update' : 'Create'} Service
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}