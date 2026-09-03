/**
 * The nudge policy: what a bottom-right panel is allowed to say, and when.
 *
 * The rendering lives in $lib/components/kenfolio/NudgePanel.svelte; the wiring
 * lives in NudgeHost.svelte. This file is only the decision-making, so the rules
 * can be read in one place without hunting through markup.
 *
 * The rules, in short:
 *   - nothing on first paint. A nudge needs a second page in the visit plus a
 *     short settle, so it can never interrupt an arrival.
 *   - one nudge per visit, ever. Two is nagging.
 *   - a dismissal sticks for two months for that nudge, and buys two quiet
 *     weeks for every other nudge as well. "Not now" almost always means "not
 *     now, about anything".
 *   - acting on a nudge retires it for six months.
 *   - nothing at all for a visitor sending Do Not Track or Global Privacy
 *     Control, and nothing written to storage for them either. That mirrors how
 *     $lib/analytics.ts treats the same signals.
 *
 * On knowing who already subscribed. There is no client-reachable signal for
 * it. A subscription is written server side by subscribeEmail() in
 * /api/verify/confirm and lives in the database; nothing is set in a cookie, in
 * localStorage, or on the page, and /unsubscribe identifies people by a token
 * in the link rather than by any stored state. So the newsletter nudge is
 * suppressed on the evidence that is actually available: /unsubscribe is
 * blocked outright, the two pages that already render the signup form are
 * skipped, and starting the embedded signup retires the nudge for six months.
 * A visitor who subscribed on another device, or before this shipped, can still
 * see it once; closing it is then remembered for two months.
 */
import { browser } from '$app/environment';
import { optedOut } from '$lib/analytics';

export type NudgeId = 'newsletter' | 'contact' | 'sponsor';

export type Nudge = {
	id: NudgeId;
	/** icon name from the generated subset; run `npm run icons` after changing one */
	icon: string;
	/** names the panel for assistive tech */
	label: string;
	/**
	 * 'link' sends the visitor to an existing route. 'newsletter' hosts the
	 * existing NewsletterSignup component, so there is exactly one signup path
	 * on the site rather than a second one living in here.
	 */
	kind: 'link' | 'newsletter';
	/**
	 * Copy for a 'link' nudge. A 'newsletter' nudge has none of its own: it
	 * renders NewsletterSignup, which brings its own heading and its own
	 * step-by-step wording, and repeating that above it would only say it twice.
	 */
	eyebrow?: string;
	title?: string;
	body?: string;
	cta?: string;
	href?: string;
	/** a quieter second option, when there is a genuine one */
	alt?: { label: string; href: string };
	/** where this nudge has nothing to add, because the thing is already there */
	redundant: (path: string) => boolean;
};

export const NUDGES: Record<NudgeId, Nudge> = {
	newsletter: {
		id: 'newsletter',
		icon: 'sms',
		label: 'Newsletter',
		kind: 'newsletter',
		// The home page and the blog index both render the signup form already,
		// so on those two a panel would only repeat what is on screen.
		redundant: (p) => p === '/' || p === '/blog'
	},
	contact: {
		id: 'contact',
		icon: 'messages',
		label: 'Get in touch',
		kind: 'link',
		eyebrow: 'Work',
		title: 'Something you want built?',
		body: 'A sentence about it is enough to start. I read every message myself and usually reply within a day.',
		cta: 'Start a conversation',
		href: '/contact',
		alt: { label: 'Ask for a quote', href: '/quote' },
		redundant: (p) => p.startsWith('/contact') || p.startsWith('/quote')
	},
	sponsor: {
		id: 'sponsor',
		icon: 'heart',
		label: 'Sponsorship',
		kind: 'link',
		eyebrow: 'Partners',
		title: 'Sponsor the work.',
		body: 'Sponsorship buys time for SkillKenya tutoring and for the open-source pieces behind these projects.',
		cta: 'See the tiers',
		href: '/partners',
		redundant: (p) => p.startsWith('/partners') || p.startsWith('/donate')
	}
};

/* ─────────── timing ─────────── */

/** A nudge needs this many page views in the visit before it may appear. */
export const PAGES_BEFORE_NUDGE = 2;

/** ...and this long on that page, so it never lands mid-navigation. */
export const SETTLE_MS = 8000;

const DAY = 86_400_000;
const DISMISSED_DAYS = 60;
const ACTED_DAYS = 180;
const QUIET_DAYS = 14;

/* ─────────── storage ─────────── */

/**
 * Versioned on purpose. If the copy or the set of nudges changes materially,
 * bump the suffix and everyone starts clean rather than inheriting a
 * suppression that was about different words.
 */
const STORE_KEY = 'kt_nudge_v1';
/** Per-tab, so it dies with the visit. One nudge per visit is enforced here. */
const VISIT_KEY = 'kt_nudge_visit_v1';

