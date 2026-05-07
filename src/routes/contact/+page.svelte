<script lang="ts">
	import ContactQuote from '../components/ContactQuote.svelte'
	import Cursor from '../components/Cursor.svelte'
</script>

<svelte:head>
	<title>Contact | Steve Tom - Full-Stack Developer</title>
	<meta
		name="description"
		content="Get in touch with Steve Tom for your next web development project. Let's discuss your vision and bring it to life."
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://stevetom.vercel.app/contact" />
	<meta property="og:title" content="Contact | Steve Tom - Full-Stack Developer" />
	<meta
		property="og:description"
		content="Get in touch with Steve Tom for your next web development project. Let's discuss your vision and bring it to life."
	/>
	<meta property="og:image" content="https://stevetom.vercel.app/kentom_website_banner.jpg" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://stevetom.vercel.app/contact" />
	<meta name="twitter:title" content="Contact | Steve Tom - Full-Stack Developer" />
	<meta
		name="twitter:description"
		content="Get in touch with Steve Tom for your next web development project. Let's discuss your vision and bring it to life."
	/>
	<meta name="twitter:image" content="https://stevetom.vercel.app/kentom_website_banner.jpg" />
</svelte:head>

<Cursor />

<div class="bg-[#252525]/10 min-h-screen relative overflow-x-hidden">
	<main class="hero-section mx-auto min-h-screen flex flex-col items-center justify-center py-20">
		<!-- Background decoration -->
		<div
			class="hidden lg:block absolute rotate-[65deg] top-20 -left-20 opacity-10"
			style="border-top: 120px solid transparent; border-bottom: 120px solid transparent; border-right: 80px solid white;"
		></div>

		<ContactQuote mode="contact" />
	</main>
</div>
