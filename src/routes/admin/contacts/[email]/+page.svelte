<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';
	import type { PageData } from './$types';

	export let data: PageData;

	$: contact = data.contact;
	$: timeline = data.timeline;

	type Entry = {
		key: string;
		at: Date;
		icon: string;
		title: string;
		detail: string;
		tone: string;
	};

	const money = (amount: number, currency = 'USD') =>
		`${currency === 'USD' ? '$' : `${currency} `}${amount.toLocaleString(undefined, {
			maximumFractionDigits: 2
		})}`;

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

	// One list, ordered by time, from the four sources. Nothing is synthesised:
	// every entry is a row that exists.
	$: entries = ((): Entry[] => {
		const out: Entry[] = [];
		for (const d of timeline.donations) {
			out.push({
				key: `don-${d.id}`,
				at: new Date(d.createdAt),
				icon: 'heart',
				title: `${money(d.amount, d.currency)} donation`,
				detail: [
					d.status.toLowerCase(),
					d.provider ? d.provider.toLowerCase() : null,
					d.cadence ? (d.cadence === 'RECURRING' ? 'recurring' : 'one time') : null,
					d.usdAmount ? `${money(d.usdAmount)} USD` : null
				]
					.filter(Boolean)
					.join(' · '),
				tone: d.status === 'SUCCESS' ? '#9fe2a0' : d.status === 'PENDING' ? '#ffd166' : '#ff5a52'
			});
		}
		for (const r of timeline.requests) {
			out.push({
				key: `req-${r.id}`,
				at: new Date(r.createdAt),
				icon: 'messages',
				title: r.projectTitle,
				detail: `service request · ${r.status.replace('_', ' ').toLowerCase()}${
					r.serviceName ? ` · ${r.serviceName}` : ''
				}${r.company ? ` · ${r.company}` : ''}`,
				tone: '#ffd166'
			});
		}
		if (timeline.subscriber) {
			out.push({
				key: 'sub-start',
				at: new Date(timeline.subscriber.createdAt),
				icon: 'sms',
				title: 'Subscribed to the newsletter',
				detail: 'newsletter',
				tone: '#7ecbff'
			});
			if (!timeline.subscriber.isActive) {
				out.push({
					key: 'sub-end',
					at: new Date(timeline.subscriber.updatedAt),
					icon: 'close-circle',
					title: 'Unsubscribed from the newsletter',
					detail: 'newsletter · excluded from every bulk send',
					tone: '#ff5a52'
				});
			}
		}
		if (timeline.sponsor) {
			out.push({
				key: 'spo-start',
				at: new Date(timeline.sponsor.startedAt),
				icon: 'crown',
				title: `Became a sponsor · ${timeline.sponsor.tier.toLowerCase()}`,
				detail: `${timeline.sponsor.cadence === 'RECURRING' ? 'recurring' : 'one time'} · ${timeline.sponsor.visibility.toLowerCase()} · ${timeline.sponsor.moderation
					.replace('_', ' ')
					.toLowerCase()}`,
				tone: '#ff7a1a'
			});
			if (timeline.sponsor.cancelledAt) {
				out.push({
					key: 'spo-end',
					at: new Date(timeline.sponsor.cancelledAt),
					icon: 'close-circle',
					title: 'Sponsorship cancelled',
					detail: 'sponsorship',
					tone: '#ff5a52'
				});
			}
		}
		for (const m of data.messages) {
			if (!m.sentAt) continue;
			out.push({
				key: `msg-${m.id}`,
				at: new Date(m.sentAt),
				icon: 'send',
				title: m.subject,
				detail: `message · ${m.status.toLowerCase()}`,
				tone: '#cfeee6'
			});
		}
		return out.sort((a, b) => b.at.getTime() - a.at.getTime());
	})();

	$: writeHref = `/admin/messages/new?to=${encodeURIComponent(contact.email)}`;
</script>

<svelte:head>
	<title>{contact.name || contact.email} · kenTom Admin</title>
</svelte:head>

<a class="back" href="/admin/contacts">
	<Icon name="arrow-left4" size={13} /> All contacts
</a>

<div class="a-head">
	<div class="ident">
		<img class="a-avatar" src={avatar(contact.email)} alt="" width="54" height="54" />
		<div>
			<p class="a-eyebrow">Contact</p>
			<h1 class="a-title">{contact.name || contact.email}</h1>
			<p class="a-sub">
				<a class="mail" href="mailto:{contact.email}">{contact.email}</a>{contact.org
					? ` · ${contact.org}`
					: ''}
			</p>
		</div>
	</div>
	<a class="a-btn a-btn--solid" href={writeHref}>
		<Icon name="send" size={14} /> Write to them
	</a>
