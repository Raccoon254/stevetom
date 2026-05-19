// Lab experiments — the interaction studies that live across this site.
// Each has its own page at /lab/<slug> with a live demo + write-up.

export type LabDemo = 'ecg' | 'wave' | 'rain' | 'theme' | 'drop';

export interface LabSection {
	heading: string;
	body: string;
}

export interface LabExperiment {
	slug: string;
	name: string;
	tag: string;
	year: string;
	demo: LabDemo;
	summary: string;
	intro: string;
	sections: LabSection[];
}

export const experiments: LabExperiment[] = [
	{
		slug: 'ecg-ribbon',
		name: 'ECG Ribbon',
		tag: 'SVG',
		year: '2026',
		demo: 'ecg',
		summary: 'A heartbeat trace that paints itself across the hero, then slides off and redraws.',
		intro:
			'The hero needed a single moving line that felt alive rather than decorative — a pulse. It is one SVG path, but drawn as a ribbon whose width tapers along its tail so the head reads as the "now" and the rest fades into the past.',
		sections: [
			{
				heading: 'One path, many slices',
				body: 'The waveform is a single <path>. Instead of stroking it once, the animation appends 70 <use> clones of that path into a group. Each clone reveals only a tiny slice of the curve using a stroke-dasharray gap. Together the slices tile the whole length — but because each is independent, every slice can be a different width.'
			},
			{
				heading: 'The tapering tail',
				body: 'A widthAt() function maps "distance behind the head" to a stroke width with a quadratic falloff. The slice nearest the head gets the full ~6px; slices further back thin out to nothing by ~980 units. That quadratic curve is what makes the tail feel like it is dissolving rather than just being cut off.'
			},
			{
				heading: 'Painting and erasing',
				body: 'Progress runs a head position along the total path length each cycle. As the head advances, the visible window (head minus tail length) slides with it. When the head reaches the end, the tail keeps sliding until it too leaves the path — then the cycle restarts. No frame ever clears the whole thing; slices are simply re-measured every tick.'
			},
			{
				heading: 'Paused when unseen',
				body: 'An IntersectionObserver watches the hero. The moment it scrolls out of view the requestAnimationFrame loop stops advancing, so the trace costs nothing while you read the rest of the page. It resumes from where it left off when the hero returns.'
			}
		]
	},
	{
		slug: 'halftone-wave',
		name: 'Halftone Wave',
		tag: 'Canvas',
		year: '2026',
		demo: 'wave',
		summary: 'A field of dots that breathes — a smoothed sine field rendered dot by dot.',
		intro:
			'A quiet backdrop for the about section: a halftone field where the dot size carries the signal. It should feel like a slow tide, never loud enough to compete with the text in front of it.',
		sections: [
			{
				heading: 'A signal per column',
				body: 'The canvas is divided into ~140 vertical columns. Each column has a target amplitude built from two layered sine waves multiplied together, shaped by a bell-curve envelope so the motion concentrates toward the centre and calms at the edges.'
			},
			{
				heading: 'Smoothing the motion',
				body: 'Jumping straight to each target would look jittery. Instead every column eases toward its target with a low-pass filter — 85% of the old value, 15% of the new. That single line of smoothing is what turns a noisy signal into something that breathes.'
			},
			{
				heading: 'Drawing in halftone',
				body: 'For each column the amplitude becomes a stack of dots above and below the centre line. Dot radius follows a circular falloff, so a column reads as a soft vertical lens. Larger amplitude means bigger, fuller dots — the size is the data.'
			},
			{
				heading: 'Theme-aware',
				body: 'Colours are read from CSS custom properties every frame, so when you flip between light and dark the field re-tints itself without the animation ever restarting.'
			}
		]
	},
	{
		slug: 'ambient-rain',
		name: 'Ambient Rain',
		tag: 'Canvas',
		year: '2026',
		demo: 'rain',
		summary: 'Slow vertical streaks drifting in the dark, each landing in a small ripple.',
		intro:
			'The lab section wanted weather — something atmospheric and barely there. Thirty-five streaks fall at their own pace, and each one ends its life in a flat little ellipse where it meets the ground.',
		sections: [
			{
				heading: 'Each drop is independent',
				body: 'Every streak carries its own x position, fall speed, length, and a randomised "ground" height. When a streak respawns it rerolls all of those, so the rain never settles into a visible pattern or a shared rhythm.'
			},
			{
				heading: 'Landing into ripples',
				body: 'A streak falls until its tip crosses its ground line. At that instant it pushes a ripple into a separate list and respawns above the frame. The ripple records where it landed and a perspective factor based on how far down the scene it is.'
			},
			{
				heading: 'Fake perspective',
				body: 'Ripples are drawn as ellipses squashed to 35% height — a circle seen at a shallow angle. Ripples lower in the frame expand wider, which sells a floor receding away from you without any real 3D.'
			},
			{
				heading: 'Frame-rate independent',
				body: 'Movement is multiplied by real elapsed time (delta), clamped so a backgrounded tab cannot make every drop teleport. The rain falls at the same speed on a 60Hz and a 120Hz screen.'
			}
		]
	},
	{
		slug: 'theme-toggle',
		name: 'Theme Toggle',
		tag: 'CSS',
		year: '2026',
		demo: 'theme',
		summary: 'A sun that eclipses into a moon — and collapses to a rotating half-disc on phones.',
		intro:
			'The light/dark switch should be a small moment of delight, not a checkbox. On desktop a sun and moon trade places with a rotation; on phones the whole thing distils down to a single half-filled disc.',
		sections: [
			{
				heading: 'Sun and moon, stacked',
				body: 'Both icons occupy the same box. The inactive one is rotated, scaled down, and faded out; the active one sits upright at full size. Toggling the theme swaps which is which, and a shared cubic-bezier handles the cross-rotation so they appear to orbit past each other.'
			},
			{
				heading: 'The sun’s rays',
				body: 'The eight rays are their own group with a transform-origin at the centre. As the icon becomes a moon the rays scale toward zero — the sun visibly retracts its light rather than just disappearing.'
			},
			{
				heading: 'A different shape for phones',
				body: 'Thin-stroke icons read poorly at small sizes, so under 640px the SVGs are hidden and a crisp half-filled disc takes over. Selecting dark mode rotates that disc 180°, sweeping the filled half to the other side — the same gesture, far more legible on a small screen.'
			},
			{
				heading: 'Respecting motion settings',
				body: 'Every transition is driven by one --anim custom property. Under prefers-reduced-motion that property drops to zero, so the toggle still works — it just changes state instantly instead of animating.'
			}
		]
	},
	{
		slug: 'scroll-drop',
		name: 'Scroll Drop',
		tag: 'CSS',
		year: '2026',
		demo: 'drop',
		summary: 'A spark that falls under gravity and breaks into a ripple when it lands.',
		intro:
			'A scroll cue that does not nag. A spark falls down an invisible line, and the instant it lands it blooms into a single oval ripple — a small physical beat that says "there is more below".',
		sections: [
			{
				heading: 'Falling, not floating',
				body: 'The drop uses an ease-in timing function, so it accelerates the whole way down like something under gravity. It never eases out — there is no soft landing, which is exactly what makes the ripple that follows feel earned.'
			},
			{
				heading: 'A clipped track',
				body: 'The drop travels inside a one-pixel-wide element with overflow hidden, so it is cleanly cut off at the top and bottom. There is no visible guide line — only the spark and the space it moves through.'
			},
			{
				heading: 'The ripple',
				body: 'When the drop reaches the bottom, an oval ring scales up and fades out with its own ease-out curve, decelerating as it spreads — the way a real ripple loses energy across a surface. The oval shape reads as a ring seen on a receding plane.'
			},
			{
				heading: 'One clock',
				body: 'The fall and the ripple are separate animations on the same duration, with keyframe percentages tuned so the ripple fires exactly when the drop lands. Shared --cue-* custom properties mean retiming the whole cue is a one-line change.'
			}
		]
	}
];

export const getExperiment = (slug: string): LabExperiment | undefined =>
	experiments.find((e) => e.slug === slug);
