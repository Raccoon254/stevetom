<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="kf-footer">
	<span class="copy">© {year} kenTom</span>
	<nav class="foot-links" aria-label="Legal">
		<a href="/privacy">Privacy</a>
		<a href="/terms">Terms</a>
	</nav>
</footer>

<style>
	.kf-footer {
		position: relative;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px 24px;
		padding: clamp(22px, 4vh, 36px) clamp(16px, 4vw, 40px);
		background: var(--bg);
		border-top: 1px solid var(--hairline);
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
	}
	.copy {
		color: var(--mute);
	}
	.foot-links {
		display: flex;
		gap: 22px;
	}
	.foot-links a {
		color: var(--ink-2);
		transition: color 0.2s ease;
	}
	.foot-links a:hover {
		color: var(--spark);
	}
</style>
