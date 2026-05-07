<script lang="ts">
	import Scene from './Scene.svelte'
</script>

<main class="w-full min-h-screen relative overflow-hidden" style="background-color: #252525">
	<img
		src="./new/kentom-bg-main.png"
		alt="Ken"
		class="absolute top-0 left-0 z-0 w-full h-full object-cover object-center"
	/>
	<div class="absolute top-0 left-0 z-50 w-full h-full">
		<Scene />
	</div>
</main>
