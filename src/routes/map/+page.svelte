<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import PlaceSheet from '$lib/components/PlaceSheet.svelte';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import SearchBar from '$lib/components/ui/search-bar/SearchBar.svelte';
	import SearchView from '$lib/components/ui/search-view/SearchView.svelte';
	import { isSavedPlace, type Place } from '$lib/schemas/place';
	import type { PageProps } from './$types';
	import { getVisitsForPlace } from './visits.remote';
	import Icon from '$lib/components/ui/icon/Icon.svelte';
	import { autocompletePlaces, type AutocompleteSuggestion } from '$lib/google-places';
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { invalidate, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import { slugifyPlace, parsePlaceId } from '$lib/place-slug';
	import type VisitDialogType from '$lib/components/VisitDialog.svelte';
	import type DeleteVisitConfirmationDialogType from '$lib/components/DeleteVisitConfirmationDialog.svelte';

	let { data }: PageProps = $props();

	let placeMap = $state<PlaceMap | null>(null);

	let selectedPlace = $state<Place | null>(null);
	let dialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let visitBeingEdited = $state<VisitWithUser | null>(null);
	let deleteDialogOpen = $state(false);
	let visitBeingDeleted = $state<VisitWithUser | null>(null);
	let sheetOpen = $state(false);
	let searchQuery = $state('');
	let visitsResult = $state<ReturnType<typeof getVisitsForPlace> | null>(null);

	let sessionToken: string | null = null;

	// Dialog components — lazily loaded on first use
	let VisitDialog = $state<typeof VisitDialogType | null>(null);
	let DeleteVisitConfirmationDialog = $state<typeof DeleteVisitConfirmationDialogType | null>(null);

	function handlePlaceSelect(place: Place | null) {
		if (place === null) {
			selectedPlace = null;
			searchQuery = '';
			replaceState('', {});
			return;
		}

		searchQuery = place.name;

		if (isSavedPlace(place)) {
			visitsResult = getVisitsForPlace(place.id);
			sheetOpen = true;
			const url = `${$page.url.pathname}?place=${slugifyPlace(place)}`;
			selectedPlace = place;
			if ($page.url.searchParams.has('place')) {
				replaceState(url, {});
			} else {
				pushState(url, {});
			}
		} else {
			selectedPlace = place;
		}
	}

	$effect(() => {
		const param = $page.url.searchParams.get('place');
		const id = param ? parsePlaceId(param) : null;

		if (!id) {
			if (selectedPlace !== null) {
				selectedPlace = null;
				sheetOpen = false;
				searchQuery = '';
			}
			return;
		}

		if (selectedPlace && isSavedPlace(selectedPlace) && selectedPlace.id === id) return;

		const place = Object.values(data.savedPlaces).find((p) => p.id === id);
		if (place) {
			selectedPlace = place;
			searchQuery = place.name;
			visitsResult = getVisitsForPlace(place.id);
			sheetOpen = true;
		}
	});

	async function handleOnAddVisit() {
		if (!VisitDialog) {
			VisitDialog = (await import('$lib/components/VisitDialog.svelte')).default;
		}
		dialogOpen = true;
	}

	async function handleOnEditVisit(visit: VisitWithUser) {
		visitBeingEdited = visit;
		if (!VisitDialog) {
			VisitDialog = (await import('$lib/components/VisitDialog.svelte')).default;
		}
		editDialogOpen = true;
	}

	async function handleOnDeleteVisit(visit: VisitWithUser) {
		visitBeingDeleted = visit;
		if (!DeleteVisitConfirmationDialog) {
			DeleteVisitConfirmationDialog = (
				await import('$lib/components/DeleteVisitConfirmationDialog.svelte')
			).default;
		}
		deleteDialogOpen = true;
	}

	async function handleVisitAdded() {
		if (selectedPlace && isSavedPlace(selectedPlace)) {
			invalidate('app:places');
			await getVisitsForPlace(selectedPlace.id).refresh();
			visitsResult = getVisitsForPlace(selectedPlace.id);
		}
	}

	async function handlePlaceEdited() {
		await invalidate('app:places');
		if (selectedPlace && isSavedPlace(selectedPlace)) {
			selectedPlace = data.savedPlaces[selectedPlace.google_place_id] ?? selectedPlace;
		}
	}

	async function handlePlaceDeleted() {
		await invalidate('app:places');
		selectedPlace = null;
	}

	const fetchAutocompleteResults = async (
		query: string
	): Promise<(AutocompleteSuggestion | SavedPlace)[]> => {
		sessionToken ??= crypto.randomUUID();

		const suggestions = await autocompletePlaces(query, sessionToken);

		return suggestions.map(
			(suggestion) => data.savedPlaces[suggestion.google_place_id] ?? suggestion
		);
	};

	const handleSearchResultClick = async (googlePlaceId: string, closeSearchResults: () => void) => {
		await placeMap?.handlePlaceSelected(googlePlaceId, sessionToken);
		closeSearchResults();
	};
</script>

<div class="map-root">
	<PlaceMap
		bind:this={placeMap}
		savedPlaces={data.savedPlaces}
		onsaveplace={() => {
			handleOnAddVisit();
		}}
		onplacechange={handlePlaceSelect}
	/>
</div>

{#if selectedPlace && isSavedPlace(selectedPlace) && visitsResult}
	<PlaceSheet
		place={selectedPlace}
		visits={visitsResult}
		currentUserId={data.user?.id}
		bind:open={sheetOpen}
		onaddvisit={handleOnAddVisit}
		oneditvisit={handleOnEditVisit}
		ondeletevisit={handleOnDeleteVisit}
		oneditplace={handlePlaceEdited}
		ondeleteplace={handlePlaceDeleted}
	/>
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
								replaceState('', {});
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

{#if selectedPlace && VisitDialog}
	<VisitDialog
		mode="add"
		bind:open={dialogOpen}
		place={selectedPlace}
		onsuccess={handleVisitAdded}
	/>
{/if}

{#if visitBeingEdited && selectedPlace && VisitDialog}
	<VisitDialog
		mode="edit"
		bind:open={editDialogOpen}
		place={selectedPlace}
		visit={visitBeingEdited}
		onsuccess={handleVisitAdded}
	/>
{/if}

{#if visitBeingDeleted && DeleteVisitConfirmationDialog}
	<DeleteVisitConfirmationDialog
		bind:open={deleteDialogOpen}
		visitId={visitBeingDeleted.id}
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
