<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import { CATEGORIES } from '$lib/categories';
	import SearchView from '$lib/components/ui/search-view/SearchView.svelte';
	import SearchBar from '$lib/components/ui/search-bar/SearchBar.svelte';
	import List from '$lib/components/ui/list/List.svelte';
	import ListItem from '$lib/components/ui/list/ListItem.svelte';
	import { type Place } from '$lib/schemas/search';
	import { setSelectedPlaceContext } from '$lib/contexts/selected-location.svelte.js';

	let ctx = setSelectedPlaceContext();

	let { data } = $props();

	let searchValue = $state('');
	let searchResults = $state<Place[]>([]);

	$effect(() => {
		const q = searchValue;
		if (!q) {
			searchResults = [];
			return;
		}
		const timer = setTimeout(async () => {
			const res = await fetch(`/places/search?q=${encodeURIComponent(q)}`);
			if (res.ok) {
				searchResults = await res.json();
			}
		}, 500);
		return () => clearTimeout(timer);
	});
</script>

<div class="map-root">
	<PlaceMap categories={CATEGORIES} places={data.places} />
</div>

<div class="controls">
	<SearchView placeholder="Search places" bind:value={searchValue}>
		{#snippet children({ open, value })}
			<SearchBar
				{value}
				placeholder="Search places"
				aria-label="Search places"
				aria-expanded={open}
			/>
		{/snippet}

		{#snippet results({ close })}
			<List as="div" noPadding>
				{#each searchResults as place (place.google_place_id)}
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
