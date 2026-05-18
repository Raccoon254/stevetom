/**
 * Axene Mailer icon library - Iconsax "Broken" pack.
 * All SVGs use currentColor so they respond to Tailwind text-* classes.
 *
 * Source files live in $lib/icons/broken/*.svg and are loaded eagerly via
 * Vite's import.meta.glob so each <Icon name="..."> renders the raw SVG.
 *
 * You can pass either the kebab-case filename (e.g. "arrow-left", "tick-circle")
 * or a camelCase alias defined below (e.g. "arrowLeft", "checkCircle").
 */

const modules = import.meta.glob('./icons/broken/*.svg', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const byName: Record<string, string> = {};
for (const [path, svg] of Object.entries(modules)) {
	const name = path.split('/').pop()!.replace(/\.svg$/, '');
	byName[name] = svg;
}

const aliases: Record<string, string> = {
	// arrows / chevrons
	arrowLeft: 'arrow-left',
	arrowRight: 'arrow-right',
	arrowUp: 'arrow-up',
	arrowDown: 'arrow-down',
	arrowSwap: 'arrow-swap',
	chevronDown: 'arrow-down',
	chevronLeft: 'arrow-left',
	chevronRight: 'arrow-right',
	chevronUp: 'arrow-up',
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
	return byName[name] ?? byName[aliases[name] ?? ''] ?? '';
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
