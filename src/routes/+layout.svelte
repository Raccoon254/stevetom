<script>
	import '../app.css';
   import { Briefcase, Mail, Github, Linkedin, MessageCircle, Moon, Sun } from 'lucide-svelte';
   import { onMount } from 'svelte';

   let theme = 'light';

   onMount(() => {
		theme = localStorage.getItem('theme') || 'light';
		document.documentElement.setAttribute('data-theme', theme);
   });

   function toggleTheme() {
      theme = theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
   }

	 let year = new Date().getFullYear();
</script>

<button
	on:click={toggleTheme}
	class="absolute top-4 right-4 z-50 btn btn-circle btn-ghost"
	aria-label="Toggle theme"
>
	{#if theme === 'light'}
		<Moon size="20" />
	{:else}
		<Sun size="20" />
	{/if}
</button>

<div class="min-h-screen bg-base-100">
	<main>
		<slot />
	</main>

	<footer class="bg-base-200 text-base-content py-16 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
				<!-- Logo & Image -->
				<div class="text-center md:text-left flex flex-col items-center md:items-start">
					<div class="relative mb-4">
						<img
							src="/ken.HEIC"
							alt="Ken Tom"
							class="rounded-full ring ring-primary/20 ring-offset-4 ring-offset-base-100 object-cover w-32 h-32"
						/>
					</div>
					<img src="/namelogo.jpg" alt="KenTom logo" class="w-36 mb-2" />
					<p class="text-sm text-base-content/60">All in one dev solutions</p>
				</div>

				<!-- About Text -->
				<div class="col-span-2 space-y-4">
					<p class="text-base-content/70">
						Hi, I'm KenTom[Steve Osoro Tom], the developer behind Projects like Status Saver, Jestorm, Cline, and
						many more. I'm a passionate developer with a keen interest in technology and software
					</p>
					<p class="text-base-content/70">
						This website is a showcase of my work and a platform to connect with me. Feel free to reach out to me for any queries or collaborations, I'm always open to new opportunities and challenges, and I'm looking forward to working with you. Thank you for visiting my website.
					</p>

					<!-- Social Links -->
					<div class="flex flex-wrap gap-3 mt-4">
						<a
							href="https://stevetom.vercel.app/"
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-primary btn-sm gap-2"
						>
							<Briefcase size="16" /> Portfolio
						</a>
						<a
							href="mailto:tomsteve187@gmail.com"
							class="btn btn-warning btn-sm gap-2"
						>
							<Mail size="16" /> Email
						</a>
						<a
							href="https://github.com/Raccoon254"
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-neutral btn-sm gap-2"
						>
							<Github size="16" /> GitHub
						</a>
						<a
							href="https://www.linkedin.com/in/steve-tom-822a81230/"
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-info btn-sm gap-2"
						>
							<Linkedin size="16" /> LinkedIn
						</a>
						<a
							href="https://wa.link/w1774n"
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-success btn-sm gap-2"
						>
							<MessageCircle size="16" /> WhatsApp
						</a>
					</div>
				</div>
			</div>

			<!-- Copyright -->
			<div class="mt-12 pt-8 border-t border-base-300 flex flex-col items-center gap-4">
				<img src="/logo-light.png" alt="Ken Tom" class="w-16" />
				<p class="text-sm text-base-content/50">&copy; {year} KenTom. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>