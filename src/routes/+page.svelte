<script lang="ts">
	import LoginWithDiscord from '$lib/components/LoginWithDiscord.svelte';
	import Icon from '$lib/components/ui/icon/Icon.svelte';
	import type { ComponentProps } from 'svelte';

	let { data } = $props();
</script>

{#snippet StatsChip(
	iconName: Extract<ComponentProps<typeof Icon>['name'], 'foodTruck' | 'otherDestination'>,
	label: string
)}
	<div class="stats-chip">
		<Icon name={iconName} />
		{label}
	</div>
{/snippet}

<div class="container">
	<div class="header">
		<img src="/salt-cellar-map.svg" alt="Salt Cellar Map" class="title" />
		<div class="stats">
			{@render StatsChip('otherDestination', '275 Pins')}
			{@render StatsChip('foodTruck', '48 Contributors')}
		</div>
	</div>
	{#if !data.user}
		<LoginWithDiscord />
	{:else if !data.user.is_current_server_member && !data.user.has_lifetime_access}
		<p>Looks like you've left the Salt Cellar! We're sorry to see you go 😭</p>
	{/if}

	<span class="attribution"
		>Made with🧂by The Salt Cellar • <a
			rel="external"
			href="https://github.com/SaltCellar-FOSS/sc-map">Github</a
		></span
	>
</div>

<style>
	:root {
		background-image: url(/Purple_Pattern_-_Full_Res_-_Fixed.png);
		background-size: cover;
		background-position: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		width: 100vw;
	}

	.container {
		justify-content: center;
		align-self: center;
		aspect-ratio: 1.12/1;
		background-color: white;
		padding: 1.5rem 1.5rem 1rem 1.5rem;
		border-radius: var(--md-sys-shape-corner-large);
		border: solid;
		border-color: black;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.stats {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 12px;
	}

	.stats-chip {
		padding-left: 0.75rem;
		padding-right: 0.75rem;
		padding-top: 0.125rem;
		padding-bottom: 0.125rem;
		border-radius: var(--md-sys-shape-corner-extra-large);
		border: solid;
		border-width: 2px;
		border-color: black;
		display: flex;
		flex-direction: row;
		gap: 8px;
		align-items: center;
		font-size: 12px;
		font-family: 'VCHenrietta', sans-serif;
		box-sizing: border-box;
	}

	.attribution {
		font-family: 'VCHenrietta', sans-serif;

		a {
			text-decoration: underline;
		}
	}

	@media (min-width: 768px) {
		.container {
			padding: 2rem 2rem 1.25rem 2rem;
		}

		.title {
			width: 320px;
		}

		.stats-chip {
			font-size: 14px;
			padding-left: 1.5rem;
			padding-right: 1.5rem;
			gap: 10px;
		}

		.stats {
			gap: 16px;
		}

		.attribution {
			text-align: center;
			font-size: 14px;
		}
	}

	@media (min-width: 1024px) {
		.container {
			padding: 2.5rem 2.5rem 1.5rem 2.5rem;
		}

		.title {
			width: 400px;
		}

		.stats-chip {
			font-size: 16px;
			padding-left: 1.25rem;
			padding-right: 1.25rem;
			gap: 12px;
		}

		.stats {
			gap: 20px;
		}

		.attribution {
			font-size: 16px;
		}
	}

	@media (min-width: 1280px) {
		.container {
			padding: 3rem 3rem 2rem 3rem;
		}

		.title {
			width: 480px;
		}

		.stats-chip {
			font-size: 1.5rem;
			padding-left: 1.5rem;
			padding-right: 1.5rem;
			gap: 14px;
		}

		.stats-chip :global(svg) {
			size: 62px;
		}

		.stats {
			gap: 24px;
		}

		.attribution {
			font-size: 18px;
		}
	}
</style>
