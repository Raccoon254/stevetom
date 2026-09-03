<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';
	import { renderBodyHtml } from '$lib/emailMarkdown';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let subject = form?.values?.subject ?? '';
	let body = form?.values?.body ?? '';
	let from = form?.values?.from || data.defaultSender;
	let target = form?.values?.target || (data.contact ? 'contact' : 'subscribers');
	let contactEmail = form?.values?.contactEmail || data.contact?.email || data.requestedTo || '';
	let acknowledgeOptOut = false;

	// The preview renders with the same function the sender uses, so it cannot
	// drift from what goes out. It is debounced only to keep the iframe from
	// reloading on every keystroke.
	let previewBody = '';
	let timer: ReturnType<typeof setTimeout> | undefined;
	const schedulePreview = (source: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => (previewBody = renderBodyHtml(source)), 220);
	};
	$: schedulePreview(body);
	onDestroy(() => clearTimeout(timer));

	$: selectedSegment = data.segments.find((s) => s.key === target) ?? null;
	$: segmentCount = selectedSegment && data.counts ? data.counts[selectedSegment.key] : null;
	$: optedOut = target === 'contact' && data.contact?.opted_out === true;

	$: srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:26px 20px;background:#fff">
<div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;color:#111">
<h1 style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:24px;line-height:1.3;font-weight:600;color:#111">${subject
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')}</h1>
${previewBody || '<p style="font-family:Georgia,serif;color:#999;font-size:15px">Nothing written yet.</p>'}
</div></body></html>`;
</script>

<svelte:head>
	<title>New message · kenTom Admin</title>
</svelte:head>

<a class="back" href="/admin/messages">
	<Icon name="arrow-left4" size={13} /> All messages
</a>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Outbound</p>
		<h1 class="a-title">New message</h1>
		<p class="a-sub">
			Saving this creates a draft and freezes its recipient list. Nothing is sent from this screen.
		</p>
	</div>
</div>

{#if form?.error}
	<div class="a-card notice danger" in:fade>
		<Icon name="danger" size={18} />
		<p>{form.error}</p>
	</div>
{/if}
{#if data.unavailable}
	<div class="a-card notice" in:fade>
		<Icon name="danger" size={18} />
		<p>{data.unavailable}</p>
	</div>
{:else if data.missing.length}
	<div class="a-card notice" in:fade>
		<Icon name="danger" size={18} />
		<p>
			These sources are not in this database yet, so their segments cannot be used: {data.missing.join(
				', '
			)}.
		</p>
	</div>
{/if}

<form method="POST" class="split">
	<div class="pane">
		<div class="a-field">
			<label class="a-label" for="from">From</label>
			<select class="a-select" id="from" name="from" bind:value={from}>
				{#each data.senders as sender (sender.key)}
					<option value={sender.key}>{sender.name} · {sender.email}</option>
				{/each}
			</select>
		</div>

		<div class="a-field">
			<label class="a-label" for="target">Send to</label>
			<select class="a-select" id="target" name="target" bind:value={target}>
				<option value="contact">One contact</option>
				{#each data.segments as seg (seg.key)}
					<option value={seg.key} disabled={!seg.available}>
						{seg.label}{seg.available
							? data.counts
								? ` · ${data.counts[seg.key]}`
								: ''
							: ' · table not migrated'}
					</option>
				{/each}
			</select>
		</div>

		{#if target === 'contact'}
			<div class="a-field">
				<label class="a-label" for="contactEmail">Contact address</label>
				<input
					class="a-input"
					id="contactEmail"
					name="contactEmail"
					type="email"
					bind:value={contactEmail}
					placeholder="name@example.com"
					autocomplete="off"
				/>
				<p class="field-note">
					Must be an address already in Contacts. One-to-one messages are not bulk mail and do not
					use a segment.
				</p>
			</div>

			{#if data.contact}
				<div class="a-card who">
					<img class="a-avatar" src={avatar(data.contact.email)} alt="" width="36" height="36" />
					<div>
						<span class="who-name">{data.contact.name || data.contact.email}</span>
						<span class="who-meta">
							{data.contact.email}{data.contact.org ? ` · ${data.contact.org}` : ''}
						</span>
					</div>
				</div>
			{/if}

			{#if optedOut}
				<label class="ack">
					<input type="checkbox" name="acknowledgeOptOut" bind:checked={acknowledgeOptOut} />
					<span>
						This person unsubscribed from the newsletter. I confirm this is a direct, one-to-one
						reply and not marketing.
					</span>
				</label>
			{/if}
		{:else if selectedSegment}
			<div class="a-card seg">
				<p class="seg-desc">{selectedSegment.description}</p>
				<p class="seg-count">
					{#if segmentCount === null}
						Recipient count unavailable.
					{:else}
						{segmentCount}
						{segmentCount === 1 ? 'recipient' : 'recipients'} right now.
					{/if}
				</p>
				<p class="seg-note">
					Anyone who has unsubscribed from the newsletter is excluded from this list, whatever else
					they are. Every recipient gets a working unsubscribe link. The list is frozen when you
					save the draft, and one message can hold at most {data.maxRecipients} recipients.
				</p>
			</div>
		{/if}

		<div class="a-field">
			<label class="a-label" for="subject">Subject</label>
			<input
				class="a-input"
				id="subject"
				name="subject"
				bind:value={subject}
				maxlength="200"
				placeholder="What the message is about"
			/>
		</div>

		<div class="a-field">
			<label class="a-label" for="body">Body</label>
			<textarea
				class="a-textarea body"
				id="body"
				name="body"
				bind:value={body}
				placeholder="Markdown. Headings, lists, links, bold and italic. Raw HTML is shown as text, never rendered."
			></textarea>
			<p class="field-note">
				Markdown is rendered to the kenTom email template and sanitised: only a fixed set of tags is
				produced and any HTML you type comes out as visible text.
			</p>
		</div>

		<div class="actions">
			<button class="a-btn a-btn--solid" type="submit" disabled={optedOut && !acknowledgeOptOut}>
				<Icon name="arrow-right4" size={14} /> Save draft and review
			</button>
			<a class="a-btn" href="/admin/messages">Cancel</a>
		</div>
	</div>

	<div class="pane preview-pane">
		<h2 class="a-section-title"><Icon name="eye" size={14} /> Live preview</h2>
		<iframe class="preview" title="Message preview" sandbox="" {srcdoc}></iframe>
		<p class="field-note">
			The body exactly as it will be rendered. The kenTom header, footer and unsubscribe line are
			added by the template: the complete email is shown on the review step and in the test send.
		</p>
	</div>
</form>

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
	.notice p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
	}

	.split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: clamp(18px, 3vw, 32px);
		align-items: start;
	}
	.pane {
		min-width: 0;
	}
	.field-note {
		font-size: 12px;
		line-height: 1.5;
		color: var(--mute);
		margin: 2px 0 0;
	}
	.body {
		min-height: 320px;
		font-family: var(--mono);
		font-size: 13px;
		line-height: 1.65;
	}

	.who {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		margin-bottom: 18px;
	}
	.who-name {
		display: block;
		font-size: 14px;
		color: var(--ink);
	}
	.who-meta {
		display: block;
		font-size: 12px;
		color: var(--mute);
	}
	.seg {
		padding: 16px 18px;
		margin-bottom: 18px;
	}
	.seg-desc {
		margin: 0 0 8px;
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.seg-count {
		margin: 0 0 10px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--spark);
	}
	.seg-note {
		margin: 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--mute);
	}
	.ack {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 14px 16px;
		margin-bottom: 18px;
		border: 1px solid var(--danger);
		border-radius: 12px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink-2);
		cursor: pointer;
	}
	.ack input {
		margin-top: 2px;
		accent-color: var(--spark);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 8px;
	}

	.preview-pane {
		position: sticky;
		top: 0;
	}
	.preview {
		width: 100%;
		height: min(62vh, 640px);
		border: 1px solid var(--hairline);
		border-radius: 12px;
		background: #fff;
		margin-bottom: 10px;
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
