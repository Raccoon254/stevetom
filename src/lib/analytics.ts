/**
 * First-party analytics: the client side.
 *
 * What this sends: the pathname you are on, the hostname that sent you here on
 * the first hit of a page load, a utm_source if the link carried one, and a
 * random per-tab id. That is the whole payload.
 *
 * What it never sends: no name, no email, no query string, no IP (the browser
 * cannot send one anyway, and the server hashes and discards what it sees), no
 * cookie, and no third-party request.
 *
 * Identity, and why it changed. This used to keep a per-tab id that died with
 * the tab. It now keeps two ids in localStorage:
 *   visitorId  persistent, so repeat visits join up
 *   sessionId  rolls over after SESSION_TIMEOUT_MINUTES of inactivity, so one
 *              session spans several pages and survives a reload or a new tab
 * That is a real change of posture: a persistent id can follow someone across
 * visits. It is first-party only and never leaves our origin, Do Not Track and
 * Global Privacy Control still suppress the whole pipeline, and nothing is
 * written to storage at all for someone who has opted out.
 *
 * It also fails silently by design. A blocked, offline, or erroring beacon must
 * never surface in the console or break a navigation.
 */
import { browser } from '$app/environment';

const ENDPOINT = '/api/analytics/collect';
const SESSION_KEY = 'kt_session_v1';
const VISITOR_KEY = 'kt_visitor_v1';

/** A session ends after this much inactivity. 30 minutes is the usual convention. */
const SESSION_TIMEOUT_MINUTES = 30;

/** Honours Do Not Track and Global Privacy Control. Opted out means silent. */
export function optedOut(): boolean {
	if (!browser) return true;
	try {
		const nav = navigator as Navigator & { msDoNotTrack?: string; globalPrivacyControl?: boolean };
		const win = window as Window & { doNotTrack?: string };
		const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
		if (dnt === '1' || dnt === 'yes') return true;
		if (nav.globalPrivacyControl === true) return true;
	} catch {
		return true;
	}
	return false;
}

function randomId(): string {
	return typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Persistent, random, and never derived from anything about the person. It
 * says "the same browser came back", nothing more.
 */
export function visitorId(): string | null {
	if (!browser || optedOut()) return null;
	try {
		let id = localStorage.getItem(VISITOR_KEY);
		if (!id) {
			id = randomId();
			localStorage.setItem(VISITOR_KEY, id);
		}
		return id;
	} catch {
		// storage blocked or full: run without an id rather than failing
		return null;
	}
}

/**
 * The current session, rolled over once the visitor has been idle for longer
 * than the timeout. Reading it also refreshes the idle clock, which is correct
 * because every read here accompanies an actual hit.
 */
export function sessionId(): string | null {
	if (!browser || optedOut()) return null;
	try {
		const now = Date.now();
		const raw = localStorage.getItem(SESSION_KEY);
		let id: string | null = null;

		if (raw) {
			try {
				const parsed = JSON.parse(raw) as { id?: unknown; last?: unknown };
				const last = typeof parsed.last === 'number' ? parsed.last : 0;
				const fresh = now - last < SESSION_TIMEOUT_MINUTES * 60_000;
				if (fresh && typeof parsed.id === 'string' && parsed.id) id = parsed.id;
			} catch {
				id = null; // corrupt entry, just start a new session
			}
		}

		if (!id) id = randomId();
		localStorage.setItem(SESSION_KEY, JSON.stringify({ id, last: now }));
		return id;
	} catch {
		return null;
	}
}

type Payload = {
	path: string;
	referrer?: string | null;
	source?: string | null;
	sessionId?: string | null;
	visitorId?: string | null;
	event?: string;
};

/** Fire and forget. Every failure path ends here quietly. */
function send(payload: Payload): void {
	if (!browser || optedOut()) return;
	let body: string;
	try {
		body = JSON.stringify({ ...payload, sessionId: sessionId(), visitorId: visitorId() });
	} catch {
		return;
	}
	try {
		if (typeof navigator.sendBeacon === 'function') {
			const blob = new Blob([body], { type: 'application/json' });
			if (navigator.sendBeacon(ENDPOINT, blob)) return;
		}
		void fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body,
			keepalive: true,
			credentials: 'omit',
			mode: 'same-origin'
		}).catch(() => {});
	} catch {
		// analytics is never allowed to throw into the page
	}
}

// The external referrer belongs to the page load, not to every client-side
// navigation inside it. Sending it once stops one visit from being counted as
// five arrivals from the same source.
let referrerSpent = false;

/** Record one page view. Safe to call on first load and after every navigation. */
export function trackPageview(url?: URL): void {
	if (!browser || optedOut()) return;
	const here = url ?? new URL(window.location.href);

	let referrer: string | null = null;
	let source: string | null = null;
	if (!referrerSpent) {
		referrerSpent = true;
		referrer = document.referrer || null;
		source = here.searchParams.get('utm_source') || here.searchParams.get('ref');
	}

	// pathname only: the query string is dropped before it ever leaves the page
	send({ path: here.pathname, referrer, source });
}

/**
 * Record a named client-side event. Conversions that happen on the server are
 * recorded there instead, where they cannot be faked or missed.
 */
export function trackEvent(name: string): void {
	if (!browser || optedOut()) return;
	send({ path: window.location.pathname, event: name });
}
