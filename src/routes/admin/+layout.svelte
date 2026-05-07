<script lang="ts">
    import { page } from '$app/stores';
    import { fly, fade, scale } from 'svelte/transition';
    import { TrendingUp, Folder, Settings, Mail, ArrowLeft, LogOut } from 'lucide-svelte';

    $: currentPath = $page.route.id;
</script>

<div class="min-h-screen text-white border-b border-gray-900 flex overflow-hidden">
    <!-- Sidebar -->
    <aside
            class="w-64 min-h-screen border-r border-gray-900 relative"
            in:fly={{ x: -200, duration: 500 }}
    >
        <div class="p-6 flex flex-col h-full">
            <!-- Header -->
            <div class="mb-8" in:fade={{ duration: 600 }}>
                <div class="flex items-center gap-3 mb-4">
                    <div>
                        <h1 class="text-2xl font-bold text-white tracking-wide">Admin</h1>
                        <p class="text-gray-400 text-sm">Dashboard</p>
                    </div>
                </div>
                <div class="h-px bg-gray-900"></div>
            </div>

            <!-- Navigation -->
            <nav class="space-y-2 flex-1">
                {#each [
                    { href: '/admin', label: 'Dashboard', icon: TrendingUp },
                    { href: '/admin/projects', label: 'Projects', icon: Folder },
                    { href: '/admin/services', label: 'Services', icon: Settings },
                    { href: '/admin/service-requests', label: 'Requests', icon: Mail }
                ] as link (link.href)}
                    <a
                            href={link.href}
                            class="nav-link mb-2 relative {currentPath === link.href || currentPath?.includes(link.href) ? 'active' : ''}"
                            in:fade={{ duration: 400 }}
                    >
                        <svelte:component this={link.icon} size="20" />
                        <span>{link.label}</span>
                        <!-- Active highlight bar -->
                        {#if currentPath === link.href || currentPath?.includes(link.href)}
                            <div class="absolute right-2 top-2 bottom-2 w-1 bg-blue-400 rounded-full animate-pulse"></div>
                        {/if}
                    </a>
                {/each}
            </nav>

            <!-- Bottom Section -->
            <div class="mt-auto" in:fade={{ duration: 600 }}>
                <div class="h-px bg-gray-900 mb-4"></div>
                <a href="/" class="nav-link hover:text-green-400 transition-all duration-300">
                    <ArrowLeft size="20" />
                    <span>Back to Site</span>
                </a>
                <form action="/logout" method="POST" class="w-full">
                    <button type="submit" class="nav-link mt-2 w-full hover:text-red-400 transition-all duration-300">
                        <LogOut size="20" />
                        <span>Logout</span>
                    </button>
                </form>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto" in:fade={{ duration: 600 }}>
        <div class="p-8 animate-fadeIn">
            <slot />
        </div>
    </main>
</div>

<style>
    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        text-decoration: none;
        color: rgb(156, 163, 175);
        position: relative;
        transition: all 0.3s ease;
        border: 1px solid rgba(128, 128, 128, 0.1);
    }
    .nav-link:hover {
        color: white;
        background: linear-gradient(
                90deg,
                rgba(59, 130, 246, 0.2),
                rgba(37, 99, 235, 0.1)
        );
    }
    .nav-link.active {
        color: white;
        background: linear-gradient(
                90deg,
                rgba(59, 130, 246, 0.8),
                rgba(37, 99, 235, 0.8)
        );
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fadeIn {
        animation: fadeIn 0.6s ease-in-out;
    }
</style>
