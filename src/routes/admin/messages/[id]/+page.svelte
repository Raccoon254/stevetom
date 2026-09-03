<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const STATUS_COLOR: Record<string, string> = {
		DRAFT: '#6fa89c',
		SENDING: '#ffd166',
		SENT: '#9fe2a0',
		CANCELLED: '#ff5a52'
	};

	let confirmed = false;
	let testing = false;
	let starting = false;

	// Batch loop. The page asks the server for one batch at a time and keeps
	// asking while addresses remain. A batch that fails to move the queue three
	// times running stops the loop rather than hammering the mail API.
	let deliverForm: HTMLFormElement | null = null;
	let auto = false;
	let busy = false;
	let stalls = 0;
	let lastRemaining = -1;

	$: counts = data.counts;
	$: total = data.campaign.recipientCount || Object.values(counts).reduce((a, b) => a + b, 0);
	$: done = counts.SENT + counts.FAILED + counts.SKIPPED;
	$: remaining = counts.QUEUED;
	$: inFlight = counts.SENDING;
	$: percent = total > 0 ? Math.round((done / total) * 100) : 0;
	$: sending = data.campaign.status === 'SENDING';

	onMount(() => {
		if (data.campaign.status === 'SENDING') auto = true;
	});

	function scheduleNext() {
		busy = true;
		setTimeout(() => {
			if (deliverForm) deliverForm.requestSubmit();
			else busy = false;
		}, 400);
	}

	$: if (browser && auto && !busy && sending && remaining > 0 && stalls < 3) scheduleNext();

	const onDeliver: SubmitFunction = () => async ({ update }) => {
		await update({ reset: false });
		if (lastRemaining >= 0 && counts.QUEUED >= lastRemaining) stalls += 1;
		else stalls = 0;
		lastRemaining = counts.QUEUED;
		busy = false;
	};

	function when(value: string | Date | null | undefined): string {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleString('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{data.campaign.subject} · kenTom Admin</title>
</svelte:head>

<a class="back" href="/admin/messages">
	<Icon name="arrow-left4" size={13} /> All messages
</a>

<div class="a-head">
	<div>
		<p class="a-eyebrow">{data.campaign.contactEmail ?? data.campaign.segmentLabel}</p>
		<h1 class="a-title">{data.campaign.subject}</h1>
		<p class="a-sub">
			From {data.sender.name} · {data.sender.email} · created {when(data.campaign.createdAt)}
		</p>
	</div>
	<span class="a-pill" style="color:{STATUS_COLOR[data.campaign.status] ?? '#6fa89c'}">
		{data.campaign.status}
	</span>
</div>

{#if form?.error}
	<div class="a-card notice danger" in:fade>
		<Icon name="danger" size={18} />
		<p>{form.error}</p>
	</div>
{:else if form?.message}
	<div class="a-card notice ok" in:fade>
		<Icon name="tick-circle" size={18} />
		<p>{form.message}</p>
	</div>
{/if}

<div class="split">
	<div class="pane">
		<section class="block">
			<h2 class="a-section-title"><Icon name="profile-2user" size={14} /> Recipients</h2>
			<div class="a-card facts">
				<div><dt>List</dt><dd>{data.campaign.contactEmail ?? data.campaign.segmentLabel}</dd></div>
				<div><dt>Frozen at</dt><dd>{total} {total === 1 ? 'address' : 'addresses'}</dd></div>
				<div>
					<dt>Unsubscribe link</dt>
					<dd>{data.campaign.includeUnsubscribe ? 'On every copy' : 'Not included'}</dd>
				</div>
				<div><dt>Sent</dt><dd>{counts.SENT}</dd></div>
				<div><dt>Failed</dt><dd>{counts.FAILED}</dd></div>
				<div><dt>Queued</dt><dd>{counts.QUEUED}</dd></div>
			</div>
			{#if data.sample.length}
				<p class="sample">
					{#each data.sample as s, i (s.email)}<span
							class="addr">{s.email}</span
						>{i < data.sample.length - 1 ? ' ' : ''}{/each}
					{#if total > data.sample.length}
						<span class="more">and {total - data.sample.length} more</span>
					{/if}
				</p>
			{/if}
			{#if !data.campaign.includeUnsubscribe}
				<p class="hint">
					This is a one-to-one message to someone who is not on the newsletter list, so no
					unsubscribe link is added. Every segment send carries one.
				</p>
			{/if}
		</section>

		{#if data.campaign.status === 'DRAFT'}
			<section class="block">
				<h2 class="a-section-title"><Icon name="direct-send" size={14} /> Step 1 · Test send</h2>
				<div class="a-card step" class:done={!!data.campaign.testSentAt}>
					<p class="step-copy">
						{#if data.campaign.testSentAt}
							Test sent to {data.notifyTo} on {when(data.campaign.testSentAt)}. Read it before you
							send for real.
						{:else}
							Send this to {data.notifyTo} first. It is the only honest preview of an email, and the
							real send stays locked until it has been done.
						{/if}
					</p>
					<form
						method="POST"
						action="?/test"
						use:enhance={() => {
							testing = true;
							return async ({ update }) => {
								await update({ reset: false });
								testing = false;
							};
						}}
					>
						<button class="a-btn" type="submit" disabled={testing}>
							<Icon name="direct-send" size={14} />
							{testing ? 'Sending' : data.campaign.testSentAt ? 'Send another test' : 'Send test'}
						</button>
					</form>
				</div>
			</section>

			<section class="block">
				<h2 class="a-section-title"><Icon name="send" size={14} /> Step 2 · Confirm and send</h2>
				<div class="a-card step confirm" class:locked={!data.campaign.testSentAt}>
					{#if !data.campaign.testSentAt}
						<p class="step-copy">Locked until a test has been sent.</p>
					{:else}
						<p class="count-line">
							This sends to <strong>{remaining}</strong>
							{remaining === 1 ? 'person' : 'people'}.
						</p>
						<p class="step-copy">
							{data.campaign.contactEmail
								? 'One address, chosen by you.'
								: `Everyone in "${data.campaign.segmentLabel}" as the list stood when this draft was saved. Anyone who had unsubscribed was already excluded.`}
							Delivery runs {data.batchSize} at a time and can be paused and resumed. It cannot be
							undone.
						</p>
						<form
							method="POST"
							action="?/start"
							use:enhance={() => {
								starting = true;
								return async ({ update }) => {
									await update({ reset: false });
									starting = false;
									auto = true;
								};
							}}
						>
							<label class="ack">
								<input type="checkbox" name="confirm" bind:checked={confirmed} />
								<span>
									I have read the test and I want to email {remaining}
									{remaining === 1 ? 'person' : 'people'}.
								</span>
							</label>
							<button
								class="a-btn a-btn--solid"
								type="submit"
								disabled={!confirmed || starting || remaining === 0}
							>
								<Icon name="send" size={14} />
								{starting
									? 'Starting'
									: `Send to ${remaining} ${remaining === 1 ? 'person' : 'people'}`}
							</button>
						</form>
					{/if}
				</div>
			</section>
		{/if}

		{#if sending || data.campaign.status === 'SENT'}
			<section class="block">
				<h2 class="a-section-title"><Icon name="activity" size={14} /> Delivery</h2>
				<div class="a-card step">
					<div class="bar" aria-hidden="true">
						<span style="width:{percent}%"></span>
					</div>
					<p class="progress-line">
						{counts.SENT} sent
						{#if counts.FAILED}· {counts.FAILED} failed{/if}
						{#if remaining}· {remaining} queued{/if}
						{#if inFlight}· {inFlight} in flight{/if}
						{#if counts.SKIPPED}· {counts.SKIPPED} skipped{/if}
						· {percent}%
					</p>

					{#if sending}
						<div class="row-actions">
							<form
								bind:this={deliverForm}
								method="POST"
								action="?/deliver"
								use:enhance={onDeliver}
							>
								<button class="a-btn" type="submit" disabled={busy || remaining === 0}>
									<Icon name="send" size={14} />
									{busy ? 'Sending a batch' : 'Send the next batch'}
								</button>
							</form>
							{#if browser && remaining > 0}
								<button class="a-btn" type="button" on:click={() => (auto = !auto)}>
									{auto ? 'Pause' : 'Resume automatically'}
								</button>
							{/if}
							<form method="POST" action="?/cancel" use:enhance>
								<button class="a-btn a-btn--danger" type="submit">
									<Icon name="close-circle" size={14} /> Stop
								</button>
							</form>
						</div>
						{#if stalls >= 3}
							<p class="hint danger-text">
								Three batches in a row moved nothing. Automatic sending has stopped. Check the
								failures below before continuing.
							</p>
						{:else if !browser}
							<p class="hint">
								Each press sends up to {data.batchSize} more. The send is resumable: come back any
								time and continue where it stopped.
							</p>
						{/if}
					{:else}
						<p class="hint">
							Completed {when(data.campaign.completedAt)}.
						</p>
					{/if}
				</div>
			</section>
		{/if}

		{#if data.staleUnconfirmed > 0}
			<section class="block">
				<h2 class="a-section-title"><Icon name="danger" size={14} /> Unconfirmed</h2>
				<div class="a-card step">
					<p class="step-copy">
						{data.staleUnconfirmed}
						{data.staleUnconfirmed === 1 ? 'address was' : 'addresses were'} claimed by a batch that
						never reported back. We cannot tell whether the mail was accepted. Requeueing may send
						a second copy to someone who already has it.
					</p>
					<form method="POST" action="?/retryUnconfirmed" use:enhance>
						<button class="a-btn a-btn--danger" type="submit">
							Requeue anyway, accepting possible duplicates
						</button>
					</form>
				</div>
			</section>
		{/if}

		{#if data.failures.length}
			<section class="block">
				<h2 class="a-section-title"><Icon name="close-circle" size={14} /> Failures</h2>
				<ul class="fails">
					{#each data.failures as f (f.email)}
						<li>
							<span class="addr">{f.email}</span>
							<span class="why">{f.error ?? 'Unknown error'}</span>
						</li>
					{/each}
				</ul>
				<form method="POST" action="?/retryFailed" use:enhance>
					<button class="a-btn" type="submit">Requeue the failures</button>
				</form>
			</section>
		{/if}

		{#if data.campaign.status === 'DRAFT' || data.campaign.status === 'CANCELLED'}
			<form
				method="POST"
				action="?/remove"
				class="danger-zone"
				on:submit={(event) => {
					if (browser && !confirm('Delete this draft and its recipient list?')) {
						event.preventDefault();
					}
				}}
			>
				<button class="a-btn a-btn--danger" type="submit">
					<Icon name="trash" size={14} /> Delete this draft
				</button>
			</form>
		{/if}
	</div>

	<div class="pane preview-pane">
		<h2 class="a-section-title"><Icon name="eye" size={14} /> The exact email</h2>
		<iframe
			class="preview"
			title="Rendered email"
			sandbox=""
			srcdoc={data.previewHtml}
		></iframe>
		<p class="hint">
			Rendered for {data.previewFor}, including that person's own unsubscribe link.
		</p>
	</div>
</div>

<style>
	.back {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 18px;
	}
	.back:hover {
		color: var(--ink);
	}
	.notice {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px 18px;
		margin-bottom: 18px;
		color: var(--spark);
	}
	.notice.danger {
		color: var(--danger);
	}
	.notice.ok {
		color: #9fe2a0;
	}
	.notice p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
	}

	.split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
		gap: clamp(18px, 3vw, 32px);
		align-items: start;
	}
	.pane {
		min-width: 0;
	}
	.block {
		margin-bottom: clamp(22px, 4vh, 34px);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 16px;
		padding: 18px 20px;
	}
	.facts dt {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 5px;
	}
	.facts dd {
		margin: 0;
		font-size: 14px;
		color: var(--ink);
	}
	.sample {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 12px 0 0;
	}
	.addr {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute);
		border: 1px solid var(--hairline);
		border-radius: 999px;
		padding: 4px 9px;
	}
	.more {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		align-self: center;
	}

	.step {
		padding: 18px 20px;
	}
	.step.done {
		border-color: rgba(159, 226, 160, 0.4);
	}
	.step.locked {
		opacity: 0.6;
	}
	.step-copy {
		margin: 0 0 14px;
		font-size: 13.5px;
		line-height: 1.6;
		color: var(--ink-2);
	}
	.count-line {
		margin: 0 0 10px;
		font-family: 'Google Sans Display', var(--sans);
		font-size: 20px;
		color: var(--ink);
	}
	.count-line strong {
		color: var(--spark);
		font-weight: 500;
	}
	.ack {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin-bottom: 14px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink-2);
		cursor: pointer;
	}
	.ack input {
		margin-top: 2px;
		accent-color: var(--spark);
	}

	.bar {
		height: 6px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		overflow: hidden;
		margin-bottom: 12px;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--spark);
		transition: width 0.4s ease;
	}
	.progress-line {
		margin: 0 0 14px;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.row-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.fails {
		list-style: none;
		margin: 0 0 14px;
		padding: 0;
		display: grid;
		gap: 6px;
	}
	.fails li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		padding: 9px 12px;
		border: 1px solid var(--hairline);
		border-radius: 9px;
	}
	.why {
		font-size: 12px;
		color: var(--danger);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.hint {
		font-size: 12px;
		line-height: 1.55;
		color: var(--mute);
		margin: 12px 0 0;
	}
	.hint.danger-text {
		color: var(--danger);
	}
	.danger-zone {
		padding-top: 18px;
		border-top: 1px solid var(--hairline);
	}

	.preview-pane {
		position: sticky;
		top: 0;
	}
	.preview {
		width: 100%;
		height: min(70vh, 720px);
		border: 1px solid var(--hairline);
		border-radius: 12px;
		background: #fff;
	}

	@media (max-width: 1000px) {
		.split {
			grid-template-columns: 1fr;
		}
		.preview-pane {
			position: static;
		}
	}
</style>
