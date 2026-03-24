<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import { CATEGORIES } from '$lib/categories';
	import SearchView from '$lib/components/ui/search-view/SearchView.svelte';
	import SearchBar from '$lib/components/ui/search-bar/SearchBar.svelte';
	import { isSavedPlace, type Place } from '$lib/schemas/place.js';
	import CloseIcon from '$lib/icons/CloseIcon.svelte';
	import AddPlaceDialog from '$lib/components/AddPlaceDialog.svelte';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { searchPlacesOptions, submitPlaceOptions } from '$lib/queries';
	import { invalidateAll } from '$app/navigation';
	import SearchResults from '$lib/components/SearchResults.svelte';

	let { data } = $props();

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

	const searchQuery = createQuery(() => searchPlacesOptions(debouncedSearch));

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
	<SearchView placeholder="Search places" bind:value={searchValue}>
		{#snippet children({ open, value })}
			<SearchBar
				{value}
				placeholder="Search places"
				aria-label="Search places"
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

{#if selectedPlace && !isSavedPlace(selectedPlace)}
	<AddPlaceDialog
		open={dialogOpen}
		placeName={selectedPlace.name}
		googlePlaceId={selectedPlace.google_place_id}
		onadd={handleSubmit}
	></AddPlaceDialog>
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
