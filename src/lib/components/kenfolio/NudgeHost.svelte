<script lang="ts">
	/**
	 * The controller. Mounted once, in the KenFolio layout.
	 *
	 * It counts pages in the visit, waits for the engagement rule to be met, asks
	 * $lib/nudges which panel is allowed to appear, renders it, and reports what
	 * happened through the existing first-party analytics helper. All the policy
	 * lives in $lib/nudges.ts; this file is the wiring.
	 *
	 * The newsletter panel embeds the site's one NewsletterSignup component
	 * rather than posting to /api/verify/start itself, so there is a single
	 * signup path and a single place where that flow can change.
	 */
	import { afterNavigate } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import NewsletterSignup from '$lib/components/kenfolio/NewsletterSignup.svelte';
	import NudgePanel from '$lib/components/kenfolio/NudgePanel.svelte';
	import { trackEvent } from '$lib/analytics';
	import {
		blockedPath,
		chooseNudge,
		eventName,
		markVisitSpent,
		notePageView,
		recordAction,
		recordDismissal,
		visitSpent,
		PAGES_BEFORE_NUDGE,
		SETTLE_MS,
		type Nudge
	} from '$lib/nudges';

	let current: Nudge | null = null;
	let open = false;
	let path = '';
	let acted = false;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function clearTimer() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function reveal() {
		timer = null;
		if (open || visitSpent()) return;
		const nudge = chooseNudge(path);
		if (!nudge) return;
		current = nudge;
		acted = false;
		open = true;
		markVisitSpent();
		trackEvent(eventName(nudge.id, 'shown'));
	}

	/** The X, or Escape. Both mean the same thing and both are remembered. */
	function dismiss() {
		if (!open || !current) return;
		open = false;
		recordDismissal(current.id);
		trackEvent(eventName(current.id, 'dismissed'));
	}

	/** Followed the link, or started the embedded signup. Recorded once. */
	function act(id: Nudge['id']) {
		if (acted) return;
		acted = true;
		recordAction(id);
		trackEvent(eventName(id, 'acted'));
	}

	function follow() {
		if (!current) return;
		act(current.id);
		open = false; // the destination is the answer; the panel has nothing left to say
	}

	/**
	 * NewsletterSignup exposes no completion callback and is not ours to change,
	 * so the submit event bubbling out of its form is the signal we have. It
	 * means "this person is dealing with the newsletter", which is enough to stop
	 * asking them. It is not proof of a completed subscription; see the note on
	 * subscriber state in $lib/nudges.ts.
	 */
	function watchSignup(node: HTMLElement) {
		const onSubmit = () => act('newsletter');
		node.addEventListener('submit', onSubmit);
		return { destroy: () => node.removeEventListener('submit', onSubmit) };
	}

	afterNavigate(({ to }) => {
		path = to?.url.pathname ?? '';
		clearTimer();

		// An open panel follows the visitor across a client-side navigation, but
		// only while it still makes sense on the page they landed on. Closing it
		// here is not a dismissal, so nothing is written down.
		if (open && current && (blockedPath(path) || current.redundant(path))) open = false;
		if (open || blockedPath(path)) return;

		// The engagement rule: a second page in this visit, then a short settle.
		// The count is incremented for every page, including blocked ones, so the
		// rule stays honest about how much of the site has been seen.
		const pages = notePageView();
		if (pages < PAGES_BEFORE_NUDGE || visitSpent()) return;
		timer = setTimeout(reveal, SETTLE_MS);
	});

	onDestroy(clearTimer);
</script>

<!-- Always mounted: the live region inside has to pre-exist the content it announces. -->
<NudgePanel
	{open}
	label={current?.label ?? 'Suggestion'}
	on:dismiss={dismiss}
	--nudge-w={current?.kind === 'newsletter' ? '400px' : '360px'}
>
	{#if current}
		{#if current.kind === 'newsletter'}
			<div class="nl-slot" use:watchSignup>
				<NewsletterSignup framed={false} />
			</div>
		{:else}
			<p class="eyebrow"><Icon name={current.icon} size={12} /> {current.eyebrow}</p>
			<h2>{current.title}</h2>
			<p class="body">{current.body}</p>
			<div class="actions">
				<a class="pill pill--solid" href={current.href} on:click={follow}>
					<span>{current.cta}</span>
					<span class="ar" aria-hidden="true"><Icon name="arrow-right4" size={13} /></span>
				</a>
				{#if current.alt}
					<a class="alt" href={current.alt.href} on:click={follow}>{current.alt.label}</a>
				{/if}
			</div>
		{/if}
	{/if}
</NudgePanel>

<style>
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 12px;
	}
	h2 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: 19px;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--ink);
		/* clear of the close button */
		margin: 0 26px 8px 0;
		text-wrap: balance;
	}
	.body {
		font-size: 13px;
		line-height: 1.55;
		color: var(--ink-2);
		margin: 0 0 16px;
		text-wrap: pretty;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}
	.alt {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
		transition: color 0.2s;
	}
	.alt:hover {
		color: var(--spark);
	}

	/*
	 * NewsletterSignup is built for a full-width page section. Nothing about it
	 * changes here; it is only scaled down to panel size. The doubled class is
	 * for specificity, so these win over the component's own scoped rules
	 * regardless of the order the two stylesheets land in.
	 */
	.nl-slot.nl-slot :global(.nl h2) {
		font-size: 19px;
		margin-right: 26px;
		margin-bottom: 8px;
	}
	.nl-slot.nl-slot :global(.nl-note) {
		font-size: 13px;
		margin-bottom: 16px;
	}
	.nl-slot.nl-slot :global(.nl-label) {
		margin-bottom: 12px;
	}
	.nl-slot.nl-slot :global(.otp) {
		gap: 8px;
	}
	.nl-slot.nl-slot :global(.otp input) {
		width: 44px;
		height: 52px;
		font-size: 21px;
		border-radius: 10px;
	}
	.nl-slot.nl-slot :global(.row) {
		gap: 10px;
	}
	.nl-slot.nl-slot :global(.row input) {
		min-width: 0;
	}
</style>
