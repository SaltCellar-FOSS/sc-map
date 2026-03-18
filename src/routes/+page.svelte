<script lang="ts">
	import LoginWithDiscord from '$lib/components/LoginWithDiscord.svelte';

	let { data } = $props();
</script>

<div class="container">
	<h1>Salt Cellar Map</h1>
	{#if !data.user}
		<LoginWithDiscord />
	{:else if !data.user.is_current_server_member && !data.user.has_lifetime_access}
		<p>Looks like you've left the Salt Cellar! We're sorry to see you go 😭</p>
	{/if}
</div>
