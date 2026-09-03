<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const STATUS_COLOR: Record<string, string> = {
		SENT: '#9fe2a0',
		RUNNING: '#ffd166',
		SKIPPED: '#6fa89c',
		FAILED: '#ff5a52'
	};

	// Only the selected month's runs, keyed by job, so the template can look one
	// up without re-scanning the list for every card.
	$: runByJob = new Map(
		data.runs.filter((run) => run.period === data.selected.key).map((run) => [run.job, run])
	);

	$: openPreview = data.preview;

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
	<title>Reports · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Scheduled</p>
		<h1 class="a-title">Monthly reports</h1>
		<p class="a-sub">
			Four jobs run themselves once a month. Read what each one would say before it goes, or make
			it happen now.
		</p>
	</div>
	<form method="GET" class="period">
		<label class="a-label" for="period">Month</label>
		<select
			id="period"
			name="period"
			class="a-select"
			on:change={(event) => event.currentTarget.form?.requestSubmit()}
		>
			{#each data.periods as period (period.key)}
				<option value={period.key} selected={period.key === data.selected.key}>{period.label}</option
				>
			{/each}
		</select>
		<noscript><button class="a-btn" type="submit">Show</button></noscript>
	</form>
</div>

{#if form?.error}
	<div class="a-card notice alert" in:fade>
		<Icon name="danger" size={18} />
		<p>{form.error}</p>
	</div>
{:else if form?.message}
	<div class="a-card notice" in:fade>
		<Icon name="tick-circle" size={18} />
		<p>{form.message}</p>
	</div>
{/if}

{#if data.runsUnavailable}
	<div class="a-card notice alert" in:fade>
		<Icon name="danger" size={18} />
		<p>{data.runsUnavailable}</p>
	</div>
{/if}

<h2 class="a-section-title"><Icon name="chart" size={14} /> {data.selected.label}, from the database</h2>

{#if data.substance.length === 0}
	<div class="a-card notice" in:fade>
		<Icon name="danger" size={18} />
		<p>
			Nothing is recorded for {data.selected.label}: no payment, no visitor, no request, no sponsor
			movement and no post. The sponsor report will skip this month rather than mail a page of
			zeros.
		</p>
	</div>
{/if}

<div class="tiles">
	{#each data.tiles as tile, i (tile.label)}
		<div class="a-card a-stat" in:fly={{ y: 10, duration: 250, delay: Math.min(i, 8) * 25 }}>
			<span class="a-stat-label">{tile.label}</span>
			<span class="a-stat-value">{tile.value}</span>
			{#if tile.note}<span class="tile-note">{tile.note}</span>{/if}
		</div>
	{/each}
</div>

{#if data.missing.length}
	<div class="a-card notice" in:fade>
		<Icon name="danger" size={18} />
		<div>
			<p>Left out of every figure above, rather than counted as zero:</p>
			<ul class="missing">
				{#each data.missing as line (line)}<li>{line}</li>{/each}
			</ul>
		</div>
	</div>
{/if}

<h2 class="a-section-title"><Icon name="calendar" size={14} /> The jobs</h2>

<div class="jobs">
	{#each data.jobs as job, i (job.key)}
		{@const run = runByJob.get(job.key)}
		<div class="a-card job" in:fly={{ y: 12, duration: 280, delay: Math.min(i, 8) * 30 }}>
			<div class="job-head">
				<div class="job-name">
					<h3>{job.label}</h3>
					<p>{job.blurb}</p>
				</div>
				{#if run}
					<span class="a-pill" style="color:{STATUS_COLOR[run.status] ?? '#6fa89c'}"
						>{run.status}</span
					>
				{:else}
					<span class="a-pill">Not run</span>
				{/if}
			</div>

			<dl class="job-facts">
				<div><dt>Goes to</dt><dd>{job.audience}</dd></div>
				<div>
					<dt>Runs</dt>
					<dd>
						Day {job.day} of the month, on {job.covers === 'previous'
							? 'the month just ended'
							: 'the month it runs in'}
					</dd>
				</div>
				<div>
					<dt>This screen</dt>
					<dd>Acting on {data.selected.label}</dd>
				</div>
			</dl>

			{#if run}
				<p class="job-run">
					{run.status === 'SENT'
						? `Sent to ${run.recipientCount} recipient${run.recipientCount === 1 ? '' : 's'} on ${when(run.completedAt)}.`
						: run.status === 'RUNNING'
							? `Started ${when(run.startedAt)} and not finished.`
							: `Recorded ${when(run.startedAt)}.`}
					{#if run.detail}<span class="job-detail">{run.detail}</span>{/if}
				</p>
			{/if}

			<div class="job-actions">
				<a class="a-btn" href="?period={data.selected.key}&job={job.key}">
					<Icon name="eye" size={14} /> Read it
				</a>

				{#if run?.campaignId}
					<a class="a-btn" href="/admin/messages/{run.campaignId}">
						Delivery record <Icon name="arrow-right4" size={13} />
					</a>
				{/if}

				{#if job.bulk}
					<form method="POST" action="?/draft&period={data.selected.key}" use:enhance>
						<input type="hidden" name="job" value={job.key} />
						<button class="a-btn" type="submit">
							<Icon name="document-text" size={14} /> Build a draft
						</button>
					</form>
					<form
						method="POST"
						action="?/run&period={data.selected.key}"
						use:enhance
						class="confirm-form"
					>
						<input type="hidden" name="job" value={job.key} />
						<label class="confirm">
							<input type="checkbox" name="confirm" />
							Send to the list
						</label>
						<button class="a-btn a-btn--solid" type="submit">
							<Icon name="send" size={14} /> Send now
						</button>
					</form>
				{:else}
					<form method="POST" action="?/run&period={data.selected.key}" use:enhance>
						<input type="hidden" name="job" value={job.key} />
						<button class="a-btn a-btn--solid" type="submit">
							<Icon name="direct-send" size={14} /> Send to {data.notifyTo}
						</button>
					</form>
				{/if}

				{#if run && run.status !== 'SENT'}
					<form method="POST" action="?/clear&period={data.selected.key}" use:enhance>
						<input type="hidden" name="job" value={job.key} />
						<button class="a-btn a-btn--danger" type="submit">
							<Icon name="close-circle" size={14} /> Clear this run
						</button>
					</form>
				{/if}
			</div>
		</div>
	{/each}
</div>

{#if data.previewError}
	<div class="a-card notice alert" in:fade>
		<Icon name="danger" size={18} />
		<p>{data.previewError}</p>
	</div>
{:else if openPreview}
	<h2 class="a-section-title"><Icon name="eye" size={14} /> The exact email</h2>
	<div class="a-card preview-card" in:fade>
		<div class="preview-head">
			<div>
				<span class="preview-subject">{openPreview.subject}</span>
				<span class="preview-meta">
					{openPreview.recipients}
					{openPreview.recipients === 1 ? 'recipient' : 'recipients'}
					{#if openPreview.sample.length}
						· {openPreview.sample.join(', ')}{openPreview.recipients > openPreview.sample.length
							? ' and more'
							: ''}
					{/if}
				</span>
			</div>
			<a class="a-btn" href="?period={data.selected.key}">Close</a>
		</div>

		{#if openPreview.skipReason}
			<div class="notice inline">
				<Icon name="danger" size={16} />
				<p>{openPreview.skipReason}</p>
			</div>
		{/if}

		<iframe class="preview" title="Rendered email" sandbox="" srcdoc={openPreview.html}></iframe>
		<p class="hint">
			Nothing has been sent. This is the email as it would arrive, rendered for the first address
			on the list.
		</p>
	</div>
{/if}

<style>
	.period {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.period :global(.a-label) {
		margin: 0;
	}
	.notice {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 18px 20px;
		margin-bottom: 12px;
		color: var(--ink-2);
	}
	.notice.alert {
		color: var(--spark);
	}
	.notice.inline {
		padding: 12px 0 0;
		margin: 0 0 14px;
	}
	.notice p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
	}
	.missing {
		margin: 8px 0 0;
		padding-left: 18px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--ink-2);
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 8px;
		margin-bottom: 26px;
	}
	.tile-note {
		display: block;
		margin-top: 6px;
		font-size: 12px;
		line-height: 1.5;
		color: var(--ink-3, #8a8a86);
	}
	.jobs {
		display: grid;
		gap: 10px;
		margin-bottom: 26px;
	}
	.job {
		padding: 18px 20px;
	}
	.job-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
	}
	.job-name h3 {
		margin: 0 0 4px;
		font-size: 15px;
		font-weight: 500;
		color: var(--ink);
	}
	.job-name p {
		margin: 0;
		font-size: 13px;
		line-height: 1.55;
		color: var(--ink-2);
	}
	.job-facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 10px 18px;
		margin: 16px 0 0;
	}
	.job-facts dt {
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-3, #8a8a86);
	}
	.job-facts dd {
		margin: 3px 0 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink-2);
	}
	.job-run {
		margin: 14px 0 0;
		font-size: 13px;
		line-height: 1.6;
		color: var(--ink-2);
	}
	.job-detail {
		display: block;
		margin-top: 4px;
		color: var(--ink-3, #8a8a86);
	}
	.job-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 16px;
	}
	.confirm-form {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.confirm {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--ink-2);
	}
	.preview-card {
		padding: 18px 20px;
	}
	.preview-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
	}
	.preview-subject {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
	}
	.preview-meta {
		display: block;
		margin-top: 4px;
		font-size: 12px;
		color: var(--ink-3, #8a8a86);
		word-break: break-word;
	}
	.preview {
		width: 100%;
		height: 620px;
		margin-top: 14px;
		border: 1px solid var(--line, #2a2a28);
		border-radius: 6px;
		background: #fff;
	}
	.hint {
		margin: 10px 0 0;
		font-size: 12px;
		color: var(--ink-3, #8a8a86);
	}
</style>