type Store = {
	/** no nudge of any kind before this timestamp */
	quietUntil?: number;
	/** per-nudge suppression, id -> timestamp */
	until?: Partial<Record<NudgeId, number>>;
};

function readStore(): Store {
	if (!browser) return {};
	try {
		const raw = localStorage.getItem(STORE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== 'object') return {};
		return parsed as Store;
	} catch {
		// corrupt or blocked: behave as though nothing was ever stored
		return {};
	}
}

function writeStore(next: Store): void {
	// An opted-out visitor gets no local record written about them at all.
	if (!browser || optedOut()) return;
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(next));
	} catch {
		// private mode, quota, blocked storage: the nudge simply loses its memory
	}
}

function suppress(id: NudgeId, days: number, quietDays: number): void {
	const now = Date.now();
	const store = readStore();
	writeStore({
		quietUntil: Math.max(store.quietUntil ?? 0, now + quietDays * DAY),
		until: { ...store.until, [id]: Math.max(store.until?.[id] ?? 0, now + days * DAY) }
	});
}

/** Closed by the X or by Escape. Long memory, and a quiet fortnight for the rest. */
export function recordDismissal(id: NudgeId): void {
	suppress(id, DISMISSED_DAYS, QUIET_DAYS);
}

/**
 * Clicked through, or submitted the embedded signup. Retire this one for half a
 * year: whatever it was asking for, they have now dealt with it.
 */
export function recordAction(id: NudgeId): void {
	suppress(id, ACTED_DAYS, QUIET_DAYS);
}

/* ─────────── the visit ─────────── */

type Visit = { pages: number; spent: boolean };

function readVisit(): Visit {
	if (!browser) return { pages: 0, spent: false };
	try {
		const raw = sessionStorage.getItem(VISIT_KEY);
		const parsed = raw ? (JSON.parse(raw) as Partial<Visit>) : null;
		return {
			pages: typeof parsed?.pages === 'number' ? parsed.pages : 0,
			spent: parsed?.spent === true
		};
	} catch {
		return { pages: 0, spent: false };
	}
}

function writeVisit(next: Visit): void {
	if (!browser || optedOut()) return;
	try {
		sessionStorage.setItem(VISIT_KEY, JSON.stringify(next));
	} catch {
		// without session storage the counter restarts, which only delays a nudge
	}
}

/** Count one page view in this visit and return the running total. */
export function notePageView(): number {
	const visit = readVisit();
	const next = { ...visit, pages: visit.pages + 1 };
	writeVisit(next);
	return next.pages;
}

/** True once this visit has had its one nudge. */
export function visitSpent(): boolean {
	return readVisit().spent;
}

/** Burn the visit's single nudge slot. */
export function markVisitSpent(): void {
	writeVisit({ ...readVisit(), spent: true });
}

/* ─────────── eligibility ─────────── */

/**
 * Routes where no nudge belongs. /admin and /login are not public surface;
 * /unsubscribe is someone actively leaving, and pitching anything there
 * (the newsletter least of all) would be tone deaf.
 */
const BLOCKED = [/^\/admin(\/|$)/, /^\/login(\/|$)/, /^\/logout(\/|$)/, /^\/unsubscribe(\/|$)/];

export function blockedPath(path: string): boolean {
	return BLOCKED.some((re) => re.test(path));
}

/**
 * Which nudge fits this page best. The first one that is eligible wins, so the
 * ordering per section is the whole of the ranking.
 */
function preference(path: string): NudgeId[] {
	if (path.startsWith('/blog')) return ['newsletter', 'contact', 'sponsor'];
	if (path.startsWith('/lab')) return ['sponsor', 'newsletter', 'contact'];
	return ['contact', 'newsletter', 'sponsor'];
}

function eligible(nudge: Nudge, path: string, store: Store, now: number): boolean {
	if (nudge.redundant(path)) return false;
	if ((store.until?.[nudge.id] ?? 0) > now) return false;
	return true;
}

/**
 * The one decision. Returns the nudge to show, or null, and does not itself
 * check engagement: the caller only asks once the engagement rule has been met.
 */
export function chooseNudge(path: string): Nudge | null {
	if (!browser || optedOut()) return null;
	if (blockedPath(path)) return null;
	if (visitSpent()) return null;

	const now = Date.now();
	const store = readStore();
	if ((store.quietUntil ?? 0) > now) return null;

	for (const id of preference(path)) {
		const nudge = NUDGES[id];
		if (eligible(nudge, path, store, now)) return nudge;
	}
	return null;
}

/** Analytics event names. Free-form strings, recorded as AnalyticsEvent rows. */
export function eventName(id: NudgeId, action: 'shown' | 'dismissed' | 'acted'): string {
	return `nudge.${id}.${action}`;
}
