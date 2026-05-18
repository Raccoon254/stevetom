/**
 * KenFolio theme store — drives the [data-theme] attribute on <html>.
 * The initial value is set synchronously by the boot script in app.html
 * (to avoid a flash); this store keeps the toggle button in sync.
 */
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';
const KEY = 'kentom-theme';

function initial(): Theme {
	if (!browser) return 'dark';
	const attr = document.documentElement.getAttribute('data-theme');
	if (attr === 'light' || attr === 'dark') return attr;
	const saved = localStorage.getItem(KEY);
	return saved === 'light' ? 'light' : 'dark';
}

export const theme = writable<Theme>(initial());

export function toggleTheme(): void {
	theme.update((current) => {
		const next: Theme = current === 'dark' ? 'light' : 'dark';
		if (browser) {
			document.documentElement.setAttribute('data-theme', next);
			try {
				localStorage.setItem(KEY, next);
			} catch {
				/* private mode — ignore */
			}
		}
		return next;
	});
}
