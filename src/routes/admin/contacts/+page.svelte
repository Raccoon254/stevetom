<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';
	import type { PageData } from './$types';

	export let data: PageData;

	const money = (usd: number) =>
		usd >= 1000
			? `$${Math.round(usd).toLocaleString()}`
			: `$${usd.toFixed(usd % 1 === 0 ? 0 : 2)}`;

	function when(value: string | Date | null): string {
		if (!value) return 'No activity';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return 'No activity';
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	const href = (email: string) => `/admin/contacts/${encodeURIComponent(email)}`;

	function pageLink(page: number): string {
		const params = new URLSearchParams();
		if (data.segment !== 'all') params.set('segment', data.segment);
		if (data.search) params.set('q', data.search);
		if (page > 1) params.set('page', String(page));
		const qs = params.toString();
		return `/admin/contacts${qs ? `?${qs}` : ''}`;
	}

	function segmentLink(key: string, keepSearch = true): string {
		const params = new URLSearchParams();
		if (key !== 'all') params.set('segment', key);
		if (keepSearch && data.search) params.set('q', data.search);
		const qs = params.toString();
		return `/admin/contacts${qs ? `?${qs}` : ''}`;
	}

	const TIER_LABEL: Record<string, string> = {
		SUPPORTER: 'Supporter',
		STANDARD: 'Standard',
		WORKSHOP: 'Workshop',
		CUSTOM: 'Custom'
	};
</script>

<svelte:head>
	<title>Contacts · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Audience</p>
		<h1 class="a-title">Contacts</h1>
		<p class="a-sub">
			Everyone connected to the brand, folded into one row per email address.
		</p>
	</div>
	<a class="a-btn a-btn--solid" href="/admin/messages/new">
		<Icon name="send" size={14} /> Write a message
	</a>
</div>

{#if data.unavailable}
	<div class="a-card notice" in:fade>
		<Icon name="danger" size={18} />
		<p>{data.unavailable}</p>
	</div>
{:else}
	<form class="tools" method="GET" action="/admin/contacts">
		{#if data.segment !== 'all'}
			<input type="hidden" name="segment" value={data.segment} />
		{/if}
		<label class="search">
			<Icon name="search-normal" size={15} />
			<input
				class="a-input"
				type="search"
				name="q"
				value={data.search}
				placeholder="Search by email, name or company"
			/>
		</label>
		<button class="a-btn" type="submit">Search</button>
		{#if data.search}
			<a class="a-btn" href={segmentLink(data.segment, false)}>Clear</a>
		{/if}
	</form>

	{#if data.missing.length}
		<p class="missing">
			Not counted here: {data.missing.join(', ')}. Those tables are not in this database yet.
		</p>
	{/if}

	<div class="chips">
		{#each data.segments as seg (seg.key)}
			<a
				class="chip"
				class:on={data.segment === seg.key}
				href={segmentLink(seg.key)}
				title={seg.description}
			>
				<span>{seg.label}</span>
				{#if data.counts}<em>{data.counts[seg.key]}</em>{/if}
			</a>
		{/each}
	</div>

	<p class="result-line">
		{data.total}
		{data.total === 1 ? 'contact' : 'contacts'}{data.search ? ` matching "${data.search}"` : ''}
	</p>

	{#if data.rows.length === 0}
		<div class="a-card a-empty" in:fade>
			<div class="a-empty-icon"><Icon name="profile-2user" size={30} /></div>
			<h3>No contacts here</h3>
			<p>
				{data.search
					? 'Nothing matches that search in this segment.'
					: 'Subscribers, donors, sponsors and clients will appear here as they arrive.'}
			</p>
		</div>
	{:else}
		<div class="rows">
			{#each data.rows as row, i (row.email)}
				<a
					class="a-card row"
					href={href(row.email)}
					in:fly={{ y: 12, duration: 300, delay: Math.min(i, 12) * 30 }}
				>
					<img class="a-avatar" src={avatar(row.email)} alt="" width="40" height="40" />
					<div class="who">
						<span class="name">{row.name || row.email}</span>
						<span class="sub">
							{row.name ? row.email : ''}{row.org ? `${row.name ? ' · ' : ''}${row.org}` : ''}
						</span>
					</div>
					<div class="tags">
						{#if row.subscribed}
							<span class="tag sub-tag">Subscriber</span>
						{:else if row.opted_out}
							<span class="tag out-tag">Unsubscribed</span>
						{/if}
						{#if row.is_sponsor}
							<span class="tag sponsor-tag">
								Sponsor{row.sponsor_tier ? ` · ${TIER_LABEL[row.sponsor_tier] ?? row.sponsor_tier}` : ''}
							</span>
						{/if}
						{#if row.donation_count > 0}
							<span class="tag donor-tag">
								Donor{row.donation_count > 1 ? ` · ${row.donation_count}` : ''}
							</span>
						{/if}
						{#if row.request_count > 0}
							<span class="tag client-tag">
								Client{row.request_count > 1 ? ` · ${row.request_count}` : ''}
							</span>
						{/if}
					</div>
					<span class="given">
						{#if row.total_usd === null}
							<span class="unknown" title="Donation totals need the usdAmount column">n/a</span>
						{:else if row.total_usd > 0}
							{money(row.total_usd)}
						{/if}
					</span>
					<span class="seen">{when(row.last_activity)}</span>
					<span class="go" aria-hidden="true"><Icon name="arrow-right4" size={14} /></span>
				</a>
			{/each}
		</div>

		{#if data.pages > 1}
			<nav class="pager" aria-label="Pagination">
				{#if data.page > 1}
					<a class="a-btn" href={pageLink(data.page - 1)}>
						<Icon name="arrow-left4" size={13} /> Previous
					</a>
				{:else}
					<span class="a-btn ghost"><Icon name="arrow-left4" size={13} /> Previous</span>
				{/if}
				<span class="pager-at">Page {data.page} of {data.pages}</span>
				{#if data.page < data.pages}
					<a class="a-btn" href={pageLink(data.page + 1)}>
						Next <Icon name="arrow-right4" size={13} />
					</a>
				{:else}
					<span class="a-btn ghost">Next <Icon name="arrow-right4" size={13} /></span>
				{/if}
			</nav>
		{/if}
	{/if}
{/if}

<style>
	.notice {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 18px 20px;
		color: var(--spark);
	}
	.notice p {
		margin: 0;
		font-size: 14px;
		color: var(--ink-2);
	}

	.tools {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.search {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 240px;
		max-width: 460px;
		color: var(--mute);
	}
	.search :global(span) {
		position: absolute;
		left: 12px;
	}
	.search .a-input {
		padding-left: 36px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 18px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1px solid var(--hairline);
		border-radius: 999px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		transition:
			color 0.2s,
			border-color 0.2s,
			background 0.2s;
	}
	.chip:hover {
		color: var(--ink);
		border-color: var(--hairline-2);
	}
	.chip.on {
		color: var(--ink);
		background: rgba(255, 255, 255, 0.06);
		border-color: var(--hairline-2);
	}
	.chip em {
		font-style: normal;
		color: var(--spark);
	}

	.missing {
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--spark);
		margin: 0 0 14px;
	}

	.result-line {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute-2);
		margin: 0 0 14px;
	}

	.rows {
		display: grid;
		gap: 8px;
	}
	.row {
		display: grid;
		grid-template-columns: 40px minmax(160px, 1.4fr) minmax(0, 1.6fr) 90px 110px 18px;
		align-items: center;
		gap: 14px;
		padding: 12px 16px;
	}
	.who {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.name {
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sub {
		font-size: 12px;
		color: var(--mute);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tag {
		font-family: var(--mono);
		font-size: 9px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 4px 8px;
		border-radius: 999px;
		border: 1px solid currentColor;
		white-space: nowrap;
	}
	.sub-tag {
		color: #7ecbff;
	}
	.out-tag {
		color: var(--danger);
	}
	.sponsor-tag {
		color: var(--spark);
	}
	.donor-tag {
		color: #9fe2a0;
	}
	.client-tag {
		color: #ffd166;
	}
	.unknown {
		color: var(--mute-2);
	}
	.given {
		font-family: var(--mono);
		font-size: 12px;
		color: var(--ink-2);
		text-align: right;
	}
	.seen {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
		text-align: right;
	}
	.go {
		color: var(--mute-2);
		display: inline-flex;
	}

	.pager {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
		margin-top: 22px;
	}
	.pager-at {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.a-btn.ghost {
		opacity: 0.35;
		cursor: default;
	}

	@media (max-width: 900px) {
		.row {
			grid-template-columns: 40px 1fr auto;
			row-gap: 10px;
		}
		.tags {
			grid-column: 2 / -1;
		}
		.given,
		.seen {
			text-align: left;
			grid-column: 2 / -1;
		}
		.go {
			display: none;
		}
	}
</style>
