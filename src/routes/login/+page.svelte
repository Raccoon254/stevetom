<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<main class="min-h-screen flex flex-col justify-center items-center">
    <div class="w-full max-w-md mx-auto">
        <div class="flex gap-2 items-center h-16 overflow-clip mb-4 justify-center">
            <img src="/logo-light.png" alt="Steve Tom" class="w-10 object-cover" />
            <h1 class="text-3xl font-bold text-interactive">kenTom</h1>
        </div>

        <div class="bg-gray-900/50 border border-gray-700 rounded-lg shadow-xl p-8">
            <h2 class="text-2xl font-bold text-center text-white mb-6">Admin Login</h2>
            <form method="POST" use:enhance class="space-y-6">
                <div>
                    <label for="password" class="text-sm font-medium text-gray-300">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        class="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                        required
                    />
                </div>
                {#if form?.error}
                    <p class="text-red-500 text-sm font-bold text-center">{form.error}</p>
                {/if}
                <div>
                    <button type="submit" class="w-full bg-gray-50 text-gray-900 px-4 py-2 rounded-full hover:bg-gray-300 transition duration-300 font-bold">
                        Login
                    </button>
                </div>
            </form>
        </div>
    </div>
</main>
