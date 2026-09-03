<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: s = data.sponsor;
	$: name = s.orgName || s.displayName;

	const TIER_LABEL: Record<string, string> = {
		SUPPORTER: 'Supporter',
		STANDARD: 'Standard',
		WORKSHOP: 'Workshop',
		CUSTOM: 'Custom'
	};

	function since(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
	}
</script>

<Seo
	title={`${name} · Partner`}
	description={`${name} sponsors the work at kenTom.`}
	path={`/partners/${s.slug}`}
	breadcrumbs={[
		{ name: 'Partners', path: '/partners' },
		{ name, path: `/partners/${s.slug}` }
	]}
/>

<div class="page">
	<div class="wrap">
		<a class="back" href="/partners">
			<span class="ar" aria-hidden="true"><Icon name="arrow-left4" size={13} /></span>
			<span>Partners</span>
		</a>

		{#if s.logoUrl}
			<div class="logo"><img src={s.logoUrl} alt={name} /></div>
		{/if}

		<h1>{name}</h1>

		{#if s.blurb}
			<p class="blurb">{s.blurb}</p>
		{/if}

		<dl class="facts">
			<div>
				<dt>Tier</dt>
				<dd>{TIER_LABEL[s.tier] ?? s.tier}</dd>
			</div>
			<div>
				<dt>Since</dt>
				<dd>{since(s.since)}</dd>
			</div>
			<div>
				<dt>Status</dt>
				<dd>{s.active ? 'Active' : 'Past partner'}</dd>
			</div>
		</dl>

		{#if s.websiteUrl}
			<a class="pill" href={s.websiteUrl} target="_blank" rel="sponsored noopener noreferrer">
				<span>Visit {name}</span>
				<span class="ar" aria-hidden="true"><Icon name="export-arrow" size={14} /></span>
			</a>
		{/if}

		<p class="foot">
			{name} helps fund SkillKenya tutoring and the open-source work here.
			<a href="/partners">See how sponsorship works</a>.
		</p>
	</div>
</div>

<style>
	.wrap {
		max-width: 560px;
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		text-decoration: none;
		margin-bottom: 30px;
	}
	.back:hover {
		color: var(--ink);
	}
	.ar {
		display: inline-flex;
		line-height: 0;
	}
	.logo {
		margin-bottom: 22px;
	}
	.logo img {
		max-width: 190px;
		max-height: 64px;
		object-fit: contain;
	}
	h1 {
		font-size: clamp(30px, 5vw, 44px);
		line-height: 1.08;
		letter-spacing: -0.02em;
		margin: 0 0 14px;
		color: var(--ink);
	}
	.blurb {
		font-size: 16px;
		line-height: 1.6;
		color: var(--ink-2);
		margin: 0 0 30px;
		max-width: 46ch;
	}
	.facts {
		display: grid;
		gap: 1px;
		background: var(--hairline, rgba(127, 127, 127, 0.2));
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.2));
		border-radius: 10px;
		overflow: hidden;
		margin: 0 0 26px;
	}
	.facts > div {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 18px;
		padding: 13px 16px;
		background: var(--bg);
	}
	dt {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	dd {
		margin: 0;
		color: var(--ink);
		font-size: 15px;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 9px 16px;
		border-radius: 999px;
		border: 1px solid var(--hairline, rgba(127, 127, 127, 0.3));
		color: var(--ink);
		text-decoration: none;
		font-size: 14px;
	}
	.pill:hover {
		border-color: var(--ink-2);
	}
	.foot {
		margin: 34px 0 0;
		padding-top: 24px;
		border-top: 1px solid var(--hairline, rgba(127, 127, 127, 0.2));
		font-size: 13px;
		line-height: 1.6;
		color: var(--mute);
	}
	.foot a {
		color: var(--ink-2);
	}
</style>
