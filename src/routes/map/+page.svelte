<script lang="ts">
	import FilterChips from '$lib/components/FilterChips.svelte';
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import { CATEGORIES } from '$lib/categories';
	import type { Place } from '$lib/dao/places/types.js';
	import type { Suggestion } from '$lib/schemas/search';
	import { createMutation } from '@tanstack/svelte-query';
	import { addPlaceOptions } from '$lib/queries';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let activeFilter = $state<Place['type'] | null>(null);
	let selectedPlace = $state<{
		lat: number;
		lng: number;
		name: string;
		placeId: string;
		address?: string;
	} | null>(null);

	let filteredPlaces = $derived(
		activeFilter ? data.places.filter((place) => place.type === activeFilter) : data.places
	);

	function handleSuggestionClick(suggestion: Suggestion) {
		selectedPlace =
			suggestion.source === 'db'
				? {
						lat: suggestion.data.lat,
						lng: suggestion.data.lng,
						name: suggestion.data.name,
						placeId: suggestion.data.google_place_id,
						address: suggestion.data.formatted_address
					}
				: {
						lat: suggestion.data.geometry.location.lat,
						lng: suggestion.data.geometry.location.lng,
						name: suggestion.data.name,
						placeId: suggestion.data.place_id,
						address: suggestion.data.formatted_address
					};
	}

	const addPlace = createMutation(() => ({ ...addPlaceOptions, onSuccess: () => invalidateAll() }));

	function handleAddToList(placeId: string) {
		addPlace.mutate(placeId);
	}
</script>

<PlaceMap
	categories={CATEGORIES}
	places={filteredPlaces}
	onplaceclick={() => {}}
	{selectedPlace}
	onmapclick={() => (selectedPlace = null)}
	onaddtolist={handleAddToList}
/>
<div class="controls">
	<SearchBar placeholder="Search for something yummy" onsuggestionclick={handleSuggestionClick} />
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
</style>
