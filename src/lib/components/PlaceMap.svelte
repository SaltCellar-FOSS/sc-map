<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { Place } from '$lib/dao/places/types';
	import PlaceMarker from './PlaceMarker.svelte';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import type { CategoryConfig } from './types';
	import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ID } from './map-constants';

	let {
		categories,
		onplaceclick,
		places
	}: {
		categories: Record<Place['type'], CategoryConfig>;
		places: Place[];
		onplaceclick: (place: Place) => void;
	} = $props();

	let mapEl: HTMLDivElement;
	let map: google.maps.Map | null = $state(null);

	onMount(async () => {
		setOptions({ key: PUBLIC_GOOGLE_MAPS_API_KEY });

		const { Map } = await importLibrary('maps');

		map = new Map(mapEl, {
			center: DEFAULT_MAP_CENTER,
			zoom: DEFAULT_MAP_ZOOM,
			mapId: MAP_ID,
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false
		});
	});
</script>

<div bind:this={mapEl} style="width: 100%; height: 100vh;"></div>

{#if map}
	{#each places as place (place.id)}
		<PlaceMarker
			{map}
			{place}
			visible={true}
			onclick={onplaceclick}
			categoryConfig={categories[place.type]}
		/>
	{/each}
{/if}
