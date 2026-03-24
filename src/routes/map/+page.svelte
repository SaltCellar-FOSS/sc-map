<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import { CATEGORIES } from '$lib/categories';
	import SearchView from '$lib/components/ui/search-view/SearchView.svelte';
	import SearchBar from '$lib/components/ui/search-bar/SearchBar.svelte';
	import List from '$lib/components/ui/list/List.svelte';
	import ListItem from '$lib/components/ui/list/ListItem.svelte';
	import { setSelectedPlaceContext } from '$lib/contexts/selected-location.svelte.js';
	import CloseIcon from '$lib/icons/CloseIcon.svelte';
	import AddPlaceDialog from '$lib/components/AddPlaceDialog.svelte';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { searchPlacesOptions, submitPlaceOptions } from '$lib/queries';
	import { invalidateAll } from '$app/navigation';

	let ctx = setSelectedPlaceContext();

	let { data } = $props();

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
	<PlaceMap categories={CATEGORIES} places={data.places} onaddtolist={() => (dialogOpen = true)} />
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
					{#if ctx.selectedPlace !== null}
						<button
							class="md-search-view__icon-btn"
							aria-label="Clear"
							type="button"
							onclick={() => {
								searchValue = '';
								ctx.selectedPlace = null;
							}}
						>
							<CloseIcon />
						</button>
					{/if}
				{/snippet}
			</SearchBar>
		{/snippet}

		{#snippet results({ close })}
			<List as="div" noPadding>
				{#each searchQuery.data ?? [] as place (place.google_place_id)}
					<ListItem
						type="button"
						role="option"
						aria-selected="false"
						onclick={() => {
							ctx.selectedPlace = place;
							close();
							searchValue = place.name;
						}}
					>
						{place.name}
						{#snippet supporting()}{place.formatted_address}{/snippet}
					</ListItem>
				{/each}
			</List>
		{/snippet}
	</SearchView>
</div>

{#if ctx.selectedPlace}
	<AddPlaceDialog
		open={dialogOpen}
		placeName={ctx.selectedPlace.name}
		googlePlaceId={ctx.selectedPlace.google_place_id}
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
