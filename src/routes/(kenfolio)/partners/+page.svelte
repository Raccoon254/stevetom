<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	const reasons = [
		{
			n: '01',
			title: 'Where your name appears',
			body: 'Standard puts your name and your link on this page, and gives you a page of your own. Workshop adds your logo here, a line on the homepage, and a logo slide at SkillKenya sessions while you sponsor.'
		},
		{
			n: '02',
			title: 'The quarterly note',
			body: "Every sponsor gets it by email: a short write-up of what the money paid for, what shipped and what didn't."
		},
		{
			n: '03',
			title: 'What the money pays for',
			body: 'SkillKenya tutoring, the hosting and tooling behind the open-source work, and the time to keep both going.'
		}
	];

	const tiers = [
		{
			label: 'Standard',
			amount: '$5',
			period: '/ month',
			what: 'Your name and your link on this page, a page of your own, and the quarterly note. Or $25 once, which lists you for twelve months.'
		},
		{
			label: 'Workshop',
			amount: '$15',
			period: '/ month',
			what: 'Everything in Standard, plus your logo here, a line on the homepage, and a logo slide at SkillKenya sessions. Or $100 once, for twelve months.'
		},
		{
			label: 'Custom',
			amount: 'Arranged',
			period: '',
			what: 'Set up by email. What it covers and what it costs are whatever we agree, so there is nothing fixed to quote here.',
			link: 'mailto:partners@kentom.co.ke?subject=Custom%20partnership'
		}
	];

	import type { PageData } from './$types';
	export let data: PageData;

	$: partners = data.partners;
	$: past = data.past;
	$: anonymousCount = data.anonymousCount;
</script>

<Seo
	title="Partners"
	description="Sponsorship tiers for kenTom: what each one costs and what it gets you, plus the sponsors funding SkillKenya tutoring and the open-source work."
	path="/partners"
	keywords="sponsor developer, partner with kenTom, open-source sponsorship Kenya"
	breadcrumbs={[{ name: 'Partners', path: '/partners' }]}
/>

