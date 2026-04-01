<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import { MarkerClusterer, defaultOnClusterClickHandler } from '@googlemaps/markerclusterer';
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';
	import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ID } from './map-constants';
	import type { Place } from '$lib/schemas/place';
	import { getGooglePlaceById } from '$lib/google-places';

	const markerIconMap: Record<SavedPlaceType, string> = {
		[SavedPlaceType.Restaurant]: '/marker-icons/restaurant.png',
		[SavedPlaceType.Bar]: '/marker-icons/bar.png',
		[SavedPlaceType.Bakery]: '/marker-icons/bakery.png',
		[SavedPlaceType.Cafe]: '/marker-icons/cafe.png',
		[SavedPlaceType.Deli]: '/marker-icons/deli.png',
		[SavedPlaceType.FoodTruck]: '/marker-icons/food-truck.png',
		[SavedPlaceType.Dessert]: '/marker-icons/dessert.png',
		[SavedPlaceType.OtherDestination]: '/marker-icons/other-destination.png'
	};

	type Props = {
		savedPlaces: { [googlePlaceId: string]: SavedPlace };
		selectedPlace: Place | null;
		onsaveplace: (place: Place) => void;
		onplacechange: (place: Place | null) => void;
	};

	let { savedPlaces, selectedPlace, onsaveplace, onplacechange }: Props = $props();

	let map: google.maps.Map | null = $state(null);
	let InfoWindowClass = $state<typeof google.maps.InfoWindow | null>(null);
	let AdvancedMarkerClass = $state<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
	let currentInfoWindow = $state<google.maps.InfoWindow | null>(null);
	let currentMarker = $state<google.maps.marker.AdvancedMarkerElement | null>(null);

	let clusterer: MarkerClusterer | null = $state(null);
	let markerByPlaceId = new SvelteMap<string, google.maps.marker.AdvancedMarkerElement>();

	const cachedMarkerContent = new SvelteMap<SavedPlaceType, Element>();

	const buildContent = (type: SavedPlaceType): Element => {
		if (cachedMarkerContent.has(type)) {
			return cachedMarkerContent.get(type)!.cloneNode(true) as Element;
		}

		const img = document.createElement('img');
		img.src = markerIconMap[type];
		img.width = 32;
		img.height = 32;
		img.alt = type;

		cachedMarkerContent.set(type, img);
		return img.cloneNode(true) as Element;
	};

	const createMarker = (place: SavedPlace): google.maps.marker.AdvancedMarkerElement => {
		const marker = new AdvancedMarkerClass!({
			position: { lat: place.lat, lng: place.lng },
			title: place.name,
			content: buildContent(place.type)
		});

		marker.addListener('click', () => {
			handlePlaceSelected(place.google_place_id, null);
		});

		return marker;
	};

	/**
	 * Given a Google Place ID and an optional [session token](https://developers.google.com/maps/documentation/places/web-service/place-details#session-tokens),
	 * retrieves the info needed to render a place on the map.
	 *
	 * Exposed externally so that clicking a search result can reuse the same behavior as clicking a location on the map.
	 * @param googlePlaceId The [Google Place ID](https://developers.google.com/maps/documentation/places/web-service/place-id) of a location.
	 * @param sessionToken An optional [session token](https://developers.google.com/maps/documentation/places/web-service/place-details#session-tokens), used to minimize autocomplete costs.
	 */
	export const handlePlaceSelected = async (googlePlaceId: string, sessionToken: string | null) => {
		if (googlePlaceId in savedPlaces) {
			clearCurrentInfoWindow();
			clearCurrentMarker();
			const savedPlace = savedPlaces[googlePlaceId];
			onplacechange(savedPlace);
			return;
		}

		const googlePlace = await getGooglePlaceById(googlePlaceId, sessionToken);

		if (googlePlace === null) {
			return;
		}

		const unsavedPlace = {
			name: googlePlace.name,
			lat: googlePlace.geometry.location.lat,
			lng: googlePlace.geometry.location.lng,
			formatted_address: googlePlace.formatted_address,
			google_place_id: googlePlace.place_id
		};

		onplacechange(unsavedPlace);
		openInfoWindowForPlace(unsavedPlace);
	};

	const clearCurrentMarker = () => {
		if (currentMarker === null) {
			return;
		}

		currentMarker.map = null;
		currentMarker = null;
	};

	const clearCurrentInfoWindow = () => {
		if (currentInfoWindow === null) {
			return;
		}

		currentInfoWindow.close();
		currentInfoWindow = null;
	};

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
		if (InfoWindowClass === null || AdvancedMarkerClass === null) {
			return;
		}
		clearCurrentMarker();
		clearCurrentInfoWindow();

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

	$effect(() => {
		if (!clusterer || !AdvancedMarkerClass) return;

		const newIds = new Set(Object.keys(savedPlaces));
		const oldIds = new Set(markerByPlaceId.keys());

		const toRemove = [...oldIds].filter((id) => !newIds.has(id));
		const toAdd = [...newIds].filter((id) => !oldIds.has(id));

		if (toRemove.length > 0) {
			const markersToRemove = toRemove.map((id) => markerByPlaceId.get(id)!);
			clusterer.removeMarkers(markersToRemove);
			for (const id of toRemove) {
				markerByPlaceId.delete(id);
			}
		}

		if (toAdd.length > 0) {
			const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
			for (const id of toAdd) {
				const place = savedPlaces[id];
				const marker = createMarker(place);
				markerByPlaceId.set(id, marker);
				newMarkers.push(marker);
			}
			clusterer.addMarkers(newMarkers);
		}

		if (toRemove.length > 0 || toAdd.length > 0) {
			clusterer.render();
		}
	});

	let mapEl: HTMLDivElement;

	onMount(async () => {
		setOptions({ key: PUBLIC_GOOGLE_MAPS_API_KEY });

		const [{ Map: MapClass, InfoWindow }, { AdvancedMarkerElement }] = await Promise.all([
			importLibrary('maps') as Promise<google.maps.MapsLibrary>,
			importLibrary('marker') as Promise<google.maps.MarkerLibrary>
		]);

		InfoWindowClass = InfoWindow;
		AdvancedMarkerClass = AdvancedMarkerElement;

		map = new MapClass(mapEl, {
			center: DEFAULT_MAP_CENTER,
			zoom: DEFAULT_MAP_ZOOM,
			mapId: MAP_ID,
			colorScheme: google.maps.ColorScheme.FOLLOW_SYSTEM,
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false,
			renderingType: google.maps.RenderingType.RASTER
		});

		map.addListener('click', handleMapClick);

		const initialMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
		for (const place of Object.values(savedPlaces)) {
			const marker = createMarker(place);
			markerByPlaceId.set(place.id.toString(), marker);
			initialMarkers.push(marker);
		}

		clusterer = new MarkerClusterer({
			markers: initialMarkers,
			map,
			onClusterClick: defaultOnClusterClickHandler
		});
	});
</script>

<div bind:this={mapEl} class="map"></div>

<style>
	.map {
		width: 100%;
		height: 100%;
	}
</style>
