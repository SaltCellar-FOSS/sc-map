<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import type { CategoryConfig } from '$lib/components/types.js';
	import type { Place } from '$lib/dao/places/types.js';

	let { data } = $props();

	const CATEGORIES: Record<Place['type'], CategoryConfig> = {
		RESTAURANT: {
			label: 'Restaurants',
			color: '#E8472A',
			glyphText: '🍽️'
		},
		BAR: {
			label: 'Bars',
			color: '#6B4FBB',
			glyphText: '🍸'
		},
		BAKERY: {
			label: 'Bakeries',
			color: '#F0A500',
			glyphText: '🥐'
		}
	};
</script>

<PlaceMap categories={CATEGORIES} places={data.places} onplaceclick={() => {}} />

<SearchBar placeholder="Search for something yummy" />
