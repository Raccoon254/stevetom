<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade, fly, scale } from 'svelte/transition'
	import { cubicOut, elasticOut } from 'svelte/easing'
	import { X } from 'lucide-svelte'

	export let items: { name: string; icon: string; color: string }[] = []
	export let visible = false

	const dispatch = createEventDispatcher()
	let selectedItem: { name: string; icon: string; color: string } | null = null
	let hoveredIndex: number | null = null

	function handleSelect(item: { name: string; icon: string; color: string }) {
		selectedItem = selectedItem === item ? null : item
		dispatch('select', { item: selectedItem })
	}

	function close() {
		dispatch('close')
	}

	function shortenName(name: string) {
		return name.length > 10 ? name.substring(0, 8) + '...' : name
	}
</script>

{#if visible}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40 pointer-events-none"
		on:click={close}
		on:keydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="-1"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 150 }}
	></div>

	<!-- Menu Container -->
	<div
		class="bar-menu overflow-visible pointer-events-auto"
		in:fly={{ y: 20, duration: 400, easing: cubicOut }}
		out:scale={{ duration: 200, start: 0.95 }}
		on:mouseenter={() => dispatch('menuenter')}
		on:mouseleave={() => dispatch('menuleave')}
	>
		<!-- Header -->
		<div class="bar-header" in:fly={{ y: -10, duration: 300, delay: 100 }}>
			<span class="bar-title">Tools I Use</span>
			<button class="close-btn" on:click={close}>
				<X size={16} />
			</button>
		</div>

		<!-- Divider -->
		<div
			class="bar-divider"
			in:scale={{ duration: 400, delay: 150, start: 0, easing: cubicOut }}
		></div>

		<!-- Items Grid -->
		<div class="bar-items py-1">
			{#each items as item, i}
				<button
					class="bar-item"
					class:selected={selectedItem === item}
					class:hovered={hoveredIndex === i}
					style="--color: {item.color}; --delay: {i * 40 + 200}ms;"
					on:mouseenter={() => (hoveredIndex = i)}
					on:mouseleave={() => (hoveredIndex = null)}
					on:click={() => handleSelect(item)}
					in:fly={{ y: 15, duration: 400, delay: i * 40 + 200, easing: cubicOut }}
				>
					<!-- Icon Container -->
					<div class="item-icon" class:pulse={selectedItem === item}>
						{#if item.icon.startsWith('devicon')}
							<i class={item.icon} style="color: {item.color}; font-size: 1.75rem;"></i>
						{:else if item.icon.startsWith('image')}
							<img src={'./new/' + item.icon} alt={item.name} class="w-7 h-7 object-contain" />
						{:else}
							<img src={'/icons/' + item.icon} alt={item.name} class="w-7 h-7 object-contain" />
						{/if}
					</div>

					<!-- Label -->
					<span class="item-label">{shortenName(item.name)}</span>

					<!-- Selection indicator -->
					{#if selectedItem === item}
						<div class="selection-ring" in:scale={{ duration: 300, easing: elasticOut }}></div>
					{/if}

					<!-- Hover glow -->
					<div
						class="hover-glow"
						style="background: radial-gradient(circle, {item.color}20 0%, transparent 70%);"
					></div>
				</button>
			{/each}
		</div>

		<!-- Footer with selected info -->
		{#if selectedItem}
			<div class="bar-footer" in:fly={{ y: 10, duration: 300 }} out:fade={{ duration: 150 }}>
				<div class="selected-info">
					<i class={selectedItem.icon} style="color: {selectedItem.color}; font-size: 1.25rem;"></i>
					<span style="color: {selectedItem.color};">{selectedItem.name}</span>
					<span class="selected-badge">Selected</span>
				</div>
			</div>
		{/if}

		<!-- Arrow pointer -->
		<div class="bar-arrow"></div>
	</div>
{/if}

<style>
	.bar-menu {
		position: absolute;
		bottom: calc(100% + 1rem);
		left: 50%;
		transform: translateX(-50%);
		background: rgba(37, 37, 37, 1);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		z-index: 50;
	}

	.bar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem 0.75rem;
	}

	.bar-title {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: rgba(255, 255, 255, 0.5);
	}

	.close-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		transform: rotate(90deg);
	}

	.bar-divider {
		height: 1px;
		margin: 0 1.25rem 0.75rem;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
	}

	.bar-items {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.5rem;
		padding: 2px 1rem 1rem;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.bar-items::-webkit-scrollbar {
		display: none;
	}

	.bar-item {
		position: relative;
		width: 80px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 0.75rem 0.5rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid transparent;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.25s ease;
		overflow: hidden;
	}

	.bar-item:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}

	.bar-item.selected {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color);
	}

	.item-icon {
		position: relative;
		z-index: 1;
		transition: transform 0.2s ease;
	}

	.bar-item:hover .item-icon {
		transform: scale(1.15);
	}

	.item-icon.pulse {
		animation: iconPulse 2s ease-in-out infinite;
	}

	.item-label {
		font-size: 0.6rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.6);
		text-align: center;
		z-index: 1;
		transition: color 0.2s ease;
	}

	.bar-item:hover .item-label,
	.bar-item.selected .item-label {
		color: rgba(255, 255, 255, 0.9);
	}

	.selection-ring {
		position: absolute;
		inset: -2px;
		border: 2px solid var(--color);
		border-radius: 14px;
		opacity: 0.6;
		pointer-events: none;
	}

	.hover-glow {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.bar-item:hover .hover-glow {
		opacity: 1;
	}

	.bar-footer {
		padding: 0.75rem 1.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(37, 37, 37, 1);
		border-radius: 0 0 16px 16px;
	}

	.selected-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.selected-badge {
		margin-left: auto;
		font-size: 0.6rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.05);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.bar-arrow {
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%) rotate(45deg);
		width: 20px;
		height: 20px;
		background: rgba(37, 37, 37, 1);
		z-index: 2;
	}

	@keyframes iconPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}
</style>
