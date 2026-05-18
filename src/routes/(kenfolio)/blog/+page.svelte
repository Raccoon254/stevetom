<script lang="ts">
	const notes = [
		{
			when: 'Dec · 25',
			title: 'Kentom 2026: Charting New Creative Directions.',
			slug: 'kentom-2026-new-directions'
		},
		{
			when: 'Dec · 25',
			title: 'Skill Kenya pivots from pre-recorded courses to live interactive sessions.',
			slug: 'skillkenya-pivot-to-live-sessions'
		}
	];
</script>

<svelte:head>
	<title>kenTom · Notes</title>
	<meta name="description" content="Notes from the workshop — writing by Steve Tom." />
</svelte:head>

<main class="page">
	<div class="notes">
		<h1>Notes from the <em>workshop</em>.</h1>
		<ol class="list">
			{#each notes as note}
				<li>
					<a href="/blog/{note.slug}">
						<span class="when">{note.when}</span>
						<span class="title">{note.title}</span>
					</a>
				</li>
			{/each}
		</ol>
	</div>
</main>

<style>
	.page {
		place-items: center !important;
	}
	.notes {
		width: 100%;
		max-width: 720px;
	}
	.notes h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(34px, 4.6vw, 56px);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(48px, 8vh, 80px);
	}
	.notes h1 em {
		font-style: normal;
		color: var(--mute);
	}

	ol.list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	ol.list li + li {
		margin-top: clamp(28px, 4.5vh, 44px);
	}
	ol.list a {
		display: grid;
		grid-template-columns: 72px 1fr;
		gap: clamp(18px, 2.5vw, 32px);
		align-items: baseline;
		transition: opacity 0.3s;
	}
	ol.list .when {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		color: var(--mute);
		text-transform: uppercase;
	}
	ol.list .title {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(20px, 2.2vw, 26px);
		line-height: 1.25;
		letter-spacing: -0.015em;
		color: var(--ink);
		transition: color 0.25s;
		text-wrap: pretty;
	}
	ol.list:has(a:hover) a:not(:hover) {
		opacity: 0.35;
	}
	ol.list a:hover .title {
		color: var(--spark);
	}
	@media (max-width: 560px) {
		ol.list a {
			grid-template-columns: 1fr;
			gap: 4px;
		}
	}
</style>
