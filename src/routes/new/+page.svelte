<script lang="ts">
	import Scene from './Scene.svelte'
</script>

<main
	class="w-full min-h-screen flex flex-col relative items-center justify-start overflow-x-hidden"
	style="background-color: #252525"
>
	<!-- Container that locks background and 3D scene together -->
	<div class="w-full ml-[30%] -mt-20 h-screen z-50 sticky top-0">
		<Scene />
	</div>

	<!-- Rectangle with 25% width -->
	<div class="w-[35%] h-screen z-10 top-0 right-0 absolute bg-white"></div>

	<!-- Scrollable content sections -->
	<div class="w-full relative z-10 bg-gradient-to-b from-transparent to-[#252525] pt-20">
		<section class="w-full min-h-screen flex items-center justify-center px-8">
			<div class="max-w-4xl text-center text-white">
				<h2 class="text-5xl font-bold mb-6">Scroll to See the Magic</h2>
				<p class="text-xl text-gray-300">Watch the Top Cube and Sphere move as you scroll</p>
			</div>
		</section>

		<section class="w-full min-h-screen flex items-center justify-center px-8">
			<div class="max-w-4xl text-center text-white">
				<h2 class="text-5xl font-bold mb-6">Keep Scrolling</h2>
				<p class="text-xl text-gray-300">The animations continue as you explore</p>
			</div>
		</section>

		<section class="w-full min-h-screen flex items-center justify-center px-8">
			<div class="max-w-4xl text-center text-white">
				<h2 class="text-5xl font-bold mb-6">End of Demo</h2>
				<p class="text-xl text-gray-300">Scroll back up to see the reverse effect</p>
			</div>
		</section>
	</div>
</main>

<style>
</style>
