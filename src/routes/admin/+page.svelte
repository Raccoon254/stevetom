<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import { avatar } from '$lib/avatar';

	let stats = { projects: 0, services: 0, serviceRequests: 0, pendingRequests: 0 };
	let loading = true;
	let recentRequests: any[] = [];

	onMount(async () => {
		try {
			const [projectsRes, servicesRes, requestsRes] = await Promise.all([
				fetch('/api/projects'),
				fetch('/api/services'),
				fetch('/api/service-requests')
			]);
			const [projects, services, requests] = await Promise.all([
				projectsRes.json(),
				servicesRes.json(),
				requestsRes.json()
			]);
			stats.projects = projects.count || 0;
			stats.services = services.count || 0;
			stats.serviceRequests = requests.count || 0;
			stats.pendingRequests =
				requests.data?.filter((r: any) => r.status === 'PENDING').length || 0;
			recentRequests = requests.data?.slice(0, 5) || [];
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			loading = false;
		}
	});

	const formatDate = (d: string) => new Date(d).toLocaleDateString();

	function statusColor(status: string): string {
		return (
			{
				PENDING: '#ff7a1a',
				IN_REVIEW: '#7ecbff',
				ACCEPTED: '#6fa89c',
				IN_PROGRESS: '#ffd166',
				COMPLETED: '#9fe2a0',
				REJECTED: '#ff5a52'
			}[status] || '#6fa89c'
		);
	}

	$: cards = [
		{ label: 'Projects', value: stats.projects, icon: 'box', href: '/admin/projects' },
		{ label: 'Services', value: stats.services, icon: 'setting', href: '/admin/services' },
		{
			label: 'Requests',
			value: stats.serviceRequests,
			icon: 'messages',
			href: '/admin/service-requests'
		},
		{
			label: 'Pending',
			value: stats.pendingRequests,
			icon: 'clock',
			href: '/admin/service-requests',
			alert: stats.pendingRequests > 0
		}
	];

	const actions = [
		{ href: '/admin/projects', title: 'Add a project', desc: 'Showcase new work', icon: 'box' },
		{ href: '/admin/services', title: 'Add a service', desc: 'Expand offerings', icon: 'setting' },
		{ href: '/api/test', title: 'Test database', desc: 'Check connectivity', icon: 'code', ext: true }
	];
</script>

<svelte:head>
	<title>Dashboard · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Control panel</p>
		<h1 class="a-title">Dashboard</h1>
		<p class="a-sub">Overview of your portfolio and business.</p>
	</div>
</div>

{#if loading}
	<div class="a-loading" in:fade>
		<div class="a-spinner"></div>
		<p>Loading</p>
	</div>
{:else}
	<div class="grid stats">
		{#each cards as c, i}
			<a class="a-card a-stat" class:alert={c.alert} href={c.href} in:fly={{ y: 16, duration: 380, delay: i * 70 }}>
				<span class="a-stat-label"><Icon name={c.icon} size={13} /> {c.label}</span>
				<span class="a-stat-value">{c.value}</span>
			</a>
		{/each}
	</div>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 320 }}>
		<div class="block-head">
			<h2 class="a-section-title"><Icon name="messages" size={14} /> Recent requests</h2>
			<a class="more" href="/admin/service-requests">All requests <Icon name="arrow-right4" size={12} /></a>
		</div>

		{#if recentRequests.length === 0}
			<div class="a-card a-empty">
				<div class="a-empty-icon"><Icon name="messages" size={30} /></div>
				<h3>No requests yet</h3>
				<p>Client requests will show up here.</p>
			</div>
		{:else}
			<div class="rows">
				{#each recentRequests as r}
					<a class="a-card row" href="/admin/service-requests">
						<img class="a-avatar" src={avatar(r.clientEmail || r.clientName)} alt="" width="40" height="40" />
						<div class="row-main">
							<span class="row-title">{r.projectTitle}</span>
							<span class="row-meta">{r.clientName} · {r.service?.name ?? 'Service'}</span>
						</div>
						<span class="a-pill" style="color:{statusColor(r.status)}">
							{r.status.replace('_', ' ')}
						</span>
						<span class="row-date">{formatDate(r.createdAt)}</span>
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<section class="block" in:fly={{ y: 16, duration: 420, delay: 420 }}>
		<h2 class="a-section-title"><Icon name="flash" size={14} /> Quick actions</h2>
		<div class="grid actions">
			{#each actions as a}
				<a
					class="a-card action"
					href={a.href}
					target={a.ext ? '_blank' : undefined}
					rel={a.ext ? 'noopener' : undefined}
				>
					<span class="action-icon"><Icon name={a.icon} size={20} /></span>
					<span class="action-title">{a.title}</span>
					<span class="action-desc">{a.desc}</span>
				</a>
			{/each}
		</div>
	</section>
{/if}

<style>
	.grid {
		display: grid;
		gap: 14px;
	}
	.stats {
		grid-template-columns: repeat(4, 1fr);
		margin-bottom: clamp(28px, 5vh, 48px);
	}
	.actions {
		grid-template-columns: repeat(3, 1fr);
	}
	@media (max-width: 820px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
		.actions {
			grid-template-columns: 1fr;
		}
	}

	.block {
		margin-bottom: clamp(28px, 5vh, 48px);
	}
	.block-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mute);
		margin-bottom: 16px;
		transition: color 0.2s;
	}
	.more:hover {
		color: var(--ink);
	}

	.rows {
		display: grid;
		gap: 10px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
	}
	.row-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.row-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row-meta {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row-date {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--mute-2);
		white-space: nowrap;
	}
	@media (max-width: 600px) {
		.row-date {
			display: none;
		}
	}

	.action {
		padding: 24px 20px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
	}
	.action-icon {
		display: inline-flex;
		color: var(--spark);
		margin-bottom: 8px;
	}
	.action-title {
		font-size: 15px;
		font-weight: 500;
		color: var(--ink);
	}
	.action-desc {
		font-size: 13px;
		color: var(--mute);
	}
</style>
