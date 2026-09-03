<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const STATUS_COLOR: Record<string, string> = {
		DRAFT: '#6fa89c',
		SENDING: '#ffd166',
		SENT: '#9fe2a0',
		CANCELLED: '#ff5a52'
	};

	function when(value: string | Date | null): string {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleString('en', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Messages · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Outbound</p>
		<h1 class="a-title">Messages</h1>
		<p class="a-sub">Write to one contact or to a whole segment, through Axene Mailer.</p>
	</div>
	<a class="a-btn a-btn--solid" href="/admin/messages/new">
		<Icon name="edit" size={14} /> New message
	</a>
</div>

{#if data.unavailable}
	<div class="a-card notice" in:fade>
		<Icon name="danger" size={18} />
		<p>{data.unavailable}</p>
	</div>
{:else if data.campaigns.length === 0}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="send" size={30} /></div>
		<h3>Nothing written yet</h3>
		<p>Messages you draft and send will be listed here with their delivery record.</p>
	</div>
{:else}
	<div class="rows">
		{#each data.campaigns as c, i (c.id)}
			<a
				class="a-card row"
				href="/admin/messages/{c.id}"
				in:fly={{ y: 12, duration: 300, delay: Math.min(i, 12) * 30 }}
			>
				<div class="main">
					<span class="subject">{c.subject}</span>
					<span class="meta">
						{c.contactEmail ?? c.segmentLabel}
						·
						{c.recipientCount}
						{c.recipientCount === 1 ? 'recipient' : 'recipients'}
						{#if c.status === 'SENT' || c.status === 'SENDING'}
							· {c.sentCount} sent{c.failedCount ? `, ${c.failedCount} failed` : ''}
						{:else if !c.testSentAt}
							· no test sent yet
						{/if}
					</span>
				</div>
				<span class="a-pill" style="color:{STATUS_COLOR[c.status] ?? '#6fa89c'}">{c.status}</span>
				<span class="date">{when(c.completedAt ?? c.createdAt)}</span>
				<span class="go" aria-hidden="true"><Icon name="arrow-right4" size={14} /></span>
			</a>
		{/each}
	</div>
{/if}

<style>
	.notice {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 18px 20px;
		color: var(--spark);
	}
	.notice p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
	}
	.rows {
		display: grid;
		gap: 8px;
	}
	.row {
		display: grid;
		grid-template-columns: 1fr auto 130px 18px;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
	}
	.main {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.subject {
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mute);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.date {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		text-align: right;
		white-space: nowrap;
	}
	.go {
		color: var(--mute-2);
		display: inline-flex;
	}
	@media (max-width: 760px) {
		.row {
			grid-template-columns: 1fr auto;
		}
		.date,
		.go {
			display: none;
		}
	}
</style>