</div>

{#if contact.opted_out}
	<div class="a-card warn" in:fade>
		<Icon name="danger" size={18} />
		<p>
			This person unsubscribed from the newsletter. They are excluded from every bulk send. Only a
			direct, one-to-one reply may go to them, and you have to confirm that when you write it.
		</p>
	</div>
{/if}

<div class="stats">
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="heart" size={13} /> Total donated (USD)</span>
		<span class="a-stat-value" class:small={contact.total_usd === null}>
			{contact.total_usd === null
				? 'Unknown'
				: contact.total_usd > 0
					? `$${Math.round(contact.total_usd).toLocaleString()}`
					: '0'}
		</span>
	</div>
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="receipt-item" size={13} /> Donations</span>
		<span class="a-stat-value">{contact.donation_count}</span>
	</div>
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="messages" size={13} /> Requests</span>
		<span class="a-stat-value">{contact.request_count}</span>
	</div>
	<div class="a-card a-stat">
		<span class="a-stat-label"><Icon name="crown" size={13} /> Sponsor tier</span>
		<span class="a-stat-value small">
			{contact.sponsor_tier ? contact.sponsor_tier.toLowerCase() : 'none'}
		</span>
	</div>
</div>

<section class="block">
	<h2 class="a-section-title"><Icon name="user" size={14} /> Standing</h2>
	<dl class="defs a-card">
		<div>
			<dt>Newsletter</dt>
			<dd>
				{#if contact.subscribed}
					Subscribed
				{:else if contact.opted_out}
					Unsubscribed
				{:else}
					Never subscribed
				{/if}
			</dd>
		</div>
		<div>
			<dt>Sponsor</dt>
			<dd>
				{#if contact.is_sponsor}
					{contact.sponsor_active ? 'Active' : 'Lapsed'}
					{#if contact.sponsor_slug}
						· <a class="mail" href="/partners/{contact.sponsor_slug}">/partners/{contact.sponsor_slug}</a>
					{/if}
				{:else}
					No
				{/if}
			</dd>
		</div>
		<div>
			<dt>Lifetime sponsorship</dt>
			<dd>{contact.sponsor_usd > 0 ? `$${contact.sponsor_usd.toLocaleString()}` : 'None'}</dd>
		</div>
		<div>
			<dt>Last activity</dt>
			<dd>{when(contact.last_activity) || 'Unknown'}</dd>
		</div>
	</dl>
</section>

<section class="block">
	<h2 class="a-section-title"><Icon name="activity" size={14} /> Timeline</h2>
	{#if data.messagesUnavailable}
		<p class="hint">
			Message history is unavailable: the messaging tables are not in this database yet.
		</p>
	{/if}
	{#if entries.length === 0}
		<div class="a-card a-empty">
			<div class="a-empty-icon"><Icon name="activity" size={28} /></div>
			<h3>Nothing recorded</h3>
			<p>This address exists in the database but has no dated activity on it.</p>
		</div>
	{:else}
		<ol class="feed">
			{#each entries as entry, i (entry.key)}
				<li class="entry" in:fly={{ y: 10, duration: 260, delay: Math.min(i, 12) * 25 }}>
					<span class="ent-icon" style="color:{entry.tone}">
						<Icon name={entry.icon} size={15} />
					</span>
					<div class="main">
						<p class="summary">{entry.title}</p>
						<p class="meta">{entry.detail}</p>
					</div>
					<time class="time">{when(entry.at)}</time>
				</li>
			{/each}
		</ol>
	{/if}
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
	.mail {
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
	}
	.warn {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px 18px;
		margin-bottom: 20px;
		color: var(--danger);
	}
	.warn p {
		margin: 0;
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--ink-2);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
		margin-bottom: clamp(24px, 4vh, 36px);
	}
	.a-stat-value.small {
		font-size: 24px;
		text-transform: capitalize;
	}
	.block {
		margin-bottom: clamp(26px, 5vh, 42px);
	}
	.defs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 18px;
		margin: 0;
		padding: 20px;
	}
	.defs dt {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 6px;
	}
	.defs dd {
		margin: 0;
		font-size: 14px;
		color: var(--ink);
	}
	.hint {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute);
		margin: 0 0 12px;
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
	}
	.main {
		min-width: 0;
	}
	.summary {
		margin: 0;
		font-size: 14px;
		color: var(--ink);
		line-height: 1.4;
	}
	.meta {
		margin: 3px 0 0;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mute);
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
</style>
