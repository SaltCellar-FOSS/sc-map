<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { Place } from '$lib/dao/places/types';
	import PlaceMarker from './PlaceMarker.svelte';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import type { CategoryConfig } from './types';

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
			center: { lat: 39.5, lng: -98.35 },
			zoom: 4,
			mapId: 'sc-map',
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
