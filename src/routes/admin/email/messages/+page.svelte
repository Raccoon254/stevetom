<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { STATE_LABEL } from '../shared';
	import type { PageData } from './$types';

	export let data: PageData;

	const nf = new Intl.NumberFormat('en');
	const fmt = (n: number) => nf.format(n);

	/** Delivery states that are bad news, and get the danger treatment. */
	const BAD = new Set(['BOUNCED', 'FAILED', 'COMPLAINED']);
	const GOOD = new Set(['DELIVERED', 'OPENED', 'CLICKED']);

	const EVENT_ICON: Record<string, string> = {
		QUEUED: 'clock',
		SENT: 'send',
		DELIVERED: 'tick-circle',
		OPENED: 'eye',
		CLICKED: 'mouse-circle',
		BOUNCED: 'danger',
		FAILED: 'close-circle',
		COMPLAINED: 'shield-cross',
		UNSUBSCRIBED: 'slash',
		UNKNOWN: 'info-circle'
	};

	function when(iso: string): string {
		return new Date(iso).toLocaleString('en', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function clock(iso: string): string {
		return new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
	}

	function link(params: Record<string, string | number>): string {
		const search = new URLSearchParams();
		if (data.rangeKey !== '30d') search.set('range', data.rangeKey);
		if (data.search) search.set('q', data.search);
		if (data.purpose) search.set('purpose', data.purpose);
		for (const [key, value] of Object.entries(params)) {
			if (value === '' || value === 0) search.delete(key);
			else search.set(key, String(value));
		}
		const qs = search.toString();
		return `/admin/email/messages${qs ? `?${qs}` : ''}`;
	}

	$: filtered = Boolean(data.search || data.purpose);
	$: purposeName =
		data.purpose === data.unclassified
			? 'Unclassified'
			: (data.purposes.find((p) => p.tag === data.purpose)?.label ?? '');
</script>

<svelte:head>
	<title>Message log · kenTom Admin</title>
</svelte:head>

<a class="back" href="/admin/email">
	<Icon name="arrow-left4" size={13} /> Email overview
</a>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Delivery</p>
		<h1 class="a-title">Message log</h1>
		<p class="a-sub">
			Every message this site sent, who it went to, and what happened to it afterwards.
		</p>
	</div>
</div>

{#if !data.ready}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="sms-tracking" size={30} /></div>
		<h3>The message log is not available</h3>
		<p>The EmailMessage and EmailDeliveryEvent tables are not available on this database.</p>
		{#if data.error}<p class="err">{data.error}</p>{/if}
	</div>
{:else}
	<form class="tools" method="GET" action="/admin/email/messages">
		<label class="search">
			<Icon name="search-normal" size={15} />
			<input
				class="a-input"
				type="search"
				name="q"
				value={data.search}
				placeholder="Search by recipient address"
			/>
		</label>
		<select class="a-select" name="purpose" aria-label="Purpose">
			<option value="">Every purpose</option>
			{#each data.purposes as p (p.tag)}
				<option value={p.tag} selected={data.purpose === p.tag}>{p.label}</option>
			{/each}
			<option value={data.unclassified} selected={data.purpose === data.unclassified}>
				Unclassified
			</option>
		</select>
		<select class="a-select" name="range" aria-label="Date range">
			{#each data.ranges as r (r.key)}
				<option value={r.key} selected={data.rangeKey === r.key}>{r.label}</option>
			{/each}
		</select>
		<button class="a-btn" type="submit">Search</button>
		{#if filtered}
			<a class="a-btn" href="/admin/email/messages?range={data.rangeKey}">Clear</a>
		{/if}
	</form>

	<p class="result-line">
		{fmt(data.total)}
		{data.total === 1 ? 'message' : 'messages'}
		{#if purposeName}· {purposeName}{/if}
		{#if data.search}· recipient contains "{data.search}"{/if}
		· {data.rangeLabel.toLowerCase()}
	</p>

	{#if data.rows.length === 0}
		<div class="a-card a-empty" in:fade>
			<div class="a-empty-icon"><Icon name="sms-search" size={30} /></div>
			<h3>{filtered ? 'Nothing matches' : 'No messages in this range'}</h3>
			<p>
				{#if filtered}
					No message in this range went to an address containing that text. Widen the range to
					<em>All time</em> before concluding it was never sent.
				{:else}
					Messages appear here the moment they are handed to Axene Mailer.
				{/if}
			</p>
		</div>
	{:else}
		<ol class="log">
			{#each data.rows as row, i (row.id)}
				<li class="a-card msg" in:fly={{ y: 12, duration: 280, delay: Math.min(i, 10) * 25 }}>
					<div class="msg-top">
						<span
							class="state"
							class:bad={BAD.has(row.state)}
							class:good={GOOD.has(row.state)}
							class:idle={row.state === 'NO_REPORT'}
						>
							<Icon name={EVENT_ICON[row.state] ?? 'clock'} size={12} />
							{STATE_LABEL[row.state] ?? row.state}
						</span>
						<span class="who">{row.recipient}</span>
						<time class="sent">{when(row.sentAt)}</time>
					</div>

					<p class="subject">
						{#if row.subjectWithheld}
							<span class="withheld">
								<Icon name="lock" size={12} /> Subject withheld: verification mail
							</span>
						{:else if row.subject}
							{row.subject}
						{:else}
							<span class="withheld">No subject recorded</span>
						{/if}
					</p>

					<div class="chips">
						<a class="chip purpose" href={link({ purpose: row.purpose, page: 0 })}>
							{row.purposeLabel}
						</a>
						{#if row.audience === 'internal'}
							<span class="chip flag">to your inbox</span>
						{/if}
						{#if row.fromEmail}
							<span class="chip">from {row.fromEmail}</span>
						{/if}
						{#each row.facets as facet (facet)}
							<span class="chip faint">{facet}</span>
						{/each}
					</div>

					{#if row.timeline.length === 0}
						<p class="no-events">
							No delivery report yet. Axene reported nothing back for this message, which means
							either that it is still in flight or that the webhook was not registered when it went
							out.
						</p>
					{:else}
						<ul class="events">
							{#each row.timeline as event (event.id)}
								<li>
									<span class="ev" class:bad={BAD.has(event.type)}>
										<Icon name={EVENT_ICON[event.type] ?? 'info-circle'} size={12} />
										{STATE_LABEL[event.type] ?? event.type}
									</span>
									<time class="ev-at">{clock(event.occurredAt)}</time>
									{#if event.urlLabel}
										<span class="ev-url" title={event.url}>{event.urlLabel}</span>
									{/if}
									{#if event.client}
										<span class="ev-client">{event.client}</span>
									{/if}
									{#if event.note}
										<span class="ev-note">{event.note}</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ol>

		{#if data.eventsTruncated}
			<p class="foot-note">
				This page collected the maximum number of delivery events it will read at once, so the
				timelines above may be missing their most recent entries. Narrow the range or the purpose to
				see them all.
			</p>
		{/if}

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

	<p class="foot-note">
		Opens come from a tracking pixel: Apple Mail Privacy Protection and image-proxying clients fetch
		it whether or not anyone read the message, and clients that block images never fetch it at all.
		An open here is an indication, not a measurement. Clicks are the firmer signal. Verification mail
		never shows its subject or any provider detail, and no message body is stored anywhere in this
		database.
	</p>
{/if}

<style>
	.back {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		margin-bottom: 18px;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
		transition: color 0.18s ease;
	}
	.back:hover {
		color: var(--ink);
	}

	.tools {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.tools .a-select {
		width: auto;
		min-width: 150px;
	}
	.search {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1 1 260px;
		color: var(--mute);
	}
	.search :global(svg) {
		position: absolute;
		left: 12px;
		pointer-events: none;
	}
	.search .a-input {
		padding-left: 36px;
	}

	.result-line {
		margin: 0 0 16px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
	}

	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}
	.msg {
		padding: 16px 18px;
	}
	.msg-top {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.state {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 9px;
		border: 1px solid var(--hairline);
		border-radius: 999px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-2);
		white-space: nowrap;
	}
	.state.good {
		color: var(--ink);
		border-color: var(--hairline-2);
	}
	.state.bad {
		color: var(--danger);
		border-color: rgba(255, 90, 82, 0.35);
	}
	.state.idle {
		color: var(--mute-2);
	}
	.who {
		flex: 1;
		min-width: 0;
		font-size: 14px;
		color: var(--ink);
		word-break: break-all;
	}
	.sent {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}

	.subject {
		margin: 10px 0 0;
		font-size: 13.5px;
		color: var(--ink-2);
		line-height: 1.5;
		word-break: break-word;
	}
	.withheld {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		color: var(--mute-2);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 12px;
	}
	.chip {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mute);
		border: 1px solid var(--hairline);
		border-radius: 999px;
		padding: 3px 9px;
		white-space: nowrap;
	}
	a.chip.purpose {
		color: var(--ink-2);
		transition:
			color 0.18s ease,
			border-color 0.18s ease;
	}
	a.chip.purpose:hover {
		color: var(--ink);
		border-color: var(--hairline-2);
	}
	.chip.flag {
		color: var(--spark);
		border-color: rgba(255, 122, 26, 0.35);
	}
	.chip.faint {
		color: var(--mute-2);
		text-transform: none;
		letter-spacing: 0.04em;
	}

	.no-events {
		margin: 12px 0 0;
		font-size: 12px;
		color: var(--mute-2);
		line-height: 1.6;
		max-width: 72ch;
	}

	.events {
		list-style: none;
		margin: 12px 0 0;
		padding: 10px 0 0;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		display: grid;
		gap: 6px;
	}
	.events li {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 10px;
	}
	.ev {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-2);
		min-width: 118px;
	}
	.ev.bad {
		color: var(--danger);
	}
	.ev-at {
		font-family: var(--mono);
		font-size: 10px;
		color: var(--mute-2);
	}
	.ev-url {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--ink-2);
		word-break: break-all;
	}
	.ev-client,
	.ev-note {
		font-size: 11.5px;
		color: var(--mute);
		word-break: break-word;
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
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.a-btn.ghost {
		opacity: 0.35;
		pointer-events: none;
	}

	.foot-note {
		margin: 18px 0 0;
		font-size: 12px;
		color: var(--mute);
		max-width: 78ch;
		line-height: 1.6;
	}
	.err {
		margin-top: 10px;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute-2);
		word-break: break-word;
	}
</style>
