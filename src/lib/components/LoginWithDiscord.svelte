<script lang="ts">
	import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
	import { page } from '$app/state';
	import Icon from '$lib/components/ui/icon/Icon.svelte';
	function discordAuthUrl(): string {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('client_id', PUBLIC_DISCORD_CLIENT_ID);
		url.searchParams.set('redirect_uri', `${page.url.origin}/auth/discord/callback`);
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('scope', 'guilds.members.read+identify');
		return url.toString();
	}
</script>

<div class="container">
	<a href={discordAuthUrl()} rel="external" class="login-button">
		<span class="discord-icon"><Icon name="discord" /></span>

		<span>Continue with Discord</span>
	</a>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background-color: var(--md-sys-color-surface);
	}

	.login-button {
		display: flex;
		align-items: center;
		background-color: var(--md-sys-color-surface-container);
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-medium);
		box-shadow: var(--md-sys-elevation-level1-shadow);
		padding: 8px 24px;
		font-size: var(--md-sys-typescale-label-large-size);
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
		cursor: pointer;
		transition: background-color
			calc(var(--md-sys-motion-duration-scale, 1) * var(--md-sys-motion-duration-short4));
	}

	.login-button:hover {
		background-color: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) 8%,
			var(--md-sys-color-surface-container)
		);
	}

	.login-button:focus {
		outline: 3px solid var(--md-sys-color-primary);
		outline-offset: 2px;
	}

	.discord-icon {
		display: flex;
		width: 1.5rem;
		height: 1.5rem;
		margin-right: 8px;
	}
</style>
