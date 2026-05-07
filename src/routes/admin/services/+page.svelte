<script lang="ts">
    import { onMount } from 'svelte';
    import { Plus } from 'lucide-svelte';
    
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
            <h1 class="text-3xl font-bold">Services</h1>
            <p>Manage your service offerings</p>
        </div>
        <button 
            on:click={openAddForm}
            class="btn btn-primary"
        >
            <Plus size="16" class="mr-2" />Add Service
        </button>
    </div>

    {#if loading}
        <div class="flex justify-center items-center min-h-[80vh] py-12">
            <div class="animate-spin rounded-full h-12 w-12 loading loading-ring"></div>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each services as service}
                <div class="card bg-base-200/10 border border-gray-900 shadow-xl">
                    <div class="card-body">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="card-title">{service.name}</h3>
                            <div class="flex items-center space-x-2">
                                <button 
                                    on:click={() => toggleServiceStatus(service)}
                                    class={`badge ${service.isActive ? 'badge-success' : 'badge-error'}`}
                                >
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                        </div>
                        
                        <p class="text-sm mb-4 line-clamp-3">{service.description}</p>
                        
                        <div class="space-y-2 mb-4">
                            {#if service.price}
                                <div class="text-green-400 font-medium">${service.price}</div>
                            {/if}
                            {#if service.duration}
                                <div class="text-sm">Duration: {service.duration}</div>
                            {/if}
                            <div class="text-sm">Requests: {service._count?.requests || 0}</div>
                        </div>
                        
                        {#if service.technologies.length > 0}
                            <div class="card-actions justify-start">
                                {#each service.technologies.slice(0, 3) as tech}
                                    <div class="badge badge-outline">{tech}</div>
                                {/each}
                                {#if service.technologies.length > 3}
                                    <div class="badge badge-outline">+{service.technologies.length - 3}</div>
                                {/if}
                            </div>
                        {/if}
                        
                        <div class="card-actions justify-end">
                            <button 
                                on:click={() => openEditForm(service)}
                                class="btn btn-warning btn-sm"
                            >
                                Edit
                            </button>
                            <button 
                                on:click={() => deleteService(service)}
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

{#if showAddForm}
    <dialog class="modal bg-base-950 border border-gray-900  modal-open">
        <div class="modal-box bg-base-950 w-11/12 max-w-5xl">
            <h3 class="font-bold text-lg">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            
            <form on:submit|preventDefault={saveService} class="space-y-4 mt-4">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Service Name</span>
                    </label>
                    <input 
                        type="text" 
                        bind:value={formData.name}
                        required
                        class="input input-bordered"
                    />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Description</span>
                    </label>
                    <textarea 
                        bind:value={formData.description}
                        required
                        rows="4"
                        class="textarea textarea-bordered"
                    ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Price (USD)</span>
                        </label>
                        <input 
                            type="number" 
                            step="0.01"
                            bind:value={formData.price}
                            placeholder="Optional"
                            class="input input-bordered"
                        />
                    </div>
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Duration</span>
                        </label>
                        <input 
                            type="text" 
                            bind:value={formData.duration}
                            placeholder="e.g., 2-4 weeks"
                            class="input input-bordered"
                        />
                    </div>
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
                        <button 
                            type="button"
                            on:click={addTech}
                            class="btn btn-primary"
                        >
                            Add
                        </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each formData.technologies as tech}
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
                    <label class="cursor-pointer label">
                        <span class="label-text">Service is active</span> 
                        <input type="checkbox" bind:checked={formData.isActive} class="toggle toggle-primary" />
                    </label>
                </div>

                <div class="modal-action">
                    <button 
                        type="button"
                        on:click={() => showAddForm = false}
                        class="btn"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        class="btn btn-primary"
                    >
                        {editingService ? 'Update' : 'Create'} Service
                    </button>
                </div>
            </form>
        </div>
    </dialog>
{/if}
