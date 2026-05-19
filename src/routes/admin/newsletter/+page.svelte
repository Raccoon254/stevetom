<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';

	type Issue = { id: string; postSlug: string; postTitle: string; recipients: number; sentAt: string };
	type Post = { slug: string; title: string; date: string; excerpt: string };

	let subscribers = 0;
	let sent: Issue[] = [];
	let unsent: Post[] = [];
	let loading = true;
	let sending = '';
	let note = '';

	onMount(load);

	async function load() {
		loading = true;
		try {
			const res = await fetch('/api/newsletter');
			const data = await res.json();
			if (data.success) {
				subscribers = data.subscribers;
				sent = data.sent;
				unsent = data.unsent;
			}
		} catch (error) {
			console.error('Error loading newsletter:', error);
		} finally {
			loading = false;
		}
	}

	async function send(post: Post) {
		if (sending) return;
		if (!confirm(`Send "${post.title}" to ${subscribers} subscriber${subscribers === 1 ? '' : 's'}?`))
			return;
		sending = post.slug;
		note = '';
		try {
			const res = await fetch('/api/newsletter', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug: post.slug })
			});
			const data = await res.json();
			note = data.success
				? `Sent "${post.title}" to ${data.recipients} subscriber${data.recipients === 1 ? '' : 's'}.`
				: data.error || 'Failed to send.';
			if (data.success) await load();
		} catch {
			note = 'Network error. Please try again.';
		} finally {
			sending = '';
		}
	}

	const fmt = (d: string) => new Date(d).toLocaleDateString();
</script>

<svelte:head>
	<title>Newsletter · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Audience</p>
		<h1 class="a-title">Newsletter</h1>
		<p class="a-sub">Send new posts to verified subscribers.</p>
	</div>
</div>

{#if loading}
	<div class="a-loading" in:fade><div class="a-spinner"></div><p>Loading</p></div>
{:else}
	<div class="grid stats">
		<div class="a-card a-stat">
			<span class="a-stat-label"><Icon name="sms" size={13} /> Subscribers</span>
			<span class="a-stat-value">{subscribers}</span>
		</div>
		<div class="a-card a-stat">
			<span class="a-stat-label"><Icon name="send" size={13} /> Issues sent</span>
			<span class="a-stat-value">{sent.length}</span>
		</div>
	</div>

	{#if note}
		<p class="note" in:fade>{note}</p>
	{/if}

	<section class="block">
		<h2 class="a-section-title"><Icon name="box" size={14} /> Unsent posts</h2>
		{#if unsent.length === 0}
			<div class="a-card a-empty">
				<div class="a-empty-icon"><Icon name="tick-circle" size={28} /></div>
				<h3>All caught up</h3>
				<p>Every published post has been sent to subscribers.</p>
			</div>
		{:else}
			<div class="rows">
				{#each unsent as post, i (post.slug)}
					<div class="a-card row" in:fly={{ y: 12, duration: 320, delay: i * 40 }}>
						<div class="row-main">
							<span class="row-title">{post.title}</span>
							<span class="row-meta">{post.excerpt}</span>
						</div>
						<button
							class="a-btn a-btn--solid"
							on:click={() => send(post)}
							disabled={!!sending || subscribers === 0}
						>
							<Icon name="send" size={14} />
							{sending === post.slug ? 'Sending' : 'Send'}
						</button>
					</div>
				{/each}
			</div>
			{#if subscribers === 0}
				<p class="hint">No subscribers yet, nothing to send to.</p>
			{/if}
		{/if}
	</section>

	<section class="block">
		<h2 class="a-section-title"><Icon name="activity" size={14} /> Sent history</h2>
		{#if sent.length === 0}
			<div class="a-card a-empty">
				<div class="a-empty-icon"><Icon name="send" size={28} /></div>
				<h3>Nothing sent yet</h3>
				<p>Issues you send will be listed here.</p>
			</div>
		{:else}
			<div class="rows">
				{#each sent as issue (issue.id)}
					<div class="a-card row">
						<div class="row-main">
							<span class="row-title">{issue.postTitle}</span>
							<span class="row-meta">{issue.recipients} recipient{issue.recipients === 1 ? '' : 's'}</span>
						</div>
						<span class="sent-date">{fmt(issue.sentAt)}</span>
					</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.grid {
		display: grid;
		gap: 14px;
	}
	.stats {
		grid-template-columns: repeat(2, 1fr);
		max-width: 460px;
		margin-bottom: clamp(24px, 4vh, 36px);
	}
	.note {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--spark);
		margin: 0 0 22px;
	}
	.block {
		margin-bottom: clamp(28px, 5vh, 44px);
	}
	.rows {
		display: grid;
		gap: 10px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 18px;
	}
	.row-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.row-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
	}
	.row-meta {
		font-size: 12.5px;
		color: var(--mute);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sent-date {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}
	.hint {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute);
		margin: 12px 0 0;
	}
</style>
