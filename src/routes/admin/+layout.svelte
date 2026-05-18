<script lang="ts">
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import '$lib/styles/kenfolio.css';
	import '$lib/styles/admin.css';

	$: currentPath = $page.route.id;
	let mobileMenuOpen = false;

	const nav = [
		{ href: '/admin', label: 'Dashboard', icon: 'chart' },
		{ href: '/admin/projects', label: 'Projects', icon: 'box' },
		{ href: '/admin/services', label: 'Services', icon: 'setting' },
		{ href: '/admin/service-requests', label: 'Requests', icon: 'messages' }
	];

	$: isActive = (href: string) =>
		currentPath === href || (currentPath?.startsWith(href + '/') ?? false);
</script>

<div class="admin">
	<!-- mobile menu button -->
	<button
		class="burger"
		class:open={mobileMenuOpen}
		on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
		aria-label="Menu"
		aria-expanded={mobileMenuOpen}
	>
		<span></span>
		<span></span>
	</button>

	<div class="shell">
		<!-- desktop sidebar -->
		<aside class="side" in:fly={{ x: -160, duration: 380 }}>
			<a class="brand" href="/">
				<span class="logo" aria-hidden="true">
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
				</span>
				<span class="brand-label">kenTom <em>· admin</em></span>
			</a>

			<nav class="nav">
				{#each nav as link (link.href)}
					<a href={link.href} class="nav-link" class:active={isActive(link.href)}>
						<Icon name={link.icon} size={17} />
						<span>{link.label}</span>
					</a>
				{/each}
			</nav>

			<div class="side-foot">
				<a href="/" class="nav-link subtle">
					<Icon name="arrow-left" size={17} />
					<span>Back to site</span>
				</a>
				<form action="/logout" method="POST">
					<button type="submit" class="nav-link subtle danger">
						<Icon name="logout" size={17} />
						<span>Log out</span>
					</button>
				</form>
			</div>
		</aside>

		<!-- mobile sidebar -->
		{#if mobileMenuOpen}
			<div
				class="scrim"
				on:click={() => (mobileMenuOpen = false)}
				transition:fade={{ duration: 200 }}
			>
				<aside
					class="side mobile"
					on:click|stopPropagation
					transition:fly={{ x: -200, duration: 260 }}
				>
					<a class="brand" href="/">
						<span class="logo" aria-hidden="true">
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
						</span>
						<span class="brand-label">kenTom <em>· admin</em></span>
					</a>
					<nav class="nav">
						{#each nav as link (link.href)}
							<a
								href={link.href}
								class="nav-link"
								class:active={isActive(link.href)}
								on:click={() => (mobileMenuOpen = false)}
							>
								<Icon name={link.icon} size={17} />
								<span>{link.label}</span>
							</a>
						{/each}
					</nav>
					<div class="side-foot">
						<a href="/" class="nav-link subtle">
							<Icon name="arrow-left" size={17} />
							<span>Back to site</span>
						</a>
						<form action="/logout" method="POST">
							<button type="submit" class="nav-link subtle danger">
								<Icon name="logout" size={17} />
								<span>Log out</span>
							</button>
						</form>
					</div>
				</aside>
			</div>
		{/if}

		<main class="content">
			<div class="content-inner">
				<slot />
			</div>
		</main>
	</div>
</div>

<style>
	/* admin runs always-dark, independent of the site theme toggle */
	.admin {
		--bg: #050505;
		--bg-rgb: 5, 5, 5;
		--panel: #0c0d0d;
		--ink: #f4fffc;
		--ink-2: #cfeee6;
		--mute: #6fa89c;
		--mute-2: #2c6258;
		--spark: #ff7a1a;
		--danger: #ff5a52;
		--hairline: rgba(255, 255, 255, 0.1);
		--hairline-2: rgba(255, 255, 255, 0.2);

		min-height: 100vh;
		background: var(--bg);
		color: var(--ink);
		font-family: var(--sans);
	}

	.shell {
		display: flex;
		min-height: 100vh;
	}

	/* sidebar */
	.side {
		width: 264px;
		flex: 0 0 264px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: clamp(20px, 2.4vw, 30px) 18px;
		border-right: 1px solid var(--hairline);
		background: var(--panel);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 11px;
		padding: 6px 8px;
		margin-bottom: 22px;
		color: var(--ink);
	}
	.brand .logo {
		width: 22px;
		height: 22px;
		flex: 0 0 auto;
	}
	.brand .logo svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.brand-label {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
	}
	.brand-label em {
		font-style: normal;
		color: var(--mute);
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
	}
	.nav-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 11px 12px;
		border-radius: 9px;
		border: 1px solid transparent;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
		background: transparent;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition:
			color 0.2s ease,
			background 0.2s ease,
			border-color 0.2s ease;
	}
	.nav-link:hover {
		color: var(--ink);
		background: rgba(255, 255, 255, 0.04);
	}
	.nav-link.active {
		color: var(--ink);
		background: rgba(255, 255, 255, 0.06);
		border-color: var(--hairline);
	}
	.nav-link.active :global(svg) {
		color: var(--spark);
	}
	.side-foot {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-top: 14px;
		margin-top: 14px;
		border-top: 1px solid var(--hairline);
	}
	.nav-link.subtle {
		font-size: 10px;
	}
	.nav-link.danger:hover {
		color: var(--danger);
	}

	/* content */
	.content {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
	}
	.content-inner {
		padding: clamp(20px, 3vw, 40px);
		max-width: 1200px;
	}

	/* mobile */
	.burger {
		display: none;
		position: fixed;
		top: 14px;
		left: 14px;
		z-index: 50;
		width: 42px;
		height: 42px;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		background: var(--panel);
		border: 1px solid var(--hairline);
		border-radius: 10px;
		cursor: pointer;
	}
	.burger span {
		display: block;
		width: 16px;
		height: 1.5px;
		margin: 0 auto;
		background: var(--ink);
		transition: transform 0.25s ease;
	}
	.burger.open span:first-child {
		transform: translateY(3.25px) rotate(45deg);
	}
	.burger.open span:last-child {
		transform: translateY(-3.25px) rotate(-45deg);
	}
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
	}
	.side.mobile {
		height: 100vh;
	}

	@media (max-width: 900px) {
		.side:not(.mobile) {
			display: none;
		}
		.burger {
			display: flex;
		}
		.content-inner {
			padding-top: 70px;
		}
	}
</style>
