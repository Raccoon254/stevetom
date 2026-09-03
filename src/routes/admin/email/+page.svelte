<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Bars are what we sent, the line is what actually arrived. Same two-tone
	// treatment as the traffic chart, so the two pages read as one system.
	const SENT = '#ff7a1a';
	const DELIVERED = '#3f9bd1';

	const nf = new Intl.NumberFormat('en');
	const fmt = (n: number) => nf.format(n);

	let range = data.rangeKey;
	$: range = data.rangeKey;

	function onRange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		goto(`/admin/email?range=${value}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	const count = (type: string) => data.counts[type]?.messages ?? 0;
	const events = (type: string) => data.counts[type]?.events ?? 0;

	$: delivered = count('DELIVERED');
	$: opened = count('OPENED');
	$: clicked = count('CLICKED');
	$: bounced = count('BOUNCED');
	$: complained = count('COMPLAINED');
	$: failed = count('FAILED');
	$: unsubscribed = count('UNSUBSCRIBED');

	/**
	 * A percentage off a handful of messages is noise wearing a suit. Below the
	 * sample floor this returns null and the card shows the raw counts instead.
	 */
	function rate(numerator: number, denominator: number): number | null {
		if (denominator < data.minSample) return null;
		return Math.round((numerator / denominator) * 1000) / 10;
	}

	$: deliveryRate = rate(delivered, data.sent);
	$: bounceRate = rate(bounced, data.sent);
	$: complaintRate = rate(complained, data.sent);
	$: openRate = rate(opened, delivered);
	$: clickRate = rate(clicked, delivered);

	/** "62.4% of 838 sent", or the honest fallback when the sample is too thin. */
	function against(value: number | null, denominator: number, noun: string): string {
		if (denominator === 0) return `nothing ${noun} yet`;
		if (value === null) return `of ${fmt(denominator)} ${noun}, too few to rate`;
		return `${value}% of ${fmt(denominator)} ${noun}`;
	}

	// chart geometry, identical to the traffic chart
	const W = 1000;
	const H = 280;
	const PAD = { top: 18, right: 10, bottom: 34, left: 46 };
	const plotW = W - PAD.left - PAD.right;
	const plotH = H - PAD.top - PAD.bottom;

	$: series = data.series;
	$: peak = Math.max(1, ...series.map((p) => p.sent), ...series.map((p) => p.delivered));
	$: slot = series.length ? plotW / series.length : plotW;
	$: barW = Math.max(1, Math.min(slot - 2, 46));
	$: x = (i: number) => PAD.left + i * slot + (slot - barW) / 2;
	$: mid = (i: number) => PAD.left + i * slot + slot / 2;
	$: y = (v: number) => PAD.top + plotH - (v / peak) * plotH;
	$: deliveredLine = series.map((p, i) => `${mid(i)},${y(p.delivered)}`).join(' ');
	$: tickEvery = Math.max(1, Math.ceil(series.length / 7));

	let hover: number | null = null;

	function bucketLabel(iso: string, unit: string): string {
		const d = new Date(iso);
		if (unit === 'hour') {
			return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
		}
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
	}

	function when(iso: string): string {
		return new Date(iso).toLocaleString('en', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const share = (value: number, rows: { sent: number }[]) => {
		const top = Math.max(1, ...rows.map((r) => r.sent));
		return Math.round((value / top) * 100);
	};

	const FAILURE_ICON: Record<string, string> = {
		BOUNCED: 'danger',
		FAILED: 'close-circle',
		COMPLAINED: 'shield-cross'
	};
	const FAILURE_LABEL: Record<string, string> = {
		BOUNCED: 'Bounced',
		FAILED: 'Failed',
		COMPLAINED: 'Complaint'
	};

	$: hasVolume = data.sent > 0 || data.everReceived;
	$: totalEvents = Object.values(data.counts).reduce((sum, c) => sum + c.events, 0);
</script>

<svelte:head>
	<title>Email · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Delivery</p>
		<h1 class="a-title">Email</h1>
		<p class="a-sub">What Axene Mailer reports back about the mail this site sends.</p>
	</div>
	<select class="a-select range" bind:value={range} on:change={onRange} aria-label="Date range">
		{#each data.ranges as r}
			<option value={r.key}>{r.label}</option>
		{/each}
	</select>
</div>

{#if !data.ready}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="sms-tracking" size={30} /></div>
		<h3>Email analytics is not collecting yet</h3>
		<p>The EmailMessage and EmailDeliveryEvent tables are not available on this database.</p>
		{#if data.error}<p class="err">{data.error}</p>{/if}
	</div>
{:else if !hasVolume}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="sms-tracking" size={30} /></div>
		<h3>Nothing recorded yet</h3>
		<p>
			Messages appear here as they are sent, and delivery events as Axene reports them back.
		</p>
		<p class="hint">
			Events arrive only once the webhook is registered at
			<code>https://kentom.co.ke/api/webhooks/axene-mailer</code>
			in the Axene Mailer dashboard.
		</p>
	</div>
{:else}
	<div class="grid stats">
		<div class="a-card a-stat" in:fly={{ y: 16, duration: 380 }}>
			<span class="a-stat-label"><Icon name="send" size={13} /> Sent</span>
			<span class="a-stat-value">{fmt(data.sent)}</span>
			<span class="note">handed to Axene Mailer</span>
		</div>
		<div class="a-card a-stat" in:fly={{ y: 16, duration: 380, delay: 70 }}>
			<span class="a-stat-label"><Icon name="tick-circle" size={13} /> Delivered</span>
			<span class="a-stat-value">{fmt(delivered)}</span>
			<span class="note">{against(deliveryRate, data.sent, 'sent')}</span>
		</div>
		<div
			class="a-card a-stat"
			class:alert={bounced > 0}
			in:fly={{ y: 16, duration: 380, delay: 140 }}
		>
			<span class="a-stat-label"><Icon name="danger" size={13} /> Bounced</span>
			<span class="a-stat-value">{fmt(bounced)}</span>
			<span class="note">{against(bounceRate, data.sent, 'sent')}</span>
		</div>
		<div
			class="a-card a-stat"
			class:alert={complained > 0}
			in:fly={{ y: 16, duration: 380, delay: 210 }}
		>
			<span class="a-stat-label"><Icon name="shield-cross" size={13} /> Complaints</span>
			<span class="a-stat-value">{fmt(complained)}</span>
			<span class="note">{against(complaintRate, data.sent, 'sent')}</span>
		</div>
	</div>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 240 }}>
		<h2 class="a-section-title"><Icon name="eye" size={14} /> Engagement</h2>
		<div class="grid two">
			<div class="a-card conv">
				<span class="conv-label"><Icon name="eye" size={13} /> Opened</span>
				<span class="conv-value">{fmt(opened)}</span>
				<span class="note">{against(openRate, delivered, 'delivered')}</span>
			</div>
			<div class="a-card conv">
				<span class="conv-label"><Icon name="mouse-circle" size={13} /> Clicked</span>
				<span class="conv-value">{fmt(clicked)}</span>
				<span class="note">{against(clickRate, delivered, 'delivered')}</span>
			</div>
		</div>
		<p class="foot-note">
			Opens are counted from a tracking pixel and are an indication, not a measurement. Apple Mail
			Privacy Protection and image-proxying clients fetch the pixel whether or not anyone read the
			message, which inflates the number; clients that block images suppress it. Clicks are the
			firmer signal. Both are counted once per message, so re-reads do not compound.
		</p>
	</section>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 300 }}>
		<div class="block-head">
			<h2 class="a-section-title"><Icon name="graph" size={14} /> Volume over time</h2>
			<div class="legend">
				<span class="key"><i style="background:{SENT}"></i> Sent</span>
				<span class="key"><i class="line" style="background:{DELIVERED}"></i> Delivered</span>
			</div>
		</div>

		{#if data.sent === 0}
			<div class="a-card a-empty small"><p>No messages sent in this range.</p></div>
		{:else}
			<div class="a-card chart-card">
				<div class="chart-wrap">
					<svg
						viewBox="0 0 {W} {H}"
						role="img"
						aria-label="Messages sent and delivered over {data.rangeLabel.toLowerCase()}"
					>
						{#each [0, 0.5, 1] as t}
							<line
								x1={PAD.left}
								x2={W - PAD.right}
								y1={PAD.top + plotH * t}
								y2={PAD.top + plotH * t}
								class="gridline"
							/>
							<text x={PAD.left - 10} y={PAD.top + plotH * t + 5} class="axis" text-anchor="end">
								{fmt(Math.round(peak * (1 - t)))}
							</text>
						{/each}

						{#each series as point, i}
							{#if point.sent > 0}
								<rect
									x={x(i)}
									y={y(point.sent)}
									width={barW}
									height={Math.max(2, PAD.top + plotH - y(point.sent))}
									rx="3"
									fill={SENT}
									opacity={hover === null || hover === i ? 1 : 0.45}
								>
									<title
										>{bucketLabel(point.bucket, data.unit)}: {point.sent} sent, {point.delivered} delivered</title
									>
								</rect>
							{/if}
						{/each}

						{#if series.length > 1}
							<polyline points={deliveredLine} class="delivered" stroke={DELIVERED} />
						{/if}

						{#each series as point, i}
							{#if i % tickEvery === 0}
								<text x={mid(i)} y={H - 10} class="axis" text-anchor="middle">
									{bucketLabel(point.bucket, data.unit)}
								</text>
							{/if}
						{/each}

						{#each series as _, i}
							<rect
								x={PAD.left + i * slot}
								y={PAD.top}
								width={slot}
								height={plotH}
								fill="transparent"
								role="presentation"
								on:mouseenter={() => (hover = i)}
								on:mouseleave={() => (hover = null)}
							/>
						{/each}
					</svg>

					{#if hover !== null && series[hover]}
						<div
							class="tip"
							style="left:{((mid(hover) / W) * 100).toFixed(2)}%"
							transition:fade={{ duration: 90 }}
						>
							<span class="tip-when">{bucketLabel(series[hover].bucket, data.unit)}</span>
							<span class="tip-row"
								><i style="background:{SENT}"></i>{fmt(series[hover].sent)} sent</span
							>
							<span class="tip-row"
								><i style="background:{DELIVERED}"></i>{fmt(series[hover].delivered)} delivered</span
							>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</section>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 360 }}>
		<h2 class="a-section-title"><Icon name="tag" size={14} /> By tag</h2>
		{#if data.tags.length === 0}
			<div class="a-card a-empty small"><p>No tagged sends in this range.</p></div>
		{:else}
			<ul class="list a-card">
				{#each data.tags as row}
					<li class="item tag-row">
						<span class="bar" style="width:{share(row.sent, data.tags)}%"></span>
						<span class="name" title={row.tag}>{row.tag}</span>
						<span class="metrics">
							<span class="m"><b>{fmt(row.sent)}</b> sent</span>
							<span class="m"><b>{fmt(row.delivered)}</b> delivered</span>
							<span class="m"><b>{fmt(row.opened)}</b> opened</span>
							<span class="m" class:bad={row.bounced > 0}><b>{fmt(row.bounced)}</b> bounced</span>
						</span>
					</li>
				{/each}
			</ul>
			<p class="foot-note">
				Counts, not rates: a single tag rarely carries enough volume for a percentage to mean
				anything. Messages sent without a tag are grouped as
				<code>(untagged)</code>.
			</p>
		{/if}
	</section>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 420 }}>
		<h2 class="a-section-title"><Icon name="close-circle" size={14} /> Recent hard failures</h2>
		{#if data.failures.length === 0}
			<div class="a-card a-empty small">
				<p>No bounces, failures or complaints in this range.</p>
			</div>
		{:else}
			<ol class="feed">
				{#each data.failures as f, i (f.id)}
					<li class="entry" in:fly={{ y: 12, duration: 300, delay: Math.min(i, 12) * 30 }}>
						<span class="ent-icon"><Icon name={FAILURE_ICON[f.type] ?? 'danger'} size={15} /></span>
						<div class="main">
							<p class="summary">{f.recipient ?? 'Unknown recipient'}</p>
							<p class="meta">
								<span class="kind">{FAILURE_LABEL[f.type] ?? f.type}</span>
								{#if f.subject}
									<span class="dot">·</span>
									<span class="subject" title={f.subject}>{f.subject}</span>
								{/if}
							</p>
							{#if f.reason}
								<p class="reason">{f.reason}</p>
							{/if}
						</div>
						<time class="time">{when(f.occurredAt)}</time>
					</li>
				{/each}
			</ol>
		{/if}
	</section>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 480 }}>
		<h2 class="a-section-title"><Icon name="activity" size={14} /> Webhook health</h2>
		<div class="a-card health">
			<div class="h-row">
				<span class="h-label">Events received</span>
				<span class="h-value">{fmt(totalEvents)}</span>
			</div>
			<div class="h-row">
				<span class="h-label">Last event</span>
				<span class="h-value">{data.lastEventAt ? when(data.lastEventAt) : 'Never'}</span>
			</div>
			<div class="h-row">
				<span class="h-label">Opens recorded</span>
				<span class="h-value">{fmt(events('OPENED'))} across {fmt(opened)} messages</span>
			</div>
			<div class="h-row">
				<span class="h-label">Failed</span>
				<span class="h-value">{fmt(failed)}</span>
			</div>
			<div class="h-row">
				<span class="h-label">Unsubscribed</span>
				<span class="h-value">{fmt(unsubscribed)}</span>
			</div>
			<div class="h-row">
				<span class="h-label">Uncorrelated events</span>
				<span class="h-value">{fmt(data.uncorrelated)}</span>
			</div>
		</div>
		<p class="foot-note">
			Uncorrelated events are deliveries Axene reported for a message this database has no record
			of sending, usually mail sent from the Axene dashboard or from another service on the same
			account. They are kept but excluded from every rate above, because the denominator does not
			contain them.
		</p>
	</section>
{/if}

<style>
	.range {
		width: auto;
		min-width: 170px;
	}

	.grid {
		display: grid;
		gap: 14px;
	}
	.stats {
		grid-template-columns: repeat(4, 1fr);
		margin-bottom: clamp(28px, 5vh, 48px);
	}
	.two {
		grid-template-columns: repeat(2, 1fr);
		align-items: start;
	}
	@media (max-width: 900px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
		.two {
			grid-template-columns: 1fr;
		}
	}

	.block {
		margin-bottom: clamp(28px, 5vh, 48px);
	}
	.block-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
	}

	.note {
		display: block;
		margin-top: 12px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mute);
	}

	/* legend: identity is never colour alone, each key is labelled */
	.legend {
		display: flex;
		gap: 16px;
		margin-bottom: 16px;
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.key i {
		width: 9px;
		height: 9px;
		border-radius: 2px;
	}
	.key i.line {
		height: 2px;
		border-radius: 2px;
	}

	.chart-card {
		padding: 16px 14px 8px;
	}
	.chart-wrap {
		position: relative;
	}
	.chart-wrap svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
	line.gridline {
		stroke: rgba(255, 255, 255, 0.08);
		stroke-width: 1;
	}
	text.axis {
		fill: #6fa89c;
		font-family: var(--mono);
		font-size: 15px;
		letter-spacing: 0.04em;
	}
	polyline.delivered {
		fill: none;
		stroke-width: 2.5;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	rect {
		transition: opacity 0.15s ease;
	}

	.tip {
		position: absolute;
		top: 4px;
		transform: translateX(-50%);
		display: grid;
		gap: 3px;
		padding: 9px 11px;
		background: var(--panel);
		border: 1px solid var(--hairline-2);
		border-radius: 9px;
		pointer-events: none;
		white-space: nowrap;
		z-index: 2;
	}
	.tip-when {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.tip-row {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 12.5px;
		color: var(--ink);
	}
	.tip-row i {
		width: 8px;
		height: 8px;
		border-radius: 2px;
	}

	/* engagement cards */
	.conv {
		padding: 18px 20px;
	}
	.conv-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.conv-value {
		display: block;
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: 30px;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin-top: 8px;
		line-height: 1;
	}
	.foot-note {
		margin: 14px 0 0;
		font-size: 12px;
		color: var(--mute);
		max-width: 72ch;
		line-height: 1.6;
	}
	.foot-note code,
	.hint code {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--ink-2);
	}
	.hint {
		margin-top: 12px;
		font-size: 13px;
		color: var(--mute-2);
	}

	/* tag breakdown */
	.list {
		list-style: none;
		margin: 0;
		padding: 6px;
		display: grid;
		gap: 2px;
	}
	.item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 8px;
		overflow: hidden;
	}
	.bar {
		position: absolute;
		inset: 0 auto 0 0;
		background: rgba(255, 122, 26, 0.14);
		border-radius: 8px;
	}
	.name {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
		font-size: 13px;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.metrics {
		position: relative;
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}
	.m {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mute);
		white-space: nowrap;
	}
	.m b {
		font-weight: 500;
		color: var(--ink-2);
	}
	.m.bad b {
		color: var(--spark);
	}
	@media (max-width: 720px) {
		.tag-row {
			flex-wrap: wrap;
		}
		.metrics {
			justify-content: flex-start;
			gap: 10px;
		}
	}

	/* failures feed, same shape as the activity log */
	.feed {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 2px;
	}
	.entry {
		display: grid;
		grid-template-columns: 38px 1fr auto;
		align-items: center;
		gap: 14px;
		padding: 13px 16px;
		border: 1px solid transparent;
		border-radius: 10px;
		transition:
			background 0.18s ease,
			border-color 0.18s ease;
	}
	.entry:hover {
		background: rgba(255, 255, 255, 0.025);
		border-color: var(--hairline);
	}
	.ent-icon {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border: 1px solid var(--hairline);
		border-radius: 9px;
		color: var(--danger);
	}
	.main {
		min-width: 0;
	}
	.summary {
		margin: 0;
		font-size: 14px;
		color: var(--ink);
		line-height: 1.4;
		word-break: break-word;
	}
	.meta {
		margin: 3px 0 0;
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		min-width: 0;
	}
	.kind {
		color: var(--danger);
		flex: 0 0 auto;
	}
	.dot {
		color: var(--mute-2);
	}
	.subject {
		color: var(--mute);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.reason {
		margin: 5px 0 0;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute-2);
		line-height: 1.5;
		word-break: break-word;
	}
	.time {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}
	@media (max-width: 560px) {
		.time {
			display: none;
		}
	}

	/* webhook health */
	.health {
		padding: 6px;
		display: grid;
		gap: 2px;
	}
	.h-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 11px 14px;
		border-radius: 8px;
	}
	.h-row:hover {
		background: rgba(255, 255, 255, 0.025);
	}
	.h-label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.h-value {
		font-size: 13px;
		color: var(--ink);
		text-align: right;
	}

	.a-empty.small {
		padding: 34px 20px;
	}
	.err {
		margin-top: 10px;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute-2);
		word-break: break-word;
	}
</style>
