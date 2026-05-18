<script lang="ts">
	import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<div class="meta">
	<button class="theme" aria-label="Toggle theme" type="button" on:click={toggleTheme}>
		<span class="glyph" aria-hidden="true"></span>
		<span>{$theme === 'dark' ? 'Light' : 'Dark'}</span>
	</button>
</div>
