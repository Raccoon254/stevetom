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
        <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
        <p>Overview of your portfolio and business</p>
    </div>

    {#if loading}
        <div class="flex justify-center items-center min-h-[80vh] py-12">
            <div class="animate-spin rounded-full h-12 w-12 loading loading-ring"></div>
        </div>
    {:else}
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="card bg-base-200/10 border border-gray-900 shadow-xl">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm">Total Projects</p>
                            <p class="text-2xl font-semibold">{stats.projects}</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <i class="fas fa-folder text-white"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card bg-base-200/10 border border-gray-900 shadow-xl">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm">Active Services</p>
                            <p class="text-2xl font-semibold">{stats.services}</p>
                        </div>
                        <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <i class="fas fa-cogs text-white"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card bg-base-200/10 border border-gray-900 shadow-xl">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm">Total Requests</p>
                            <p class="text-2xl font-semibold">{stats.serviceRequests}</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                            <i class="fas fa-envelope text-white"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card bg-base-200/10 border border-gray-900 shadow-xl">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm">Pending Requests</p>
                            <p class="text-2xl font-semibold {stats.pendingRequests > 0 ? 'text-yellow-400' : ''}">{stats.pendingRequests}</p>
                        </div>
                        <div class="w-12 h-12 {stats.pendingRequests > 0 ? 'bg-yellow-500' : 'bg-gray-600'} rounded-lg flex items-center justify-center">
                            <i class="fas fa-clock text-white"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Service Requests -->
        <div class="card bg-base-200/10 border border-gray-900 shadow-xl">
            <div class="card-body">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="card-title">Recent Service Requests</h2>
                    <a href="/admin/service-requests" class="text-blue-400 hover:text-blue-300 text-sm">
                        View all →
                    </a>
                </div>
                
                {#if recentRequests.length === 0}
                    <div class="text-center py-12">
                        <div class="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <h3 class="font-medium mb-2">No requests yet</h3>
                        <p class="text-sm">When clients submit service requests, they'll appear here</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Project</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each recentRequests as request}
                                    <tr>
                                        <td>
                                            <div class="flex items-center gap-3">
                                                <div class="avatar">
                                                    <div class="mask mask-squircle w-10 h-10">
                                                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-medium">
                                                            {request.clientName.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div class="font-bold">{request.projectTitle}</div>
                                                    <div class="text-sm opacity-50">{request.clientName} • {request.service.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="badge badge-ghost badge-sm {getStatusColor(request.status)}">
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{formatDate(request.createdAt)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Quick Actions -->
        <div>
            <h2 class="text-xl font-semibold mb-6">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/admin/projects" class="card bg-base-200/10 border border-gray-900 shadow-xl hover:shadow-2xl transition-shadow">
                    <div class="card-body items-center text-center">
                        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                            <i class="fas fa-plus text-white"></i>
                        </div>
                        <h3 class="card-title">Add New Project</h3>
                        <p class="text-sm">Showcase your latest work</p>
                    </div>
                </a>
                
                <a href="/admin/services" class="card bg-base-200/10 border border-gray-900 shadow-xl hover:shadow-2xl transition-shadow">
                    <div class="card-body items-center text-center">
                        <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                            <i class="fas fa-plus text-white"></i>
                        </div>
                        <h3 class="card-title">Add New Service</h3>
                        <p class="text-sm">Expand your offerings</p>
                    </div>
                </a>
                
                <a href="/api/test" target="_blank" class="card bg-base-200/10 border border-gray-900 shadow-xl hover:shadow-2xl transition-shadow">
                    <div class="card-body items-center text-center">
                        <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                            <i class="fas fa-database text-white"></i>
                        </div>
                        <h3 class="card-title">Test Database</h3>
                        <p class="text-sm">Check system connectivity</p>
                    </div>
                </a>
            </div>
        </div>
    {/if}
</div>
