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
	let currentInfoWindow: google.maps.InfoWindow | null = null;

	let mapEl: HTMLDivElement;

	$effect(() => {
		if (map === null || selectedLocation === null) {
			return;
		}

		map.panTo(selectedLocation);
		map.setZoom(15);
	});

	function openInfoWindow(iw: google.maps.InfoWindow) {
		currentInfoWindow?.close();
		currentInfoWindow = iw;
		iw.open(map!);
	}

	onMount(async () => {
		setOptions({ key: PUBLIC_GOOGLE_MAPS_API_KEY });

		const [{ Map, InfoWindow }, { Place }] = await Promise.all([
			importLibrary('maps') as Promise<google.maps.MapsLibrary>,
			importLibrary('places') as Promise<google.maps.PlacesLibrary>
		]);

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
				selectedLocation = null;
				return;
			}

			event.stop();

			const place = new Place({ id: event.placeId });
			await place.fetchFields({
				fields: ['displayName', 'formattedAddress', 'location']
			});

			const iw = new InfoWindow({
				position: event.latLng,
				content: `
				<div style="max-width: 200px">
					<strong>${place.displayName}</strong><br />
					${place.formattedAddress ?? ''}<br />
					<button
						data-place-id="${place.id}"
						style="margin-top: 8px; padding: 6px 12px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer"
					>
						Add to list
					</button>
				</div>
			`
			});
			iw.addListener('domready', () => {
				document
					.querySelector<HTMLButtonElement>(`[data-place-id="${place.id}"]`)
					?.addEventListener('click', () => onaddtolist?.(place.id));
			});
			openInfoWindow(iw);
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
