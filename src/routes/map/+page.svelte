<script lang="ts">
	import AddVisitDialog from '$lib/components/AddVisitDialog.svelte';
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import PlaceSheet from '$lib/components/PlaceSheet.svelte';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import SearchBar from '$lib/components/ui/search-bar/SearchBar.svelte';
	import SearchView from '$lib/components/ui/search-view/SearchView.svelte';
	import { isSavedPlace, type Place, getExternalPlaceId } from '$lib/schemas/place';
	import type { PageProps } from './$types';
	import { getVisitsForPlace } from './visits.remote';
	import Icon from '$lib/components/ui/icon/Icon.svelte';
	import type { PlaceSearchResult } from '$lib/place-search';
	import type { SavedPlace } from '$lib/schemas/saved-place';

	let { data }: PageProps = $props();

	let placeMap = $state<PlaceMap | null>(null);

	let selectedPlace = $state<Place | null>(null);
	let dialogOpen = $state(false);
	let sheetOpen = $state(false);
	let searchQuery = $state('');
	let visitsResult = $state<ReturnType<typeof getVisitsForPlace> | null>(null);

	function handlePlaceSelect(place: Place | null) {
		selectedPlace = place;
		if (place === null) {
			searchQuery = '';
			return;
		}

		searchQuery = place.name;

		if (isSavedPlace(place)) {
			visitsResult = getVisitsForPlace(place.id);
			sheetOpen = true;
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

	const fetchAutocompleteResults = async (
		query: string
	): Promise<(PlaceSearchResult | SavedPlace)[]> => {
		const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
		if (!res.ok) return [];
		const results: PlaceSearchResult[] = await res.json();

		return results.map((result) => data.savedPlaces[result.osm_place_id] ?? result);
	};

	const handleSearchResultClick = async (osmPlaceId: string, closeSearchResults: () => void) => {
		await placeMap?.handlePlaceSelected(osmPlaceId);
		closeSearchResults();
	};
</script>

<div class="map-root">
	<PlaceMap
		bind:this={placeMap}
		savedPlaces={data.savedPlaces}
		onsaveplace={() => {
			dialogOpen = true;
		}}
		onplacechange={handlePlaceSelect}
	/>
</div>

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
					<Icon name="search" class="md-search-bar__icon" />
				{/snippet}

				{#snippet trailingIcons()}
					{#if searchQuery}
						<button
							class="md-search-bar__icon-btn"
							aria-label="Clear search"
							type="button"
							tabindex="-1"
							onmousedown={(e) => e.preventDefault()}
							onpointerdown={(e) => e.preventDefault()}
							onclick={(e) => {
								e.stopPropagation();
								searchQuery = '';
								selectedPlace = null;
								sheetOpen = false;
							}}
						>
							<Icon name="close" class="md-search-bar__icon" />
						</button>
					{/if}
				{/snippet}
			</SearchBar>
		{/snippet}

		{#snippet results({ value, close })}
			{#await fetchAutocompleteResults(value)}
				<SearchResults
					results={[]}
					onsearchresultclick={(result) => handleSearchResultClick(result, close)}
				/>
			{:then places}
				{#if places.length > 0}
					<hr class="md-search-view__divider" aria-hidden="true" />
				{/if}
				<SearchResults
					results={places}
					onsearchresultclick={(result) => handleSearchResultClick(result, close)}
				/>
			{/await}
		{/snippet}
	</SearchView>
</div>

{#if selectedPlace}
	<AddVisitDialog
		bind:open={dialogOpen}
		placeName={selectedPlace.name}
		osmPlaceId={getExternalPlaceId(selectedPlace)}
		isSavedPlace={isSavedPlace(selectedPlace)}
		onsuccess={handleVisitAdded}
	/>
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
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		padding-top: 1rem;
		box-sizing: border-box;
		pointer-events: none;
	}

	.controls :global(.search-view) {
		pointer-events: auto;
	}

	@media screen and (min-width: 768px) {
		.controls :global(.search-view) {
			width: 360px;
		}
	}
</style>
