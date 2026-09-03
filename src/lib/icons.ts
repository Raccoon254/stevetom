/**
 * Axene Mailer icon library - Iconsax "Broken" pack.
 * All SVGs use currentColor so they respond to Tailwind text-* classes.
 *
 * Source files live in $lib/icons/broken/*.svg. Only the icons this site
 * actually references are bundled: scripts/generate-icons.mjs scans the source
 * and writes icons.generated.ts with static imports for that subset. Globbing
 * the whole pack eagerly inlined all 1057 SVGs into one ~1.3 MB client chunk.
 * After adding a new <Icon name="...">, run `npm run icons`.
 *
 * You can pass either the kebab-case filename (e.g. "arrow-left4", "tick-circle")
 * or a camelCase alias defined below (e.g. "arrowLeft", "checkCircle").
 *
 * Directional affordances use the pure chevron glyphs only: arrow-left4,
 * arrow-right4, arrow-up3, arrow-down4. The tailed variants (arrow-left,
 * arrow-up2 and friends) and the circled/squared ones are not used for
 * navigation, and the arrowLeft/arrowRight/arrowUp/arrowDown aliases all
 * resolve to chevrons so the rule holds by default.
 */

import { rawIcons } from './icons.generated';

const byName: Record<string, string> = rawIcons;

const aliases: Record<string, string> = {
	// arrows / chevrons
	arrowLeft: 'arrow-left4',
	arrowRight: 'arrow-right4',
	arrowUp: 'arrow-up3',
	arrowDown: 'arrow-down4',
	arrowSwap: 'arrow-swap',
	// Directional affordances use the pure chevron glyphs, never the tailed
	// arrow variants. Applies to dropdowns, breadcrumbs, pagination, back,
	// collapse and sort.
	chevronDown: 'arrow-down4',
	chevronLeft: 'arrow-left4',
	chevronRight: 'arrow-right4',
	chevronUp: 'arrow-up3',
	importArrow: 'import-arrow',
	exportArrow: 'export-arrow',
	linkExternal: 'export-arrow',
	externalLink: 'export-arrow',

	// status / feedback
	checkCircle: 'tick-circle',
	tickCircle: 'tick-circle',
	check: 'tick-circle',
	cancel: 'close-circle',
	close: 'close-circle',
	closeCircle: 'close-circle',
	circleExclamation: 'danger',
	warning: 'warning',
	danger: 'danger',
	info: 'info-circle',
	infoCircle: 'info-circle',
	minusCircle: 'minus-circle',
	plus: 'add',
	add: 'add',

	// nav / dashboard
	home: 'home',
	overview: 'home',
	dashboard: 'home',
	apiKeys: 'key',
	domains: 'global',
	emails: 'sms',
	email: 'sms',
	send: 'send',
	senderIds: 'tag-user',
	forwarding: 'arrow-forward',
	webhook: 'programming-arrows',
	team: 'people',
	people: 'people',
	settings: 'setting',
	setting: 'setting',
	logout: 'logout',
	logout2: 'logout2',
	terminal: 'code',
	html: 'html',
	schedule: 'calendar-tick',
	calendar: 'calendar',

	// charts / metrics
	barChart: 'chart',
	chart: 'chart',
	pieChart: 'graph',
	graph: 'graph',
	graphUp: 'status-up',
	statusUp: 'status-up',
	trendUp: 'trend-up',
	trendDown: 'trend-down',
	chartSuccess: 'chart-success',
	chartFail: 'chart-fail',
	presentationChart: 'presentation-chart',

	// content / interaction
	click: 'mouse',
	mouse: 'mouse',
	cursor: 'mouse-circle',
	copy: 'copy',
	link: 'link',
	search: 'search-normal',
	globalSearch: 'global-search',
	global: 'global',
	eye: 'eye',
	eyeSlash: 'eye-slash',
	refresh: 'refresh-circle',
	clock: 'clock',
	timer: 'timer',
	filter: 'filter',
	sort: 'sort',
	edit: 'edit',
	trash: 'trash',
	"delete": 'trash',
	bookSaved: 'book-saved',
	bookmark: 'bookmark',
	flag: 'flag',
	tag: 'tag',
	aiTagPrice: 'tag',
	hashtag: 'hashtag',
	bell: 'bell',
	notification: 'notification',
	share: 'share',
	star: 'star',
	heart: 'heart',
	heartCircle: 'heart-circle',
	gift: 'gift',
	bag: 'bag',
	box: 'box',
	building: 'building',
	wifi: 'wifi',
	cloud: 'cloud',
	cloudLightning: 'cloud-lightning',
	menu: 'menu',
	grid: 'grid',
	hierarchy: 'hierarchy',
	hierarchySquare: 'hierarchy-square', // explicit opt-in
	nodesSquare: 'hierarchy',
	nodesCircle: 'hierarchy',
	flow: 'hierarchy',
	userFlow: 'hierarchy',
	route: 'route-square',

	// security / identity
	shield: 'shield',
	shieldTick: 'shield-tick',
	shieldSlash: 'shield-slash',
	lock: 'lock',
	key: 'key',
	keySquare: 'key-square',
	user: 'user',
	users: 'profile-2user',
	profile: 'profile',
	profileCircle: 'profile-circle',
	userAddCircle: 'user-circle-add',

	// money
	wallet: 'wallet',
	dollar: 'dollar-circle',
	dollarCircle: 'dollar-circle',
	money: 'money',

	// misc
	health: 'activity',
	activity: 'activity',
	trophy: 'cup',
	crown: 'crown',
	adjust: 'slider',
	slider: 'slider',
	mobile: 'mobile',
	monitor: 'monitor',
	devices: 'devices',
	homeTrendUp: 'home-trend-up',
	homeTrendDown: 'home-trend-down'
};

export type IconName = string;

export function getIcon(name: string): string {
	if (!name) return '';
	const svg = byName[name] ?? byName[aliases[name] ?? ''] ?? '';
	if (!svg && import.meta.env.DEV) {
		// The generated subset is built by scanning source for icon names, so a
		// miss here means the name was unreachable to that scan (built at
		// runtime, say) and needs adding before it ships blank.
		console.warn(`[icons] "${name}" is not in the generated subset. Run: npm run icons`);
	}
	return svg;
}

export const icons = new Proxy(byName, {
	get(target, prop: string) {
		if (typeof prop !== 'string') return undefined;
		return target[prop] ?? target[aliases[prop] ?? ''] ?? '';
	},
	has(target, prop: string) {
		if (typeof prop !== 'string') return false;
		return prop in target || prop in aliases;
	}
}) as Record<string, string>;
