<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { Inbox, Mail, Phone, Eye, Trash2, X, User, Building, DollarSign, Clock, FileText } from 'lucide-svelte';

	let requests: any[] = [];
	let loading = true;
	let selectedRequest: any = null;
	let showDetailModal = false;
	let filterStatus = '';

	onMount(() => {
		fetchRequests();
	});

	async function fetchRequests() {
		try {
			let url = '/api/service-requests';
			if (filterStatus) {
				url += `?status=${filterStatus}`;
			}

			const response = await fetch(url);
			const data = await response.json();
			if (data.success) {
				requests = data.data;
			}
		} catch (error) {
			console.error('Error fetching requests:', error);
		} finally {
			loading = false;
		}
	}

	async function updateRequestStatus(request: any, newStatus: string) {
		try {
			const response = await fetch(`/api/service-requests/${request.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...request,
					status: newStatus
				})
			});

			if (response.ok) {
				await fetchRequests();
				if (selectedRequest?.id === request.id) {
					selectedRequest = { ...selectedRequest, status: newStatus };
				}
			}
		} catch (error) {
			console.error('Error updating request status:', error);
		}
	}

	async function deleteRequest(request: any) {
		if (confirm(`Are you sure you want to delete the request from ${request.clientName}?`)) {
			try {
				const response = await fetch(`/api/service-requests/${request.id}`, {
					method: 'DELETE'
				});

				if (response.ok) {
					await fetchRequests();
					if (selectedRequest?.id === request.id) {
						showDetailModal = false;
					}
				}
			} catch (error) {
				console.error('Error deleting request:', error);
			}
		}
	}

	function showDetails(request: any) {
		selectedRequest = request;
		showDetailModal = true;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'PENDING':
				return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
			case 'IN_REVIEW':
				return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
			case 'ACCEPTED':
				return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
			case 'IN_PROGRESS':
				return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
			case 'COMPLETED':
				return 'bg-green-500/10 text-green-400 border-green-500/30';
			case 'REJECTED':
				return 'bg-red-500/10 text-red-400 border-red-500/30';
			default:
				return 'bg-white/5 text-white/40 border-white/20';
		}
	}

	function getStatusOptions(currentStatus: string) {
		const allStatuses = ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
		return allStatuses.filter((status) => status !== currentStatus);
	}

	import { browser } from '$app/environment';

	$: {
		if (browser && filterStatus !== undefined) {
			fetchRequests();
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
		<div>
			<h1 class="text-4xl font-bold text-white">Service Requests</h1>
			<p class="text-white/60">Manage client service requests</p>
		</div>

		<!-- Filter -->
		<select
			bind:value={filterStatus}
			class="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
		>
			<option value="">All Statuses</option>
			<option value="PENDING">Pending</option>
			<option value="IN_REVIEW">In Review</option>
			<option value="ACCEPTED">Accepted</option>
			<option value="IN_PROGRESS">In Progress</option>
			<option value="COMPLETED">Completed</option>
			<option value="REJECTED">Rejected</option>
		</select>
	</div>

	{#if loading}
		<div class="flex justify-center items-center min-h-[60vh] py-12" in:fade>
			<div class="flex flex-col items-center gap-4">
				<div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
				<p class="text-white/50">Loading requests...</p>
			</div>
		</div>
	{:else if requests.length === 0}
		<div class="text-center py-20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl" in:fade>
			<div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
				<Inbox size="32" class="text-white/40" />
			</div>
			<h3 class="text-xl font-semibold text-white mb-2">No service requests</h3>
			<p class="text-white/50">When clients submit service requests, they'll appear here.</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each requests as request, i}
				<div
					class="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300"
					in:fly={{ y: 20, duration: 500, delay: i * 50, easing: cubicInOut }}
				>
					<div class="flex flex-col lg:flex-row lg:items-center gap-4">
						<!-- Client Info -->
						<div class="flex items-center gap-4 flex-1">
							<div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0">
								{request.clientName.charAt(0).toUpperCase()}
							</div>
							<div class="min-w-0 flex-1">
								<h4 class="font-semibold text-white truncate">{request.clientName}</h4>
								<p class="text-sm text-white/60 truncate">{request.clientEmail}</p>
								{#if request.company}
									<p class="text-xs text-white/40 truncate">{request.company}</p>
								{/if}
							</div>
						</div>

						<!-- Project Info -->
						<div class="flex-1 min-w-0">
							<p class="font-semibold text-white truncate">{request.projectTitle}</p>
							<p class="text-sm text-white/60 line-clamp-1">{request.description}</p>
							<p class="text-xs text-white/40 mt-1">{request.service.name}</p>
						</div>

						<!-- Budget -->
						<div class="flex items-center gap-2 text-emerald-400 font-medium">
							<DollarSign size="16" />
							<span>{request.budget ? `${request.budget}` : 'N/A'}</span>
						</div>

						<!-- Status -->
						<div>
							<span class="px-3 py-1.5 text-xs font-semibold rounded-full border {getStatusColor(request.status)} whitespace-nowrap">
								{request.status.replace('_', ' ')}
							</span>
						</div>

						<!-- Date -->
						<div class="text-sm text-white/40 whitespace-nowrap hidden xl:block">
							{formatDate(request.createdAt)}
						</div>

						<!-- Actions -->
						<div class="flex gap-2">
							<button
								on:click={() => showDetails(request)}
								class="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all text-sm font-medium flex items-center gap-2"
							>
								<Eye size="16" />
								<span class="hidden sm:inline">View</span>
							</button>
							<button
								on:click={() => deleteRequest(request)}
								class="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium flex items-center gap-2"
							>
								<Trash2 size="16" />
								<span class="hidden sm:inline">Delete</span>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Detail Modal -->
{#if showDetailModal && selectedRequest}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252525]/90 backdrop-blur-sm"
		on:click={() => (showDetailModal = false)}
		transition:fade={{ duration: 200 }}
	>
		<div
			class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
			on:click|stopPropagation
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Modal Header -->
			<div class="sticky top-0 bg-[#252525]/80 backdrop-blur-lg border-b border-white/10 p-6 flex justify-between items-center">
				<h3 class="text-2xl font-bold text-white">Service Request Details</h3>
				<button
					on:click={() => (showDetailModal = false)}
					class="p-2 hover:bg-white/10 rounded-lg transition-colors"
				>
					<X size="24" class="text-white/60" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 space-y-6">
				<!-- Client Information -->
				<div class="bg-white/5 border border-white/10 rounded-xl p-6">
					<h4 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
						<User size="20" />
						Client Information
					</h4>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<span class="text-sm text-white/50 block mb-1">Name</span>
							<p class="text-white font-medium">{selectedRequest.clientName}</p>
						</div>
						<div>
							<span class="text-sm text-white/50 block mb-1">Email</span>
							<p class="text-white font-medium">{selectedRequest.clientEmail}</p>
						</div>
						{#if selectedRequest.clientPhone}
							<div>
								<span class="text-sm text-white/50 block mb-1">Phone</span>
								<p class="text-white font-medium">{selectedRequest.clientPhone}</p>
							</div>
						{/if}
						{#if selectedRequest.company}
							<div>
								<span class="text-sm text-white/50 block mb-1">Company</span>
								<p class="text-white font-medium">{selectedRequest.company}</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Project Information -->
				<div class="bg-white/5 border border-white/10 rounded-xl p-6">
					<h4 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
						<FileText size="20" />
						Project Information
					</h4>
					<div class="space-y-4">
						<div>
							<span class="text-sm text-white/50 block mb-1">Project Title</span>
							<p class="text-white font-medium">{selectedRequest.projectTitle}</p>
						</div>
						<div>
							<span class="text-sm text-white/50 block mb-1">Service Requested</span>
							<p class="text-white font-medium">{selectedRequest.service.name}</p>
						</div>
						<div>
							<span class="text-sm text-white/50 block mb-1">Description</span>
							<p class="text-white/80 whitespace-pre-wrap">{selectedRequest.description}</p>
						</div>
						{#if selectedRequest.requirements}
							<div>
								<span class="text-sm text-white/50 block mb-1">Requirements</span>
								<p class="text-white/80 whitespace-pre-wrap">{selectedRequest.requirements}</p>
							</div>
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if selectedRequest.budget}
								<div>
									<span class="text-sm text-white/50 block mb-1">Budget</span>
									<p class="text-emerald-400 font-semibold flex items-center gap-1">
										<DollarSign size="16" />
										{selectedRequest.budget}
									</p>
								</div>
							{/if}
							{#if selectedRequest.timeline}
								<div>
									<span class="text-sm text-white/50 block mb-1">Timeline</span>
									<p class="text-white font-medium flex items-center gap-1">
										<Clock size="16" />
										{selectedRequest.timeline}
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Status Management -->
				<div class="bg-white/5 border border-white/10 rounded-xl p-6">
					<h4 class="text-lg font-bold text-white mb-4">Status Management</h4>
					<div class="flex items-center gap-4 mb-4">
						<span class="text-white/60">Current Status:</span>
						<span class="px-3 py-1.5 text-xs font-semibold rounded-full border {getStatusColor(selectedRequest.status)}">
							{selectedRequest.status.replace('_', ' ')}
						</span>
					</div>
					<div>
						<span class="text-white/60 mb-3 block">Change Status:</span>
						<div class="flex flex-wrap gap-2">
							{#each getStatusOptions(selectedRequest.status) as status}
								<button
									on:click={() => updateRequestStatus(selectedRequest, status)}
									class="px-4 py-2 rounded-lg border text-sm font-medium transition-all {getStatusColor(status)} hover:scale-105"
								>
									{status.replace('_', ' ')}
								</button>
							{/each}
						</div>
					</div>
				</div>

				{#if selectedRequest.notes}
					<div class="bg-white/5 border border-white/10 rounded-xl p-6">
						<h4 class="text-lg font-bold text-white mb-4">Internal Notes</h4>
						<p class="text-white/80 whitespace-pre-wrap">{selectedRequest.notes}</p>
					</div>
				{/if}
			</div>

			<!-- Modal Actions -->
			<div class="sticky bottom-0 bg-[#252525]/80 backdrop-blur-lg border-t border-white/10 p-6 flex flex-wrap gap-3 justify-between">
				<div class="flex flex-wrap gap-3">
					<a
						href="mailto:{selectedRequest.clientEmail}"
						class="px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/20 transition-all flex items-center gap-2"
					>
						<Mail size="16" />
						<span>Email Client</span>
					</a>
					{#if selectedRequest.clientPhone}
						<a
							href="tel:{selectedRequest.clientPhone}"
							class="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold hover:bg-emerald-500/20 transition-all flex items-center gap-2"
						>
							<Phone size="16" />
							<span>Call Client</span>
						</a>
					{/if}
				</div>
				<div class="flex gap-3">
					<button
						on:click={() => deleteRequest(selectedRequest)}
						class="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 transition-all"
					>
						Delete
					</button>
					<button
						on:click={() => (showDetailModal = false)}
						class="px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
