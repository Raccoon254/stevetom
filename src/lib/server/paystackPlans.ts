/**
 * Paystack plans, for recurring sponsorship.
 *
 * A one-off charge and a subscription are different objects in Paystack. To
 * make a payment repeat you must attach a Plan to the transaction at
 * initialisation; without one, "monthly" is just a single charge that never
 * comes back. The partners page has advertised monthly tiers since before any
 * of this existed, so this is what makes that claim true.
 *
 * Plans are created lazily, once per (amount, interval), and looked up by a
 * deterministic name so a redeploy or a second server cannot create duplicates.
 */
import { PAYSTACK_SECRET_KEY } from '$env/static/private';

const API = 'https://api.paystack.co';

/** Deterministic, so the same amount always resolves to the same plan. */
function planName(amountKes: number, interval: string): string {
	return `kenTom Sponsor ${interval} KES ${Math.round(amountKes)}`;
}

type PaystackPlan = { plan_code?: string; name?: string; amount?: number; interval?: string };

async function api(path: string, init?: RequestInit) {
	const res = await fetch(`${API}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			'Content-Type': 'application/json',
			...(init?.headers ?? {})
		}
	});
	const body = await res.json().catch(() => null);
	return { ok: res.ok && body?.status === true, body };
}

/**
 * The plan code for a recurring charge of this amount, creating it if needed.
 *
 * Returns null rather than throwing when Paystack cannot be reached or refuses.
 * The caller then falls back to a one-time charge, which is the right failure
 * mode: taking the money once and saying so beats refusing a sponsor outright.
 */
export async function ensurePlan(
	amountKes: number,
	interval: 'monthly' | 'annually' = 'monthly'
): Promise<string | null> {
	const amount = Math.round(amountKes);
	if (!Number.isFinite(amount) || amount < 1) return null;

	const name = planName(amount, interval);
	const minor = amount * 100;

	try {
		// Look before creating. Paystack happily creates two plans with the same
		// name, and a duplicate set would make reconciliation ambiguous later.
		const list = await api(`/plan?perPage=100&interval=${interval}`);
		if (list.ok && Array.isArray(list.body?.data)) {
			const found = (list.body.data as PaystackPlan[]).find(
				(p) => p.name === name && p.amount === minor && p.interval === interval
			);
			if (found?.plan_code) return found.plan_code;
		}

		const created = await api('/plan', {
			method: 'POST',
			body: JSON.stringify({ name, amount: minor, interval, currency: 'KES' })
		});
		if (created.ok && created.body?.data?.plan_code) {
			return created.body.data.plan_code as string;
		}

		console.error('paystack plan create failed:', created.body?.message ?? 'unknown');
		return null;
	} catch (error) {
		console.error('paystack plan lookup failed:', error);
		return null;
	}
}
