<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';
	import { STATUSES, statusColor, statusLabel } from './status';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: unanswered = data.requests.filter((r) => !r.answered).length;
	$: filtered = !!(data.q || data.status);

	function viewHref(view: 'active' | 'archived'): string {
		const params = new URLSearchParams();
		if (view === 'archived') params.set('view', 'archived');
		if (data.status) params.set('status', data.status);
		if (data.q) params.set('q', data.q);
		const qs = params.toString();
		return '/admin/service-requests' + (qs ? `?${qs}` : '');
	}

	const formatDate = (d: Date | string) => new Date(d).toLocaleDateString();

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
</script>

<svelte:head>
	<title>Requests · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Inbox</p>
		<h1 class="a-title">Service Requests</h1>
		<p class="a-sub">
			{#if data.view === 'archived'}
				{data.counts.archived}
				{data.counts.archived === 1 ? 'request has' : 'requests have'} been archived. They are never destroyed.
			{:else}
				{data.counts.active} active {data.counts.active === 1 ? 'request' : 'requests'}{#if unanswered}<span
						class="unanswered-count">, {unanswered} unanswered</span
					>{/if}.
			{/if}
		</p>
	</div>
	<div class="controls">
		<div class="vtoggle">
			<a class:on={data.view === 'active'} href={viewHref('active')}>Active</a>
			<a class:on={data.view === 'archived'} href={viewHref('archived')}>Archived</a>
		</div>
		<!-- A plain GET form: the filters live in the URL, so they survive a
		     reload, a bookmark and a browser with no JavaScript. -->
		<form class="filters" method="GET" data-sveltekit-keepfocus data-sveltekit-replacestate>
			{#if data.view === 'archived'}
				<input type="hidden" name="view" value="archived" />
			{/if}
			<label class="search">
				<Icon name="search-normal" size={14} />
				<input
					class="a-input"
					type="search"
					name="q"
					value={data.q}
					placeholder="Name, email, company, project"
					aria-label="Search requests"
				/>
			</label>
			<select
				class="a-select filter"
				name="status"
				aria-label="Filter by status"
				on:change={(event) => event.currentTarget.form?.requestSubmit()}
			>
				<option value="" selected={data.status === ''}>All statuses</option>
				{#each STATUSES as s (s)}
					<option value={s} selected={data.status === s}>{statusLabel(s)}</option>
				{/each}
			</select>
			<button class="a-btn" type="submit">Search</button>
		</form>
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

{#if data.requests.length === 0}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="messages" size={30} /></div>
		{#if filtered}
			<h3>Nothing matches</h3>
			<p>
				No {data.view === 'archived' ? 'archived' : 'active'} request matches that search or status.
				<a href={viewHref(data.view)}>Clear the filters</a> to see them all.
			</p>
		{:else if data.view === 'archived'}
			<h3>Nothing archived</h3>
			<p>Archived requests show up here. They are never destroyed.</p>
		{:else}
			<h3>No service requests</h3>
			<p>When clients submit requests, they appear here.</p>
		{/if}
	</div>
{:else if data.view === 'archived'}
	<!-- An archived request has no page of its own: /admin/service-requests/[id]
	     answers 404 for a soft-deleted row, on purpose. So the archived list
	     opens each one in place instead, which is the only way to read one
	     without restoring it first. -->
	<div class="rows">
		{#each data.requests as r, i (r.id)}
			<details class="a-card arch" in:fly={{ y: 14, duration: 360, delay: Math.min(i, 10) * 45 }}>
				<summary>
					<img
						class="a-avatar"
						src={avatar(r.clientEmail || r.clientName)}
						alt=""
						width="44"
						height="44"
					/>
					<div class="client">
						<span class="name">{r.clientName}</span>
						<span class="email">{r.clientEmail}</span>
					</div>
					<div class="project">
						<span class="ptitle">{r.projectTitle}</span>
						<span class="pdesc">{r.description}</span>
					</div>
					<span class="a-pill" style="color:{statusColor(r.status)}">{statusLabel(r.status)}</span>
					<span class="date">{formatDate(r.createdAt)}</span>
					<span class="chev"><Icon name="arrow-down4" size={14} /></span>
				</summary>

				<div class="arch-body">
					<div class="facts">
						<div><dt>Service</dt><dd>{r.service?.name ?? 'None'}</dd></div>
						<div><dt>Email</dt><dd>{r.clientEmail}</dd></div>
						{#if r.clientPhone}
							<div><dt>Phone</dt><dd>{r.clientPhone}</dd></div>
						{/if}
						{#if r.company}
							<div><dt>Company</dt><dd>{r.company}</dd></div>
						{/if}
						{#if r.budget !== null}
							<div><dt>Budget</dt><dd>{r.budget.toLocaleString('en')}</dd></div>
						{/if}
						{#if r.timeline}
							<div><dt>Timeline</dt><dd>{r.timeline}</dd></div>
						{/if}
						<div><dt>Submitted</dt><dd>{when(r.createdAt)}</dd></div>
						<div><dt>Archived</dt><dd>{when(r.deletedAt)}</dd></div>
					</div>
					<div class="prose">
						<h4>Description</h4>
						<p>{r.description}</p>
						{#if r.requirements}
							<h4>Requirements</h4>
							<p>{r.requirements}</p>
						{/if}
						{#if r.notes}
							<h4>Internal notes</h4>
							<p>{r.notes}</p>
						{/if}
					</div>
					<form method="POST" action="?/restore" use:enhance class="arch-foot">
						<input type="hidden" name="id" value={r.id} />
						<button class="a-btn" type="submit">
							<Icon name="refresh" size={14} /> Restore this request
						</button>
						<span class="hint">Restoring puts it back in the active list, with its own page.</span>
					</form>
				</div>
			</details>
		{/each}
	</div>
{:else}
	<div class="rows">
		{#each data.requests as r, i (r.id)}
			<div class="a-card row" in:fly={{ y: 14, duration: 360, delay: Math.min(i, 10) * 45 }}>
				<a class="row-link" href="/admin/service-requests/{r.id}">
					<img
						class="a-avatar"
						src={avatar(r.clientEmail || r.clientName)}
						alt=""
						width="44"
						height="44"
					/>
					<div class="client">
						<span class="name">{r.clientName}</span>
						<span class="email">{r.clientEmail}</span>
					</div>
					<div class="project">
						<span class="ptitle">{r.projectTitle}</span>
						<span class="pdesc">{r.description}</span>
					</div>
					{#if r.answered}
						<span class="answer done" title="Replied to"><Icon name="tick-circle" size={14} /></span>
					{:else}
						<span class="answer open">Unanswered</span>
					{/if}
					<span class="a-pill" style="color:{statusColor(r.status)}">{statusLabel(r.status)}</span>
					<span class="date">{formatDate(r.createdAt)}</span>
					<span class="chev"><Icon name="arrow-right4" size={14} /></span>
				</a>
				<form
					method="POST"
					action="?/archive"
					use:enhance
					on:submit={(event) => {
						if (
							browser &&
							!confirm(`Archive the request from ${r.clientName}? You can restore it later.`)
						) {
							event.preventDefault();
						}
					}}
				>
					<input type="hidden" name="id" value={r.id} />
					<button class="a-btn a-btn--danger" type="submit" aria-label="Archive">
						<Icon name="archive" size={14} />
					</button>
				</form>
			</div>
		{/each}
	</div>
{/if}

<style>
	.controls {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.filters {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.filter {
		width: auto;
		min-width: 150px;
	}
	.search {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding-left: 12px;
		border: 1px solid var(--hairline-2);
		border-radius: 8px;
		color: var(--mute);
		transition: border-color 0.2s;
	}
	.search:focus-within {
		border-color: var(--spark);
	}
	.search input {
		border: none;
		background: transparent;
		min-width: 210px;
		padding-left: 0;
	}
	.search input:focus {
		border-color: transparent;
	}
	.unanswered-count {
		color: var(--spark);
	}
	.vtoggle {
		display: inline-flex;
		border: 1px solid var(--hairline-2);
		border-radius: 8px;
		padding: 3px;
	}
	.vtoggle a {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		padding: 7px 13px;
		border-radius: 6px;
		transition:
			color 0.2s,
			background 0.2s;
	}
	.vtoggle a.on {
		color: var(--bg);
		background: var(--ink);
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

	.rows {
		display: grid;
		gap: 10px;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 12px;
		padding: 8px 14px 8px 8px;
	}
	.row-link,
	summary {
		display: grid;
		grid-template-columns: 44px minmax(0, 1.1fr) minmax(0, 1.4fr) auto auto auto auto;
		align-items: center;
		gap: 16px;
		padding: 6px 10px;
		border-radius: 10px;
		min-width: 0;
	}
	.row-link:hover {
		background: rgba(255, 255, 255, 0.03);
	}
	.row-link:hover .chev {
		color: var(--ink);
	}
	.client,
	.project {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.name,
	.ptitle {
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.email,
	.pdesc {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.pdesc {
		font-family: var(--sans);
	}
	.answer {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.answer.open {
		color: var(--spark);
	}
	.answer.done {
		display: inline-flex;
		color: var(--mute-2);
	}
	.date {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}
	.chev {
		display: inline-flex;
		color: var(--mute-2);
		transition: color 0.2s ease;
	}

	/* archived rows open in place */
	.arch {
		padding: 8px;
	}
	.arch summary {
		cursor: pointer;
		list-style: none;
	}
	.arch summary::-webkit-details-marker {
		display: none;
	}
	.arch summary:hover {
		background: rgba(255, 255, 255, 0.03);
	}
	.arch[open] .chev {
		transform: rotate(180deg);
	}
	.arch-body {
		padding: 16px 10px 8px;
		border-top: 1px solid var(--hairline);
		margin: 10px 6px 0;
	}
	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 16px;
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
	.prose h4 {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 18px 0 6px;
		font-weight: 400;
	}
	.prose p {
		margin: 0;
		font-size: 14px;
		line-height: 1.65;
		color: var(--ink-2);
		white-space: pre-wrap;
	}
	.arch-foot {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		margin-top: 18px;
	}
	.hint {
		font-size: 12px;
		line-height: 1.55;
		color: var(--mute);
	}

	@media (max-width: 1000px) {
		.row-link,
		.arch summary {
			grid-template-columns: 44px minmax(0, 1fr) auto auto;
			row-gap: 10px;
		}
		.project {
			grid-column: 2 / -1;
		}
		.date {
			display: none;
		}
	}
	@media (max-width: 560px) {
		.search input {
			min-width: 0;
		}
		.answer.open {
			font-size: 9px;
		}
	}
</style>
