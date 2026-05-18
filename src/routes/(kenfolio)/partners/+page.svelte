<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	const reasons = [
		{
			n: '01',
			title: 'You see where it goes.',
			body: "Every sponsored cycle ends with a short public note: what shipped, what didn't, and what the money paid for."
		},
		{
			n: '02',
			title: 'You reach the right room.',
			body: 'Quiet but engaged: engineers, founders, and students across East Africa. Your name lives on the homepage, the notes, and one slide at every event I host.'
		},
		{
			n: '03',
			title: 'You compound something real.',
			body: 'Tutoring sessions, infra credits, and a handful of essays a year. None of it disappears at the end of a quarter.'
		}
	];

	const tiers = [
		{
			label: 'Standard',
			amount: '$1 to $5',
			period: '/ month',
			what: 'Listed on the partners page. A thank-you and the quarterly note.'
		},
		{
			label: 'Workshop',
			amount: '$10 to $20',
			period: '/ month',
			what: 'A line on the homepage. Logo at SkillKenya events. Early access to write-ups.'
		},
		{
			label: 'Custom',
			amount: 'Arranged',
			period: '',
			what: 'Co-built. We pick one project or cohort a year and put your name on it. Pricing is scoped to what we build together.',
			link: 'mailto:partners@kentom.co.ke?subject=Custom%20partnership'
		}
	];

	// no partners on board yet; backend wiring comes later
	const partners: { name: string; logo?: string }[] = [];
</script>

<svelte:head>
	<title>kenTom · Partners</title>
	<meta
		name="description"
		content="Back the work, not the noise. Sponsorship tiers and reasons to partner with kenTom, funding SkillKenya tutoring and open-source work."
	/>
</svelte:head>

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
						This wall is waiting. Sponsors appear here once they go live. Your logo could be the
						first.
					</p>
				</div>
			{:else}
				<div class="wall">
					{#each partners as p}
						<div class="slot">{p.name}</div>
					{/each}
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

		<!-- 3 · the text -->
		<section class="block">
			<div class="section-label">Why partner</div>
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
				<span>Start a conversation</span>
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
