<script lang="ts">
	import LoginWithDiscord from '$lib/components/LoginWithDiscord.svelte';

	const PurplePattern = '/Purple_Pattern_-_Full_Res_-_Fixed.png';

	let { data } = $props();
</script>

<div class="container" style:background-image="url({PurplePattern})">
	<img src="/salt-cellar-map.svg" alt="Salt Cellar Map" class="title" />
	{#if !data.user}
		<LoginWithDiscord />
	{:else if !data.user.is_current_server_member && !data.user.has_lifetime_access}
		<p>Looks like you've left the Salt Cellar! We're sorry to see you go 😭</p>
	{/if}
</div>

<style>
	.container {
		background-size: cover;
		background-position: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		height: 100vh;
	}

	.title {
		max-width: 600px;
		width: 90%;
	}
</style>
