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
	<img src="/salt-cellar-map.svg" alt="Salt Cellar Map" class="title" />
	<div class="stats">
		{@render StatsChip('otherDestination', `${data.pins} ${data.pins === 1 ? 'Pin' : 'Pins'}`)}
		{@render StatsChip(
			'foodTruck',
			`${data.contributors} ${data.contributors === 1 ? 'Contributor' : 'Contributors'}`
		)}
	</div>
	<div class="cta">
		{#if !data.user}
			<LoginWithDiscord />
		{:else if !data.user.is_current_server_member && !data.user.has_lifetime_access}
			<p>Looks like you've left the Salt Cellar! We're sorry to see you go 😭</p>
		{/if}
	</div>

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
		align-self: center;
		aspect-ratio: 1.12/1;
		background-color: white;
		padding: 24px 24px 16px 24px;
		border-radius: var(--md-sys-shape-corner-large);
		border: solid;
		border-color: black;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.stats {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 12px;
		margin-top: 24px;
	}

	.stats-chip {
		padding-left: 12px;
		padding-right: 12px;
		padding-top: 6px;
		padding-bottom: 6px;
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

	.cta {
		margin-top: auto;
	}

	.attribution {
		text-align: center;
		font-family: 'VCHenrietta', sans-serif;
		margin-top: auto;

		a {
			text-decoration: underline;
		}
	}

	@media (min-width: 768px) {
		.container {
			padding: 45px 60px 20px 60px;
			justify-content: space-between;
		}

		.stats {
			gap: 24px;
			margin-top: 0;
		}

		.cta {
			margin-top: 0;
		}

		.attribution {
			margin-top: 0;
		}
		.stats-chip {
			font-size: 1.25em;
		}

		.stats-chip :global(img) {
			width: 32px;
			height: 32px;
		}
	}
</style>
