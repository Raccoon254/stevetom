<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';
	import type { PageData } from './$types';

	export let data: PageData;

	const TIER_LABEL: Record<string, string> = {
		SUPPORTER: 'Supporter',
		STANDARD: 'Standard',
		WORKSHOP: 'Workshop',
		CUSTOM: 'Custom'
	};
	const STATE_LABEL: Record<string, string> = {
		PENDING_REVIEW: 'Pending review',
		APPROVED: 'Approved',
		REJECTED: 'Rejected'
	};
	const STATE_COLOR: Record<string, string> = {
		PENDING_REVIEW: '#ff7a1a',
		APPROVED: '#9fe2a0',
		REJECTED: '#ff5a52'
	};
	const VISIBILITY_LABEL: Record<string, string> = {
		PUBLIC: 'Public',
		ANONYMOUS: 'Anonymous',
		PRIVATE: 'Private'
	};

	const STATE_CHIPS = [
		{ key: '', label: 'All states' },
		{ key: 'PENDING_REVIEW', label: 'Pending review' },
		{ key: 'APPROVED', label: 'Approved' },
		{ key: 'REJECTED', label: 'Rejected' }
	];
	const TIER_CHIPS = [
		{ key: '', label: 'All tiers' },
		{ key: 'SUPPORTER', label: 'Supporter' },
		{ key: 'STANDARD', label: 'Standard' },
		{ key: 'WORKSHOP', label: 'Workshop' },
		{ key: 'CUSTOM', label: 'Custom' }
	];

	const money = (usd: number) =>
		usd >= 1000
			? `$${Math.round(usd).toLocaleString()}`
			: `$${usd.toFixed(usd % 1 === 0 ? 0 : 2)}`;

	function when(value: string | Date | null): string {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function link(next: { state?: string | null; tier?: string | null; q?: string; page?: number }) {
		const params = new URLSearchParams();
		const state = next.state === undefined ? data.state : next.state;
		const tier = next.tier === undefined ? data.tier : next.tier;
		const q = next.q === undefined ? data.search : next.q;
		if (state) params.set('state', state);
		if (tier) params.set('tier', tier);
		if (q) params.set('q', q);
		if (next.page && next.page > 1) params.set('page', String(next.page));
		const qs = params.toString();
		return `/admin/sponsors${qs ? `?${qs}` : ''}`;
	}
</script>

<svelte:head>
	<title>Sponsors · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Sponsorship</p>
		<h1 class="a-title">Sponsors</h1>
		<p class="a-sub">
			Who is paying, what they consented to show, and who is on the wall right now.
		</p>
	</div>
	<a class="a-btn" href="/partners" target="_blank" rel="noreferrer">
		<Icon name="link" size={14} /> View the wall
	</a>
</div>

{#if data.unavailable}
	<div class="a-card notice" in:fade>
		<Icon name="danger" size={18} />
		<p>{data.unavailable}</p>
	</div>
{:else}
	{#if data.counts.pending > 0}
		<a class="a-card queue" href={link({ state: 'PENDING_REVIEW', q: '', page: 1 })} in:fade>
			<Icon name="shield-tick" size={20} />
			<div>
				<strong>
					{data.counts.pending}
					{data.counts.pending === 1 ? 'sponsor is' : 'sponsors are'} waiting for review
				</strong>
				<span>Nothing they wrote reaches the wall until it has been looked at.</span>
			</div>
			<span class="go" aria-hidden="true"><Icon name="arrow-right4" size={14} /></span>
		</a>
	{/if}

	<div class="stats">
		<div class="a-card a-stat">
			<span class="a-stat-label"><Icon name="crown" size={13} /> Sponsors</span>
			<span class="a-stat-value">{data.counts.all}</span>
		</div>
		<div class="a-card a-stat" class:alert={data.counts.pending > 0}>
			<span class="a-stat-label"><Icon name="shield-tick" size={13} /> Awaiting review</span>
			<span class="a-stat-value">{data.counts.pending}</span>
		</div>
		<div class="a-card a-stat">
			<span class="a-stat-label"><Icon name="eye" size={13} /> On the wall</span>
			<span class="a-stat-value">{data.counts.listed}</span>
		</div>
		<div class="a-card a-stat">
			<span class="a-stat-label"><Icon name="wallet" size={13} /> Recurring / month</span>
			<span class="a-stat-value">{money(data.counts.monthlyUsd)}</span>
		</div>
	</div>

	<form class="tools" method="GET" action="/admin/sponsors">
		{#if data.state}<input type="hidden" name="state" value={data.state} />{/if}
		{#if data.tier}<input type="hidden" name="tier" value={data.tier} />{/if}
		<label class="search">
			<Icon name="search-normal" size={15} />
			<input
				class="a-input"
				type="search"
				name="q"
				value={data.search}
				placeholder="Search by name, organisation, email or slug"
			/>
		</label>
		<button class="a-btn" type="submit">Search</button>
		{#if data.search}
			<a class="a-btn" href={link({ q: '', page: 1 })}>Clear</a>
		{/if}
	</form>

	<div class="chips">
		{#each STATE_CHIPS as chip (chip.key)}
			<a
				class="chip"
				class:on={(data.state ?? '') === chip.key}
				class:pending={chip.key === 'PENDING_REVIEW' && data.counts.pending > 0}
				href={link({ state: chip.key || null, page: 1 })}
			>
				<span>{chip.label}</span>
				{#if chip.key === 'PENDING_REVIEW' && data.counts.pending > 0}
					<em>{data.counts.pending}</em>
				{/if}
			</a>
		{/each}
	</div>
	<div class="chips">
		{#each TIER_CHIPS as chip (chip.key)}
			<a
				class="chip"
				class:on={(data.tier ?? '') === chip.key}
				href={link({ tier: chip.key || null, page: 1 })}
			>
				<span>{chip.label}</span>
			</a>
		{/each}
	</div>

	<p class="result-line">
		{data.total}
		{data.total === 1 ? 'sponsor' : 'sponsors'}{data.search ? ` matching "${data.search}"` : ''}
		{#if data.autoApprove}
			<span class="dim">· auto-approval is on, new public listings go live unreviewed</span>
		{:else}
			<span class="dim">· auto-approval is off, every new public listing waits for review</span>
		{/if}
	</p>

	{#if data.rows.length === 0}
		<div class="a-card a-empty" in:fade>
			<div class="a-empty-icon"><Icon name="crown" size={30} /></div>
			{#if data.counts.all === 0}
				<h3>No sponsors yet</h3>
				<p>
					The first person to pay through /support becomes a row here. Nothing is listed on the
					partners wall until someone is both public and approved.
				</p>
			{:else}
				<h3>Nothing matches</h3>
				<p>No sponsor fits this filter. Widen it, or clear the search.</p>
			{/if}
		</div>
	{:else}
		<div class="rows">
			{#each data.rows as row, i (row.id)}
				<a
					class="a-card row"
					class:flagged={row.moderation === 'PENDING_REVIEW'}
					href="/admin/sponsors/{row.id}"
					in:fly={{ y: 12, duration: 300, delay: Math.min(i, 12) * 30 }}
				>
					<img class="a-avatar" src={avatar(row.email)} alt="" width="40" height="40" />
					<div class="who">
						<span class="name">{row.displayName}</span>
						<span class="sub">{row.orgName ? `${row.orgName} · ` : ''}{row.email}</span>
					</div>
					<div class="tags">
						<span class="tag tier-tag">{TIER_LABEL[row.tier] ?? row.tier}</span>
						<span class="tag plain">
							{row.cadence === 'RECURRING' ? 'Recurring' : 'One time'}
						</span>
						<span class="tag plain">{VISIBILITY_LABEL[row.visibility] ?? row.visibility}</span>
						{#if row.moderation !== 'APPROVED'}
							<span class="tag" style="color:{STATE_COLOR[row.moderation]}">
								{STATE_LABEL[row.moderation] ?? row.moderation}
							</span>
						{/if}
					</div>
					<span class="given">
						{#if row.cadence === 'RECURRING' && row.monthlyUsd > 0}
							{money(row.monthlyUsd)}<em>/mo</em>
						{/if}
						<span class="life">{money(row.lifetimeUsd)} total</span>
					</span>
					<span class="wall">
						<span class="state" class:live={row.listed}>
							<span class="dot"></span>
							{row.listed ? 'On the wall' : 'Not listed'}
						</span>
						<span class="dates">
							{when(row.startedAt)}
							{#if row.expiresAt}
								· ends {when(row.expiresAt)}
							{/if}
						</span>
					</span>
					<span class="go" aria-hidden="true"><Icon name="arrow-right4" size={14} /></span>
				</a>
			{/each}
		</div>

		{#if data.pages > 1}
			<nav class="pager" aria-label="Pagination">
				{#if data.page > 1}
					<a class="a-btn" href={link({ page: data.page - 1 })}>
						<Icon name="arrow-left4" size={13} /> Previous
					</a>
				{:else}
					<span class="a-btn ghost"><Icon name="arrow-left4" size={13} /> Previous</span>
				{/if}
				<span class="pager-at">Page {data.page} of {data.pages}</span>
				{#if data.page < data.pages}
					<a class="a-btn" href={link({ page: data.page + 1 })}>
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

	.queue {
		display: grid;
		grid-template-columns: 20px 1fr 18px;
		align-items: center;
		gap: 14px;
		padding: 16px 18px;
		margin-bottom: 18px;
		color: var(--spark);
		border-color: rgba(255, 122, 26, 0.45);
		background: rgba(255, 122, 26, 0.07);
	}
	.queue:hover {
		border-color: var(--spark);
		background: rgba(255, 122, 26, 0.11);
	}
	.queue strong {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
	}
	.queue span {
		font-size: 12.5px;
		color: var(--ink-2);
	}
	.queue .go {
		color: var(--spark);
		display: inline-flex;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 10px;
		margin-bottom: 22px;
	}

	.tools {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
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
		margin-bottom: 10px;
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
	.chip.pending {
		color: var(--spark);
		border-color: rgba(255, 122, 26, 0.5);
	}
	.chip em {
		font-style: normal;
		color: var(--spark);
	}

	.result-line {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute-2);
		margin: 6px 0 14px;
	}
	.result-line .dim {
		color: var(--mute-2);
		opacity: 0.75;
	}

	.rows {
		display: grid;
		gap: 8px;
	}
	.row {
		display: grid;
		grid-template-columns: 40px minmax(150px, 1.4fr) minmax(0, 1.5fr) 100px 130px 18px;
		align-items: center;
		gap: 14px;
		padding: 12px 16px;
	}
	.row.flagged {
		border-color: rgba(255, 122, 26, 0.45);
		background: rgba(255, 122, 26, 0.05);
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
	.tier-tag {
		color: var(--spark);
	}
	.tag.plain {
		color: var(--mute);
	}
	.given {
		font-family: var(--mono);
		font-size: 12px;
		color: var(--ink-2);
		text-align: right;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.given em {
		font-style: normal;
		color: var(--mute-2);
	}
	.given .life {
		font-size: 10px;
		color: var(--mute-2);
	}
	.wall {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-align: right;
	}
	.state {
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: 6px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mute-2);
	}
	.state.live {
		color: #9fe2a0;
	}
	.state .dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: currentColor;
	}
	.dates {
		font-family: var(--mono);
		font-size: 10px;
		color: var(--mute-2);
		white-space: nowrap;
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

	@media (max-width: 1000px) {
		.row {
			grid-template-columns: 40px 1fr auto;
			row-gap: 10px;
		}
		.tags {
			grid-column: 2 / -1;
		}
		.given,
		.wall {
			grid-column: 2 / -1;
			text-align: left;
			flex-direction: row;
			align-items: center;
			gap: 10px;
		}
		.state {
			justify-content: flex-start;
		}
		.go {
			display: none;
		}
	}
</style>
