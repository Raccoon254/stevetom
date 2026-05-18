<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/blog', label: 'Notes' },
		{ href: '/partners', label: 'Partners' },
		{ href: '/donate', label: 'Support' },
		{ href: '/quote', label: 'Quote' },
		{ href: '/contact', label: 'Contact' }
	];

	let hidden = false;
	let scrolled = false;
	let menuOpen = false;

	$: pathname = $page.url.pathname;
	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname.startsWith(href);

	onMount(() => {
		let lastY = window.scrollY;
		let ticking = false;
		function evaluate() {
			const y = window.scrollY;
			scrolled = y > 8;
			if (!menuOpen) {
				if (y > lastY && y > 90) hidden = true;
				else if (y < lastY) hidden = false;
			}
			lastY = y;
			ticking = false;
		}
		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(evaluate);
				ticking = true;
			}
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<header class="nav" class:hidden class:scrolled class:menu-open={menuOpen}>
	<a class="logo" href="/" aria-label="kenTom — home">
		<svg viewBox="0 0 576 596" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M 0 0 L 319.02 -1 L 318.946 402.932 L 158 595 L 158 183 L -1 183 L 0 0 Z"
				fill="currentColor"
				transform="translate(1,1)"
			></path>
			<path
				d="M 0 0 C 110.421 0 191.846 0 191.846 0 L 0 183.628 C 0 183.628 0 65.96 0 0 Z"
				fill="currentColor"
				transform="translate(384,0)"
			></path>
		</svg>
	</a>

	<nav class="links" aria-label="Primary">
		{#each links as l}
			<a href={l.href} class:active={isActive(l.href)}>{l.label}</a>
		{/each}
	</nav>

	<div class="right">
		<ThemeToggle />
		<button
			class="burger"
			class:open={menuOpen}
			type="button"
			aria-label="Menu"
			aria-expanded={menuOpen}
			on:click={() => (menuOpen = !menuOpen)}
		>
			<span></span>
			<span></span>
		</button>
	</div>

	{#if menuOpen}
		<nav class="panel" aria-label="Menu">
			{#each links as l}
				<a
					href={l.href}
					class:active={isActive(l.href)}
					on:click={() => (menuOpen = false)}>{l.label}</a
				>
			{/each}
		</nav>
	{/if}
</header>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 70;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: clamp(12px, 1.8vw, 18px) clamp(16px, 4vw, 40px);
		transition:
			transform 0.38s cubic-bezier(0.4, 0, 0.2, 1),
			background 0.3s ease,
			border-color 0.3s ease;
		border-bottom: 1px solid transparent;
	}
	.nav.hidden {
		transform: translateY(-100%);
	}
	.nav.scrolled,
	.nav.menu-open {
		background: rgba(var(--bg-rgb), 0.78);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom-color: var(--hairline);
	}

	/* logo */
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		color: var(--ink);
		flex: 0 0 auto;
	}
	.logo svg {
		width: 22px;
		height: 22px;
		display: block;
	}
	.wordmark {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--ink);
		padding-top: 1px;
	}

	/* desktop links */
	.links {
		display: flex;
		align-items: center;
		gap: clamp(14px, 2vw, 30px);
	}
	.links a {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
		padding: 6px 2px;
		position: relative;
		transition: color 0.2s ease;
	}
	.links a:hover {
		color: var(--ink);
	}
	.links a.active {
		color: var(--ink);
	}
	.links a.active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: var(--spark);
	}

	.right {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 0 0 auto;
	}

	/* mobile menu button */
	.burger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		width: 36px;
		height: 32px;
		padding: 0;
		background: transparent;
		border: 1px solid var(--hairline);
		border-radius: 8px;
		cursor: pointer;
	}
	.burger span {
		display: block;
		width: 15px;
		height: 1.5px;
		margin: 0 auto;
		background: var(--ink);
		transition:
			transform 0.28s ease,
			opacity 0.2s ease;
	}
	.burger.open span:first-child {
		transform: translateY(3.25px) rotate(45deg);
	}
	.burger.open span:last-child {
		transform: translateY(-3.25px) rotate(-45deg);
	}

	/* mobile dropdown panel */
	.panel {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		padding: 8px clamp(16px, 4vw, 40px) 20px;
		background: rgba(var(--bg-rgb), 0.96);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--hairline);
	}
	.panel a {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
		padding: 14px 2px;
		border-top: 1px solid var(--hairline);
	}
	.panel a:first-child {
		border-top: none;
	}
	.panel a.active {
		color: var(--spark);
	}

	@media (max-width: 760px) {
		.links {
			display: none;
		}
		.burger {
			display: flex;
			border-color: transparent;
		}
	}
</style>
