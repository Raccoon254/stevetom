/**
 * Admin activity log: an append-only trail written to the ActivityLog table.
 * Logging never throws; a failed log must not break the action it describes.
 */
import { prisma } from '$lib/db.js';

export type LogEntry = {
	action: string;
	entity: 'request' | 'project' | 'service' | 'donation' | 'newsletter';
	entityId?: string | null;
	summary: string;
	actor?: 'system' | 'admin' | 'client';
};

export async function logActivity(entry: LogEntry): Promise<void> {
	try {
		await prisma.activityLog.create({
			data: {
				action: entry.action,
				entity: entry.entity,
				entityId: entry.entityId ?? null,
				summary: entry.summary,
				actor: entry.actor ?? 'system'
			}
		});
	} catch (error) {
		console.error('logActivity failed:', error);
	}
}
