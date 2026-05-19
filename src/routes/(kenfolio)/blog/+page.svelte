<script lang="ts">
	import { posts, shortDate } from '$lib/content';
	import Seo from '$lib/components/Seo.svelte';
	import NewsletterSignup from '$lib/components/kenfolio/NewsletterSignup.svelte';

	// Build a lowercased search blob per post once, up front. Posts are
	// already bundled in memory, so filtering is an instant in-memory pass,
	// no network, no index to load.
	const indexed = posts.map((post) => ({
		post,
		blob: [post.title, post.excerpt, post.category, post.html.replace(/<[^>]+>/g, ' ')]
			.join(' ')
			.toLowerCase()
	}));

	let query = '';

	$: terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	$: filtered = terms.length
		? indexed.filter((item) => terms.every((t) => item.blob.includes(t))).map((item) => item.post)
		: posts;
</script>

<Seo
	title="Notes"
	description="Field notes from the workshop — writing by Steve Tom on building software, products, and the work."
	path="/blog"
	keywords="kenTom notes, Steve Tom blog, developer writing Kenya, software engineering notes"
/>

<main class="page">
	<div class="notes">
		<h1>Notes from the <em>workshop</em>.</h1>
		{#if posts.length === 0}
			<p class="empty">Nothing here yet.</p>
		{:else}
			<div class="search">
				<input
					type="search"
					placeholder="Search notes"
					aria-label="Search notes"
					bind:value={query}
				/>
				<span class="count" class:invisible={!terms.length} aria-hidden={!terms.length}>
					{filtered.length} of {posts.length}
				</span>
			</div>
			{#if filtered.length === 0}
				<p class="empty">No notes match “{query}”.</p>
			{:else}
				<ol class="list">
					{#each filtered as post (post.slug)}
						<li>
							<a href="/blog/{post.slug}">
								<span class="when">{shortDate(post.date)}</span>
								<span class="title">{post.title}</span>
							</a>
						</li>
					{/each}
				</ol>
			{/if}
		{/if}

		<div class="nl-wrap">
			<NewsletterSignup />
		</div>
	</div>
</main>

<style>
	.notes {
		width: 100%;
		max-width: var(--page-w);
	}
	.notes h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(34px, 4.6vw, 56px);
		line-height: 1.05;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(28px, 4.5vh, 44px);
	}
	.notes h1 em {
		font-style: normal;
		color: var(--mute);
	}
	.empty {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.nl-wrap {
		margin-top: clamp(48px, 9vh, 88px);
	}

	/* search */
	.search {
		display: flex;
		align-items: center;
		gap: 14px;
		margin: 0 0 clamp(36px, 6vh, 60px);
	}
	.search input {
		flex: 1;
		min-width: 0;
		font: inherit;
		font-family: var(--sans);
		font-size: 16px;
		color: var(--ink);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--hairline-2);
		padding: 10px 2px;
		outline: none;
		transition: border-color 0.25s;
	}
	.search input::placeholder {
		color: var(--mute);
	}
	.search input:focus {
		border-bottom-color: var(--spark);
	}
	.search .count {
		/* reserve a fixed slot so the input width never changes when the
		   count toggles, keeping the post list from shifting */
		flex: 0 0 auto;
		width: 72px;
		text-align: right;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.search .count.invisible {
		visibility: hidden;
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
