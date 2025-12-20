<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import { Folder, Settings, Mail, Clock, Inbox, Plus, Database, Sparkles, ArrowRight, TrendingUp } from 'lucide-svelte';

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
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-white/5 text-white/40 border-white/20';
        }
    }
</script>

<svelte:head>
    <title>Admin Dashboard | KenTom</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header Section -->
    <div in:fly={{ y: -20, duration: 600, easing: cubicInOut }}>
        <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-white/10 rounded-lg border border-white/20">
                <Sparkles size="24" class="text-white" />
            </div>
            <div>
                <h1 class="text-4xl font-bold text-white">Dashboard</h1>
                <p class="text-white/60">Overview of your portfolio and business</p>
            </div>
        </div>
    </div>

    {#if loading}
        <div class="flex justify-center items-center min-h-[60vh] py-12" in:fade>
            <div class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p class="text-white/50">Loading dashboard...</p>
            </div>
        </div>
    {:else}
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each [
                { label: 'Total Projects', value: stats.projects, icon: Folder, color: 'bg-blue-500', href: '/admin/projects' },
                { label: 'Active Services', value: stats.services, icon: Settings, color: 'bg-emerald-500', href: '/admin/services' },
                { label: 'Total Requests', value: stats.serviceRequests, icon: Mail, color: 'bg-purple-500', href: '/admin/service-requests' },
                { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: stats.pendingRequests > 0 ? 'bg-yellow-500' : 'bg-white/20', href: '/admin/service-requests' }
            ] as stat, index}
                <a
                    href={stat.href}
                    class="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5"
                    in:fly={{
                        y: 20,
                        duration: 500,
                        delay: index * 100,
                        easing: cubicInOut
                    }}
                >
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <p class="text-white/60 text-sm mb-2 uppercase tracking-wider font-semibold">{stat.label}</p>
                            <p class="text-4xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div class="{stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                            <svelte:component this={stat.icon} size="24" class="text-white" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors text-sm">
                        <span>View all</span>
                        <ArrowRight size="16" class="transition-transform group-hover:translate-x-1" />
                    </div>
                </a>
            {/each}
        </div>

        <!-- Recent Service Requests -->
        <div
            class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
            in:fly={{ y: 20, duration: 600, delay: 400, easing: cubicInOut }}
        >
            <div class="p-6 border-b border-white/10">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-white/10 rounded-lg">
                            <Mail size="20" class="text-white" />
                        </div>
                        <h2 class="text-2xl font-bold text-white">Recent Service Requests</h2>
                    </div>
                    <a
                        href="/admin/service-requests"
                        class="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm group"
                    >
                        <span>View all</span>
                        <ArrowRight size="16" class="transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </div>

            <div class="p-6">
                {#if recentRequests.length === 0}
                    <div class="text-center py-16">
                        <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Inbox size="32" class="text-white/40" />
                        </div>
                        <h3 class="text-xl font-semibold text-white mb-2">No requests yet</h3>
                        <p class="text-white/50">When clients submit service requests, they'll appear here</p>
                    </div>
                {:else}
                    <div class="space-y-3">
                        {#each recentRequests as request, index}
                            <div
                                class="group p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                in:fade={{ duration: 300, delay: index * 50 }}
                            >
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                                        {request.clientName.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-semibold text-white truncate">{request.projectTitle}</h4>
                                        <p class="text-sm text-white/60 truncate">{request.clientName} • {request.service.name}</p>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span class="px-3 py-1 text-xs font-semibold rounded-full border {getStatusColor(request.status)} uppercase tracking-wider">
                                            {request.status.replace('_', ' ')}
                                        </span>
                                        <span class="text-sm text-white/40 hidden sm:block">{formatDate(request.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Quick Actions -->
        <div in:fly={{ y: 20, duration: 600, delay: 500, easing: cubicInOut }}>
            <div class="flex items-center gap-3 mb-6">
                <TrendingUp size="20" class="text-white" />
                <h2 class="text-2xl font-bold text-white">Quick Actions</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                {#each [
                    { href: '/admin/projects', title: 'Add New Project', description: 'Showcase your latest work', icon: Plus, color: 'bg-blue-500' },
                    { href: '/admin/services', title: 'Add New Service', description: 'Expand your offerings', icon: Plus, color: 'bg-emerald-500' },
                    { href: '/api/test', title: 'Test Database', description: 'Check system connectivity', icon: Database, color: 'bg-purple-500', target: '_blank' }
                ] as action, index}
                    <a
                        href={action.href}
                        target={action.target || '_self'}
                        class="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5"
                        in:fly={{ y: 20, duration: 500, delay: 500 + (index * 100), easing: cubicInOut }}
                    >
                        <div class="flex flex-col items-center text-center">
                            <div class="{action.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                <svelte:component this={action.icon} size="28" class="text-white" />
                            </div>
                            <h3 class="text-xl font-bold text-white mb-2">{action.title}</h3>
                            <p class="text-white/60 text-sm">{action.description}</p>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>
