<script lang="ts">
    import { onMount } from 'svelte';
    import { Inbox, Mail, Phone } from 'lucide-svelte';
    
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
            case 'PENDING': return 'badge-warning';
            case 'IN_REVIEW': return 'badge-info';
            case 'ACCEPTED': return 'badge-success';
            case 'IN_PROGRESS': return 'badge-primary';
            case 'COMPLETED': return 'badge-success';
            case 'REJECTED': return 'badge-error';
            default: return 'badge-ghost';
        }
    }

    function getStatusOptions(currentStatus: string) {
        const allStatuses = ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
        return allStatuses.filter(status => status !== currentStatus);
    }

    $: {
        if (filterStatus !== undefined) {
            fetchRequests();
        }
    }
</script>

<div class="space-y-6">
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-bold">Service Requests</h1>
            <p>Manage client service requests</p>
        </div>
        
        <!-- Filter -->
        <div class="form-control">
            <select 
                bind:value={filterStatus}
                class="select select-bordered"
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
    </div>

    {#if loading}
        <div class="flex justify-center items-center min-h-[80vh] py-12">
            <div class="animate-spin rounded-full h-12 w-12 loading loading-ring"></div>
        </div>
    {:else if requests.length === 0}
        <div class="text-center py-12">
            <div class="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox size="24" />
            </div>
            <h3 class="font-medium mb-2">No service requests</h3>
            <p class="text-sm">When clients submit service requests, they'll appear here.</p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Project</th>
                        <th>Service</th>
                        <th>Budget</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each requests as request}
                        <tr>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="avatar">
                                        <div class="mask mask-squircle w-10 h-10">
                                            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-medium">
                                                {request.clientName.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="font-bold">{request.clientName}</div>
                                        <div class="text-sm opacity-50">{request.clientEmail}</div>
                                        {#if request.company}
                                            <div class="text-xs opacity-50">{request.company}</div>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="font-bold">{request.projectTitle}</div>
                                <div class="text-sm opacity-50 line-clamp-2">{request.description.substring(0, 100)}...</div>
                            </td>
                            <td>
                                <div>{request.service.name}</div>
                            </td>
                            <td>
                                <div class="text-green-400">
                                    {request.budget ? `${request.budget}` : 'Not specified'}
                                </div>
                            </td>
                            <td>
                                <span class={`badge ${getStatusColor(request.status)}`}>
                                    {request.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                {formatDate(request.createdAt)}
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <button 
                                        on:click={() => showDetails(request)}
                                        class="btn btn-info btn-sm"
                                    >
                                        View
                                    </button>
                                    <button 
                                        on:click={() => deleteRequest(request)}
                                        class="btn btn-error btn-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

{#if showDetailModal && selectedRequest}
    <dialog class="modal modal-open">
        <div class="modal-box w-11/12 max-w-5xl">
            <h3 class="font-bold text-lg">Service Request Details</h3>
            
            <div class="space-y-6 mt-4">
                <!-- Client Information -->
                <div class="card bg-base-200 shadow-xl">
                    <div class="card-body">
                        <h3 class="card-title">Client Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm opacity-50">Name</label>
                                <p>{selectedRequest.clientName}</p>
                            </div>
                            <div>
                                <label class="text-sm opacity-50">Email</label>
                                <p>{selectedRequest.clientEmail}</p>
                            </div>
                            {#if selectedRequest.clientPhone}
                                <div>
                                    <label class="text-sm opacity-50">Phone</label>
                                    <p>{selectedRequest.clientPhone}</p>
                                </div>
                            {/if}
                            {#if selectedRequest.company}
                                <div>
                                    <label class="text-sm opacity-50">Company</label>
                                    <p>{selectedRequest.company}</p>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Project Information -->
                <div class="card bg-base-200 shadow-xl">
                    <div class="card-body">
                        <h3 class="card-title">Project Information</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm opacity-50">Project Title</label>
                                <p>{selectedRequest.projectTitle}</p>
                            </div>
                            <div>
                                <label class="text-sm opacity-50">Service Requested</label>
                                <p>{selectedRequest.service.name}</p>
                            </div>
                            <div>
                                <label class="text-sm opacity-50">Description</label>
                                <p class="whitespace-pre-wrap">{selectedRequest.description}</p>
                            </div>
                            {#if selectedRequest.requirements}
                                <div>
                                    <label class="text-sm opacity-50">Additional Requirements</label>
                                    <p class="whitespace-pre-wrap">{selectedRequest.requirements}</p>
                                </div>
                            {/if}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {#if selectedRequest.budget}
                                    <div>
                                        <label class="text-sm opacity-50">Budget</label>
                                        <p class="text-green-400">${selectedRequest.budget}</p>
                                    </div>
                                {/if}
                                {#if selectedRequest.timeline}
                                    <div>
                                        <label class="text-sm opacity-50">Timeline</label>
                                        <p>{selectedRequest.timeline}</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Management -->
                <div class="card bg-base-200 shadow-xl">
                    <div class="card-body">
                        <h3 class="card-title">Status Management</h3>
                        <div class="flex items-center gap-4">
                            <span class="opacity-50">Current Status:</span>
                            <span class={`badge ${getStatusColor(selectedRequest.status)}`}>
                                {selectedRequest.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div class="mt-4">
                            <label class="opacity-50 mb-2 block">Change Status:</label>
                            <div class="flex flex-wrap gap-2">
                                {#each getStatusOptions(selectedRequest.status) as status}
                                    <button
                                        on:click={() => updateRequestStatus(selectedRequest, status)}
                                        class={`btn btn-sm ${getStatusColor(status)}`}
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>

                {#if selectedRequest.notes}
                    <div class="card bg-base-200 shadow-xl">
                        <div class="card-body">
                            <h3 class="card-title">Internal Notes</h3>
                            <p class="whitespace-pre-wrap">{selectedRequest.notes}</p>
                        </div>
                    </div>
                {/if}

                <!-- Contact Actions -->
                <div class="modal-action">
                    <div class="flex space-x-4">
                        <a 
                            href="mailto:{selectedRequest.clientEmail}"
                            class="btn btn-primary"
                        >
                            <Mail size="16" class="mr-2" />Email Client
                        </a>
                        {#if selectedRequest.clientPhone}
                            <a 
                                href="tel:{selectedRequest.clientPhone}"
                                class="btn btn-success"
                            >
                                <Phone size="16" class="mr-2" />Call Client
                            </a>
                        {/if}
                    </div>
                    <button 
                        on:click={() => deleteRequest(selectedRequest)}
                        class="btn btn-error"
                    >
                        Delete Request
                    </button>
                    <button 
                        on:click={() => showDetailModal = false}
                        class="btn"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </dialog>
{/if}
