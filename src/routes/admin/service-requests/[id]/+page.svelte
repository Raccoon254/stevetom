<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { STATUSES, statusColor, statusLabel } from '../status';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let replyText = '';
	let sending = false;
	let movingTo = '';

	$: r = data.request;
	$: answered = data.replies.length > 0;

	const DELIVERY_COLOR: Record<string, string> = {
		QUEUED: '#6fa89c',
		SENT: '#7ecbff',
		DELIVERED: '#9fe2a0',
		OPENED: '#9fe2a0',
		CLICKED: '#9fe2a0',
		BOUNCED: '#ff5a52',
		COMPLAINED: '#ff5a52',
		FAILED: '#ff5a52'
	};

	/**
	 * The button is disabled while a send is in flight, which is the first of
	 * the three guards on a double-click. The server holds the other two.
	 */
	const onReply: SubmitFunction = () => {
		sending = true;
		return async ({ result, update }) => {
			await update({ reset: false });
			// Only a send that actually went out clears the box. A submission the
			// server refused as a duplicate leaves the text where it is.
			if (result.type === 'success' && (result.data as { sent?: boolean } | undefined)?.sent) {
				replyText = '';
			}
			sending = false;
		};
	};

	const onStatus: SubmitFunction = ({ formData }) => {
		movingTo = String(formData.get('status') ?? '');
		return async ({ update }) => {
			await update({ reset: false });
			movingTo = '';
		};
	};

	function when(value: Date | string | null | undefined): string {
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

	function money(value: number | null): string {
		return value === null ? '' : value.toLocaleString('en');
	}
</script>

<svelte:head>
	<title>{r.projectTitle} · kenTom Admin</title>
</svelte:head>

<a class="back" href="/admin/service-requests">
	<Icon name="arrow-left4" size={13} /> All requests
</a>

<div class="a-head">
	<div class="head-id">
		<img class="a-avatar" src={avatar(r.clientEmail || r.clientName)} alt="" width="52" height="52" />
		<div>
			<p class="a-eyebrow">{r.service?.name ?? 'Request'} · {when(r.createdAt)}</p>
			<h1 class="a-title">{r.projectTitle}</h1>
			<p class="a-sub">{r.clientName} · {r.clientEmail}</p>
		</div>
	</div>
	<div class="head-marks">
		<span class="a-pill" style="color:{statusColor(r.status)}">{statusLabel(r.status)}</span>
		{#if answered}
			<span class="mark answered"><Icon name="tick-circle" size={13} /> Answered</span>
		{:else}
			<span class="mark unanswered">Unanswered</span>
		{/if}
	</div>
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
			<h2 class="a-section-title"><Icon name="user" size={14} /> Client</h2>
			<div class="a-card facts">
				<div><dt>Name</dt><dd>{r.clientName}</dd></div>
				<div><dt>Email</dt><dd><a href="mailto:{r.clientEmail}">{r.clientEmail}</a></dd></div>
				{#if r.clientPhone}
					<div><dt>Phone</dt><dd><a href="tel:{r.clientPhone}">{r.clientPhone}</a></dd></div>
				{/if}
				{#if r.company}
					<div><dt>Company</dt><dd>{r.company}</dd></div>
				{/if}
			</div>
			<div class="row-actions">
				<a class="a-btn" href="mailto:{r.clientEmail}"><Icon name="sms" size={14} /> Email</a>
				{#if r.clientPhone}
					<a class="a-btn" href="tel:{r.clientPhone}"><Icon name="call" size={14} /> Call</a>
				{/if}
				<a class="a-btn" href="/admin/contacts/{encodeURIComponent(r.clientEmail)}">
					<Icon name="profile-2user" size={14} /> Contact record
				</a>
			</div>
		</section>

		<section class="block">
			<h2 class="a-section-title"><Icon name="box" size={14} /> Project</h2>
			<div class="a-card facts">
				<div><dt>Service</dt><dd>{r.service?.name ?? 'None'}</dd></div>
				<div><dt>Budget</dt><dd>{r.budget === null ? 'Not given' : money(r.budget)}</dd></div>
				<div><dt>Timeline</dt><dd>{r.timeline || 'Not given'}</dd></div>
				<div><dt>Submitted</dt><dd>{when(r.createdAt)}</dd></div>
				<div><dt>Last change</dt><dd>{when(r.updatedAt)}</dd></div>
				<div><dt>Request ID</dt><dd class="mono">{r.id}</dd></div>
			</div>
			<div class="a-card prose">
				<h3>Description</h3>
				<p>{r.description}</p>
				{#if r.requirements}
					<h3>Requirements</h3>
					<p>{r.requirements}</p>
				{/if}
			</div>
		</section>

		{#if r.notes}
			<section class="block">
				<h2 class="a-section-title"><Icon name="edit" size={14} /> Internal notes</h2>
				<div class="a-card prose"><p>{r.notes}</p></div>
			</section>
		{/if}

		<section class="block">
			<h2 class="a-section-title"><Icon name="flag" size={14} /> Status</h2>
			<div class="a-card step">
				<p class="current">
					Current
					<span class="a-pill" style="color:{statusColor(r.status)}">{statusLabel(r.status)}</span>
				</p>
				<div class="status-grid">
					{#each STATUSES.filter((s) => s !== r.status) as s (s)}
						<form method="POST" action="?/status" use:enhance={onStatus}>
							<input type="hidden" name="status" value={s} />
							<button class="a-btn" type="submit" style="color:{statusColor(s)}" disabled={!!movingTo}>
								{movingTo === s ? 'Moving' : statusLabel(s)}
							</button>
						</form>
					{/each}
				</div>
			</div>
		</section>

		<form
			method="POST"
			action="?/archive"
			class="danger-zone"
			on:submit={(event) => {
				if (browser && !confirm(`Archive the request from ${r.clientName}? You can restore it later.`)) {
					event.preventDefault();
				}
			}}
		>
			<button class="a-btn a-btn--danger" type="submit">
				<Icon name="archive" size={14} /> Archive this request
			</button>
			<p class="hint">
				Archiving is a soft delete. The request moves to the archived list and can be restored from
				there. Nothing is destroyed.
			</p>
		</form>
	</div>

	<div class="pane">
		<section class="block">
			<h2 class="a-section-title"><Icon name="sms" size={14} /> Reply to client</h2>
			<form method="POST" action="?/reply" class="a-card composer" use:enhance={onReply}>
				<input type="hidden" name="nonce" value={data.nonce} />
				<textarea
					class="a-textarea reply"
					name="message"
					bind:value={replyText}
					placeholder="Write a reply. It is emailed to {r.clientEmail} from KenTom HQ."
				></textarea>
				<div class="composer-foot">
					<p class="hint tight">
						Sent as "Re: {r.projectTitle}". Blank lines become paragraphs.
					</p>
					<button class="a-btn a-btn--solid" type="submit" disabled={sending || !replyText.trim()}>
						<Icon name="send" size={14} />
						{sending ? 'Sending' : 'Send reply'}
					</button>
				</div>
			</form>
		</section>

		<section class="block">
			<h2 class="a-section-title"><Icon name="direct-send" size={14} /> Replies</h2>
			{#if data.replies.length === 0}
				<div class="a-card a-empty small">
					<p>No reply has been sent yet.</p>
				</div>
			{:else}
				<ul class="list">
					{#each data.replies as reply (reply.id)}
						<li>
							<div class="li-main">
								<p class="li-title">Replied to {r.clientEmail}</p>
								<p class="li-meta">
									<span>{reply.actor}</span>
									{#if reply.delivery}
										<span class="dot">·</span>
										<span style="color:{DELIVERY_COLOR[reply.delivery] ?? 'var(--mute)'}">
											{reply.delivery.toLowerCase()}
										</span>
									{/if}
								</p>
							</div>
							<time>{when(reply.at)}</time>
						</li>
					{/each}
				</ul>
				<p class="hint">
					The wording of each reply is not kept in the database, only the fact that it went out and
					what the mail service did with it.
				</p>
			{/if}
		</section>

		<section class="block">
			<h2 class="a-section-title"><Icon name="activity" size={14} /> Activity</h2>
			{#if data.trail.length === 0}
				<div class="a-card a-empty small"><p>Nothing logged for this request.</p></div>
			{:else}
				<ul class="list">
					{#each data.trail as entry (entry.id)}
						<li>
							<div class="li-main">
								<p class="li-title">{entry.summary}</p>
								<p class="li-meta">
									<span>{entry.action}</span>
									<span class="dot">·</span>
									<span>{entry.actor}</span>
								</p>
							</div>
							<time>{when(entry.createdAt)}</time>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
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
	.head-id {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		min-width: 0;
	}
	.head-marks {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.mark {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.mark.unanswered {
		color: var(--spark);
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
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
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
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
		word-break: break-word;
	}
	.facts dd a:hover {
		color: var(--spark);
	}
	.facts dd.mono {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute);
	}

	.prose {
		padding: 18px 20px;
		margin-top: 10px;
	}
	.prose h3 {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 6px;
		font-weight: 400;
	}
	.prose h3:not(:first-child) {
		margin-top: 18px;
	}
	.prose p {
		margin: 0;
		font-size: 14px;
		line-height: 1.65;
		color: var(--ink-2);
		white-space: pre-wrap;
	}

	.row-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 12px;
	}

	.step {
		padding: 18px 20px;
	}
	.current {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 14px;
	}
	.status-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.composer {
		padding: 18px 20px;
	}
	/* Roughly twice the old popup's box, and draggable taller from the corner.
	   Vertical only: a horizontal drag would push the column out of the grid. */
	.reply {
		min-height: 240px;
		resize: vertical;
	}
	.composer-foot {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 14px;
		flex-wrap: wrap;
		margin-top: 12px;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 2px;
	}
	.list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 12px 14px;
		border: 1px solid transparent;
		border-radius: 10px;
		transition:
			background 0.18s ease,
			border-color 0.18s ease;
	}
	.list li:hover {
		background: rgba(255, 255, 255, 0.025);
		border-color: var(--hairline);
	}
	.li-main {
		min-width: 0;
	}
	.li-title {
		margin: 0;
		font-size: 13.5px;
		color: var(--ink);
		line-height: 1.4;
	}
	.li-meta {
		margin: 3px 0 0;
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.dot {
		color: var(--mute-2);
	}
	.list time {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}

	.hint {
		font-size: 12px;
		line-height: 1.55;
		color: var(--mute);
		margin: 12px 0 0;
	}
	.hint.tight {
		margin: 0;
		max-width: 42ch;
	}
	.danger-zone {
		padding-top: 18px;
		border-top: 1px solid var(--hairline);
	}
	.a-empty.small {
		padding: 26px 20px;
	}
	.a-empty.small p {
		margin: 0;
		font-size: 13.5px;
		color: var(--mute);
	}

	@media (max-width: 1000px) {
		.split {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 560px) {
		.list time {
			display: none;
		}
	}
</style>
