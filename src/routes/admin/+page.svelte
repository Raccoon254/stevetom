<script lang="ts">
    import { onMount } from 'svelte';
    
    let stats = {
        projects: 0,
        services: 0,
        serviceRequests: 0,
        pendingRequests: 0
    };
    let loading = true;
    let recentRequests: any[] = [];

    onMount(async () => {
        try {
            // Fetch overview stats
            const [projectsRes, servicesRes, requestsRes] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/services'),
                fetch('/api/service-requests')
            ]);

            const [projects, services, requests] = await Promise.all([
                projectsRes.json(),
                servicesRes.json(),
                requestsRes.json()
            ]);

            stats.projects = projects.count || 0;
            stats.services = services.count || 0;
            stats.serviceRequests = requests.count || 0;
            stats.pendingRequests = requests.data?.filter((r: any) => r.status === 'PENDING').length || 0;
            
            // Get recent 5 requests
            recentRequests = requests.data?.slice(0, 5) || [];
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            loading = false;
        }
    });

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString();
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'PENDING': return 'text-yellow-400';
            case 'IN_PROGRESS': return 'text-blue-400';
            case 'COMPLETED': return 'text-green-400';
            case 'REJECTED': return 'text-red-400';
            default: return 'text-gray-400';
        }
    }
</script>

<div class="space-y-8">
    <!-- Header Section -->
    <div>
        <h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p class="text-gray-400">Overview of your portfolio and business</p>
    </div>

    {#if loading}
        <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p class="text-gray-400 ml-3">Loading...</p>
        </div>
    {:else}
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="stat-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm">Total Projects</p>
                        <p class="text-2xl font-semibold text-white">{stats.projects}</p>
                    </div>
                    <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-folder text-white"></i>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm">Active Services</p>
                        <p class="text-2xl font-semibold text-white">{stats.services}</p>
                    </div>
                    <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-cogs text-white"></i>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm">Total Requests</p>
                        <p class="text-2xl font-semibold text-white">{stats.serviceRequests}</p>
                    </div>
                    <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-envelope text-white"></i>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm">Pending Requests</p>
                        <p class="text-2xl font-semibold {stats.pendingRequests > 0 ? 'text-yellow-400' : 'text-white'}">{stats.pendingRequests}</p>
                    </div>
                    <div class="w-12 h-12 {stats.pendingRequests > 0 ? 'bg-yellow-500' : 'bg-gray-600'} rounded-lg flex items-center justify-center">
                        <i class="fas fa-clock text-white"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Service Requests -->
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-semibold text-white">Recent Service Requests</h2>
                <a href="/admin/service-requests" class="text-blue-400 hover:text-blue-300 text-sm">
                    View all →
                </a>
            </div>
            
            {#if recentRequests.length === 0}
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-inbox text-gray-400"></i>
                    </div>
                    <h3 class="text-white font-medium mb-2">No requests yet</h3>
                    <p class="text-gray-400 text-sm">When clients submit service requests, they'll appear here</p>
                </div>
            {:else}
                <div class="space-y-4">
                    {#each recentRequests as request}
                        <div class="flex items-center justify-between p-4 bg-gray-700 border border-gray-600 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {request.clientName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 class="text-white font-medium">{request.projectTitle}</h4>
                                    <p class="text-gray-400 text-sm">{request.clientName} • {request.service.name}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="px-2 py-1 rounded text-xs font-medium {getStatusColor(request.status)}">
                                    {request.status.replace('_', ' ')}
                                </span>
                                <p class="text-gray-500 text-xs mt-1">{formatDate(request.createdAt)}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Quick Actions -->
        <div>
            <h2 class="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/admin/projects" class="bg-gray-800 border border-gray-700 p-6 rounded-lg hover:border-gray-600 transition-colors">
                    <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                        <i class="fas fa-plus text-white"></i>
                    </div>
                    <h3 class="text-white font-medium mb-2">Add New Project</h3>
                    <p class="text-gray-400 text-sm">Showcase your latest work</p>
                </a>
                
                <a href="/admin/services" class="bg-gray-800 border border-gray-700 p-6 rounded-lg hover:border-gray-600 transition-colors">
                    <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <i class="fas fa-plus text-white"></i>
                    </div>
                    <h3 class="text-white font-medium mb-2">Add New Service</h3>
                    <p class="text-gray-400 text-sm">Expand your offerings</p>
                </a>
                
                <a href="/api/test" target="_blank" class="bg-gray-800 border border-gray-700 p-6 rounded-lg hover:border-gray-600 transition-colors">
                    <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <i class="fas fa-database text-white"></i>
                    </div>
                    <h3 class="text-white font-medium mb-2">Test Database</h3>
                    <p class="text-gray-400 text-sm">Check system connectivity</p>
                </a>
            </div>
        </div>
    {/if}
</div>

<style>
    .stat-card {
        background-color: rgb(31, 41, 55);
        border: 1px solid rgb(55, 65, 81);
        border-radius: 0.5rem;
        padding: 1.5rem;
    }
</style>