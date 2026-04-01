<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import PlaceMarker from './PlaceMarker.svelte';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ID } from './map-constants';
	import type { Place } from '$lib/schemas/place';
	import { getGooglePlaceById } from '$lib/google-places';

	type Props = {
		savedPlaces: { [googlePlaceId: string]: SavedPlace };
		onsaveplace: (place: Place) => void;
		onplacechange: (place: Place | null) => void;
	};

	let { savedPlaces, onsaveplace, onplacechange }: Props = $props();

	let map: google.maps.Map | null = $state(null);
	let InfoWindowClass = $state<typeof google.maps.InfoWindow | null>(null);
	let AdvancedMarkerClass = $state<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
	let selectedPlace = $state<Place | null>(null);
	let currentInfoWindow = $state<google.maps.InfoWindow | null>(null);
	let currentMarker = $state<google.maps.marker.AdvancedMarkerElement | null>(null);

	let pendingPan: { lat: number; lng: number } | null = null;

	export const panTo = (lat: number, lng: number) => {
		if (map) {
			map.panTo({ lat, lng });
			map.setZoom(15);
		} else {
			pendingPan = { lat, lng };
		}
	};

	export const handlePlaceSelected = async (googlePlaceId: string, sessionToken: string | null) => {
		if (googlePlaceId in savedPlaces) {
			clearCurrentInfoWindow();
			clearCurrentMarker();
			// This place is in our saved places, we can save ourselves a query to Google
			// (thus avoiding incurring charges) by just using the saved place instead.
			const savedPlace = savedPlaces[googlePlaceId];
			onplacechange(savedPlace);
			return;
		}

		// This is a new place that isn't saved in our database. We need to retrieve
		// information for it from Google and ask the user if they want to save it.

		// Fetch the place by its Google Place ID (hits Google APIs and incurs cost)
		const googlePlace = await getGooglePlaceById(googlePlaceId, sessionToken);

		if (googlePlace === null) {
			// TODO: Visually handle error
			return;
		}

		const unsavedPlace = {
			name: googlePlace.name,
			lat: googlePlace.geometry.location.lat,
			lng: googlePlace.geometry.location.lng,
			formatted_address: googlePlace.formatted_address,
			google_place_id: googlePlace.place_id
		};

		// Signal to the parent that the place has changed.
		onplacechange(unsavedPlace);

		// Show an InfoWindow so the user can save the place if desired.
		openInfoWindowForPlace(unsavedPlace);
	};

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
	const handleSavePlace = (place: Place) => {
		clearCurrentInfoWindow();
		onsaveplace(place);
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
						id="save-place-btn"
						style="margin-top: 8px; padding: 6px 12px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer"
					>
						Save place
					</button>
				</div>
			`
		});

		currentInfoWindow.addListener('domready', () => {
			document
				.querySelector<HTMLButtonElement>('#save-place-btn')
				?.addEventListener('click', () => handleSavePlace(place));
		});

		currentInfoWindow.addListener('closeclick', () => {
			clearCurrentMarker();
			clearCurrentInfoWindow();
		});

		currentInfoWindow.open({ map, anchor: currentMarker });
	};

	const handleMapClick = async (event: google.maps.MapMouseEvent & { placeId?: string }) => {
		// If setup hasn't completed for some reason, do nothing.
		// Failed setup will cause serious downstream issues.
		if (InfoWindowClass === null || AdvancedMarkerClass === null) {
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

		handlePlaceSelected(event.placeId, null);
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

		const [{ Map, InfoWindow }, { AdvancedMarkerElement }] = await Promise.all([
			importLibrary('maps') as Promise<google.maps.MapsLibrary>,
			importLibrary('marker') as Promise<google.maps.MarkerLibrary>
		]);

		InfoWindowClass = InfoWindow;
		AdvancedMarkerClass = AdvancedMarkerElement;

		map = new Map(mapEl, {
			center: DEFAULT_MAP_CENTER,
			zoom: DEFAULT_MAP_ZOOM,
			mapId: MAP_ID,
			colorScheme: google.maps.ColorScheme.FOLLOW_SYSTEM,
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false
		});

		map.addListener('click', handleMapClick);

		if (pendingPan) {
			map.panTo(pendingPan);
			map.setZoom(15);
			pendingPan = null;
		}
	});
</script>

<div bind:this={mapEl} class="map"></div>

{#if map}
	{#each Object.values(savedPlaces) as place (place.id)}
		<PlaceMarker
			{map}
			{place}
			visible={true}
			onclick={(place) => handlePlaceSelected(place.google_place_id, null)}
		/>
	{/each}
{/if}

<style>
	.map {
		width: 100%;
		height: 100%;
	}
</style>
