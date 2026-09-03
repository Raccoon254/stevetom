<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
	import ChartLegend from '$lib/components/charts/ChartLegend.svelte';
	import TimeSeriesChart from '$lib/components/charts/TimeSeriesChart.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	/* The traffic chart used to be a hand-rolled SVG in this file, with its
	   own geometry, its own tooltip and two hard-coded hexes. It is now the
	   shared TimeSeriesChart, so the dashboard and this page draw the same
	   quantity the same way and there is one chart implementation in the
	   codebase rather than two. The colours come from the validated chart
	   palette (see $lib/components/charts/chart-tokens.css) instead of the
	   accent orange, which is a UI colour rather than a series colour. */

	const nf = new Intl.NumberFormat('en');
	const fmt = (n: number) => nf.format(n);
	const countTick = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(Math.round(n)));

	let range = data.rangeKey;
	$: range = data.rangeKey;

	function onRange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		goto(`/admin/analytics?range=${value}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	// ── traffic series ──────────────────────────────────────────────────────
	function bucketLabel(iso: string, unit: string): string {
		const d = new Date(iso);
		if (unit === 'hour') {
			return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
		}
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
	}
	function bucketLabelLong(iso: string, unit: string): string {
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

	$: labels = data.series.map((p) => bucketLabel(p.bucket, data.unit));
	$: longLabels = data.series.map((p) => bucketLabelLong(p.bucket, data.unit));
	$: trafficSeries = [
		{ name: 'Page views', color: 'var(--chart-1)', values: data.series.map((p) => p.views) },
		{
			name: 'Visitors',
			color: 'var(--chart-2)',
			values: data.series.map((p) => p.visitors),
			kind: 'line' as const
		}
	];
	$: trafficRows = data.series.map((p) => [
		bucketLabelLong(p.bucket, data.unit),
		fmt(p.views),
		fmt(p.visitors)
	]);

	// ── breakdown helpers ───────────────────────────────────────────────────
	const share = (count: number, rows: { count: number }[]) => {
		const top = Math.max(1, ...rows.map((r) => r.count));
		return Math.round((count / top) * 100);
	};

	const COUNTRY_NAMES: Record<string, string> = {
		KE: 'Kenya',
		US: 'United States',
		GB: 'United Kingdom',
		IN: 'India',
		NG: 'Nigeria',
		ZA: 'South Africa',
		TZ: 'Tanzania',
		UG: 'Uganda',
		DE: 'Germany',
		FR: 'France',
		CA: 'Canada',
		AU: 'Australia',
		NL: 'Netherlands',
		BR: 'Brazil',
		JP: 'Japan',
		CN: 'China',
		AE: 'United Arab Emirates',
		SE: 'Sweden',
		ES: 'Spain',
		IT: 'Italy'
	};

	/** Regional-indicator flag from the ISO code itself, no image assets. */
	function flag(code: string): string {
		if (!/^[A-Z]{2}$/.test(code)) return '';
		return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
	}

	const DEVICE_ICON: Record<string, string> = {
		DESKTOP: 'monitor',
		MOBILE: 'mobile',
		TABLET: 'devices',
		BOT: 'cpu',
		UNKNOWN: 'global'
	};

	const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

	// ── deltas ──────────────────────────────────────────────────────────────
	function delta(current: number, before: number): { pct: number; up: boolean } | null {
		if (!before) return null;
		const pct = Math.round(((current - before) / before) * 100);
		return { pct: Math.abs(pct), up: pct >= 0 };
	}

	$: viewsDelta = delta(data.totals.views, data.previous.views);
	$: visitorsDelta = delta(data.totals.visitors, data.previous.visitors);
	$: perSession = data.totals.sessions
		? (data.totals.views / data.totals.sessions).toFixed(1)
		: '0.0';

	$: hasTraffic = data.totals.views > 0;
</script>

<svelte:head>
	<title>Analytics · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Traffic</p>
		<h1 class="a-title">Analytics</h1>
		<p class="a-sub">First-party, cookie-free. Nothing leaves this server.</p>
	</div>
	<select class="a-select range" bind:value={range} on:change={onRange} aria-label="Date range">
		{#each data.ranges as r}
			<option value={r.key}>{r.label}</option>
		{/each}
	</select>
</div>

{#if !data.ready}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="graph" size={30} /></div>
		<h3>Analytics is not collecting yet</h3>
		<p>The PageView and AnalyticsEvent tables are not available on this database.</p>
		{#if data.error}<p class="err">{data.error}</p>{/if}
	</div>
{:else}
	<div class="grid stats">
		<div class="a-card a-stat" in:fly={{ y: 16, duration: 380 }}>
			<span class="a-stat-label"><Icon name="eye" size={13} /> Page views</span>
			<span class="a-stat-value">{fmt(data.totals.views)}</span>
			{#if viewsDelta}
				<span class="delta" class:down={!viewsDelta.up}>
					<Icon name={viewsDelta.up ? 'arrow-up3' : 'arrow-down4'} size={11} />
					{viewsDelta.pct}% vs previous period
				</span>
			{/if}
		</div>
		<div class="a-card a-stat" in:fly={{ y: 16, duration: 380, delay: 70 }}>
			<span class="a-stat-label"><Icon name="people" size={13} /> Visitors</span>
			<span class="a-stat-value">{fmt(data.totals.visitors)}</span>
			{#if visitorsDelta}
				<span class="delta" class:down={!visitorsDelta.up}>
					<Icon name={visitorsDelta.up ? 'arrow-up3' : 'arrow-down4'} size={11} />
					{visitorsDelta.pct}% vs previous period
				</span>
			{/if}
		</div>
		<div class="a-card a-stat" in:fly={{ y: 16, duration: 380, delay: 140 }}>
			<span class="a-stat-label"><Icon name="devices" size={13} /> Sessions</span>
			<span class="a-stat-value">{fmt(data.totals.sessions)}</span>
		</div>
		<div class="a-card a-stat" in:fly={{ y: 16, duration: 380, delay: 210 }}>
			<span class="a-stat-label"><Icon name="document-text" size={13} /> Views per session</span>
			<span class="a-stat-value">{perSession}</span>
		</div>
	</div>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 240 }}>
		<ChartFrame
			title="Traffic over time"
			note="Visitors are counted from the daily rotating hash, so the same person on two days counts twice."
			empty={!hasTraffic}
			emptyIcon="graph"
			emptyTitle="No page views in this range"
			emptyText="Hits appear here as soon as someone visits the site."
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
	</section>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 300 }}>
		<h2 class="a-section-title"><Icon name="status-up" size={14} /> Conversions</h2>
		<div class="grid convs">
			{#each data.conversions as c}
				<div class="a-card conv">
					<span class="conv-label"><Icon name={c.icon} size={13} /> {c.label}</span>
					<span class="conv-value">{fmt(c.count)}</span>
				</div>
			{/each}
		</div>
		<p class="foot-note">
			Form conversions are recorded when the server accepts them. Donations and sponsor signups are
			counted from the payment records themselves.
		</p>
	</section>

	<div class="grid two" in:fly={{ y: 16, duration: 420, delay: 360 }}>
		<section class="block">
			<h2 class="a-section-title"><Icon name="document-text" size={14} /> Top pages</h2>
			{#if data.pages.length === 0}
				<div class="a-card a-empty small"><p>No pages recorded yet.</p></div>
			{:else}
				<ul class="list a-card">
					{#each data.pages as row}
						<li class="item">
							<span class="bar" style="width:{share(row.count, data.pages)}%"></span>
							<span class="name" title={row.label}>{row.label}</span>
							<span class="count">{fmt(row.count)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="block">
			<h2 class="a-section-title"><Icon name="link" size={14} /> Top referrers</h2>
			{#if data.referrers.length === 0}
				<div class="a-card a-empty small"><p>No external referrers yet.</p></div>
			{:else}
				<ul class="list a-card">
					{#each data.referrers as row}
						<li class="item">
							<span class="bar" style="width:{share(row.count, data.referrers)}%"></span>
							<span class="name">{row.label}</span>
							<span class="count">{fmt(row.count)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>

	<div class="grid two" in:fly={{ y: 16, duration: 420, delay: 420 }}>
		<section class="block">
			<h2 class="a-section-title"><Icon name="global" size={14} /> Countries</h2>
			{#if data.countries.length === 0}
				<div class="a-card a-empty small"><p>No country data yet.</p></div>
			{:else}
				<ul class="list a-card">
					{#each data.countries as row}
						<li class="item">
							<span class="bar" style="width:{share(row.count, data.countries)}%"></span>
							<span class="name">
								<span class="flag">{flag(row.label)}</span>
								{COUNTRY_NAMES[row.label] ?? row.label}
							</span>
							<span class="count">{fmt(row.count)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="block">
			<h2 class="a-section-title"><Icon name="devices" size={14} /> Devices</h2>
			{#if data.devices.length === 0}
				<div class="a-card a-empty small"><p>No device data yet.</p></div>
			{:else}
				<ul class="list a-card">
					{#each data.devices as row}
						<li class="item">
							<span class="bar" style="width:{share(row.count, data.devices)}%"></span>
							<span class="name">
								<Icon name={DEVICE_ICON[row.label] ?? 'global'} size={13} />
								{title(row.label)}
							</span>
							<span class="count">{fmt(row.count)}</span>
						</li>
					{/each}
					{#each data.browsers as row}
						<li class="item browser">
							<span class="bar" style="width:{share(row.count, data.browsers)}%"></span>
							<span class="name">{row.label}</span>
							<span class="count">{fmt(row.count)}</span>
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

	.grid {
		display: grid;
		gap: 14px;
	}
	.stats {
		grid-template-columns: repeat(4, 1fr);
		margin-bottom: clamp(28px, 5vh, 48px);
	}
	.convs {
		grid-template-columns: repeat(3, 1fr);
	}
	.two {
		grid-template-columns: repeat(2, 1fr);
		align-items: start;
	}
	@media (max-width: 900px) {
		.stats,
		.convs {
			grid-template-columns: repeat(2, 1fr);
		}
		.two {
			grid-template-columns: 1fr;
		}
	}

	.block {
		margin-bottom: clamp(28px, 5vh, 48px);
	}

	.delta {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		margin-top: 12px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--chart-delta-up);
	}
	.delta.down {
		color: var(--chart-delta-down);
	}

	/* conversions */
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
		max-width: 62ch;
	}

	/* breakdown lists */
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
	.item.browser .bar {
		background: rgba(63, 155, 209, 0.12);
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
	.flag {
		font-size: 14px;
		line-height: 1;
	}
	.count {
		position: relative;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--ink-2);
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
