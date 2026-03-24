<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { SavedPlace } from '$lib/dao/saved-places/types';
	import PlaceMarker from './PlaceMarker.svelte';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import { type CategoryConfig } from './types';
	import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ID } from './map-constants';
	import type { Place } from '$lib/schemas/place';

	let {
		categories,
		places,
		selectedPlace,
		onaddtolist,
		onplacechange
	}: {
		categories: Record<SavedPlace['type'], CategoryConfig>;
		places: SavedPlace[];
		selectedPlace: Place | null;
		onaddtolist: (placeId: string) => void;
		onplacechange: (place: Place | null) => void;
	} = $props();

	let map: google.maps.Map | null = $state(null);
	let InfoWindowClass: typeof google.maps.InfoWindow | null = $state(null);
	let AdvancedMarkerClass: typeof google.maps.marker.AdvancedMarkerElement | null = $state(null);
	let currentInfoWindow: google.maps.InfoWindow | null = null;
	let selectedPin: google.maps.marker.AdvancedMarkerElement | null = null;

	let mapEl: HTMLDivElement;

	function clearSelectedPin() {
		if (selectedPin) {
			selectedPin.map = null;
			selectedPin = null;
		}
	}

	$effect(() => {
		if (map === null || selectedPlace === null) {
			return;
		}

		map.panTo(selectedPlace);
		map.setZoom(15);
	});

	$effect(() => {
		if (
			map === null ||
			InfoWindowClass === null ||
			AdvancedMarkerClass === null ||
			selectedPlace === null
		) {
			clearSelectedPin();
			return;
		}

		const isSavedPlace = places.some((p) => p.google_place_id === selectedPlace!.google_place_id);
		if (isSavedPlace) {
			clearSelectedPin();
			return;
		}

		clearSelectedPin();
		selectedPin = new AdvancedMarkerClass({
			position: { lat: selectedPlace.lat, lng: selectedPlace.lng },
			map,
			title: selectedPlace.name
		});

		const iw = new InfoWindowClass({
			position: { lat: selectedPlace.lat, lng: selectedPlace.lng },
			content: `
				<div style="max-width: 200px; color: #000">
					<strong>${selectedPlace.name}</strong><br />
					${selectedPlace.formatted_address}<br />
					<button
						data-place-id="${selectedPlace.google_place_id}"
						style="margin-top: 8px; padding: 6px 12px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer"
					>
						Add to list
					</button>
				</div>
			`
		});
		iw.addListener('domready', () => {
			document
				.querySelector<HTMLButtonElement>(`[data-place-id="${selectedPlace!.google_place_id}"]`)
				?.addEventListener('click', () => onaddtolist(selectedPlace!.google_place_id));
		});
		iw.addListener('closeclick', () => {
			clearSelectedPin();
			onplacechange?.(null);
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
				clearSelectedPin();
				onplacechange?.(null);
				return;
			}

			event.stop();

			const place = new Place({ id: event.placeId });
			await place.fetchFields({
				fields: ['displayName', 'formattedAddress', 'location']
			});

			onplacechange?.({
				name: place.displayName ?? '',
				lat: place.location?.lat() ?? 0,
				lng: place.location?.lng() ?? 0,
				formatted_address: place.formattedAddress ?? '',
				google_place_id: event.placeId
			});
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
			onclick={(savedPlace) => onplacechange(savedPlace)}
			categoryConfig={categories[place.type]}
		/>
	{/each}
{/if}
