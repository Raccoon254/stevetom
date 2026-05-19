<!-- standalone copy of the hero scroll cue -->
<div class="cue" aria-hidden="true">
	<span class="line"><span class="track"></span></span>
	<span class="ripple"></span>
</div>

<style>
	.cue {
		--dur: 3.6s;
		--drop-ease: cubic-bezier(0.42, 0, 1, 1);
		--ripple-ease: cubic-bezier(0.12, 0.78, 0.28, 1);
		position: relative;
		width: 56px;
		height: 80px;
		display: flex;
		justify-content: center;
	}
	.line {
		position: relative;
		width: 1px;
		height: 100%;
		overflow: hidden;
	}
	.track {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 42%;
		background: linear-gradient(to bottom, transparent, var(--spark));
		animation: drop var(--dur) var(--drop-ease) infinite;
	}
	@keyframes drop {
		0% {
			transform: translateY(-110%);
			opacity: 0;
		}
		18% {
			opacity: 1;
		}
		52% {
			transform: translateY(138%);
			opacity: 1;
		}
		60%,
		100% {
			transform: translateY(138%);
			opacity: 0;
		}
	}
	.ripple {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 21px;
		height: 8px;
		margin: 0 0 -4px -10.5px;
		border-radius: 50%;
		border: 1px solid var(--spark);
		transform: scale(0);
		opacity: 0;
		animation: ripple var(--dur) var(--ripple-ease) infinite;
	}
	@keyframes ripple {
		0%,
		50% {
			transform: scale(0);
			opacity: 0;
		}
		54% {
			transform: scale(0.4);
			opacity: 0.85;
		}
		100% {
			transform: scale(4.4);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
			transform: translateY(70%);
		}
		.ripple {
			display: none;
		}
	}
</style>
