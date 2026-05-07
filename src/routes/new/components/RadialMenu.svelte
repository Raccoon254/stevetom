<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let activeMenu: 'design' | 'code' | 'animate' | null = null
	export let menuPosition = { x: 0, y: 0 }
	export let skillIcons: Record<string, { name: string; icon: string; color: string }[]>

	const dispatch = createEventDispatcher()

	function closeMenu() {
		dispatch('close')
	}
</script>

{#if activeMenu}
	<div
		class="radial-menu-overlay"
		on:click={closeMenu}
		on:keydown={(e) => e.key === 'Escape' && closeMenu()}
		role="button"
		tabindex="-1"
	>
		<div class="radial-menu" style="left: {menuPosition.x}px; top: {menuPosition.y}px;">
			<!-- SVG for sectored wheel -->
			<svg class="radial-wheel" viewBox="0 0 300 300" width="300" height="300">
				<defs>
					<!-- Donut mask -->
					<mask id="donut-mask">
						<circle cx="150" cy="150" r="150" fill="white" />
						<circle cx="150" cy="150" r="50" fill="black" />
					</mask>
				</defs>

				<!-- Sectors -->
				{#each skillIcons[activeMenu] as tool, index}
					{@const totalSectors = skillIcons[activeMenu].length}
					{@const anglePerSector = 360 / totalSectors}
					{@const startAngle = index * anglePerSector - 90}
					{@const endAngle = (index + 1) * anglePerSector - 90}
					{@const largeArcFlag = anglePerSector > 180 ? 1 : 0}

					{@const startRad = (startAngle * Math.PI) / 180}
					{@const endRad = (endAngle * Math.PI) / 180}

					{@const x1 = 150 + 150 * Math.cos(startRad)}
					{@const y1 = 150 + 150 * Math.sin(startRad)}
					{@const x2 = 150 + 150 * Math.cos(endRad)}
					{@const y2 = 150 + 150 * Math.sin(endRad)}

					{@const innerX1 = 150 + 50 * Math.cos(startRad)}
					{@const innerY1 = 150 + 50 * Math.sin(startRad)}
					{@const innerX2 = 150 + 50 * Math.cos(endRad)}
					{@const innerY2 = 150 + 50 * Math.sin(endRad)}

					{@const midAngle = (startAngle + endAngle) / 2}
					{@const midRad = (midAngle * Math.PI) / 180}
					{@const iconX = 150 + 100 * Math.cos(midRad)}
					{@const iconY = 150 + 100 * Math.sin(midRad)}

					<g class="sector-group" style="animation-delay: {index * 0.05}s;">
						<!-- Sector path -->
						<path
							class="sector backdrop-blur-lg"
							d="M {x1} {y1} A 150 150 0 {largeArcFlag} 1 {x2} {y2} L {innerX2} {innerY2} A 50 50 0 {largeArcFlag} 0 {innerX1} {innerY1} Z"
							fill="rgba(37, 37, 37, 0.95)"
							stroke="rgba(255, 255, 255, 0.3)"
							stroke-width="1"
							mask="url(#donut-mask)"
							style="backdrop-filter: blur(10px)"
						/>

						<!-- Icon and text -->
						<g class="sector-content" transform="translate({iconX}, {iconY})">
							<text
								class="sector-icon"
								text-anchor="middle"
								dominant-baseline="middle"
								font-size="32"
								fill="white"
							>
								{#if tool.icon.startsWith('image')}
									<div class="sector-icon">
										<img
											src={'./new/' + tool.icon}
											alt={tool.name}
											style="width: 32px; height: 32px;"
										/>
									</div>
								{:else if tool.icon.startsWith('devicon')}
									<i class="{tool.icon} colored"></i>
								{:else}
									{tool.icon}
								{/if}
							</text>
							<text
								class="sector-label"
								text-anchor="middle"
								y="25"
								font-size="12"
								fill="white"
								opacity="0.9"
							>
								{tool.name}
							</text>
						</g>
					</g>
				{/each}
			</svg>

			<!-- Overlay devicons (positioned absolutely) -->
			{#each skillIcons[activeMenu] as tool, index}
				{@const totalSectors = skillIcons[activeMenu].length}
				{@const anglePerSector = 360 / totalSectors}
				{@const midAngle = (index * anglePerSector + (index + 1) * anglePerSector) / 2 - 90}
				{@const midRad = (midAngle * Math.PI) / 180}
				{@const iconX = 100 * Math.cos(midRad)}
				{@const iconY = 100 * Math.sin(midRad)}

				{#if tool.icon.startsWith('devicon')}
					<div
						class="devicon-overlay"
						style="
							left: 50%;
							top: 50%;
							--x: {iconX}px;
							--y: {iconY - 12}px;
							animation-delay: {index * 0.05}s;
						"
					>
						<i class="{tool.icon} colored" style="font-size: 2rem; color: {tool.color};"></i>
					</div>
				{:else if tool.icon.startsWith('image')}
					<div
						class="devicon-overlay"
						style="
							left: 50%;
							top: 50%;
							--x: {iconX}px;
							--y: {iconY - 12}px;
							animation-delay: {index * 0.05}s;
						"
					>
						<img src={'./new/' + tool.icon} alt={tool.name} style="width: 32px; height: 32px;" />
					</div>
				{/if}
			{/each}

			<!-- backdrop circle exact size as the svg -->
			<div class="backdrop-circle"></div>

			<!-- Center circle with close button -->
			<div class="radial-center">
				<button class="close-btn" on:click={closeMenu}>✕</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Radial Menu (GTA Style) */
	.radial-menu-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 10000;
		background: rgba(0, 0, 0, 0.4);
	}

	.radial-menu {
		position: absolute;
		transform: translate(-50%, -50%);
		pointer-events: auto;
	}

	.radial-wheel {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 999;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3));
		border: 2px solid rgba(255, 255, 255, 0.4);
		animation: wheelAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}

	.sector-group {
		animation: sectorAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}

	.sector {
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.sector:hover {
		fill: rgba(37, 37, 37, 1);
		stroke: rgba(255, 255, 255, 0.6);
		stroke-width: 2;
	}

	.sector-content {
		pointer-events: none;
	}

	.sector-icon {
		font-weight: bold;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.sector-label {
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
	}

	.devicon-overlay {
		position: absolute;
		pointer-events: none;
		z-index: 99999;
		animation: iconAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	.radial-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60px;
		height: 60px;
		z-index: 10000001;
		background: rgba(37, 37, 37, 0.5);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
		animation: radialPulse 2s ease-in-out infinite;
		z-index: 10;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		cursor: pointer !important;
	}

	.backdrop-circle {
		width: 300px;
		height: 300px;
		border-radius: 50%;
		mix-blend-mode: screen;
		z-index: 9;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer !important;
		transition: transform 0.2s ease;
	}

	.close-btn:hover {
		transform: scale(1.2) rotate(90deg) !important;
	}

	/* Animations */
	@keyframes wheelAppear {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8) rotate(-10deg);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
	}

	@keyframes sectorAppear {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes iconAppear {
		0% {
			opacity: 0;
			transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0);
		}
		100% {
			opacity: 1;
			transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1);
		}
	}

	@keyframes radialPulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
		}
		50% {
			box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
		}
	}

	@keyframes radialItemAppear {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	@keyframes donutAppear {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>
