<script lang="ts">
	import LoginWithDiscord from '$lib/components/LoginWithDiscord.svelte';

	let { data } = $props();
</script>

<div class="container">
	<h1>Salt Cellar Map</h1>
	{#if !data.user}
		<LoginWithDiscord />
	{:else if data.user.has_lifetime_access || data.user.is_current_server_member}
		<p>Welcome, {data.user.discord_handle}</p>
	{:else if !data.user.is_current_server_member}
		<p>Looks like you've left the Salt Cellar! We're sorry to see you go 😭</p>
	{/if}
</div>
