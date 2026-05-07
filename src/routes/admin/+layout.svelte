<script lang="ts">
    import { page } from '$app/stores';
    import { fly, fade } from 'svelte/transition';
    import { TrendingUp, Folder, Settings, Mail, ArrowLeft, LogOut, Menu, X } from 'lucide-svelte';

    $: currentPath = $page.route.id;
    let mobileMenuOpen = false;

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }
</script>

<div class="min-h-screen bg-[#252525] text-white relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="hero-section fixed inset-0 pointer-events-none"></div>

    <!-- Background Decorations -->
    <div
        class="hidden lg:block absolute rotate-[65deg] top-20 -left-20 opacity-5 pointer-events-none"
        style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
    ></div>

    <div class="relative z-10 flex min-h-screen">
        <!-- Sidebar - Desktop -->
        <aside
            class="hidden lg:flex w-72 min-h-screen border-r border-white/10 relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm"
            in:fly={{ x: -200, duration: 500 }}
        >
            <div class="p-6 flex flex-col h-full w-full">
                <!-- Header -->
                <div class="mb-8" in:fade={{ duration: 600 }}>
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                            <TrendingUp size="24" class="text-white" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-white">Admin</h1>
                            <p class="text-white/60 text-sm">Control Panel</p>
                        </div>
                    </div>
                    <div class="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
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
                            class="nav-link group relative {currentPath === link.href || currentPath?.startsWith(link.href + '/') ? 'active' : ''}"
                            in:fade={{ duration: 400 }}
                        >
                            <svelte:component this={link.icon} size="20" />
                            <span>{link.label}</span>
                            <!-- Active indicator -->
                            {#if currentPath === link.href || currentPath?.startsWith(link.href + '/')}
                                <div class="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                            {/if}
                        </a>
                    {/each}
                </nav>

                <!-- Bottom Section -->
                <div class="mt-auto space-y-2" in:fade={{ duration: 600 }}>
                    <div class="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                    <a href="/" class="nav-link hover:text-emerald-400 transition-all duration-300">
                        <ArrowLeft size="20" />
                        <span>Back to Site</span>
                    </a>
                    <form action="/logout" method="POST" class="w-full">
                        <button type="submit" class="nav-link w-full hover:text-red-400 transition-all duration-300">
                            <LogOut size="20" />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </div>
        </aside>

        <!-- Mobile Menu Button -->
        <button
            on:click={toggleMobileMenu}
            class="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all"
        >
            {#if mobileMenuOpen}
                <X size="24" />
            {:else}
                <Menu size="24" />
            {/if}
        </button>

        <!-- Mobile Sidebar -->
        {#if mobileMenuOpen}
            <div
                class="lg:hidden fixed inset-0 z-40 bg-[#252525]/95 backdrop-blur-md"
                on:click={toggleMobileMenu}
                transition:fade={{ duration: 300 }}
            >
                <aside
                    class="w-72 min-h-screen border-r border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm"
                    on:click|stopPropagation
                    transition:fly={{ x: -200, duration: 300 }}
                >
                    <div class="p-6 flex flex-col h-full">
                        <!-- Header -->
                        <div class="mb-8">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <TrendingUp size="24" class="text-white" />
                                </div>
                                <div>
                                    <h1 class="text-2xl font-bold text-white">Admin</h1>
                                    <p class="text-white/60 text-sm">Control Panel</p>
                                </div>
                            </div>
                            <div class="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
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
                                    class="nav-link group relative {currentPath === link.href || currentPath?.startsWith(link.href + '/') ? 'active' : ''}"
                                    on:click={toggleMobileMenu}
                                >
                                    <svelte:component this={link.icon} size="20" />
                                    <span>{link.label}</span>
                                    {#if currentPath === link.href || currentPath?.startsWith(link.href + '/')}
                                        <div class="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                                    {/if}
                                </a>
                            {/each}
                        </nav>

                        <!-- Bottom Section -->
                        <div class="mt-auto space-y-2">
                            <div class="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                            <a href="/" class="nav-link hover:text-emerald-400 transition-all duration-300">
                                <ArrowLeft size="20" />
                                <span>Back to Site</span>
                            </a>
                            <form action="/logout" method="POST" class="w-full">
                                <button type="submit" class="nav-link w-full hover:text-red-400 transition-all duration-300">
                                    <LogOut size="20" />
                                    <span>Logout</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>
            </div>
        {/if}

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto" in:fade={{ duration: 600 }}>
            <div class="p-6 lg:p-8 animate-fadeIn">
                <slot />
            </div>
        </main>
    </div>
</div>

<style>

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 1rem;
        text-decoration: none;
        color: rgba(255, 255, 255, 0.6);
        position: relative;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
    }

    .nav-link:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateX(4px);
    }

    .nav-link.active {
        color: white;
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
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
