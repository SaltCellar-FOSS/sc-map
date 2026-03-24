<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import { CATEGORIES } from '$lib/categories';
	import SearchView from '$lib/components/ui/search-view/SearchView.svelte';
	import SearchBar from '$lib/components/ui/search-bar/SearchBar.svelte';
	import { isSavedPlace, type Place } from '$lib/schemas/place.js';
	import CloseIcon from '$lib/icons/CloseIcon.svelte';
	import AddPlaceDialog from '$lib/components/AddVisitDialog.svelte';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { searchPlacesOptions, submitPlaceOptions, placeVisitsOptions } from '$lib/queries';
	import { invalidateAll } from '$app/navigation';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import PlaceSheet from '$lib/components/PlaceSheet.svelte';

	let { data } = $props();

	const SEARCH_PLACEHOLDER = 'Search places';

	let selectedPlace = $state<Place | null>(null);
	let searchValue = $state('');
	let debouncedSearch = $state('');
	let dialogOpen = $state(false);

	$effect(() => {
		const q = searchValue;
		if (!q) {
			debouncedSearch = '';
			return;
		}
		const timer = setTimeout(() => {
			debouncedSearch = q;
		}, 500);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (selectedPlace === null) {
			return;
		}

		searchValue = selectedPlace.name;
	});

	const savedPlace = $derived(selectedPlace && isSavedPlace(selectedPlace) ? selectedPlace : null);
	const googlePlace = $derived(
		selectedPlace && !isSavedPlace(selectedPlace) ? selectedPlace : null
	);

	const searchQuery = createQuery(() => searchPlacesOptions(debouncedSearch));

	const visitsQuery = createQuery(() => ({
		...placeVisitsOptions(savedPlace?.id ?? 0n),
		enabled: savedPlace !== null
	}));

	const queryClient = useQueryClient();
	const submitMutation = createMutation(() => submitPlaceOptions(queryClient));

	const handleSubmit = async (submitData: Parameters<typeof submitMutation.mutateAsync>[0]) => {
		await submitMutation.mutateAsync(submitData);
		await invalidateAll();
		dialogOpen = false;
	};
</script>

<div class="map-root">
	<PlaceMap
		categories={CATEGORIES}
		places={data.places}
		{selectedPlace}
		onaddtolist={() => (dialogOpen = true)}
		onplacechange={(place) => (selectedPlace = place)}
	/>
</div>

<div class="controls">
	<SearchView placeholder={SEARCH_PLACEHOLDER} bind:value={searchValue}>
		{#snippet children({ open, value })}
			<SearchBar
				{value}
				placeholder={SEARCH_PLACEHOLDER}
				aria-label={SEARCH_PLACEHOLDER}
				aria-expanded={open}
			>
				{#snippet trailingIcons()}
					{#if selectedPlace !== null}
						<button
							class="md-search-view__icon-btn"
							aria-label="Clear"
							type="button"
							onclick={() => {
								searchValue = '';
								selectedPlace = null;
							}}
						>
							<CloseIcon />
						</button>
					{/if}
				{/snippet}
			</SearchBar>
		{/snippet}

		{#snippet results({ close })}
			<SearchResults
				places={searchQuery.data ?? []}
				onlistitemclick={(place) => {
					selectedPlace = place;
					close();
					searchValue = place.name;
				}}
			/>
		{/snippet}
	</SearchView>
</div>

{#if googlePlace}
	<AddPlaceDialog
		open={dialogOpen}
		placeName={googlePlace.name}
		googlePlaceId={googlePlace.google_place_id}
		onadd={handleSubmit}
	></AddPlaceDialog>
{:else if savedPlace}
	<PlaceSheet
		open={true}
		placeName={savedPlace.name}
		visits={visitsQuery.data ?? []}
		onclose={() => (selectedPlace = null)}
		onaddtolist={() => (dialogOpen = true)}
	/>
{/if}

<style>
	.map-root {
		position: absolute;
		width: 100vw;
		height: 100vh;
	}

	.controls {
		margin: 0 1rem 0 1rem;
		padding-top: 3rem;
	}
</style>
