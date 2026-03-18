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
		places,
		selectedPlace,
		onmapclick,
		onaddtolist
	}: {
		categories: Record<Place['type'], CategoryConfig>;
		places: Place[];
		onplaceclick: (place: Place) => void;
		selectedPlace?: {
			lat: number;
			lng: number;
			name: string;
			placeId: string;
			address?: string;
		} | null;
		onmapclick?: () => void;
		onaddtolist?: (placeId: string) => void;
	} = $props();

	let mapEl: HTMLDivElement;
	let map: google.maps.Map | null = $state(null);
	let selectedMarker: google.maps.marker.AdvancedMarkerElement | null = null;
	let infoWindow: google.maps.InfoWindow | null = null;

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

		map.addListener('click', () => onmapclick?.());
	});

	$effect(() => {
		infoWindow?.close();
		if (selectedMarker) {
			selectedMarker.map = null;
			selectedMarker = null;
		}
		if (selectedPlace && map) {
			const handleInfoButtonClick = onaddtolist;
			map.moveCamera({ center: { lat: selectedPlace.lat, lng: selectedPlace.lng }, zoom: 15 });
			importLibrary('marker').then(({ AdvancedMarkerElement }: google.maps.MarkerLibrary) => {
				const place = selectedPlace!;
				selectedMarker = new AdvancedMarkerElement({
					map,
					position: { lat: place.lat, lng: place.lng },
					title: place.name
				});

				const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.placeId}`;
				infoWindow = new google.maps.InfoWindow({
					content: `<div style="font-family:'Google Sans',Roboto,Arial,sans-serif;max-width:220px">
						<strong style="font-size:14px;color:#202124">${place.name}</strong>
						${place.address ? `<p style="margin:8px 0 4px;font-size:13px;color:#70757a">${place.address}</p>` : ''}
						<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
							style="font-size:13px;color:#1a73e8;text-decoration:none">View on Google Maps</a>
						<br/>
						<button data-place-id="${place.placeId}"
							style="margin-top:8px;padding:6px 12px;background:#1a73e8;color:#fff;border:none;border-radius:4px;font-size:13px;cursor:pointer">
							Add to list
						</button>
					</div>`
				});
				infoWindow.addListener('domready', () => {
					document
						.querySelector<HTMLButtonElement>(`[data-place-id="${place.placeId}"]`)
						?.addEventListener('click', () => handleInfoButtonClick?.(place.placeId));
				});
				infoWindow.open({ map, anchor: selectedMarker });
			});
		}
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
