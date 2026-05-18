<script lang="ts">
	export let title: string;
	export let meta = '';
	export let html: string;
	export let image = '';
</script>

<main class="page">
	<article class="doc">
		{#if meta}
			<div class="doc-meta">{meta}</div>
		{/if}
		<h1>{title}</h1>
		{#if image}
			<figure class="hero-img">
				<img src={image} alt={title} loading="lazy" />
			</figure>
		{/if}
		<div class="prose">
			{@html html}
		</div>
	</article>
</main>

<style>
	.doc {
		width: 100%;
		max-width: var(--page-w);
	}
	.doc-meta {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: clamp(14px, 2.5vh, 22px);
	}
	.doc h1 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(32px, 4.6vw, 56px);
		line-height: 1.08;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 clamp(28px, 5vh, 48px);
		text-wrap: balance;
	}
	.hero-img {
		margin: 0 0 clamp(32px, 6vh, 56px);
		border: 1px solid var(--hairline);
		border-radius: 12px;
		overflow: hidden;
	}
	.hero-img img {
		display: block;
		width: 100%;
		height: auto;
	}

	/* rendered markdown */
	.prose {
		font-size: clamp(16px, 1.15vw, 18px);
		line-height: 1.7;
		color: var(--ink-2);
		text-wrap: pretty;
	}
	.prose :global(h2) {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(22px, 2.3vw, 30px);
		line-height: 1.2;
		letter-spacing: -0.018em;
		color: var(--ink);
		margin: clamp(40px, 6vh, 64px) 0 clamp(14px, 2vh, 20px);
	}
	.prose :global(h3) {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: clamp(18px, 1.7vw, 21px);
		color: var(--ink);
		margin: clamp(28px, 4vh, 40px) 0 10px;
	}
	.prose :global(p) {
		margin: 0 0 1.1em;
	}
	.prose :global(strong) {
		color: var(--ink);
		font-weight: 600;
	}
	.prose :global(a) {
		color: var(--ink);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		text-decoration-color: var(--mute-2);
		transition:
			color 0.2s,
			text-decoration-color 0.2s;
	}
	.prose :global(a:hover) {
		color: var(--spark);
		text-decoration-color: var(--spark);
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 1.2em;
		padding-left: 1.3em;
	}
	.prose :global(li) {
		margin: 0 0 0.5em;
	}
	.prose :global(li::marker) {
		color: var(--mute);
	}
	.prose :global(blockquote) {
		margin: clamp(24px, 4vh, 36px) 0;
		padding: 4px 0 4px 22px;
		border-left: 2px solid var(--spark);
		color: var(--ink);
		font-size: 1.02em;
	}
	.prose :global(blockquote p) {
		margin: 0 0 0.5em;
	}
	.prose :global(blockquote p:last-child) {
		margin: 0;
	}
	.prose :global(code) {
		font-family: var(--mono);
		font-size: 0.88em;
		background: rgba(var(--bg-rgb), 0.6);
		border: 1px solid var(--hairline);
		border-radius: 4px;
		padding: 1px 6px;
	}
	.prose :global(pre) {
		background: rgba(var(--bg-rgb), 0.6);
		border: 1px solid var(--hairline);
		border-radius: 10px;
		padding: 16px 18px;
		overflow-x: auto;
		margin: 0 0 1.4em;
	}
	.prose :global(pre code) {
		background: none;
		border: none;
		padding: 0;
	}
	.prose :global(hr) {
		border: none;
		border-top: 1px solid var(--hairline);
		margin: clamp(32px, 5vh, 48px) 0;
	}
	.prose :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--hairline);
		border-radius: 10px;
		margin: clamp(24px, 4vh, 36px) 0;
	}
</style>
