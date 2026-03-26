<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import PlaceMarker from './PlaceMarker.svelte';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ID } from './map-constants';
	import type { Place } from '$lib/schemas/place';
	import type { CATEGORIES } from '$lib/categories';

	type Props = {
		categories: typeof CATEGORIES;
		savedPlaces: Record<string, SavedPlace>;
		selectedPlace: Place | null;
		onsaveplace: (placeId: string) => void;
		onplacechange: (place: Place | null) => void;
		showInfoWindow?: ((place: Place) => void) | null;
	};

	let {
		categories,
		savedPlaces,
		selectedPlace,
		onsaveplace,
		onplacechange,
		showInfoWindow = $bindable<((place: Place) => void) | null>(null)
	}: Props = $props();

	let map: google.maps.Map | null = $state(null);
	let InfoWindowClass = $state<typeof google.maps.InfoWindow | null>(null);
	let AdvancedMarkerClass = $state<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
	let PlaceClass = $state<typeof google.maps.places.Place | null>(null);

	let currentInfoWindow = $state<google.maps.InfoWindow | null>(null);
	let currentMarker = $state<google.maps.marker.AdvancedMarkerElement | null>(null);

	/** Clears the current marker from Google's map, then de-references it (for GC).*/
	const clearCurrentMarker = () => {
		if (currentMarker === null) {
			return;
		}

		currentMarker.map = null;
		currentMarker = null;
	};

	/** Closes the current InfoWindow so the user doesn't see it, then de-references it (for GC).*/
	const clearCurrentInfoWindow = () => {
		if (currentInfoWindow === null) {
			return;
		}

		currentInfoWindow.close();
		currentInfoWindow = null;
	};

	// Close the current InfoWindow before indicating that the current place should be saved.
	const handleSavePlace = (googlePlaceId: string) => {
		clearCurrentInfoWindow();
		onsaveplace(googlePlaceId);
	};

	const openInfoWindowForPlace = (place: Place) => {
		if (InfoWindowClass === null || AdvancedMarkerClass === null || map === null) {
			return;
		}

		currentMarker = new AdvancedMarkerClass({
			position: { lat: place.lat, lng: place.lng },
			map,
			title: place.name
		});

		currentInfoWindow = new InfoWindowClass({
			position: { lat: place.lat, lng: place.lng },
			content: `
				<div style="max-width: 200px; color: #000">
					<strong>${place.name}</strong><br />
					${place.formatted_address}<br />
					<button
						data-place-id="${place.google_place_id}"
						style="margin-top: 8px; padding: 6px 12px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer"
					>
						Save place
					</button>
				</div>
			`
		});

		currentInfoWindow.addListener('domready', () => {
			document
				.querySelector<HTMLButtonElement>(`[data-place-id="${place.google_place_id}"]`)
				?.addEventListener('click', () => handleSavePlace(place.google_place_id));
		});

		currentInfoWindow.addListener('closeclick', () => {
			clearCurrentMarker();
			clearCurrentInfoWindow();
		});

		currentInfoWindow.open({ map, anchor: currentMarker });
	};

	const handleMapClick = async (event: google.maps.MapMouseEvent & { placeId?: string }) => {
		// If the user has clicked on the same place twice, nothing needs to happen.
		if (event.placeId === selectedPlace?.google_place_id) {
			return;
		}
		// If setup hasn't completed for some reason, do nothing.
		// Failed setup will cause serious downstream issues.
		if (InfoWindowClass === null || AdvancedMarkerClass === null || PlaceClass === null) {
			return;
		}
		clearCurrentMarker();
		clearCurrentInfoWindow();

		// If the user has just clicked on the map, we don't want to create new UI.
		// Early exit.
		if (event.placeId === undefined) {
			onplacechange(null);
			return;
		}

		event.stop();

		// Load the currently-clicked place and its associated data needed
		// for rendering.
		const place = new PlaceClass({ id: event.placeId });
		await place.fetchFields({
			fields: ['displayName', 'formattedAddress', 'location']
		});

		const latLng = event.latLng;

		if (latLng === null) {
			return;
		}

		const unsavedPlace = {
			name: place.displayName ?? '',
			lat: latLng.lat(),
			lng: latLng.lng(),
			formatted_address: place.formattedAddress ?? '',
			google_place_id: place.id
		};

		// Signal to the parent that the place has changed.
		onplacechange(unsavedPlace);

		// Show an InfoWindow so the user can save the place if desired.
		openInfoWindowForPlace(unsavedPlace);
	};

	$effect(() => {
		if (map && selectedPlace) {
			map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
			map.setZoom(15);
		}
	});

	let mapEl: HTMLDivElement;

	onMount(async () => {
		setOptions({ key: PUBLIC_GOOGLE_MAPS_API_KEY });

		const [{ Map, InfoWindow }, { Place }, { AdvancedMarkerElement }] = await Promise.all([
			importLibrary('maps') as Promise<google.maps.MapsLibrary>,
			importLibrary('places') as Promise<google.maps.PlacesLibrary>,
			importLibrary('marker') as Promise<google.maps.MarkerLibrary>
		]);

		InfoWindowClass = InfoWindow;
		AdvancedMarkerClass = AdvancedMarkerElement;
		PlaceClass = Place;
		showInfoWindow = openInfoWindowForPlace;

		map = new Map(mapEl, {
			center: DEFAULT_MAP_CENTER,
			zoom: DEFAULT_MAP_ZOOM,
			mapId: MAP_ID,
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false
		});

		map.addListener('click', handleMapClick);
	});
</script>

<div bind:this={mapEl} class="map"></div>

{#if map}
	{#each Object.values(savedPlaces) as place (place.id)}
		<PlaceMarker
			{map}
			{place}
			visible={true}
			onclick={onplacechange}
			categoryConfig={categories[place.type]}
		/>
	{/each}
{/if}

<style>
	.map {
		width: 100%;
		height: 100%;
	}
</style>