<main class="page">
	<div class="partners">
		<h1>Back the work, <em>not the noise</em>.</h1>
		<p class="lede">
			I keep the calendar light so the work can stay good. Sponsorship buys time, for SkillKenya
			tutoring, for the small open-source pieces that keep my own projects alive, and for the next
			few things on the bench.
		</p>

		<!-- 1 · partners -->
		<section class="block">
			<div class="section-label">Current partners</div>
			{#if partners.length === 0}
				<div class="empty">
					<span class="empty-ic"><Icon name="ai-heart-square" size={44} /></span>
					<p class="empty-title">No partners yet.</p>
					<p class="empty-sub">
						Sponsors show up here once their payment clears and they have asked to be listed.
					</p>
				</div>
			{:else}
				<div class="wall">
					{#each partners as p}
						<a class="slot" href="/partners/{p.slug}">
							{#if p.logoUrl}
								<img src={p.logoUrl} alt={p.orgName || p.displayName} loading="lazy" />
							{:else}
								<span class="slot-name">{p.orgName || p.displayName}</span>
							{/if}
						</a>
					{/each}
				</div>
			{/if}

			{#if anonymousCount > 0}
				<p class="anon">
					{anonymousCount}
					{anonymousCount === 1 ? 'sponsor who asked' : 'sponsors who asked'} not to be named.
				</p>
			{/if}

			{#if past.length}
				<div class="past">
					<div class="section-label">Past partners</div>
					<div class="past-list">
						{#each past as p}
							<a href="/partners/{p.slug}">{p.orgName || p.displayName}</a>
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<!-- 2 · pricing -->
		<section class="block">
			<div class="section-label">Pricing</div>
			<div class="tiers">
				{#each tiers as t}
					<div class="tier">
						<span class="label">{t.label}</span>
						<span class="amount"
							>{t.amount}{#if t.period}<span class="period">{t.period}</span>{/if}</span
						>
						<span class="what">{t.what}</span>
						{#if t.link}
							<a class="tier-link" href={t.link}>
								<span>Scope a custom partnership</span>
								<Icon name="messages" size={13} />
							</a>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- 2b · sign up -->
		<section class="block" id="join">
			<div class="section-label">Become a partner</div>
			<p class="join-lede">
				Two tiers, no calls, no contract. Pick one and your listing goes up when the payment
				clears.
			</p>
			<a class="join-cta" href="/partners/join">
				<span>Sponsor kenTom</span>
				<span class="ar" aria-hidden="true"><Icon name="arrow-right4" size={15} /></span>
			</a>
		</section>

				<!-- 3 · the text -->
		<section class="block">
			<div class="section-label">What sponsorship covers</div>
			<ol class="reasons">
				{#each reasons as r}
					<li>
						<span class="n">{r.n}</span>
						<div>
							<h3>{r.title}</h3>
							<p>{r.body}</p>
						</div>
					</li>
				{/each}
			</ol>
		</section>

		<div class="cta-row">
			<a class="pill pill--solid" href="mailto:partners@kentom.co.ke?subject=Sponsorship">
				<span>Email about sponsorship</span>
				<span class="ar" aria-hidden="true"><Icon name="messages" size={14} /></span>
			</a>
			<span class="alt">
				prefer a one-off gift? <a href="/donate">support the work</a>
			</span>
		</div>
	</div>
</main>

<style>
	.partners {
		width: 100%;
		max-width: var(--page-w);
	}

	.partners h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(36px, 5vw, 64px);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(18px, 3vh, 28px);
		text-wrap: balance;
	}
	.partners h1 em {
		font-style: normal;
		color: var(--mute);
	}
	.partners .lede {
		font-size: clamp(17px, 1.6vw, 20px);
		line-height: 1.55;
		color: var(--ink-2);
		max-width: 58ch;
		margin: 0 0 clamp(44px, 7vh, 64px);
		text-wrap: pretty;
	}

	/* section scaffolding */
	.block {
		margin-bottom: clamp(44px, 7vh, 68px);
	}
	.section-label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		padding-bottom: 14px;
		margin-bottom: clamp(20px, 3vh, 28px);
		border-bottom: 1px solid var(--hairline);
	}

	/* 1 · partners · empty state */
	.empty {
		border: 1px dashed var(--hairline-2);
		border-radius: 14px;
		padding: clamp(32px, 5vh, 48px) clamp(20px, 4vw, 40px);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.empty-ic {
		display: inline-flex;
		color: var(--mute);
		margin-bottom: 6px;
	}
	.empty-title {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(18px, 2vw, 22px);
		color: var(--ink);
		margin: 0;
	}
	.empty-sub {
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
		max-width: 44ch;
		margin: 0;
		text-wrap: pretty;
	}
	.wall {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: clamp(12px, 1.6vw, 16px);
	}
	.slot {
		aspect-ratio: 2 / 1;
		border: 1px solid var(--hairline);
		border-radius: 8px;
		display: grid;
		place-items: center;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.18em;
		color: var(--ink-2);
		text-transform: uppercase;
	}
	@media (max-width: 560px) {
		.wall {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* 2 · pricing · borderless divider grid */
	.slot {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 84px;
		padding: 16px;
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.22));
		border-radius: 10px;
		text-decoration: none;
		color: var(--ink);
		transition: border-color 0.2s ease;
	}
	.slot:hover {
		border-color: var(--ink-2);
	}
	.slot img {
		max-width: 100%;
		max-height: 46px;
		object-fit: contain;
	}
	.slot-name {
		font-size: 15px;
		text-align: center;
		line-height: 1.35;
	}
	.anon {
		font-size: 13px;
		color: var(--mute);
		margin: 16px 0 0;
	}
	.past {
		margin-top: 34px;
	}
	.past-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 20px;
		margin-top: 10px;
	}
	.past-list a {
		font-size: 13px;
		color: var(--mute);
		text-decoration: none;
	}
	.past-list a:hover {
		color: var(--ink-2);
	}
	.join-lede {
		margin: 0 0 20px;
		max-width: 44ch;
		font-size: 15px;
		line-height: 1.6;
		color: var(--ink-2);
	}
	.join-cta {
		display: inline-flex;
		align-items: center;
		gap: 11px;
		padding: 13px 24px;
		border-radius: 999px;
		background: var(--spark);
		color: #0b0b0b;
		text-decoration: none;
		font-size: 15px;
		transition: filter 0.2s ease, transform 0.2s ease;
	}
	.join-cta:hover {
		filter: brightness(1.08);
		transform: translateY(-1px);
	}
	.join-cta .ar {
		display: inline-flex;
		line-height: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.join-cta:hover { transform: none; }
	}
	.tiers {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid var(--hairline);
		border-bottom: 1px solid var(--hairline);
	}
	.tier {
		padding: clamp(22px, 3.5vh, 30px) clamp(18px, 2.4vw, 26px);
		border-right: 1px solid var(--hairline);
		display: grid;
		gap: 10px;
		align-content: start;
	}
	.tier:last-child {
		border-right: none;
	}
	.label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.amount {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(28px, 3vw, 36px);
		letter-spacing: -0.02em;
		color: var(--ink);
		display: flex;
		align-items: baseline;
		gap: 8px;
		flex-wrap: wrap;
	}
	.period {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.what {
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink-2);
		margin: 0;
	}

	.tier-link {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		justify-self: start;
		margin-top: 4px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ink);
		border-bottom: 1px solid var(--spark);
		padding-bottom: 3px;
		transition: color 0.25s;
	}
	.tier-link:hover {
		color: var(--spark);
	}

	@media (max-width: 640px) {
		.tiers {
			grid-template-columns: 1fr;
		}
		.tier {
			border-right: none;
			border-bottom: 1px solid var(--hairline);
		}
		.tier:last-child {
			border-bottom: none;
		}
	}

	/* 3 · numbered reason list */
	ol.reasons {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--hairline);
	}
	ol.reasons li {
		border-bottom: 1px solid var(--hairline);
		padding: clamp(22px, 3.5vh, 32px) 0;
		display: grid;
		grid-template-columns: 56px 1fr;
		gap: clamp(18px, 3vw, 32px);
		align-items: baseline;
	}
	ol.reasons .n {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		color: var(--mute);
		text-transform: uppercase;
	}
	ol.reasons h3 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(20px, 2vw, 24px);
		line-height: 1.25;
		letter-spacing: -0.012em;
		color: var(--ink);
		margin: 0 0 8px;
	}
	ol.reasons p {
		margin: 0;
		font-size: 15px;
		line-height: 1.6;
		color: var(--ink-2);
		max-width: 56ch;
	}

	.cta-row {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
	}
	.cta-row .alt {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.cta-row .alt a {
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
		transition: color 0.25s, border-color 0.25s;
	}
	.cta-row .alt a:hover {
		color: var(--spark);
		border-color: var(--spark);
	}
</style>
