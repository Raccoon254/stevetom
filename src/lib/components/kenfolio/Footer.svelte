<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="kf-footer">
	<span class="copy">© {year} kenTom</span>
	<a href="/brand">Brand</a>
	<a href="/privacy">Privacy</a>
	<a href="/terms">Terms</a>
</footer>

<style>
	.kf-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 10px 22px;
		padding: clamp(40px, 8vh, 72px) clamp(16px, 4vw, 40px) clamp(28px, 5vh, 40px);
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
	}
	.copy {
		color: var(--mute);
	}
	.kf-footer a {
		color: var(--mute);
		transition: color 0.2s ease;
	}
	.kf-footer a:hover {
		color: var(--ink-2);
	}
</style>
