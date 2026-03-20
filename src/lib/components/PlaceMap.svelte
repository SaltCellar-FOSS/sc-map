<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { Place } from '$lib/dao/places/types';
	import PlaceMarker from './PlaceMarker.svelte';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import { type CategoryConfig, type SelectedLocation } from './types';
	import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ID } from './map-constants';

	let {
		categories,
		places,
		onaddtolist,
		selectedLocation = $bindable()
	}: {
		categories: Record<Place['type'], CategoryConfig>;
		places: Place[];
		onaddtolist?: (placeId: string) => void;
		selectedLocation: SelectedLocation | null;
	} = $props();

	let map: google.maps.Map | null = $state(null);
	let InfoWindowClass: typeof google.maps.InfoWindow | null = $state(null);
	let AdvancedMarkerClass: typeof google.maps.marker.AdvancedMarkerElement | null = $state(null);
	let currentInfoWindow: google.maps.InfoWindow | null = null;
	let selectedPin: google.maps.marker.AdvancedMarkerElement | null = null;

	let mapEl: HTMLDivElement;

	$effect(() => {
		if (map === null || selectedLocation === null) {
			return;
		}

		map.panTo(selectedLocation);
		map.setZoom(15);
	});

	$effect(() => {
		if (
			map === null ||
			InfoWindowClass === null ||
			AdvancedMarkerClass === null ||
			selectedLocation === null
		) {
			if (selectedPin) {
				selectedPin.map = null;
				selectedPin = null;
			}
			return;
		}

		const isSavedPlace = places.some(
			(p) => p.google_place_id === selectedLocation!.google_place_id
		);
		if (isSavedPlace) {
			if (selectedPin) {
				selectedPin.map = null;
				selectedPin = null;
			}
			return;
		}

		if (selectedPin) selectedPin.map = null;
		selectedPin = new AdvancedMarkerClass({
			position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
			map,
			title: selectedLocation.name
		});

		const iw = new InfoWindowClass({
			position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
			content: `
				<div style="max-width: 200px; color: #000">
					<strong>${selectedLocation.name}</strong><br />
					${selectedLocation.formatted_address}<br />
					<button
						data-place-id="${selectedLocation.google_place_id}"
						style="margin-top: 8px; padding: 6px 12px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer"
					>
						Add to list
					</button>
				</div>
			`
		});
		iw.addListener('domready', () => {
			document
				.querySelector<HTMLButtonElement>(`[data-place-id="${selectedLocation!.google_place_id}"]`)
				?.addEventListener('click', () => onaddtolist?.(selectedLocation!.google_place_id));
		});
		currentInfoWindow?.close();
		currentInfoWindow = iw;
		iw.open({ map, anchor: selectedPin });
	});

	onMount(async () => {
		setOptions({ key: PUBLIC_GOOGLE_MAPS_API_KEY });

		const [{ Map, InfoWindow }, { Place }, { AdvancedMarkerElement }] = await Promise.all([
			importLibrary('maps') as Promise<google.maps.MapsLibrary>,
			importLibrary('places') as Promise<google.maps.PlacesLibrary>,
			importLibrary('marker') as Promise<google.maps.MarkerLibrary>
		]);

		InfoWindowClass = InfoWindow;
		AdvancedMarkerClass = AdvancedMarkerElement;

		map = new Map(mapEl, {
			center: DEFAULT_MAP_CENTER,
			zoom: DEFAULT_MAP_ZOOM,
			mapId: MAP_ID,
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false
		});

		map.addListener('click', async (event: google.maps.MapMouseEvent & { placeId?: string }) => {
			if (!event.placeId) {
				currentInfoWindow?.close();
				currentInfoWindow = null;
				if (selectedPin) {
					selectedPin.map = null;
					selectedPin = null;
				}
				selectedLocation = null;
				return;
			}

			event.stop();

			const place = new Place({ id: event.placeId });
			await place.fetchFields({
				fields: ['displayName', 'formattedAddress', 'location']
			});

			selectedLocation = {
				name: place.displayName ?? '',
				lat: place.location?.lat() ?? 0,
				lng: place.location?.lng() ?? 0,
				formatted_address: place.formattedAddress ?? '',
				google_place_id: event.placeId
			};
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
			onclick={(savedPlace) => (selectedLocation = savedPlace)}
			categoryConfig={categories[place.type]}
		/>
	{/each}
{/if}
