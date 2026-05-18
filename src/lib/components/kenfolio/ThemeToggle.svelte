<script lang="ts">
	import { theme, toggleTheme } from '$lib/stores/theme';

	$: isDark = $theme === 'dark';
</script>

<button
	class="theme"
	class:is-dark={isDark}
	aria-label="Toggle theme"
	aria-pressed={isDark}
	type="button"
	on:click={toggleTheme}
>
	<span class="orb" aria-hidden="true">
		<!-- sun -->
		<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor">
			<circle cx="12" cy="12" r="4.25" stroke-width="1.5" />
			<g class="rays" stroke-width="2" stroke-linecap="round">
				<line x1="12" y1="2.4" x2="12" y2="4.6" />
				<line x1="12" y1="19.4" x2="12" y2="21.6" />
				<line x1="2.4" y1="12" x2="4.6" y2="12" />
				<line x1="19.4" y1="12" x2="21.6" y2="12" />
				<line x1="5.2" y1="5.2" x2="6.8" y2="6.8" />
				<line x1="17.2" y1="17.2" x2="18.8" y2="18.8" />
				<line x1="5.2" y1="18.8" x2="6.8" y2="17.2" />
				<line x1="17.2" y1="6.8" x2="18.8" y2="5.2" />
			</g>
		</svg>
		<!-- moon -->
		<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
			<path
				d="M8.37 2.19c-1.25.53-1.9 1.12-1.36 2.36-.49 1.12-.76 2.35-.75 3.65.02 4.83 4.02 8.92 8.91 9.12.72.03 1.41-.02 2.08-.14 1.37-.25 1.81.49.99 1.6C16.96 20.43 13.66 22.15 9.97 21.99 4.74 21.76.37 17.57.01 12.42c-.19-2.66.64-5.12 2.15-7.04"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<!-- phone fallback: crisp half-filled disc, rotates on toggle -->
		<span class="disc"></span>
	</span>
	<span class="label">
		<span class="key">theme</span><span class="colon">:</span>
		<span class="val">
			<span class="word from">{isDark ? 'dark' : 'light'}</span>
			<span class="word to">{isDark ? 'light' : 'dark'}</span>
		</span>
	</span>
</button>

<style>
	.theme {
		--anim: 0.5s cubic-bezier(0.65, 0, 0.35, 1);
		position: relative;
		overflow: hidden;
		background: transparent;
		border: 1px solid var(--hairline);
		color: var(--chrome-ink);
		padding: 7px 12px;
		border-radius: 999px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		cursor: pointer;
		display: inline-flex;
		gap: 8px;
		align-items: center;
		transition:
			border-color 0.25s,
			color 0.25s,
			background 0.25s;
	}
	.theme:hover {
		border-color: var(--mute);
		color: var(--ink);
	}

	/* icon */
	.orb {
		position: relative;
		width: 14px;
		height: 14px;
		flex: 0 0 auto;
	}
	.orb svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transition:
			opacity var(--anim),
			transform var(--anim);
		will-change: transform, opacity;
	}

	/* default = light mode → show sun, moon waiting below */
	.sun {
		opacity: 1;
		transform: rotate(0deg) scale(1);
	}
	.moon {
		opacity: 0;
		transform: rotate(-65deg) scale(0.4);
	}
	.theme.is-dark .sun {
		opacity: 0;
		transform: rotate(65deg) scale(0.4);
	}
	.theme.is-dark .moon {
		opacity: 1;
		transform: rotate(0deg) scale(1);
	}

	/* sun rays bloom out one beat after the disc */
	.rays line {
		transform-origin: 12px 12px;
		transition: transform var(--anim);
	}
	.theme.is-dark .rays line {
		transform: scale(0.1);
	}

	/* half-filled disc — phone only. filled half = currentColor,
	   empty half reads as the page colour through the ring. */
	.disc {
		position: absolute;
		inset: 0;
		display: none;
		border-radius: 50%;
		border: 1.5px solid currentColor;
		background: linear-gradient(90deg, currentColor 0 50%, transparent 50% 100%);
		transition: transform var(--anim);
		will-change: transform;
	}
	.theme.is-dark .disc {
		transform: rotate(180deg);
	}

	/* dev-style label: theme: <word> */
	.label {
		display: inline-flex;
		align-items: baseline;
		gap: 0;
		white-space: nowrap;
	}
	.key {
		opacity: 0.55;
	}
	.colon {
		opacity: 0.55;
		margin-right: 0.45em;
	}

	/* the value swaps with a vertical slide so it reads as a state change */
	.val {
		position: relative;
		display: inline-block;
		overflow: hidden;
		height: 1em;
	}
	.word {
		display: block;
		transition: transform var(--anim);
	}
	.word.from {
		transform: translateY(0);
	}
	.word.to {
		position: absolute;
		inset: 0;
		transform: translateY(100%);
	}
	.theme:hover .word.from {
		transform: translateY(-100%);
	}
	.theme:hover .word.to {
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.theme,
		.orb svg,
		.rays line,
		.word {
			--anim: 0s;
		}
	}

	/* phone: bare ◐ disc only — no border, no text */
	@media (max-width: 640px) {
		.theme {
			border-color: transparent;
			padding: 4px;
			gap: 0;
		}
		.theme:hover {
			border-color: transparent;
		}
		.orb {
			width: 18px;
			height: 18px;
		}
		.orb svg {
			display: none;
		}
		.disc {
			display: block;
		}
		.label {
			display: none;
		}
	}
</style>
