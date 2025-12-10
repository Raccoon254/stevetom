<script lang="ts">
	import { onMount, onDestroy } from 'svelte'

	let count: number = 0
	let binaryCount: string = '0'
	let timer: ReturnType<typeof setInterval>

	$: binaryCount = count.toString(2).padStart(8, '0')

	onMount(() => {
		timer = setInterval(() => {
			count++
		}, 1000)
	})

	onDestroy(() => {
		if (timer) clearInterval(timer)
	})
</script>

<div class="flex items-center flex-col h-full flex justify-center items-center gap-4">
	<div class="decimal-display mb-[34%] -mt-[30%] p-4 w-fit">
		{count}
	</div>
	<div class="counter rotate-90 w-full">
		<div class="binary-display">
			{#each binaryCount.split('') as bit, i}
				<span class="bit" class:one={bit === '1'} style="--delay: {i * 0.05}s;">
					{bit}
				</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.decimal-display {
		font-size: clamp(3rem, 12vw, 7rem);
		font-weight: 900;
		color: #252525;
		display: none;
	}

	.counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
	}

	.binary-display {
		display: flex;
		gap: 2px;
	}

	.bit {
		font-size: clamp(4rem, 12vw, 10rem);
		font-weight: 700;
		color: rgba(37, 37, 37, 0.1);
		-webkit-text-stroke: 1px rgb(37, 37, 37, 0.4);
		transition:
			color 0.2s ease,
			transform 0.2s ease;
	}

	.bit.one {
		-webkit-text-stroke: 1px rgb(37, 37, 37, 0.4);
		color: transparent;
		transform: scale(1.1);
	}
</style>
