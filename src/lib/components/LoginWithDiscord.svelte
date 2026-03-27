<script lang="ts">
	import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
	import { page } from '$app/state';
	function discordAuthUrl(): string {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('client_id', PUBLIC_DISCORD_CLIENT_ID);
		url.searchParams.set('redirect_uri', `${page.url.origin}/auth/discord/callback`);
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('scope', 'guilds.members.read+identify');
		return url.toString();
	}
</script>

<a href={discordAuthUrl()} rel="external" class="discord-btn">Continue with Discord</a>

<style>
	.discord-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		background-color: #5864f1;
		color: white;
		font-family: 'VCHenrietta', sans-serif;
		font-weight: bold;
		font-size: 1.5em;
		border-radius: var(--md-sys-shape-corner-small);
		padding: 8px 40px 8px 40px;
	}

	@media (min-width: 768px) {
		.discord-btn {
			font-size: 3rem;
			padding: 20px 30px 20px 30px;
		}
	}
</style>
