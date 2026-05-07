<script lang="ts">
    import { onMount } from 'svelte';
    
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
            case 'PENDING': return 'bg-yellow-500';
            case 'IN_REVIEW': return 'bg-blue-500';
            case 'ACCEPTED': return 'bg-green-500';
            case 'IN_PROGRESS': return 'bg-purple-500';
            case 'COMPLETED': return 'bg-green-700';
            case 'REJECTED': return 'bg-red-500';
            default: return 'bg-gray-500';
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
            <h1 class="text-3xl font-bold text-white">Service Requests</h1>
            <p class="text-gray-400">Manage client service requests</p>
        </div>
        
        <!-- Filter -->
        <div class="flex items-center gap-4">
            <select 
                bind:value={filterStatus}
                class="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500"
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
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    {:else if requests.length === 0}
        <div class="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <i class="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
            <h3 class="text-xl text-gray-400 mb-2">No service requests</h3>
            <p class="text-gray-500">When clients submit service requests, they'll appear here.</p>
        </div>
    {:else}
        <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Project</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Budget</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        {#each requests as request}
                            <tr class="hover:bg-gray-700 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div class="text-white font-medium">{request.clientName}</div>
                                        <div class="text-gray-400 text-sm">{request.clientEmail}</div>
                                        {#if request.company}
                                            <div class="text-gray-500 text-xs">{request.company}</div>
                                        {/if}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-white font-medium">{request.projectTitle}</div>
                                    <div class="text-gray-400 text-sm line-clamp-2">{request.description.substring(0, 100)}...</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-gray-300">{request.service.name}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-green-400">
                                        {request.budget ? `$${request.budget}` : 'Not specified'}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 rounded text-xs text-white {getStatusColor(request.status)}">
                                        {request.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                                    {formatDate(request.createdAt)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex space-x-2">
                                        <button 
                                            on:click={() => showDetails(request)}
                                            class="text-blue-400 hover:text-blue-300 text-sm"
                                        >
                                            View
                                        </button>
                                        <button 
                                            on:click={() => deleteRequest(request)}
                                            class="text-red-400 hover:text-red-300 text-sm"
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
        </div>
    {/if}
</div>

{#if showDetailModal && selectedRequest}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-white">Service Request Details</h2>
                    <button 
                        on:click={() => showDetailModal = false}
                        class="text-gray-400 hover:text-white"
                    >
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="space-y-6">
                    <!-- Client Information -->
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h3 class="text-white font-semibold mb-3">Client Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-gray-400 text-sm">Name</label>
                                <p class="text-white">{selectedRequest.clientName}</p>
                            </div>
                            <div>
                                <label class="text-gray-400 text-sm">Email</label>
                                <p class="text-white">{selectedRequest.clientEmail}</p>
                            </div>
                            {#if selectedRequest.clientPhone}
                                <div>
                                    <label class="text-gray-400 text-sm">Phone</label>
                                    <p class="text-white">{selectedRequest.clientPhone}</p>
                                </div>
                            {/if}
                            {#if selectedRequest.company}
                                <div>
                                    <label class="text-gray-400 text-sm">Company</label>
                                    <p class="text-white">{selectedRequest.company}</p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Project Information -->
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h3 class="text-white font-semibold mb-3">Project Information</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="text-gray-400 text-sm">Project Title</label>
                                <p class="text-white">{selectedRequest.projectTitle}</p>
                            </div>
                            <div>
                                <label class="text-gray-400 text-sm">Service Requested</label>
                                <p class="text-white">{selectedRequest.service.name}</p>
                            </div>
                            <div>
                                <label class="text-gray-400 text-sm">Description</label>
                                <p class="text-white whitespace-pre-wrap">{selectedRequest.description}</p>
                            </div>
                            {#if selectedRequest.requirements}
                                <div>
                                    <label class="text-gray-400 text-sm">Additional Requirements</label>
                                    <p class="text-white whitespace-pre-wrap">{selectedRequest.requirements}</p>
                                </div>
                            {/if}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {#if selectedRequest.budget}
                                    <div>
                                        <label class="text-gray-400 text-sm">Budget</label>
                                        <p class="text-green-400">${selectedRequest.budget}</p>
                                    </div>
                                {/if}
                                {#if selectedRequest.timeline}
                                    <div>
                                        <label class="text-gray-400 text-sm">Timeline</label>
                                        <p class="text-white">{selectedRequest.timeline}</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Status Management -->
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h3 class="text-white font-semibold mb-3">Status Management</h3>
                        <div class="flex items-center gap-4">
                            <span class="text-gray-400">Current Status:</span>
                            <span class="px-3 py-1 rounded text-sm text-white {getStatusColor(selectedRequest.status)}">
                                {selectedRequest.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div class="mt-4">
                            <label class="text-gray-400 text-sm mb-2 block">Change Status:</label>
                            <div class="flex flex-wrap gap-2">
                                {#each getStatusOptions(selectedRequest.status) as status}
                                    <button
                                        on:click={() => updateRequestStatus(selectedRequest, status)}
                                        class="px-3 py-1 rounded text-sm text-white {getStatusColor(status)} hover:opacity-80"
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>

                    {#if selectedRequest.notes}
                        <div class="bg-gray-700 p-4 rounded-lg">
                            <h3 class="text-white font-semibold mb-3">Internal Notes</h3>
                            <p class="text-gray-300 whitespace-pre-wrap">{selectedRequest.notes}</p>
                        </div>
                    {/if}

                    <!-- Contact Actions -->
                    <div class="flex justify-between items-center pt-4 border-t border-gray-600">
                        <div class="flex space-x-4">
                            <a 
                                href="mailto:{selectedRequest.clientEmail}"
                                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                <i class="fas fa-envelope mr-2"></i>Email Client
                            </a>
                            {#if selectedRequest.clientPhone}
                                <a 
                                    href="tel:{selectedRequest.clientPhone}"
                                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    <i class="fas fa-phone mr-2"></i>Call Client
                                </a>
                            {/if}
                        </div>
                        <button 
                            on:click={() => deleteRequest(selectedRequest)}
                            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Delete Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}