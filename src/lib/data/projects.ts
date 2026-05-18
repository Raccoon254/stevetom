/**
 * Selected work — the four ventures shown in the KenFolio redesign.
 * Each renders through the (kenfolio)/work/[slug] project page.
 */
export type Project = {
	slug: string;
	name: string;
	/** mono meta line under the title — e.g. "2024 · Builders find shelter" */
	meta: string;
	/** paragraphs; <em>…</em> is rendered as emphasised (ink) text */
	body: string[];
	link: { label: string; href: string };
};

export const projects: Project[] = [
	{
		slug: 'axene',
		name: 'Axene.io',
		meta: 'Send, build, ship',
		body: [
			'An infrastructure company for the messaging layer. Email and SMS that send at scale, and custom software for teams that have outgrown the off-the-shelf tools.',
			'The work is mostly invisible by design. The part you notice is that <em>the message arrived</em>.'
		],
		link: { label: 'axene.io', href: 'https://axene.io' }
	},
	{
		slug: 'chiromo-forge',
		name: 'Chiromo Forge',
		meta: '2024 · Builders find shelter',
		body: [
			"A developer collective in Nairobi for early founders and the engineers around them. We host hackathons, run a quiet members' space, and pool the boring infrastructure so each team can spend its time on the part only it can do.",
			'The site is the front door — a place to <em>apply, see who is in residence, and join an event</em>.'
		],
		link: { label: 'chiromo.tech', href: 'https://chiromo.tech' }
	},
	{
		slug: 'qailly',
		name: 'Qailly',
		meta: 'Strangers break apps',
		body: [
			'Crowdsourced testing for Android and iOS. List an app, set the fee, and real people on real devices put it through its paces and send back what broke.',
			'It exists because <em>the bug you ship is the one no one else could reach</em>.'
		],
		link: { label: 'qailly.com', href: 'https://qailly.com' }
	},
	{
		slug: 'pixen',
		name: 'Pixen',
		meta: 'Pixels meet desktop',
		body: [
			'A desktop design app for Windows and beyond — the canvas, the tools, and the export, without a browser tab in sight.',
			'Built for people who would rather <em>open an app than open a site</em>.'
		],
		link: { label: 'pixen.cc', href: 'https://pixen.cc' }
	}
];
