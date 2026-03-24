<script lang="ts">
	import { CATEGORIES } from '$lib/categories';
	import AddVisitDialog from '$lib/components/AddVisitDialog.svelte';
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import PlaceSheet from '$lib/components/PlaceSheet.svelte';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import SearchBar from '$lib/components/ui/search-bar/SearchBar.svelte';
	import SearchView from '$lib/components/ui/search-view/SearchView.svelte';
	import { isSavedPlace, type Place } from '$lib/schemas/place';
	import type { PageProps } from './$types';
	import { getVisitsForPlace } from './visits.remote';
	import { searchPlaces } from './search.remote';

	let { data }: PageProps = $props();

	let selectedPlace = $state<Place | null>(null);
	let dialogOpen = $state(false);
	let sheetOpen = $state(false);
	let searchQuery = $state('');
	let showInfoWindow = $state<((place: Place) => void) | null>(null);
	let visitsResult = $state<ReturnType<typeof getVisitsForPlace> | null>(null);

	const searchIconPath =
		'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';

	function handlePlaceSelect(place: Place, close: () => void) {
		selectedPlace = place;
		close();
		if (isSavedPlace(place)) {
			visitsResult = getVisitsForPlace(place.id);
			sheetOpen = true;
		} else {
			showInfoWindow?.(place);
		}
	}

	function handleOnAddVisit() {
		dialogOpen = true;
	}

	async function handleVisitAdded() {
		if (selectedPlace && isSavedPlace(selectedPlace)) {
			await getVisitsForPlace(selectedPlace.id).refresh();
			visitsResult = getVisitsForPlace(selectedPlace.id);
		}
	}
</script>

<div class="map-root">
	<PlaceMap
		savedPlaces={data.savedPlaces}
		categories={CATEGORIES}
		{selectedPlace}
		bind:showInfoWindow
		onsaveplace={() => {
			dialogOpen = true;
		}}
		onplacechange={(place) => {
			selectedPlace = place;

			if (place === null || !isSavedPlace(place)) {
				return;
			}

			visitsResult = getVisitsForPlace(place.id);
			sheetOpen = true;
		}}
	/>
</div>

<div class="controls">
	<SearchView bind:value={searchQuery} placeholder="Search places" class="search-view">
		{#snippet children({ open, value })}
			<SearchBar
				{value}
				placeholder="Search places"
				aria-label="Search places"
				aria-expanded={open}
			>
				{#snippet leadingIcon()}
					<svg
						class="md-search-bar__icon"
						viewBox="0 0 24 24"
						aria-hidden="true"
						fill="currentColor"
					>
						<path d={searchIconPath} />
					</svg>
				{/snippet}
			</SearchBar>
		{/snippet}

		{#snippet results({ value, close })}
			{#await searchPlaces(value)}
				<SearchResults places={[]} onlistitemclick={(place) => handlePlaceSelect(place, close)} />
			{:then places}
				<SearchResults {places} onlistitemclick={(place) => handlePlaceSelect(place, close)} />
			{/await}
		{/snippet}
	</SearchView>
</div>

{#if selectedPlace}
	<AddVisitDialog
		bind:open={dialogOpen}
		placeName={selectedPlace.name}
		googlePlaceId={selectedPlace.google_place_id}
		onsuccess={handleVisitAdded}
	/>
{/if}

{#if selectedPlace && isSavedPlace(selectedPlace) && visitsResult}
	{#await visitsResult}
		<PlaceSheet
			placeName={selectedPlace.name}
			visits={[]}
			bind:open={sheetOpen}
			onaddvisit={handleOnAddVisit}
		/>
	{:then visits}
		<PlaceSheet
			placeName={selectedPlace.name}
			{visits}
			bind:open={sheetOpen}
			onaddvisit={handleOnAddVisit}
		/>
	{/await}
{/if}

<style>
	.map-root {
		position: absolute;
		width: 100vw;
		height: 100vh;
	}

	.controls {
		position: absolute;
		width: 100vw;
		height: 100vh;
		padding-left: 1rem;
		padding-right: 1rem;
		padding-top: 2rem;
		box-sizing: border-box;
		pointer-events: none;
	}

	.controls :global(.search-view) {
		padding-top: 2rem;
		pointer-events: auto;
	}
</style>
