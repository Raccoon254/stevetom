// Lab experiments: the interaction studies that live across this site.
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
			'I wanted one moving line in the hero that felt alive rather than decorative, something with a pulse to it. So I drew a single SVG path as a ribbon whose width tapers along its tail. The head reads as the "now" and everything behind it fades into the past.',
		sections: [
			{
				heading: 'One path, many slices',
				body: 'The waveform is a single <path>. Instead of stroking it once, I append 70 <use> clones of that path into a group, and each clone reveals only a tiny slice of the curve through a stroke-dasharray gap. The slices tile the whole length together, but because each one is independent I can give every slice a different width.'
			},
			{
				heading: 'The tapering tail',
				body: 'A widthAt() function maps "distance behind the head" to a stroke width with a quadratic falloff. The slice nearest the head gets the full width of about 6px, and slices further back thin out to nothing by around 980 units. That quadratic curve is what makes the tail feel like it is dissolving rather than just being cut off.'
			},
			{
				heading: 'Painting and erasing',
				body: 'Each cycle, I run a head position along the total path length. As the head advances, the visible window (head minus tail length) slides along with it. When the head reaches the end, the tail keeps sliding until it too leaves the path, and then the cycle restarts. No frame ever clears the whole thing; I just re-measure the slices every tick.'
			},
			{
				heading: 'Paused when unseen',
				body: 'An IntersectionObserver watches the hero. The moment it scrolls out of view I stop advancing the requestAnimationFrame loop, so the trace costs nothing while you read the rest of the page. It picks up right where it left off when the hero comes back.'
			}
		]
	},
	{
		slug: 'halftone-wave',
		name: 'Halftone Wave',
		tag: 'Canvas',
		year: '2026',
		demo: 'wave',
		summary: 'A field of dots that breathes: a smoothed sine field rendered dot by dot.',
		intro:
			'I needed a quiet backdrop for the about section, so I built a halftone field where the dot size carries the signal. The whole point was for it to feel like a slow tide and never get loud enough to compete with the text sitting in front of it.',
		sections: [
			{
				heading: 'A signal per column',
				body: 'I divide the canvas into about 140 vertical columns. Each column gets a target amplitude built from two layered sine waves multiplied together, then shaped by a bell-curve envelope so the motion gathers toward the centre and calms down at the edges.'
			},
			{
				heading: 'Smoothing the motion',
				body: 'Jumping straight to each target looked jittery, so instead every column eases toward its target with a low-pass filter: 85% of the old value, 15% of the new. That single line of smoothing is what turns a noisy signal into something that actually breathes.'
			},
			{
				heading: 'Drawing in halftone',
				body: 'For each column I turn the amplitude into a stack of dots above and below the centre line. The dot radius follows a circular falloff, so a column reads as a soft vertical lens. Bigger amplitude means bigger, fuller dots, so the size of the dot is the data.'
			},
			{
				heading: 'Theme-aware',
				body: 'I read the colours from CSS custom properties on every frame, so when you flip between light and dark the field re-tints itself without the animation ever restarting.'
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
			'I wanted the lab section to have a bit of weather, something atmospheric and barely there. So I made 35 streaks that fall at their own pace, and each one ends its life in a flat little ellipse where it meets the ground.',
		sections: [
			{
				heading: 'Each drop is independent',
				body: 'Every streak carries its own x position, fall speed, length, and a randomised "ground" height. When a streak respawns I reroll all of those, so the rain never settles into a visible pattern or a shared rhythm.'
			},
			{
				heading: 'Landing into ripples',
				body: 'A streak falls until its tip crosses its ground line. At that instant I push a ripple into a separate list and respawn the streak above the frame. The ripple remembers where it landed and a perspective factor based on how far down the scene it is.'
			},
			{
				heading: 'Fake perspective',
				body: 'I draw the ripples as ellipses squashed to 35% height, which reads as a circle seen at a shallow angle. Ripples lower in the frame expand wider, and that alone sells a floor receding away from you without any real 3D.'
			},
			{
				heading: 'Frame-rate independent',
				body: 'I multiply movement by the real elapsed time between frames, clamped so a backgrounded tab cannot make every drop teleport. The rain falls at the same speed on a 60Hz screen and a 120Hz one.'
			}
		]
	},
	{
		slug: 'theme-toggle',
		name: 'Theme Toggle',
		tag: 'CSS',
		year: '2026',
		demo: 'theme',
		summary: 'A sun that eclipses into a moon, then collapses to a rotating half-disc on phones.',
		intro:
			'I think the light and dark switch should be a small moment of delight, not just a checkbox. On desktop a sun and moon trade places with a rotation, and on phones I distil the whole thing down to a single half-filled disc.',
		sections: [
			{
				heading: 'Sun and moon, stacked',
				body: 'Both icons sit in the same box. The inactive one is rotated, scaled down, and faded out, while the active one sits upright at full size. Toggling the theme swaps which is which, and a shared cubic-bezier handles the cross-rotation so they appear to orbit past each other.'
			},
			{
				heading: 'The sun’s rays',
				body: 'The eight rays are their own group with a transform-origin at the centre. As the icon becomes a moon I scale the rays toward zero, so the sun visibly retracts its light rather than just disappearing.'
			},
			{
				heading: 'A different shape for phones',
				body: 'Thin-stroke icons read poorly at small sizes, so under 640px I hide the SVGs and let a crisp half-filled disc take over. Selecting dark mode rotates that disc 180°, sweeping the filled half to the other side: the same gesture, far more legible on a small screen.'
			},
			{
				heading: 'Respecting motion settings',
				body: 'I drive every transition with one --anim custom property. Under prefers-reduced-motion that property drops to zero, so the toggle still works. It just changes state instantly instead of animating.'
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
			'I wanted a scroll cue that does not nag. A spark falls down an invisible line, and the instant it lands it blooms into a single oval ripple, a small physical beat that quietly says there is more below.',
		sections: [
			{
				heading: 'Falling, not floating',
				body: 'The drop uses an ease-in timing function, so it accelerates the whole way down like something under gravity. It never eases out, so there is no soft landing, and that is exactly what makes the ripple that follows feel earned.'
			},
			{
				heading: 'A clipped track',
				body: 'The drop travels inside a one-pixel-wide element with overflow hidden, so it is cleanly cut off at the top and bottom. There is no visible guide line, only the spark and the space it moves through.'
			},
			{
				heading: 'The ripple',
				body: 'When the drop reaches the bottom, an oval ring scales up and fades out with its own ease-out curve, decelerating as it spreads, the way a real ripple loses energy across a surface. The oval shape reads as a ring seen on a receding plane.'
			},
			{
				heading: 'One clock',
				body: 'The fall and the ripple are separate animations on the same duration, with the keyframe percentages tuned so the ripple fires exactly when the drop lands. Shared --cue-* custom properties mean retiming the whole cue is a one-line change.'
			}
		]
	}
];

export const getExperiment = (slug: string): LabExperiment | undefined =>
	experiments.find((e) => e.slug === slug);
