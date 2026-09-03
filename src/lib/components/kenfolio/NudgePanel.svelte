<script lang="ts">
	/**
	 * The bottom-right panel itself: chrome, entry transition, close button.
	 * It holds no policy. NudgeHost decides whether it is open and what goes in
	 * it; this file only knows how to look and how to leave.
	 *
	 * It is deliberately non-modal. A nudge is an aside, not a dialog: it does
	 * not trap focus, does not take focus on open, does not make the page behind
	 * it inert, and does not stop that page being used. So the card is an
	 * <aside>, which carries an implicit role="complementary", rather than a
	 * role="dialog", and it announces politely.
	 *
	 * The outer div is a bare live region that is mounted from first paint and
	 * stays mounted. That is what makes the announcement work at all: a screen
	 * reader announces content appearing inside a live region it was already
	 * watching, and ignores a live region that arrives with its content. It is
	 * not a landmark, so an empty one adds nothing to the landmark list.
	 */
	import { createEventDispatcher, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from '$lib/components/Icon.svelte';

	export let open = false;
	/** names the panel for assistive tech, e.g. "Newsletter" */
	export let label = 'Suggestion';

	const dispatch = createEventDispatcher<{ dismiss: null }>();

	// A slide-up is motion; someone who asked for less of it gets a plain fade.
	let reduced = false;
	onMount(() => {
		try {
			const query = window.matchMedia('(prefers-reduced-motion: reduce)');
			reduced = query.matches;
			const onChange = (e: MediaQueryListEvent) => (reduced = e.matches);
			query.addEventListener('change', onChange);
			return () => query.removeEventListener('change', onChange);
		} catch {
			reduced = false;
		}
	});

	$: enter = reduced
		? { y: 0, duration: 160, easing: cubicOut }
		: { y: 28, duration: 460, easing: cubicOut };
	$: leave = { ...enter, duration: reduced ? 120 : 220 };

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) dispatch('dismiss');
	}
</script>

<svelte:window on:keydown={onKeydown} />

<div class="nudge" aria-live="polite">
	{#if open}
		<aside class="card" aria-label={label} in:fly={enter} out:fly={leave}>
			<button
				class="x"
				type="button"
				aria-label="Dismiss this message"
				on:click={() => dispatch('dismiss')}
			>
				<Icon name="close-circle" size={16} />
			</button>
			<slot />
		</aside>
	{/if}
</div>

<style>
	/* The region is always mounted so the announcement works, so it must never
	   eat a click while it is empty. */
	.nudge {
		position: fixed;
		right: clamp(14px, 2.2vw, 28px);
		bottom: clamp(14px, 2.2vw, 28px);
		z-index: 80;
		pointer-events: none;
	}
	.card {
		position: relative;
		pointer-events: auto;
		width: min(var(--nudge-w, 360px), calc(100vw - 28px));
		box-sizing: border-box;
		padding: 20px 20px 22px;
		border: 1px solid var(--hairline-2);
		border-radius: 16px;
		background: rgba(var(--bg-rgb), 0.9);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
	}
	:global(:root[data-theme='light']) .card {
		box-shadow: 0 18px 44px rgba(14, 17, 15, 0.13);
	}

	.x {
		position: absolute;
		top: 12px;
		right: 12px;
		display: inline-flex;
		padding: 4px;
		background: none;
		border: none;
		border-radius: 999px;
		color: var(--mute);
		cursor: pointer;
		transition: color 0.25s;
	}
	.x:hover {
		color: var(--ink);
	}

	@media (max-width: 560px) {
		.nudge {
			left: 12px;
			right: 12px;
			bottom: 12px;
		}
		.card {
			width: auto;
		}
	}
</style>
