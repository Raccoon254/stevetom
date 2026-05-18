<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';

	let requests: any[] = [];
	let loading = true;
	let selectedRequest: any = null;
	let showDetailModal = false;
	let filterStatus = '';

	let replyText = '';
	let replySending = false;
	let replyMsg = '';

	const STATUSES = ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

	onMount(fetchRequests);

	async function fetchRequests() {
		try {
			let url = '/api/service-requests';
			if (filterStatus) url += `?status=${filterStatus}`;
			const res = await fetch(url);
			const data = await res.json();
			if (data.success) requests = data.data;
		} catch (error) {
			console.error('Error fetching requests:', error);
		} finally {
			loading = false;
		}
	}

	async function updateRequestStatus(request: any, newStatus: string) {
		try {
			const res = await fetch(`/api/service-requests/${request.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...request, status: newStatus })
			});
			if (res.ok) {
				await fetchRequests();
				if (selectedRequest?.id === request.id)
					selectedRequest = { ...selectedRequest, status: newStatus };
			}
		} catch (error) {
			console.error('Error updating request status:', error);
		}
	}

	async function deleteRequest(request: any) {
		if (!confirm(`Delete the request from ${request.clientName}?`)) return;
		try {
			const res = await fetch(`/api/service-requests/${request.id}`, { method: 'DELETE' });
			if (res.ok) {
				await fetchRequests();
				if (selectedRequest?.id === request.id) showDetailModal = false;
			}
		} catch (error) {
			console.error('Error deleting request:', error);
		}
	}

	function showDetails(request: any) {
		selectedRequest = request;
		showDetailModal = true;
		replyText = '';
		replyMsg = '';
	}

	async function sendReply() {
		if (!replyText.trim() || replySending) return;
		replySending = true;
		replyMsg = '';
		try {
			const res = await fetch(`/api/service-requests/${selectedRequest.id}/reply`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: replyText })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				replyMsg = `Reply sent to ${selectedRequest.clientEmail}.`;
				replyText = '';
			} else {
				replyMsg = data.error || 'Failed to send the reply.';
			}
		} catch {
			replyMsg = 'Network error. Please try again.';
		} finally {
			replySending = false;
		}
	}

	const formatDate = (d: string) => new Date(d).toLocaleDateString();

	function statusColor(status: string): string {
		return (
			{
				PENDING: '#ff7a1a',
				IN_REVIEW: '#7ecbff',
				ACCEPTED: '#6fa89c',
				IN_PROGRESS: '#ffd166',
				COMPLETED: '#9fe2a0',
				REJECTED: '#ff5a52'
			}[status] || '#6fa89c'
		);
	}

	$: if (browser && filterStatus !== undefined) fetchRequests();
</script>

<svelte:head>
	<title>Requests · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Inbox</p>
		<h1 class="a-title">Service Requests</h1>
		<p class="a-sub">Manage and respond to client requests.</p>
	</div>
	<select class="a-select filter" bind:value={filterStatus}>
		<option value="">All statuses</option>
		{#each STATUSES as s}
			<option value={s}>{s.replace('_', ' ')}</option>
		{/each}
	</select>
</div>

{#if loading}
	<div class="a-loading" in:fade>
		<div class="a-spinner"></div>
		<p>Loading</p>
	</div>
{:else if requests.length === 0}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="messages" size={30} /></div>
		<h3>No service requests</h3>
		<p>When clients submit requests, they appear here.</p>
	</div>
{:else}
	<div class="rows">
		{#each requests as r, i}
			<div class="a-card row" in:fly={{ y: 14, duration: 360, delay: i * 45 }}>
				<img class="a-avatar" src={avatar(r.clientEmail || r.clientName)} alt="" width="44" height="44" />
				<div class="client">
					<span class="name">{r.clientName}</span>
					<span class="email">{r.clientEmail}</span>
				</div>
				<div class="project">
					<span class="ptitle">{r.projectTitle}</span>
					<span class="pdesc">{r.description}</span>
				</div>
				<span class="a-pill" style="color:{statusColor(r.status)}">{r.status.replace('_', ' ')}</span>
				<span class="date">{formatDate(r.createdAt)}</span>
				<div class="actions">
					<button class="a-btn" on:click={() => showDetails(r)}>
						<Icon name="eye" size={14} /> View
					</button>
					<button class="a-btn a-btn--danger" on:click={() => deleteRequest(r)} aria-label="Delete">
						<Icon name="trash" size={14} />
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if showDetailModal && selectedRequest}
	<div class="a-modal" on:click={() => (showDetailModal = false)} transition:fade={{ duration: 180 }}>
		<div class="a-modal-box" on:click|stopPropagation transition:fly={{ y: 18, duration: 260 }}>
			<header class="modal-head">
				<div class="modal-head-id">
					<img class="a-avatar" src={avatar(selectedRequest.clientEmail || selectedRequest.clientName)} alt="" width="38" height="38" />
					<h3>{selectedRequest.clientName}</h3>
				</div>
				<button class="icon-btn" on:click={() => (showDetailModal = false)} aria-label="Close">
					<Icon name="close-circle" size={20} />
				</button>
			</header>

			<div class="modal-body">
				<section>
					<h4 class="a-section-title"><Icon name="user" size={13} /> Client</h4>
					<dl class="defs">
						<div><dt>Email</dt><dd>{selectedRequest.clientEmail}</dd></div>
						{#if selectedRequest.clientPhone}
							<div><dt>Phone</dt><dd>{selectedRequest.clientPhone}</dd></div>
						{/if}
						{#if selectedRequest.company}
							<div><dt>Company</dt><dd>{selectedRequest.company}</dd></div>
						{/if}
					</dl>
				</section>

				<section>
					<h4 class="a-section-title"><Icon name="box" size={13} /> Project</h4>
					<dl class="defs">
						<div><dt>Title</dt><dd>{selectedRequest.projectTitle}</dd></div>
						<div><dt>Service</dt><dd>{selectedRequest.service?.name ?? '—'}</dd></div>
						<div class="wide"><dt>Description</dt><dd>{selectedRequest.description}</dd></div>
						{#if selectedRequest.requirements}
							<div class="wide"><dt>Requirements</dt><dd>{selectedRequest.requirements}</dd></div>
						{/if}
						{#if selectedRequest.budget}
							<div><dt>Budget</dt><dd>{selectedRequest.budget}</dd></div>
						{/if}
						{#if selectedRequest.timeline}
							<div><dt>Timeline</dt><dd>{selectedRequest.timeline}</dd></div>
						{/if}
					</dl>
				</section>

				<section>
					<h4 class="a-section-title"><Icon name="flag" size={13} /> Status</h4>
					<p class="current">
						Current:
						<span class="a-pill" style="color:{statusColor(selectedRequest.status)}">
							{selectedRequest.status.replace('_', ' ')}
						</span>
					</p>
					<div class="status-grid">
						{#each STATUSES.filter((s) => s !== selectedRequest.status) as s}
							<button
								class="a-btn"
								style="color:{statusColor(s)}"
								on:click={() => updateRequestStatus(selectedRequest, s)}
							>
								{s.replace('_', ' ')}
							</button>
						{/each}
					</div>
				</section>

				{#if selectedRequest.notes}
					<section>
						<h4 class="a-section-title"><Icon name="edit" size={13} /> Internal notes</h4>
						<p class="notes">{selectedRequest.notes}</p>
					</section>
				{/if}

				<section>
					<h4 class="a-section-title"><Icon name="sms" size={13} /> Reply to client</h4>
					<textarea
						class="a-textarea reply"
						bind:value={replyText}
						placeholder="Write a reply — it is emailed to {selectedRequest.clientEmail} from KenTom HQ."
					></textarea>
					{#if replyMsg}<p class="reply-msg">{replyMsg}</p>{/if}
					<div class="reply-row">
						<button
							class="a-btn a-btn--solid"
							on:click={sendReply}
							disabled={replySending || !replyText.trim()}
						>
							<Icon name="send" size={14} />
							{replySending ? 'Sending' : 'Send reply'}
						</button>
					</div>
				</section>
			</div>

			<footer class="modal-foot">
				<div class="foot-l">
					<a class="a-btn" href="mailto:{selectedRequest.clientEmail}">
						<Icon name="sms" size={14} /> Email
					</a>
					{#if selectedRequest.clientPhone}
						<a class="a-btn" href="tel:{selectedRequest.clientPhone}">
							<Icon name="call" size={14} /> Call
						</a>
					{/if}
				</div>
				<div class="foot-r">
					<button class="a-btn a-btn--danger" on:click={() => deleteRequest(selectedRequest)}>
						Delete
					</button>
					<button class="a-btn a-btn--solid" on:click={() => (showDetailModal = false)}>
						Close
					</button>
				</div>
			</footer>
		</div>
	</div>
{/if}

<style>
	.filter {
		width: auto;
		min-width: 180px;
	}
	.rows {
		display: grid;
		gap: 10px;
	}
	.row {
		display: grid;
		grid-template-columns: 44px 1.1fr 1.4fr auto auto auto;
		align-items: center;
		gap: 16px;
		padding: 14px 18px;
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
	.date {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}
	.actions {
		display: flex;
		gap: 8px;
	}
	@media (max-width: 900px) {
		.row {
			grid-template-columns: 44px 1fr auto;
			grid-auto-rows: auto;
		}
		.project {
			grid-column: 2 / -1;
		}
		.date {
			display: none;
		}
		.actions {
			grid-column: 2 / -1;
		}
	}

	/* modal */
	.modal-head {
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 22px;
		background: var(--panel);
		border-bottom: 1px solid var(--hairline);
	}
	.modal-head-id {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.modal-head h3 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: 20px;
		color: var(--ink);
		margin: 0;
	}
	.icon-btn {
		background: transparent;
		border: none;
		color: var(--mute);
		cursor: pointer;
		padding: 4px;
		display: inline-flex;
	}
	.icon-btn:hover {
		color: var(--ink);
	}
	.modal-body {
		padding: 22px;
		display: grid;
		gap: 26px;
	}
	.defs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin: 0;
	}
	.defs .wide {
		grid-column: 1 / -1;
	}
	.defs dt {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 4px;
	}
	.defs dd {
		margin: 0;
		font-size: 14px;
		color: var(--ink-2);
		line-height: 1.5;
		white-space: pre-wrap;
	}
	.current {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 0 0 14px;
	}
	.status-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.notes {
		font-size: 14px;
		color: var(--ink-2);
		line-height: 1.6;
		white-space: pre-wrap;
		margin: 0;
	}
	.reply {
		min-height: 110px;
	}
	.reply-msg {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute);
		margin: 8px 0 0;
	}
	.reply-row {
		display: flex;
		justify-content: flex-end;
		margin-top: 12px;
	}
	.modal-foot {
		position: sticky;
		bottom: 0;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
		padding: 16px 22px;
		background: var(--panel);
		border-top: 1px solid var(--hairline);
	}
	.foot-l,
	.foot-r {
		display: flex;
		gap: 8px;
	}
	@media (max-width: 560px) {
		.defs {
			grid-template-columns: 1fr;
		}
	}
</style>
