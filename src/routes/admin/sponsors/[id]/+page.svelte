<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: sponsor = data.sponsor;
	// The sponsor's own page is reachable only for a public, approved listing.
	$: publicPageLive = sponsor.visibility === 'PUBLIC' && sponsor.moderation === 'APPROVED';
	$: activeSub = sponsor.subscriptions.find(
		(s) => s.status === 'ACTIVE' || s.status === 'PAST_DUE'
	);

	let busy = '';
	let slugUnlocked = false;
	let endImmediate = false;

	const run = (name: string) => () => {
		busy = name;
		return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
			await update({ reset: false });
			busy = '';
			slugUnlocked = false;
		};
	};

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
	const DONATION_COLOR: Record<string, string> = {
		SUCCESS: '#9fe2a0',
		PENDING: '#ffd166',
		FAILED: '#ff5a52',
		CANCELLED: '#ff5a52'
	};
	const SUB_COLOR: Record<string, string> = {
		ACTIVE: '#9fe2a0',
		PAST_DUE: '#ffd166',
		CANCELLED: '#ff5a52',
		COMPLETED: '#6fa89c'
	};

	const usd = (amount: number) =>
		amount >= 1000
			? `$${Math.round(amount).toLocaleString()}`
			: `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;

	const money = (amount: number, currency: string) =>
		currency === 'USD' ? usd(amount) : `${currency} ${amount.toLocaleString()}`;

	function day(value: string | Date | null | undefined): string {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function when(value: string | Date | null | undefined): string {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleString('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{sponsor.displayName} · Sponsors · kenTom Admin</title>
</svelte:head>

<a class="back" href="/admin/sponsors">
	<Icon name="arrow-left4" size={13} /> All sponsors
</a>

<div class="a-head">
	<div class="ident">
		<img class="a-avatar" src={avatar(sponsor.email)} alt="" width="52" height="52" />
		<div>
			<p class="a-eyebrow">{sponsor.email}</p>
			<h1 class="a-title">{sponsor.displayName}</h1>
			<p class="a-sub">
				{TIER_LABEL[sponsor.tier] ?? sponsor.tier} ·
				{sponsor.cadence === 'RECURRING' ? 'Recurring' : 'One time'} · started {day(
					sponsor.startedAt
				)}
			</p>
		</div>
	</div>
	<div class="head-pills">
		<span class="a-pill" style="color:{STATE_COLOR[sponsor.moderation]}">
			{STATE_LABEL[sponsor.moderation] ?? sponsor.moderation}
		</span>
		<span class="a-pill" style="color:{data.listed ? '#9fe2a0' : 'var(--mute)'}">
			{data.listed ? 'On the wall' : 'Not listed'}
		</span>
	</div>
</div>

{#if form?.error}
	<div class="a-card notice danger" in:fade>
		<Icon name="danger" size={18} />
		<p>{form.error}</p>
	</div>
{:else if form?.message}
	<div class="a-card notice ok" in:fade>
		<Icon name="tick-circle" size={18} />
		<p>{form.message}</p>
	</div>
{/if}

{#if sponsor.moderation === 'PENDING_REVIEW'}
	<section class="a-card review" in:fade>
		<h2 class="review-title"><Icon name="shield-tick" size={16} /> Waiting for review</h2>
		<p class="review-copy">
			Nothing they wrote is on the wall yet. This is what they submitted. Approve it to publish it,
			or reject it to keep it down permanently.
		</p>
		<dl class="submitted">
			<div><dt>Display name</dt><dd>{sponsor.displayName}</dd></div>
			<div><dt>Organisation</dt><dd>{sponsor.orgName || 'None given'}</dd></div>
			<div>
				<dt>Website</dt>
				<dd>
					{#if sponsor.websiteUrl}
						<a class="ext" href={sponsor.websiteUrl} target="_blank" rel="noreferrer nofollow">
							{sponsor.websiteUrl}
						</a>
					{:else}
						None given
					{/if}
				</dd>
			</div>
			<div><dt>Blurb</dt><dd>{sponsor.blurb || 'None given'}</dd></div>
		</dl>
		{#if sponsor.logoUrl && data.allowsLogo}
			<div class="logo-preview">
				<img src={sponsor.logoUrl} alt="Submitted logo" loading="lazy" />
				<span>Submitted logo, as the wall would render it.</span>
			</div>
		{/if}
		<div class="review-actions">
			<form method="POST" action="?/approve" use:enhance={run('approve')}>
				<button class="a-btn a-btn--solid" type="submit" disabled={busy !== ''}>
					<Icon name="tick-circle" size={14} />
					{busy === 'approve' ? 'Approving' : 'Approve'}
				</button>
			</form>
			<form method="POST" action="?/reject" use:enhance={run('reject')}>
				<button class="a-btn a-btn--danger" type="submit" disabled={busy !== ''}>
					<Icon name="close-circle" size={14} />
					{busy === 'reject' ? 'Rejecting' : 'Reject'}
				</button>
			</form>
		</div>
	</section>
{/if}

<div class="stats">
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="wallet" size={13} /> Monthly (USD)</span>
		<span class="a-stat-value">{usd(sponsor.monthlyUsd)}</span>
	</div>
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="heart" size={13} /> Lifetime (USD)</span>
		<span class="a-stat-value">{usd(sponsor.lifetimeUsd)}</span>
	</div>
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="receipt-item" size={13} /> Donations</span>
		<span class="a-stat-value">{data.donationCount}</span>
	</div>
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="crown" size={13} /> Tier</span>
		<span class="a-stat-value small">{TIER_LABEL[sponsor.tier] ?? sponsor.tier}</span>
	</div>
</div>

<section class="block">
	<h2 class="a-section-title"><Icon name="eye" size={14} /> Standing</h2>
	<dl class="defs a-card">
		<div>
			<dt>On the partners wall</dt>
			<dd class:live={data.listed}>
				{data.listed ? 'Yes, listed right now' : data.past ? 'No, past supporter' : 'No'}
			</dd>
		</div>
		<div><dt>Visibility</dt><dd>{VISIBILITY_LABEL[sponsor.visibility] ?? sponsor.visibility}</dd></div>
		<div>
			<dt>Moderation</dt>
			<dd>{STATE_LABEL[sponsor.moderation] ?? sponsor.moderation}</dd>
		</div>
		<div><dt>Cadence</dt><dd>{sponsor.cadence === 'RECURRING' ? 'Recurring' : 'One time'}</dd></div>
		<div><dt>Started</dt><dd>{day(sponsor.startedAt)}</dd></div>
		<div>
			<dt>Listing expires</dt>
			<dd>{sponsor.expiresAt ? day(sponsor.expiresAt) : 'No expiry while recurring'}</dd>
		</div>
		<div>
			<dt>Cancelled</dt>
			<dd>{sponsor.cancelledAt ? day(sponsor.cancelledAt) : 'Not cancelled'}</dd>
		</div>
		<div>
			<dt>Public page</dt>
			<dd>
				<a class="ext" href="/partners/{sponsor.slug}" target="_blank" rel="noreferrer">
					/partners/{sponsor.slug}
				</a>
				{#if !publicPageLive}
					<span class="warn-inline">404s until public and approved</span>
				{/if}
			</dd>
		</div>
	</dl>

	{#if data.blockers.length}
		<ul class="blockers">
			{#each data.blockers as reason (reason)}
				<li><Icon name="slash" size={13} /> {reason}</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="block">
	<h2 class="a-section-title"><Icon name="shield-tick" size={14} /> Moderation</h2>
	<div class="a-card panel">
		<p class="panel-copy">
			Rejecting takes the listing off the wall the moment it is saved. It never touches the
			donations below: the money is a ledger and stays exactly as it is.
		</p>
		<div class="row-actions">
			<form method="POST" action="?/approve" use:enhance={run('approve')}>
				<button
					class="a-btn"
					type="submit"
					disabled={busy !== '' || sponsor.moderation === 'APPROVED'}
				>
					<Icon name="tick-circle" size={14} />
					{busy === 'approve' ? 'Approving' : 'Approve'}
				</button>
			</form>
			<form method="POST" action="?/reject" use:enhance={run('reject')}>
				<button
					class="a-btn a-btn--danger"
					type="submit"
					disabled={busy !== '' || sponsor.moderation === 'REJECTED'}
				>
					<Icon name="close-circle" size={14} />
					{busy === 'reject' ? 'Rejecting' : 'Reject'}
				</button>
			</form>
		</div>

		<form class="visibility" method="POST" action="?/visibility" use:enhance={run('visibility')}>
			<div class="a-field">
				<label class="a-label" for="visibility">Visibility</label>
				<!-- selected per option, not value on the select: the form has to be
				     right in the HTML the server sends, before any hydration. -->
				<select class="a-select" id="visibility" name="visibility">
					<option value="PUBLIC" selected={sponsor.visibility === 'PUBLIC'}>
						Public · named on the wall
					</option>
					<option value="ANONYMOUS" selected={sponsor.visibility === 'ANONYMOUS'}>
						Anonymous · counted, never named
					</option>
					<option value="PRIVATE" selected={sponsor.visibility === 'PRIVATE'}>
						Private · never shown at all
					</option>
				</select>
			</div>
			<button class="a-btn" type="submit" disabled={busy !== ''}>
				{busy === 'visibility' ? 'Saving' : 'Save visibility'}
			</button>
			<p class="hint">
				Consent is theirs. Only move this to public if they asked for it: paying is not permission
				to publish someone's name.
			</p>
		</form>
	</div>
</section>

<section class="block">
	<h2 class="a-section-title"><Icon name="edit" size={14} /> Listing details</h2>
	<form class="a-card panel" method="POST" action="?/details" use:enhance={run('details')}>
		<div class="grid-2">
			<div class="a-field">
				<label class="a-label" for="displayName">Display name</label>
				<input
					class="a-input"
					id="displayName"
					name="displayName"
					value={sponsor.displayName}
					maxlength="120"
					required
				/>
			</div>
			<div class="a-field">
				<label class="a-label" for="orgName">Organisation</label>
				<input
					class="a-input"
					id="orgName"
					name="orgName"
					value={sponsor.orgName ?? ''}
					maxlength="120"
				/>
			</div>
		</div>

		<div class="a-field">
			<label class="a-label" for="websiteUrl">Website</label>
			<input
				class="a-input"
				id="websiteUrl"
				name="websiteUrl"
				value={sponsor.websiteUrl ?? ''}
				placeholder="https://example.com"
				maxlength="300"
			/>
		</div>

		<div class="a-field">
			<label class="a-label" for="logoUrl">Logo URL</label>
			<input
				class="a-input"
				id="logoUrl"
				name="logoUrl"
				value={data.allowsLogo ? (sponsor.logoUrl ?? '') : ''}
				placeholder="https://example.com/logo.svg"
				maxlength="500"
				disabled={!data.allowsLogo}
			/>
			{#if !data.allowsLogo}
				<p class="hint warn">
					<Icon name="danger" size={13} />
					A logo is a Workshop benefit. This sponsor is on the {TIER_LABEL[sponsor.tier] ??
						sponsor.tier} tier, so a logo is never rendered for them and this field is closed. The tier
					follows what they paid and is not editable here.
				</p>
				{#if sponsor.logoUrl}
					<label class="check">
						<input type="checkbox" name="removeLogo" />
						<span>
							A logo is on file ({sponsor.logoUrl}) but is not displayed anywhere. Remove it.
						</span>
					</label>
				{/if}
			{:else if sponsor.logoUrl}
				<div class="logo-preview small">
					<img src={sponsor.logoUrl} alt="Current logo" loading="lazy" />
					<span>Current logo. Clear the field to remove it.</span>
				</div>
			{/if}
		</div>

		<div class="a-field">
			<label class="a-label" for="blurb">Blurb</label>
			<textarea
				class="a-textarea"
				id="blurb"
				name="blurb"
				maxlength="300"
				placeholder="One line, shown on their own page">{sponsor.blurb ?? ''}</textarea
			>
		</div>

		<div class="a-field">
			<label class="a-label" for="slug">Slug</label>
			<div class="slug-row">
				<input
					class="a-input"
					id="slug"
					name="slug"
					value={sponsor.slug}
					maxlength="60"
					readonly={!slugUnlocked}
					class:locked={!slugUnlocked}
				/>
				{#if !slugUnlocked}
					<button class="a-btn" type="button" on:click={() => (slugUnlocked = true)}>
						Change slug
					</button>
				{/if}
			</div>
			{#if slugUnlocked}
				<p class="hint warn">
					<Icon name="danger" size={13} />
					Changing this breaks every link already shared. /partners/{sponsor.slug} will 404 for anyone
					holding it, including the sponsor's own badge and anything they put in a deck or an email.
					A taken or reserved slug is resolved with a numeric suffix rather than refused.
				</p>
			{/if}
		</div>

		<button class="a-btn a-btn--solid" type="submit" disabled={busy !== ''}>
			<Icon name="tick-circle" size={14} />
			{busy === 'details' ? 'Saving' : 'Save details'}
		</button>
	</form>
</section>

<section class="block">
	<h2 class="a-section-title"><Icon name="timer" size={14} /> Subscription</h2>
	{#if sponsor.subscriptions.length === 0}
		<div class="a-card a-empty">
			<div class="a-empty-icon"><Icon name="timer" size={28} /></div>
			<h3>No subscription</h3>
			<p>Nothing recurring was ever set up for this sponsor.</p>
		</div>
	{:else}
		<div class="rows">
			{#each sponsor.subscriptions as sub (sub.id)}
				<div class="a-card sub-row">
					<div class="main">
						<span class="line">{usd(sub.amountUsd)} · {sub.interval}</span>
						<span class="meta">
							{sub.provider.toLowerCase()}
							{#if sub.subscriptionCode}· {sub.subscriptionCode}{/if}
							{#if sub.currentPeriodEnd}· period ends {day(sub.currentPeriodEnd)}{/if}
							{#if sub.cancelledAt}· cancelled {day(sub.cancelledAt)}{/if}
						</span>
					</div>
					<span class="a-pill" style="color:{SUB_COLOR[sub.status] ?? 'var(--mute)'}">
						{sub.status.replace('_', ' ')}
					</span>
					<span class="date">{day(sub.createdAt)}</span>
				</div>
			{/each}
		</div>
	{/if}
</section>

<section class="block">
	<h2 class="a-section-title"><Icon name="receipt-item" size={14} /> Donations</h2>
	{#if sponsor.donations.length === 0}
		<div class="a-card a-empty">
			<div class="a-empty-icon"><Icon name="receipt-item" size={28} /></div>
			<h3>No donations on file</h3>
			<p>This sponsor record exists without a payment row attached to it.</p>
		</div>
	{:else}
		<ol class="feed">
			{#each sponsor.donations as d (d.id)}
				<li class="entry">
					<span class="ent-icon" style="color:{DONATION_COLOR[d.status] ?? 'var(--mute)'}">
						<Icon name="heart" size={15} />
					</span>
					<div class="main">
						<p class="summary">
							{money(d.amount, d.currency)}
							{#if d.usdAmount && d.currency !== 'USD'}<em>({usd(d.usdAmount)})</em>{/if}
						</p>
						<p class="meta">
							{d.status.toLowerCase()} · {d.provider.toLowerCase()} ·
							{d.cadence === 'RECURRING' ? 'recurring' : 'one time'}
							{#if d.paystackReference}· {d.paystackReference}{/if}
							{#if d.paypalOrderId}· {d.paypalOrderId}{/if}
						</p>
					</div>
					<time class="time">{when(d.createdAt)}</time>
				</li>
			{/each}
		</ol>
	{/if}
</section>

<section class="block">
	<h2 class="a-section-title"><Icon name="close-circle" size={14} /> End the sponsorship</h2>
	<form class="a-card panel danger-panel" method="POST" action="?/end" use:enhance={run('end')}>
		<p class="panel-copy">
			{#if activeSub}
				This cancels the subscription and takes the listing down at the end of the period they have
				already paid for{activeSub.currentPeriodEnd
					? `, which runs to ${day(activeSub.currentPeriodEnd)}`
					: ''}. Taking back something already bought is not the default.
			{:else if sponsor.expiresAt && new Date(sponsor.expiresAt) > new Date()}
				This marks the sponsorship ended. The window they bought runs to {day(sponsor.expiresAt)},
				and it is honoured unless you say otherwise below.
			{:else}
				This marks the sponsorship ended and takes the listing down. Their window has already
				closed, so nothing is being taken back.
			{/if}
		</p>
		<p class="panel-copy">
			The sponsor record and every donation stay. Nothing here deletes anything.
		</p>
		<label class="check">
			<input type="checkbox" name="immediate" bind:checked={endImmediate} />
			<span>
				Take the listing down immediately, forfeiting the rest of the period they paid for.
			</span>
		</label>
		<button
			class="a-btn a-btn--danger"
			type="submit"
			disabled={busy !== '' || (!!sponsor.cancelledAt && !endImmediate)}
		>
			<Icon name="close-circle" size={14} />
			{busy === 'end' ? 'Ending' : 'End sponsorship'}
		</button>
		{#if sponsor.cancelledAt && !endImmediate}
			<p class="hint">
				Already cancelled on {day(sponsor.cancelledAt)}. Tick the box above to take the listing down
				now instead of waiting out the paid period.
			</p>
		{/if}
	</form>
</section>

<style>
	.back {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 18px;
	}
	.back:hover {
		color: var(--ink);
	}
	.ident {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.head-pills {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.notice {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px 18px;
		margin-bottom: 20px;
	}
	.notice.danger {
		color: var(--danger);
	}
	.notice.ok {
		color: #9fe2a0;
	}
	.notice p {
		margin: 0;
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.review {
		padding: 20px 22px;
		margin-bottom: 24px;
		border-color: rgba(255, 122, 26, 0.45);
		background: rgba(255, 122, 26, 0.06);
	}
	.review-title {
		display: flex;
		align-items: center;
		gap: 9px;
		margin: 0 0 8px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--spark);
	}
	.review-copy {
		margin: 0 0 16px;
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--ink-2);
	}
	.submitted {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
		margin: 0 0 16px;
	}
	.submitted dt,
	.defs dt {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 5px;
	}
	.submitted dd,
	.defs dd {
		margin: 0;
		font-size: 13.5px;
		color: var(--ink);
		line-height: 1.5;
		overflow-wrap: anywhere;
	}
	.review-actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 10px;
		margin-bottom: 26px;
	}
	.a-stat-value.small {
		font-size: 24px;
	}

	.block {
		margin-bottom: 30px;
	}
	.defs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 18px;
		padding: 20px 22px;
		margin: 0;
	}
	.defs dd.live {
		color: #9fe2a0;
	}
	.ext {
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
		overflow-wrap: anywhere;
	}
	.ext:hover {
		color: var(--ink);
	}
	.warn-inline {
		display: block;
		margin-top: 4px;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--spark);
	}
	.blockers {
		list-style: none;
		margin: 12px 0 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.blockers li {
		display: flex;
		align-items: center;
		gap: 9px;
		font-size: 13px;
		color: var(--mute);
	}

	.panel {
		padding: 20px 22px;
	}
	.panel-copy {
		margin: 0 0 14px;
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--ink-2);
	}
	.row-actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		padding-bottom: 18px;
		margin-bottom: 18px;
		border-bottom: 1px solid var(--hairline);
	}
	.visibility {
		max-width: 420px;
	}
	.hint {
		margin: 10px 0 0;
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--mute);
	}
	.hint.warn {
		color: var(--spark);
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}
	.grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0 16px;
	}
	.check {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin: 10px 0 16px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink-2);
		cursor: pointer;
	}
	.check input {
		margin-top: 2px;
		accent-color: var(--spark);
	}
	.slug-row {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.slug-row .a-input.locked {
		color: var(--mute);
	}
	.logo-preview {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 14px;
		border: 1px solid var(--hairline);
		border-radius: 10px;
		margin: 12px 0 4px;
	}
	.logo-preview img {
		width: 64px;
		height: 64px;
		object-fit: contain;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}
	.logo-preview.small img {
		width: 44px;
		height: 44px;
	}
	.logo-preview span {
		font-size: 12.5px;
		color: var(--mute);
	}
	.danger-panel {
		border-color: rgba(255, 90, 82, 0.35);
	}

	.rows {
		display: grid;
		gap: 8px;
	}
	.sub-row {
		display: grid;
		grid-template-columns: 1fr auto 120px;
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
	.line {
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
	}
	.meta {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mute);
		overflow-wrap: anywhere;
	}
	.date {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		text-align: right;
		white-space: nowrap;
	}

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
	}
	.summary {
		margin: 0;
		font-size: 14px;
		color: var(--ink);
		line-height: 1.4;
	}
	.summary em {
		font-style: normal;
		color: var(--mute);
		font-size: 12px;
	}
	.entry .meta {
		margin: 3px 0 0;
	}
	.time {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}

	@media (max-width: 700px) {
		.sub-row {
			grid-template-columns: 1fr auto;
		}
		.date,
		.time {
			display: none;
		}
	}
</style>
