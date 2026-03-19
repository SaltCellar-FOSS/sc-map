<script lang="ts">
	import FilterChips from '$lib/components/FilterChips.svelte';
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import { CATEGORIES } from '$lib/categories';
	import type { Place } from '$lib/dao/places/types.js';
	import type { SelectedLocation } from '$lib/components/types.js';

	let { data } = $props();

	let activeFilter = $state<Place['type'] | null>(null);
	let selectedLocation = $state<SelectedLocation | null>(null);
	let drawerOpen = $state(false);

	let filteredPlaces = $derived(
		activeFilter ? data.places.filter((place) => place.type === activeFilter) : data.places
	);

	$effect(() => {
		if (selectedLocation === null) {
			drawerOpen = false;
			return;
		}

		if ('id' in selectedLocation) {
			drawerOpen = true;
		}
	});

	// function handleAddToList() {}
</script>

<PlaceMap
	categories={CATEGORIES}
	places={filteredPlaces}
	bind:selectedLocation
	// onaddtolist={handleAddToList}
/>
<SideDrawer bind:open={drawerOpen} title={selectedLocation?.name ?? ''} width="396px">
	{#if selectedLocation !== null}
		<div class="place-details">
			<p class="place-type">
				{data.places.find((p) => p.google_place_id === selectedLocation!.google_place_id)?.type ??
					'Place'}
			</p>
			<p class="place-address">{selectedLocation.formatted_address}</p>
		</div>
	{/if}
</SideDrawer>
<div class="controls">
	<SearchBar placeholder="Search for something yummy" bind:selectedLocation />
	<FilterChips
		filters={CATEGORIES}
		{activeFilter}
		onchange={(newFilter) => (activeFilter = newFilter)}
	/>
</div>

<style>
	.controls {
		position: fixed;
		display: flex;
		flex-direction: row;
		top: 10px;
		left: 10px;
		z-index: 100;
		gap: 8px;
	}

	@media (max-width: 600px) {
		.controls {
			flex-direction: column;
			gap: 8px;
		}
	}

	.place-details {
		padding: 20px;
	}

	.place-type {
		font-size: 14px;
		font-weight: 500;
		color: var(--gm-primary, #1a73e8);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 8px 0;
	}

	.place-address {
		font-size: 14px;
		color: var(--gm-on-surface-variant, #5f6368);
		margin: 0;
		line-height: 1.5;
	}
</style>
