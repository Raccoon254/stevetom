/**
 * DiceBear avatar URLs — deterministic avatars from a seed (name / email).
 * https://www.dicebear.com/
 */
export function avatar(seed: string | null | undefined, style = 'glass'): string {
	const s = encodeURIComponent((seed || 'kenTom').trim().toLowerCase());
	return `https://api.dicebear.com/9.x/${style}/svg?seed=${s}`;
}
