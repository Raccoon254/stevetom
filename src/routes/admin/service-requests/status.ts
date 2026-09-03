/**
 * The six ServiceRequestStatus values, the colours the admin paints them and
 * the guard that turns an untrusted form value back into one of them.
 *
 * Shared by the list and the single-request page so the two never drift.
 */
export const STATUSES = [
	'PENDING',
	'IN_REVIEW',
	'ACCEPTED',
	'IN_PROGRESS',
	'COMPLETED',
	'REJECTED'
] as const;

export type RequestStatus = (typeof STATUSES)[number];

export function isStatus(value: unknown): value is RequestStatus {
	return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

const COLOR: Record<string, string> = {
	PENDING: '#ff7a1a',
	IN_REVIEW: '#7ecbff',
	ACCEPTED: '#6fa89c',
	IN_PROGRESS: '#ffd166',
	COMPLETED: '#9fe2a0',
	REJECTED: '#ff5a52'
};

export function statusColor(status: string): string {
	return COLOR[status] || '#6fa89c';
}

/** PENDING -> PENDING, IN_REVIEW -> IN REVIEW. */
export function statusLabel(status: string): string {
	return status.replace('_', ' ');
}
