<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import { Plus, Edit, Trash2, X, DollarSign, Clock, Code } from 'lucide-svelte';

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
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-4xl font-bold text-white">Services</h1>
            <p class="text-white/60">Manage your service offerings</p>
        </div>
        <button
            on:click={openAddForm}
            class="px-6 py-3 bg-white text-[#252525] rounded-full font-bold flex items-center gap-2 hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg"
        >
            <Plus size="20" />
            <span>Add Service</span>
        </button>
    </div>

    {#if loading}
        <div class="flex justify-center items-center min-h-[60vh] py-12" in:fade>
            <div class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p class="text-white/50">Loading services...</p>
            </div>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each services as service, i}
                <div
                    class="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300"
                    in:fly={{ y: 20, duration: 500, delay: i * 50, easing: cubicInOut }}
                >
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-white">{service.name}</h3>
                        <button
                            on:click={() => toggleServiceStatus(service)}
                            class="px-3 py-1 text-xs font-semibold rounded-full border transition-all {service.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}"
                        >
                            {service.isActive ? 'Active' : 'Inactive'}
                        </button>
                    </div>

                    <!-- Description -->
                    <p class="text-white/60 text-sm mb-4 line-clamp-3 min-h-[60px]">{service.description}</p>

                    <!-- Details -->
                    <div class="space-y-2 mb-4">
                        {#if service.price}
                            <div class="flex items-center gap-2 text-emerald-400 font-medium">
                                <DollarSign size="16" />
                                <span>${service.price}</span>
                            </div>
                        {/if}
                        {#if service.duration}
                            <div class="flex items-center gap-2 text-white/60 text-sm">
                                <Clock size="16" />
                                <span>{service.duration}</span>
                            </div>
                        {/if}
                        <div class="flex items-center gap-2 text-white/60 text-sm">
                            <Code size="16" />
                            <span>{service._count?.requests || 0} requests</span>
                        </div>
                    </div>

                    <!-- Technologies -->
                    {#if service.technologies.length > 0}
                        <div class="flex flex-wrap gap-2 mb-4">
                            {#each service.technologies.slice(0, 3) as tech}
                                <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80">
                                    {tech}
                                </span>
                            {/each}
                            {#if service.technologies.length > 3}
                                <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                                    +{service.technologies.length - 3}
                                </span>
                            {/if}
                        </div>
                    {/if}

                    <!-- Actions -->
                    <div class="flex gap-2 pt-4 border-t border-white/10">
                        <button
                            on:click={() => openEditForm(service)}
                            class="flex-1 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Edit size="16" />
                            <span>Edit</span>
                        </button>
                        <button
                            on:click={() => deleteService(service)}
                            class="flex-1 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Trash2 size="16" />
                            <span>Delete</span>
                        </button>
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
        on:click={() => showAddForm = false}
        transition:fade={{ duration: 200 }}
    >
        <div
            class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            on:click|stopPropagation
            transition:fly={{ y: 20, duration: 300 }}
        >
            <!-- Modal Header -->
            <div class="sticky top-0 bg-[#252525]/80 backdrop-blur-lg border-b border-white/10 p-6 flex justify-between items-center">
                <h3 class="text-2xl font-bold text-white">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button
                    on:click={() => showAddForm = false}
                    class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size="24" class="text-white/60" />
                </button>
            </div>

            <!-- Modal Body -->
            <form on:submit|preventDefault={saveService} class="p-6 space-y-6">
                <div>
                    <label class="block text-sm font-semibold text-white/80 mb-2">Service Name</label>
                    <input
                        type="text"
                        bind:value={formData.name}
                        required
                        class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        placeholder="e.g., Web Development"
                    />
                </div>

                <div>
                    <label class="block text-sm font-semibold text-white/80 mb-2">Description</label>
                    <textarea
                        bind:value={formData.description}
                        required
                        rows="4"
                        class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none"
                        placeholder="Describe your service..."
                    ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Price (USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            bind:value={formData.price}
                            placeholder="Optional"
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-white/80 mb-2">Duration</label>
                        <input
                            type="text"
                            bind:value={formData.duration}
                            placeholder="e.g., 2-4 weeks"
                            class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        />
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
                        {#each formData.technologies as tech}
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

                <div class="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <span class="text-sm font-semibold text-white/80">Service is active</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" bind:checked={formData.isActive} class="sr-only peer" />
                        <div class="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>

                <!-- Modal Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        on:click={() => showAddForm = false}
                        class="px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-6 py-3 bg-white text-[#252525] rounded-xl font-bold hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
                    >
                        {editingService ? 'Update' : 'Create'} Service
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
