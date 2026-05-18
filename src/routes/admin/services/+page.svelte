<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';

	let services: any[] = [];
	let loading = true;
	let showAddForm = false;
	let editingService: any = null;
	let techInput = '';

	const blank = () => ({
		name: '',
		description: '',
		price: '',
		duration: '',
		technologies: [] as string[],
		isActive: true
	});
	let formData = blank();

	onMount(fetchServices);

	async function fetchServices() {
		try {
			const res = await fetch('/api/services');
			const data = await res.json();
			if (data.success) services = data.data;
		} catch (error) {
			console.error('Error fetching services:', error);
		} finally {
			loading = false;
		}
	}

	function openAddForm() {
		formData = blank();
		techInput = '';
		editingService = null;
		showAddForm = true;
	}
	function openEditForm(service: any) {
		formData = {
			name: service.name,
			description: service.description,
			price: service.price?.toString() || '',
			duration: service.duration || '',
			technologies: [...service.technologies],
			isActive: service.isActive
		};
		editingService = service;
		showAddForm = true;
	}

	function addTech() {
		const t = techInput.trim();
		if (t && !formData.technologies.includes(t))
			formData.technologies = [...formData.technologies, t];
		techInput = '';
	}
	const removeTech = (t: string) =>
		(formData.technologies = formData.technologies.filter((x) => x !== t));

	async function saveService() {
		try {
			const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
			const res = await fetch(url, {
				method: editingService ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			const data = await res.json();
			if (data.success) {
				showAddForm = false;
				await fetchServices();
			} else {
				alert('Error: ' + data.message);
			}
		} catch (error) {
			console.error('Error saving service:', error);
			alert('Error saving service');
		}
	}

	async function deleteService(service: any) {
		if (!confirm(`Delete "${service.name}"?`)) return;
		try {
			const res = await fetch(`/api/services/${service.id}`, { method: 'DELETE' });
			if (res.ok) await fetchServices();
		} catch (error) {
			console.error('Error deleting service:', error);
		}
	}

	async function toggleServiceStatus(service: any) {
		try {
			const res = await fetch(`/api/services/${service.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...service, isActive: !service.isActive })
			});
			if (res.ok) await fetchServices();
		} catch (error) {
			console.error('Error toggling service status:', error);
		}
	}
</script>

<svelte:head>
	<title>Services · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Offerings</p>
		<h1 class="a-title">Services</h1>
		<p class="a-sub">Manage your service offerings.</p>
	</div>
	<button class="a-btn a-btn--solid" on:click={openAddForm}>
		<Icon name="add" size={14} /> Add service
	</button>
</div>

{#if loading}
	<div class="a-loading" in:fade><div class="a-spinner"></div><p>Loading</p></div>
{:else if services.length === 0}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="setting" size={30} /></div>
		<h3>No services yet</h3>
		<p>Add a service to define what you offer.</p>
	</div>
{:else}
	<div class="grid">
		{#each services as s, i (s.id)}
			<div class="a-card svc" in:fly={{ y: 14, duration: 360, delay: i * 45 }}>
				<div class="top">
					<h3>{s.name}</h3>
					<button
						class="a-pill"
						style="color:{s.isActive ? '#9fe2a0' : '#ff5a52'}"
						on:click={() => toggleServiceStatus(s)}
					>
						{s.isActive ? 'Active' : 'Inactive'}
					</button>
				</div>
				<p class="desc">{s.description}</p>
				<div class="meta">
					{#if s.price}
						<span><Icon name="dollar-circle" size={13} /> ${s.price}</span>
					{/if}
					{#if s.duration}
						<span><Icon name="clock" size={13} /> {s.duration}</span>
					{/if}
					<span><Icon name="messages" size={13} /> {s._count?.requests || 0} requests</span>
				</div>
				{#if s.technologies.length > 0}
					<div class="tags">
						{#each s.technologies.slice(0, 4) as t}<span class="tag">{t}</span>{/each}
						{#if s.technologies.length > 4}
							<span class="tag muted">+{s.technologies.length - 4}</span>
						{/if}
					</div>
				{/if}
				<div class="acts">
					<button class="a-btn" on:click={() => openEditForm(s)}>
						<Icon name="edit" size={13} /> Edit
					</button>
					<button class="a-btn a-btn--danger" on:click={() => deleteService(s)}>
						<Icon name="trash" size={13} /> Delete
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if showAddForm}
	<div class="a-modal" on:click={() => (showAddForm = false)} transition:fade={{ duration: 180 }}>
		<div class="a-modal-box" on:click|stopPropagation transition:fly={{ y: 18, duration: 260 }}>
			<header class="modal-head">
				<h3>{editingService ? 'Edit service' : 'New service'}</h3>
				<button class="icon-btn" on:click={() => (showAddForm = false)} aria-label="Close">
					<Icon name="close-circle" size={20} />
				</button>
			</header>
			<form on:submit|preventDefault={saveService} class="modal-body">
				<div class="a-field">
					<label class="a-label" for="s-name">Service name</label>
					<input id="s-name" class="a-input" bind:value={formData.name} required />
				</div>
				<div class="a-field">
					<label class="a-label" for="s-desc">Description</label>
					<textarea id="s-desc" class="a-textarea" bind:value={formData.description} required></textarea>
				</div>
				<div class="two">
					<div class="a-field">
						<label class="a-label" for="s-price">Price (USD)</label>
						<input id="s-price" class="a-input" type="number" step="0.01" bind:value={formData.price} placeholder="Optional" />
					</div>
					<div class="a-field">
						<label class="a-label" for="s-dur">Duration</label>
						<input id="s-dur" class="a-input" bind:value={formData.duration} placeholder="e.g. 2-4 weeks" />
					</div>
				</div>
				<div class="a-field">
					<span class="a-label">Technologies</span>
					<div class="adder">
						<input
							class="a-input"
							bind:value={techInput}
							placeholder="Add technology"
							on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
						/>
						<button type="button" class="a-btn" on:click={addTech}>Add</button>
					</div>
					<div class="tags">
						{#each formData.technologies as t}
							<span class="tag removable">{t}
								<button type="button" on:click={() => removeTech(t)} aria-label="Remove">×</button>
							</span>
						{/each}
					</div>
				</div>
				<label class="check">
					<input type="checkbox" bind:checked={formData.isActive} />
					<span>Service is active</span>
				</label>
				<div class="modal-foot">
					<button type="button" class="a-btn" on:click={() => (showAddForm = false)}>Cancel</button>
					<button type="submit" class="a-btn a-btn--solid">
						{editingService ? 'Update' : 'Create'} service
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	@media (max-width: 980px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.svc {
		padding: 20px 22px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}
	.top h3 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: 17px;
		color: var(--ink);
		margin: 0;
	}
	.a-pill {
		cursor: pointer;
		background: transparent;
	}
	.desc {
		font-size: 13px;
		line-height: 1.55;
		color: var(--ink-2);
		margin: 0;
		flex: 1;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--mute);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tag {
		font-family: var(--mono);
		font-size: 10px;
		color: var(--ink-2);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--hairline);
		border-radius: 6px;
		padding: 4px 8px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.tag.muted {
		color: var(--mute);
	}
	.tag.removable button {
		background: none;
		border: none;
		color: var(--danger);
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		padding: 0;
	}
	.acts {
		display: flex;
		gap: 8px;
		padding-top: 12px;
		border-top: 1px solid var(--hairline);
	}
	.acts .a-btn {
		flex: 1;
		justify-content: center;
	}

	/* modal */
	.modal-head {
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 22px;
		background: var(--panel);
		border-bottom: 1px solid var(--hairline);
	}
	.modal-head h3 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: 19px;
		color: var(--ink);
		margin: 0;
	}
	.icon-btn {
		background: none;
		border: none;
		color: var(--mute);
		cursor: pointer;
		display: inline-flex;
		padding: 4px;
	}
	.icon-btn:hover {
		color: var(--ink);
	}
	.modal-body {
		padding: 22px;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	@media (max-width: 560px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
	.adder {
		display: flex;
		gap: 8px;
	}
	.adder .a-input {
		flex: 1;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: var(--ink-2);
		cursor: pointer;
	}
	.check input {
		width: 16px;
		height: 16px;
		accent-color: var(--spark);
	}
	.modal-foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		padding-top: 18px;
		margin-top: 18px;
		border-top: 1px solid var(--hairline);
	}
</style>
