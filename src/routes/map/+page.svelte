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
	import Icon from '$lib/components/ui/icon/Icon.svelte';
	import { searchPlaces } from './search.remote';

	let { data }: PageProps = $props();

	let selectedPlace = $state<Place | null>(null);
	let dialogOpen = $state(false);
	let sheetOpen = $state(false);
	let searchQuery = $state('');
	let showInfoWindow = $state<((place: Place) => void) | null>(null);
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
			{#await searchPlaces(value)}
				<SearchResults
					places={[]}
					onlistitemclick={(place) => {
						handlePlaceSelect(place);
						close();
					}}
				/>
			{:then places}
				{#if places.length > 0}
					<hr class="md-search-view__divider" aria-hidden="true" />
				{/if}
				<SearchResults
					{places}
					onlistitemclick={(place) => {
						handlePlaceSelect(place);
						close();
					}}
				/>
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
