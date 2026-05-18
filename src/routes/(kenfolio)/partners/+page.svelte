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
			body: 'Quiet but engaged — engineers, founders, and students across East Africa. Your name lives on the homepage, the notes, and one slide at every event I host.'
		},
		{
			n: '03',
			title: 'You compound something real.',
			body: 'Tutoring sessions, infra credits, and a handful of essays a year. None of it disappears at the end of a quarter.'
		}
	];

	const tiers = [
		{
			label: 'Friend',
			amount: '$25 / mo',
			what: 'Listed on the partners page. A thank-you and the quarterly note.'
		},
		{
			label: 'Workshop',
			amount: '$200 / mo',
			what: 'A line on the homepage. Logo at SkillKenya events. Early access to write-ups.'
		},
		{
			label: 'Forge',
			amount: 'Custom',
			what: 'Co-built. We pick one project or cohort a year and put your name on it.'
		}
	];
</script>

<svelte:head>
	<title>kenTom · Partners</title>
	<meta
		name="description"
		content="Back the work, not the noise. Sponsorship tiers and reasons to partner with kenTom — funding SkillKenya tutoring and open-source work."
	/>
</svelte:head>

<main class="page">
	<div class="partners">
		<h1>Back the work, <em>not the noise</em>.</h1>
		<p class="lede">
			I keep the calendar light so the work can stay good. Sponsorship buys time — for SkillKenya
			tutoring, for the small open-source pieces that keep my own projects alive, and for the next
			few things on the bench.
		</p>

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

		<div class="tiers">
			{#each tiers as t}
				<div>
					<span class="label">{t.label}</span>
					<span class="amount">{t.amount}</span>
					<span class="what">{t.what}</span>
				</div>
			{/each}
		</div>

		<section class="now">
			<div class="label">Current partners</div>
			<div class="wall">
				<div class="slot">your logo</div>
				<div class="slot">your logo</div>
				<div class="slot">your logo</div>
				<div class="slot">your logo</div>
			</div>
		</section>

		<div class="cta-row">
			<a class="pill pill--solid" href="mailto:tomsteve187@gmail.com?subject=Sponsorship">
				<span>Start a conversation</span>
				<span class="ar" aria-hidden="true"><Icon name="messages" size={14} /></span>
			</a>
			<span class="alt">or <a href="/contact">other ways</a></span>
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
		margin: 0 0 clamp(48px, 8vh, 72px);
		text-wrap: pretty;
	}

	/* numbered reason list — three quiet items */
	ol.reasons {
		list-style: none;
		padding: 0;
		margin: 0 0 clamp(48px, 8vh, 72px);
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

	/* tiers as a single inline row */
	.tiers {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0;
		border-top: 1px solid var(--hairline);
		border-bottom: 1px solid var(--hairline);
		margin-bottom: clamp(48px, 8vh, 72px);
	}
	.tiers > div {
		padding: clamp(22px, 3.5vh, 28px) clamp(18px, 2.4vw, 24px);
		border-right: 1px solid var(--hairline);
		display: grid;
		gap: 8px;
	}
	.tiers > div:last-child {
		border-right: none;
	}
	.tiers .label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.tiers .amount {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(24px, 2.6vw, 32px);
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.tiers .what {
		font-size: 14px;
		line-height: 1.5;
		color: var(--ink-2);
	}
	@media (max-width: 640px) {
		.tiers {
			grid-template-columns: 1fr;
		}
		.tiers > div {
			border-right: none;
			border-bottom: 1px solid var(--hairline);
		}
		.tiers > div:last-child {
			border-bottom: none;
		}
	}

	/* existing partners — quiet logo row of placeholders */
	.now {
		margin-bottom: clamp(48px, 8vh, 64px);
	}
	.now .label {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 16px;
	}
	.now .wall {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: clamp(12px, 1.6vw, 16px);
	}
	.now .slot {
		aspect-ratio: 2 / 1;
		border: 1px solid var(--hairline);
		border-radius: 8px;
		display: grid;
		place-items: center;
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.26em;
		color: var(--mute);
		text-transform: uppercase;
	}
	@media (max-width: 560px) {
		.now .wall {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.cta-row {
		display: flex;
		align-items: baseline;
		gap: 18px;
		flex-wrap: wrap;
	}
	.cta-row .alt {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.cta-row .alt a {
		color: var(--ink-2);
		border-bottom: 1px solid var(--mute-2);
	}
</style>
