<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
	import ChartLegend from '$lib/components/charts/ChartLegend.svelte';
	import TimeSeriesChart from '$lib/components/charts/TimeSeriesChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import RingChart from '$lib/components/charts/RingChart.svelte';
	import FunnelChart from '$lib/components/charts/FunnelChart.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const nf = new Intl.NumberFormat('en');
	const fmt = (n: number) => nf.format(Math.round(n));

	/** Whole dollars. Every figure here is already canonicalised to USD
	 *  on the row, so there is no currency mixing to hide. */
	const usd = (n: number) => `$${nf.format(Math.round(n))}`;
	/** Axis ticks: short enough to sit in a 54px gutter. */
	const usdTick = (n: number) =>
		n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(n)}`;
	const countTick = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(Math.round(n)));

	// ── the one filter, driving everything below it ─────────────────────
	let range = data.rangeKey;
	$: range = data.rangeKey;

	function onRange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		goto(`/admin?range=${value}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	// ── bucket labels ───────────────────────────────────────────────────
	function shortLabel(iso: string, unit: string): string {
		const d = new Date(iso);
		if (unit === 'hour') return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
	}
	function longLabel(iso: string, unit: string): string {
		const d = new Date(iso);
		if (unit === 'hour')
			return d.toLocaleString('en', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		if (unit === 'week')
			return `Week of ${d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`;
		return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	$: labels = data.buckets.map((b) => shortLabel(b, data.unit));
	$: longLabels = data.buckets.map((b) => longLabel(b, data.unit));

	// ── deltas ──────────────────────────────────────────────────────────
	/** No delta at all when the previous window was empty: "up from zero"
	 *  is not a percentage, it is a first. */
	function delta(current: number, before: number): { pct: number; up: boolean } | null {
		if (!before) return null;
		const pct = Math.round(((current - before) / before) * 100);
		return { pct: Math.abs(pct), up: pct >= 0 };
	}

	// ── revenue ─────────────────────────────────────────────────────────
	/* usdAmount is the canonical figure and it is nullable: it is written
	   at charge time, so a row that predates it can never be converted
	   after the fact. Those rows are excluded from the total and counted
	   separately rather than being read as zero. */
	$: revenueSummable = data.revenue.withUsd > 0;
	$: revenueDelta = revenueSummable ? delta(data.revenue.usd, data.revenue.previousUsd) : null;
	$: revenueSeries = [
		{ name: 'One-time', color: 'var(--chart-1)', values: data.revenue.oneTime },
		{ name: 'Recurring', color: 'var(--chart-2)', values: data.revenue.recurring }
	];
	$: revenueRows = data.buckets.map((b, i) => [
		longLabel(b, data.unit),
		usd(data.revenue.oneTime[i] ?? 0),
		usd(data.revenue.recurring[i] ?? 0),
		fmt((data.revenue.oneTimeCount[i] ?? 0) + (data.revenue.recurringCount[i] ?? 0))
	]);
	$: revenueEmptyText =
		data.revenue.donations === 0
			? `No donation completed in this window. Successful payments appear here as soon as one clears.`
			: `${fmt(data.revenue.donations)} ${data.revenue.donations === 1 ? 'donation' : 'donations'} completed in this window, but no row carries a USD amount, so there is nothing to total. usdAmount is written at charge time and cannot be filled in afterwards.`;
	$: revenueFootnote =
		revenueSummable && data.revenue.missingUsd > 0
			? `${fmt(data.revenue.missingUsd)} of ${fmt(data.revenue.donations)} successful donations in this window have no USD amount stored and are left out of the chart and the total.`
			: '';

	// ── traffic ─────────────────────────────────────────────────────────
	$: trafficSeries = [
		{ name: 'Page views', color: 'var(--chart-1)', values: data.traffic.views },
		{
			name: 'Visitors',
			color: 'var(--chart-2)',
			values: data.traffic.visitors,
			kind: 'line' as const
		}
	];
	$: trafficRows = data.buckets.map((b, i) => [
		longLabel(b, data.unit),
		fmt(data.traffic.views[i] ?? 0),
		fmt(data.traffic.visitors[i] ?? 0)
	]);
	$: viewsDelta = delta(data.traffic.totalViews, data.traffic.previousViews);

	// ── funnel ──────────────────────────────────────────────────────────
	$: funnelStages = [
		{
			label: 'Sessions',
			value: data.funnel.sessions,
			note: 'Visits recorded by the first-party beacon.'
		},
		{
			label: 'Sessions that opened the donate page',
			value: data.funnel.donateSessions,
			note:
				data.funnel.donateViews > data.funnel.donateSessions
					? `${fmt(data.funnel.donateViews)} page views in total. Hits whose session id was blocked collapse into one bucket, so this stage is a floor rather than an exact figure.`
					: `${fmt(data.funnel.donateViews)} page views in total.`
		},
		{
			label: 'Donations started',
			value: data.funnel.started,
			note: 'Payment records, counted from the Donation table rather than from an event.'
		},
		{
			label: 'Donations completed',
			value: data.funnel.completed,
			note:
				data.funnel.pending > 0
					? `${fmt(data.funnel.pending)} still pending, ${fmt(data.funnel.abandoned)} failed or cancelled.`
					: `${fmt(data.funnel.abandoned)} failed or cancelled.`
		}
	];
	$: funnelEmpty =
		data.funnel.sessions === 0 && data.funnel.donateViews === 0 && data.funnel.started === 0;
	$: funnelRows = funnelStages.map((s) => [s.label, fmt(s.value)]);

	// ── sponsors ────────────────────────────────────────────────────────
	/* Colour follows the tier, not the row it lands on, so a tier that is
	   empty this month does not repaint the ones that are not. */
	const TIER_ORDER = ['SUPPORTER', 'STANDARD', 'WORKSHOP', 'CUSTOM'];
	const TIER_LABEL: Record<string, string> = {
		SUPPORTER: 'Supporter',
		STANDARD: 'Standard',
		WORKSHOP: 'Workshop',
		CUSTOM: 'Custom'
	};
	const TIER_COLOR: Record<string, string> = {
		SUPPORTER: 'var(--chart-ord-1)',
		STANDARD: 'var(--chart-ord-2)',
		WORKSHOP: 'var(--chart-ord-3)',
		CUSTOM: 'var(--chart-ord-4)'
	};
	$: tierSlices = TIER_ORDER.map((tier) => data.sponsors.tiers.find((t) => t.tier === tier))
		.filter((t): t is NonNullable<typeof t> => Boolean(t) && (t as { count: number }).count > 0)
		.map((t) => ({
			label: TIER_LABEL[t.tier] ?? t.tier,
			value: t.count,
			color: TIER_COLOR[t.tier] ?? 'var(--chart-ord-2)',
			note: t.monthlyUsd > 0 ? `${usd(t.monthlyUsd)} a month` : undefined
		}));
	$: tierRows = TIER_ORDER.map((tier) => {
		const row = data.sponsors.tiers.find((t) => t.tier === tier);
		return [
			TIER_LABEL[tier] ?? tier,
			fmt(row?.count ?? 0),
			usd(row?.monthlyUsd ?? 0),
			usd(row?.lifetimeUsd ?? 0)
		];
	});
	$: sponsorEmptyText =
		data.sponsors.total > 0
			? `${fmt(data.sponsors.total)} sponsor records exist, but none is currently active: every one has either expired or been cancelled.`
			: 'No sponsor has signed up yet. A sponsorship creates a Sponsor row, and this chart fills in from there.';

	// ── service requests ────────────────────────────────────────────────
	const REQUEST_ORDER = [
		'PENDING',
		'IN_REVIEW',
		'ACCEPTED',
		'IN_PROGRESS',
		'COMPLETED',
		'REJECTED'
	];
	/** PENDING -> Pending, IN_REVIEW -> In review. */
	const statusLabel = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ');
	$: requestBars = REQUEST_ORDER.map((status) => ({
		label: statusLabel(status),
		value: data.requests.byStatus.find((r) => r.status === status)?.count ?? 0,
		href: '/admin/service-requests'
	}));
	$: requestTotal = data.requests.byStatus.reduce((a, r) => a + r.count, 0);
	$: requestRows = requestBars.map((b) => [b.label, fmt(b.value)]);

	// ── newsletter ──────────────────────────────────────────────────────
	$: newsletterSeries = [
		{ name: 'New subscribers', color: 'var(--chart-1)', values: data.newsletter.joined }
	];
	$: newsletterRows = data.buckets.map((b, i) => [
		longLabel(b, data.unit),
		fmt(data.newsletter.joined[i] ?? 0)
	]);

	// ── activity ────────────────────────────────────────────────────────
	const ACTION_ICON: Record<string, string> = {
		request: 'messages',
		project: 'box',
		service: 'setting',
		donation: 'heart',
		sponsor: 'crown',
		email: 'sms-tracking',
		newsletter: 'sms'
	};
	function when(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.round(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.round(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.round(hours / 24);
		if (days < 30) return `${days}d ago`;
		return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>Dashboard · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Control panel</p>
		<h1 class="a-title">Dashboard</h1>
		<p class="a-sub">Money, traffic and pipeline, straight out of Postgres.</p>
	</div>
	<select class="a-select range" bind:value={range} on:change={onRange} aria-label="Date range">
		{#each data.ranges as r (r.key)}
			<option value={r.key}>{r.label}</option>
		{/each}
	</select>
</div>

{#if !data.ready}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="chart" size={30} /></div>
		<h3>The dashboard cannot read the database</h3>
		<p>None of these tables answered, so there is nothing honest to show.</p>
		{#if data.error}<p class="err">{data.error}</p>{/if}
	</div>
{:else}
	<!-- Refetch keeps the frame: the previous render dims rather than
	     collapsing into a skeleton, so nothing jumps under the pointer. -->
	<div class="board" class:reloading={Boolean($navigating)}>
		<!-- ── the hero figure: exactly one per view ── -->
		<div class="a-card hero" in:fly={{ y: 16, duration: 380 }}>
			<div class="hero-main">
				<span class="a-stat-label"><Icon name="wallet" size={13} /> Revenue · {data.rangeLabel}</span>
				{#if revenueSummable}
					<span class="hero-value">{usd(data.revenue.usd)}</span>
					{#if revenueDelta}
						<span class="delta" class:down={!revenueDelta.up}>
							<Icon name={revenueDelta.up ? 'arrow-up3' : 'arrow-down4'} size={11} />
							{revenueDelta.pct}% vs previous period
						</span>
					{:else}
						<span class="hero-note">Nothing in the period before this one to compare against.</span>
					{/if}
				{:else}
					<span class="hero-value muted">Not recorded</span>
					<span class="hero-note">
						{#if data.revenue.donations === 0}
							No donation completed in this window.
						{:else}
							{fmt(data.revenue.donations)}
							{data.revenue.donations === 1 ? 'donation' : 'donations'} completed, none with a USD
							amount stored.
						{/if}
					</span>
				{/if}
			</div>
			<dl class="hero-side">
				<div>
					<dt>Successful donations</dt>
					<dd>{fmt(data.revenue.donations)}</dd>
				</div>
				<div>
					<dt>Recurring of those</dt>
					<dd>{fmt(data.revenue.recurringDonations)}</dd>
				</div>
				<div>
					<dt>Monthly recurring</dt>
					<dd>{data.sponsors.activeSubscriptions > 0 ? usd(data.sponsors.mrr) : 'None'}</dd>
				</div>
			</dl>
		</div>

		<!-- ── KPI row ── -->
		<div class="grid stats">
			<a class="a-card a-stat" href="/admin/sponsors" in:fly={{ y: 16, duration: 380, delay: 60 }}>
				<span class="a-stat-label"><Icon name="crown" size={13} /> Active sponsors</span>
				<span class="a-stat-value">{fmt(data.sponsors.active)}</span>
				<span class="stat-foot">
					{#if data.sponsors.pendingReview > 0}
						{fmt(data.sponsors.pendingReview)} awaiting review
					{:else if data.sponsors.newInRange > 0}
						{fmt(data.sponsors.newInRange)} new in this window
					{:else}
						None added in this window
					{/if}
				</span>
			</a>
			<a class="a-card a-stat" href="/admin/analytics" in:fly={{ y: 16, duration: 380, delay: 120 }}>
				<span class="a-stat-label"><Icon name="people" size={13} /> Visitors</span>
				<span class="a-stat-value">{fmt(data.traffic.totalVisitors)}</span>
				{#if viewsDelta}
					<span class="delta" class:down={!viewsDelta.up}>
						<Icon name={viewsDelta.up ? 'arrow-up3' : 'arrow-down4'} size={11} />
						{viewsDelta.pct}% views vs previous
					</span>
				{:else}
					<span class="stat-foot">{fmt(data.traffic.totalViews)} page views</span>
				{/if}
			</a>
			<a
				class="a-card a-stat"
				class:alert={data.requests.openNow > 0}
				href="/admin/service-requests"
				in:fly={{ y: 16, duration: 380, delay: 180 }}
			>
				<span class="a-stat-label"><Icon name="messages" size={13} /> Open requests</span>
				<span class="a-stat-value">{fmt(data.requests.openNow)}</span>
				<span class="stat-foot">{fmt(requestTotal)} created in this window</span>
			</a>
			<a class="a-card a-stat" href="/admin/newsletter" in:fly={{ y: 16, duration: 380, delay: 240 }}>
				<span class="a-stat-label"><Icon name="sms" size={13} /> Subscribers</span>
				<span class="a-stat-value">{fmt(data.newsletter.active)}</span>
				<span class="stat-foot">
					{data.newsletter.joinedInRange > 0
						? `+${fmt(data.newsletter.joinedInRange)} in this window`
						: 'None joined in this window'}
				</span>
			</a>
		</div>

		<!-- ── revenue over time ── -->
		<ChartFrame
			title="Revenue over time"
			note="Successful donations only, in USD, split by cadence."
			empty={!revenueSummable}
			emptyIcon="wallet"
			emptyTitle="No revenue to chart"
			emptyText={revenueEmptyText}
			footnote={revenueFootnote}
			columns={['Bucket', 'One-time', 'Recurring', 'Donations']}
			rows={revenueRows}
		>
			<ChartLegend
				slot="legend"
				items={[
					{ name: 'One-time', color: 'var(--chart-1)' },
					{ name: 'Recurring', color: 'var(--chart-2)' }
				]}
			/>
			<TimeSeriesChart
				{labels}
				tooltipLabels={longLabels}
				series={revenueSeries}
				stacked
				height={280}
				formatValue={usdTick}
				ariaLabel="Donation revenue in US dollars over {data.rangeLabel.toLowerCase()}, one-time and recurring stacked"
			/>
		</ChartFrame>

		<!-- ── traffic over time ── -->
		<ChartFrame
			title="Traffic over time"
			note="First-party, cookie-free. Visitors are counted from the daily rotating hash, so the same person on two days counts twice."
			empty={data.traffic.totalViews === 0}
			emptyIcon="graph"
			emptyTitle="No page views in this window"
			emptyText="Hits appear here as soon as someone visits the site and the beacon is not suppressed."
			columns={['Bucket', 'Page views', 'Visitors']}
			rows={trafficRows}
		>
			<ChartLegend
				slot="legend"
				items={[
					{ name: 'Page views', color: 'var(--chart-1)' },
					{ name: 'Visitors', color: 'var(--chart-2)', kind: 'line' }
				]}
			/>
			<TimeSeriesChart
				{labels}
				tooltipLabels={longLabels}
				series={trafficSeries}
				height={280}
				formatValue={countTick}
				ariaLabel="Page views and visitors over {data.rangeLabel.toLowerCase()}"
			/>
		</ChartFrame>

		<div class="grid two">
			<!-- ── conversion funnel ── -->
			<ChartFrame
				title="Donation funnel"
				note="Sessions to money, in this window."
				empty={funnelEmpty}
				emptyIcon="status-up"
				emptyTitle="Nothing has moved through the funnel"
				emptyText="No session, no donate page view and no donation was recorded in this window."
				columns={['Stage', 'Count']}
				rows={funnelRows}
				footnote="The first two stages are sessions; the last two are payment records, and the two are not joined. A donation from a visitor whose session was never recorded still counts, so a stage can exceed the one above it. Rates are suppressed below {data.minSample} at the top of a step."
			>
				<FunnelChart stages={funnelStages} minSample={data.minSample} formatValue={fmt} />
			</ChartFrame>

			<!-- ── sponsors by tier ── -->
			<ChartFrame
				title="Active sponsors by tier"
				note="Current state, not scoped to the date range: a sponsorship is either live right now or it is not."
				empty={tierSlices.length === 0}
				emptyIcon="crown"
				emptyTitle="No active sponsors"
				emptyText={sponsorEmptyText}
				columns={['Tier', 'Sponsors', 'Monthly', 'Lifetime']}
				rows={tierRows}
				footnote={data.sponsors.pastDueSubscriptions > 0
					? `${fmt(data.sponsors.pastDueSubscriptions)} subscriptions are past due and are not counted in the monthly recurring figure.`
					: ''}
			>
				<RingChart
					slices={tierSlices}
					centerValue={fmt(data.sponsors.active)}
					centerLabel="Active"
					formatValue={fmt}
					minSampleForShare={5}
				/>
				<p class="mrr">
					<span class="mrr-label">Monthly recurring</span>
					<span class="mrr-value">
						{data.sponsors.activeSubscriptions > 0 ? usd(data.sponsors.mrr) : 'None'}
					</span>
					<span class="mrr-note">
						from {fmt(data.sponsors.activeSubscriptions)} active
						{data.sponsors.activeSubscriptions === 1 ? 'subscription' : 'subscriptions'}
					</span>
				</p>
			</ChartFrame>
		</div>

		<div class="grid two">
			<!-- ── service requests ── -->
			<ChartFrame
				title="Service requests by status"
				note="Created in this window. Archived requests are excluded."
				empty={requestTotal === 0}
				emptyIcon="messages"
				emptyTitle="No requests in this window"
				emptyText={data.requests.openNow > 0
					? `Nothing new came in, but ${fmt(data.requests.openNow)} requests from earlier are still open.`
					: 'Client requests land here as soon as the form is submitted.'}
				columns={['Status', 'Requests']}
				rows={requestRows}
			>
				<BarChart bars={requestBars} formatValue={fmt} />
			</ChartFrame>

			<!-- ── newsletter growth ── -->
			<ChartFrame
				title="New newsletter subscribers"
				note="Sign-ups per bucket. Not a running total: an unsubscribe carries no date, so a cumulative line would keep counting people who have left."
				empty={data.newsletter.joinedInRange === 0}
				emptyIcon="sms"
				emptyTitle="No sign-ups in this window"
				emptyText="{fmt(data.newsletter.active)} of {fmt(
					data.newsletter.total
				)} subscribers on the list are still active."
				columns={['Bucket', 'New subscribers']}
				rows={newsletterRows}
				footnote="{fmt(data.newsletter.active)} active of {fmt(
					data.newsletter.total
				)} ever subscribed."
			>
				<TimeSeriesChart
					{labels}
					tooltipLabels={longLabels}
					series={newsletterSeries}
					height={220}
					formatValue={countTick}
					ariaLabel="New newsletter subscribers over {data.rangeLabel.toLowerCase()}"
				/>
			</ChartFrame>
		</div>

		<!-- ── recent activity ── -->
		<section class="block">
			<div class="block-head">
				<h2 class="a-section-title"><Icon name="activity" size={14} /> Recent activity</h2>
				<a class="more" href="/admin/logs">All logs <Icon name="arrow-right4" size={12} /></a>
			</div>

			{#if data.activity.length === 0}
				<div class="a-card a-empty">
					<div class="a-empty-icon"><Icon name="activity" size={30} /></div>
					<h3>Nothing logged yet</h3>
					<p>Requests, projects and payments write a line here as they happen.</p>
				</div>
			{:else}
				<ul class="log a-card">
					{#each data.activity as row (row.id)}
						<li class="log-row">
							<span class="log-icon">
								<Icon name={ACTION_ICON[row.entity] ?? 'activity'} size={14} />
							</span>
							<span class="log-main">
								<span class="log-summary">{row.summary}</span>
								<span class="log-meta">{row.action} · {row.actor}</span>
							</span>
							<time class="log-when" datetime={row.createdAt}>{when(row.createdAt)}</time>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}

<style>
	.range {
		width: auto;
		min-width: 170px;
	}

	.board {
		display: grid;
		gap: clamp(18px, 3vh, 28px);
		transition: opacity 0.2s ease;
	}
	/* refetch holds the previous render rather than flashing a skeleton */
	.board.reloading {
		opacity: 0.55;
	}
	@media (prefers-reduced-motion: reduce) {
		.board {
			transition: none;
		}
	}

	.grid {
		display: grid;
		gap: 14px;
	}
	.stats {
		grid-template-columns: repeat(4, 1fr);
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

	/* hero figure: the one number the dashboard leads with */
	.hero {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		padding: 26px 24px;
	}
	.hero-main {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.hero-value {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		/* proportional figures, not tabular: a standalone number this
		   large looks loose with every digit the width of a zero */
		font-size: clamp(46px, 6vw, 64px);
		letter-spacing: -0.035em;
		color: var(--ink);
		line-height: 1;
		margin-top: 12px;
	}
	.hero-value.muted {
		color: var(--mute);
		font-size: clamp(30px, 4vw, 40px);
	}
	.hero-note {
		margin-top: 12px;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--mute);
		max-width: 46ch;
	}
	.hero-side {
		display: grid;
		gap: 14px;
		margin: 0;
		padding-left: 24px;
		border-left: 1px solid var(--hairline);
	}
	.hero-side div {
		display: grid;
		gap: 4px;
	}
	.hero-side dt {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.hero-side dd {
		margin: 0;
		font-size: 17px;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	@media (max-width: 700px) {
		.hero-side {
			padding-left: 0;
			padding-top: 18px;
			border-left: 0;
			border-top: 1px solid var(--hairline);
			width: 100%;
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* direction is carried by the chevron and the words, never by hue alone */
	.delta {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		margin-top: 14px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--chart-delta-up);
	}
	.delta.down {
		color: var(--chart-delta-down);
	}

	.stat-foot {
		display: block;
		margin-top: 12px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mute);
	}

	.mrr {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 10px;
		margin: 18px 0 0;
		padding-top: 15px;
		border-top: 1px solid var(--hairline);
	}
	.mrr-label {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.mrr-value {
		font-size: 19px;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.mrr-note {
		font-size: 12px;
		color: var(--mute);
	}

	/* activity */
	.block-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 16px;
		transition: color 0.2s;
	}
	.more:hover {
		color: var(--ink);
	}
	.log {
		list-style: none;
		margin: 0;
		padding: 6px;
		display: grid;
		gap: 1px;
	}
	.log-row {
		display: flex;
		align-items: center;
		gap: 13px;
		padding: 11px 12px;
		border-radius: 9px;
		min-width: 0;
	}
	.log-row:hover {
		background: rgba(255, 255, 255, 0.03);
	}
	.log-icon {
		display: inline-flex;
		color: var(--mute);
		flex: 0 0 auto;
	}
	.log-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.log-summary {
		font-size: 13.5px;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.log-meta {
		font-family: var(--mono);
		font-size: 10px;
		color: var(--mute);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.log-when {
		flex: 0 0 auto;
		font-family: var(--mono);
		font-size: 10px;
		color: var(--mute-2, var(--mute));
		white-space: nowrap;
	}

	.err {
		margin-top: 10px;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute-2, var(--mute));
		word-break: break-word;
	}
</style>
