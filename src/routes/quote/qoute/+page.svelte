<script lang="ts">
	import ContactQuote from '../../components/ContactQuote.svelte'
	import Cursor from '../../components/Cursor.svelte'
</script>

<svelte:head>
	<title>Request a Quote | Steve Tom - Full-Stack Developer</title>
	<meta
		name="description"
		content="Ready to build something amazing? Request a quote for your web design, development, or mobile app project."
	/>
</svelte:head>

<Cursor />

<div class="bg-[#252525] min-h-screen relative overflow-x-hidden">
	<main class="hero-section mx-auto min-h-screen flex flex-col items-center justify-center py-20">
		<!-- Background decoration -->
		<div
			class="hidden lg:block absolute rotate-[65deg] top-20 -left-20 opacity-10"
			style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
		></div>

		<ContactQuote mode="quote" />
	</main>
</div>
