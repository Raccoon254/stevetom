<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';

	let projects: any[] = [];
	let loading = true;
	let showAddForm = false;
	let editingProject: any = null;
	let techInput = '';
	let featureInput = '';

	const blank = () => ({
		title: '',
		description: '',
		image: '',
		projectUrl: '',
		githubUrl: '',
		tech: [] as string[],
		year: new Date().getFullYear().toString(),
		category: '',
		features: [] as string[],
		status: 'DEVELOPMENT',
		featured: false
	});
	let formData = blank();

	onMount(fetchProjects);

	async function fetchProjects() {
		try {
			const res = await fetch('/api/projects');
			const data = await res.json();
			if (data.success) projects = data.data;
		} catch (error) {
			console.error('Error fetching projects:', error);
		} finally {
			loading = false;
		}
	}

	function openAddForm() {
		formData = blank();
		techInput = '';
		featureInput = '';
		editingProject = null;
		showAddForm = true;
	}
	function openEditForm(project: any) {
		formData = { ...project, tech: [...project.tech], features: [...project.features] };
		editingProject = project;
		showAddForm = true;
	}

	function addTech() {
		const t = techInput.trim();
		if (t && !formData.tech.includes(t)) formData.tech = [...formData.tech, t];
		techInput = '';
	}
	const removeTech = (t: string) => (formData.tech = formData.tech.filter((x) => x !== t));
	function addFeature() {
		const f = featureInput.trim();
		if (f && !formData.features.includes(f)) formData.features = [...formData.features, f];
		featureInput = '';
	}
	const removeFeature = (f: string) =>
		(formData.features = formData.features.filter((x) => x !== f));

	async function saveProject() {
		try {
			const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
			const res = await fetch(url, {
				method: editingProject ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			const data = await res.json();
			if (data.success) {
				showAddForm = false;
				await fetchProjects();
			} else {
				alert('Error: ' + data.message);
			}
		} catch (error) {
			console.error('Error saving project:', error);
			alert('Error saving project');
		}
	}

	async function deleteProject(project: any) {
		if (!confirm(`Delete "${project.title}"?`)) return;
		try {
			const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
			if (res.ok) await fetchProjects();
		} catch (error) {
			console.error('Error deleting project:', error);
		}
	}

	function statusColor(status: string): string {
		return { LIVE: '#9fe2a0', DEVELOPMENT: '#ffd166', ARCHIVED: '#ff5a52' }[status] || '#6fa89c';
	}
</script>

<svelte:head>
	<title>Projects · kenTom Admin</title>
</svelte:head>

<div class="a-head">
	<div>
		<p class="a-eyebrow">Portfolio</p>
		<h1 class="a-title">Projects</h1>
		<p class="a-sub">Manage your portfolio projects.</p>
	</div>
	<button class="a-btn a-btn--solid" on:click={openAddForm}>
		<Icon name="add" size={14} /> Add project
	</button>
</div>

{#if loading}
	<div class="a-loading" in:fade><div class="a-spinner"></div><p>Loading</p></div>
{:else if projects.length === 0}
	<div class="a-card a-empty" in:fade>
		<div class="a-empty-icon"><Icon name="box" size={30} /></div>
		<h3>No projects yet</h3>
		<p>Add your first project to showcase it.</p>
	</div>
{:else}
	<div class="rows">
		{#each projects as p, i (p.id)}
			<div class="a-card proj" in:fly={{ y: 14, duration: 360, delay: i * 45 }}>
				<div class="shot">
					{#if p.image}<img src={p.image} alt={p.title} loading="lazy" />{/if}
				</div>
				<div class="body">
					<div class="top">
						<h3>{p.title}</h3>
						<div class="pills">
							{#if p.featured}<span class="a-pill" style="color:#7ecbff">Featured</span>{/if}
							<span class="a-pill" style="color:{statusColor(p.status)}">{p.status}</span>
						</div>
					</div>
					<p class="desc">{p.description}</p>
					<div class="tags">
						{#each p.tech as t}<span class="tag">{t}</span>{/each}
					</div>
					<div class="acts">
						{#if p.projectUrl}
							<a class="a-btn" href={p.projectUrl} target="_blank" rel="noopener">
								<Icon name="export-arrow" size={13} /> Live
							</a>
						{/if}
						{#if p.githubUrl}
							<a class="a-btn" href={p.githubUrl} target="_blank" rel="noopener">
								<Icon name="code" size={13} /> Code
							</a>
						{/if}
						<span class="spacer"></span>
						<button class="a-btn" on:click={() => openEditForm(p)}>
							<Icon name="edit" size={13} /> Edit
						</button>
						<button class="a-btn a-btn--danger" on:click={() => deleteProject(p)} aria-label="Delete">
							<Icon name="trash" size={13} />
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if showAddForm}
	<div class="a-modal" on:click={() => (showAddForm = false)} transition:fade={{ duration: 180 }}>
		<div class="a-modal-box" on:click|stopPropagation transition:fly={{ y: 18, duration: 260 }}>
			<header class="modal-head">
				<h3>{editingProject ? 'Edit project' : 'New project'}</h3>
				<button class="icon-btn" on:click={() => (showAddForm = false)} aria-label="Close">
					<Icon name="close-circle" size={20} />
				</button>
			</header>
			<form on:submit|preventDefault={saveProject} class="modal-body">
				<div class="two">
					<div class="a-field">
						<label class="a-label" for="p-title">Title</label>
						<input id="p-title" class="a-input" bind:value={formData.title} required />
					</div>
					<div class="a-field">
						<label class="a-label" for="p-cat">Category</label>
						<input id="p-cat" class="a-input" bind:value={formData.category} required />
					</div>
				</div>
				<div class="a-field">
					<label class="a-label" for="p-desc">Description</label>
					<textarea id="p-desc" class="a-textarea" bind:value={formData.description} required></textarea>
				</div>
				<div class="two">
					<div class="a-field">
						<label class="a-label" for="p-img">Image URL</label>
						<input id="p-img" class="a-input" type="url" bind:value={formData.image} required />
					</div>
					<div class="a-field">
						<label class="a-label" for="p-year">Year</label>
						<input id="p-year" class="a-input" bind:value={formData.year} required />
					</div>
				</div>
				<div class="two">
					<div class="a-field">
						<label class="a-label" for="p-url">Project URL</label>
						<input id="p-url" class="a-input" type="url" bind:value={formData.projectUrl} />
					</div>
					<div class="a-field">
						<label class="a-label" for="p-gh">GitHub URL</label>
						<input id="p-gh" class="a-input" type="url" bind:value={formData.githubUrl} />
					</div>
				</div>
				<div class="two">
					<div class="a-field">
						<label class="a-label" for="p-status">Status</label>
						<select id="p-status" class="a-select" bind:value={formData.status}>
							<option value="DEVELOPMENT">Development</option>
							<option value="LIVE">Live</option>
							<option value="ARCHIVED">Archived</option>
						</select>
					</div>
					<label class="check">
						<input type="checkbox" bind:checked={formData.featured} />
						<span>Featured project</span>
					</label>
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
						{#each formData.tech as t}
							<span class="tag removable">{t}
								<button type="button" on:click={() => removeTech(t)} aria-label="Remove">×</button>
							</span>
						{/each}
					</div>
				</div>

				<div class="a-field">
					<span class="a-label">Features</span>
					<div class="adder">
						<input
							class="a-input"
							bind:value={featureInput}
							placeholder="Add feature"
							on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
						/>
						<button type="button" class="a-btn" on:click={addFeature}>Add</button>
					</div>
					<div class="tags">
						{#each formData.features as f}
							<span class="tag removable">{f}
								<button type="button" on:click={() => removeFeature(f)} aria-label="Remove">×</button>
							</span>
						{/each}
					</div>
				</div>

				<div class="modal-foot">
					<button type="button" class="a-btn" on:click={() => (showAddForm = false)}>Cancel</button>
					<button type="submit" class="a-btn a-btn--solid">
						{editingProject ? 'Update' : 'Create'} project
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.rows {
		display: grid;
		gap: 14px;
	}
	.proj {
		display: grid;
		grid-template-columns: 200px 1fr;
		overflow: hidden;
	}
	.shot {
		background: rgba(255, 255, 255, 0.04);
	}
	.shot img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.body {
		padding: 20px 22px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
	}
	.top h3 {
		font-family: 'Google Sans Display', var(--sans);
		font-weight: 500;
		font-size: 19px;
		color: var(--ink);
		margin: 0;
	}
	.pills {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.desc {
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--ink-2);
		margin: 0;
		flex: 1;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tag {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.04em;
		color: var(--ink-2);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--hairline);
		border-radius: 6px;
		padding: 4px 8px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
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
		flex-wrap: wrap;
		align-items: center;
	}
	.spacer {
		flex: 1;
	}
	@media (max-width: 720px) {
		.proj {
			grid-template-columns: 1fr;
		}
		.shot {
			height: 160px;
		}
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
	.check {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: var(--ink-2);
		cursor: pointer;
		padding-top: 22px;
	}
	.check input {
		width: 16px;
		height: 16px;
		accent-color: var(--spark);
	}
	.adder {
		display: flex;
		gap: 8px;
	}
	.adder .a-input {
		flex: 1;
	}
	.modal-foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		padding-top: 18px;
		margin-top: 6px;
		border-top: 1px solid var(--hairline);
	}
</style>
