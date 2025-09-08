<script lang="ts">
    import { page } from '$app/stores';
    
    $: currentPath = $page.route.id;
</script>

<div class="min-h-screen bg-gray-900 text-white">
    <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-800 min-h-screen p-6">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p class="text-gray-400 text-sm">kenTom Portfolio</p>
            </div>
            
            <nav class="space-y-2">
                <a 
                    href="/admin" 
                    class="block px-4 py-2 rounded-lg transition-colors {currentPath === '/admin' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                >
                    <i class="fas fa-dashboard mr-3"></i>Dashboard
                </a>
                <a 
                    href="/admin/projects" 
                    class="block px-4 py-2 rounded-lg transition-colors {currentPath?.includes('/admin/projects') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                >
                    <i class="fas fa-project-diagram mr-3"></i>Projects
                </a>
                <a 
                    href="/admin/services" 
                    class="block px-4 py-2 rounded-lg transition-colors {currentPath?.includes('/admin/services') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                >
                    <i class="fas fa-cogs mr-3"></i>Services
                </a>
                <a 
                    href="/admin/service-requests" 
                    class="block px-4 py-2 rounded-lg transition-colors {currentPath?.includes('/admin/service-requests') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                >
                    <i class="fas fa-envelope mr-3"></i>Service Requests
                </a>
            </nav>
            
            <div class="mt-8 pt-8 border-t border-gray-700">
                <a href="/" class="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                    <i class="fas fa-arrow-left mr-3"></i>Back to Site
                </a>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 p-8">
            <slot />
        </main>
    </div>
</div>