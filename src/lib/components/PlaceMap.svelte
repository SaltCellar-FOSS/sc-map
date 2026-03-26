<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map as LeafletMap, Marker, Popup } from 'leaflet';
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from './map-constants';
	import type { Place } from '$lib/schemas/place';
	import { getExternalPlaceId } from '$lib/schemas/place';
	import { CATEGORIES } from '$lib/categories';

	type Props = {
		savedPlaces: { [osmPlaceId: string]: SavedPlace };
		onsaveplace: (place: Place) => void;
		onplacechange: (place: Place | null) => void;
	};

	let { savedPlaces, onsaveplace, onplacechange }: Props = $props();

	let mapEl: HTMLDivElement;
	let map: LeafletMap | null = $state(null);
	let currentMarker: Marker | null = $state(null);
	let currentPopup: Popup | null = $state(null);
	let savedMarkers: Map<string, Marker> = new Map();

	const clearCurrentMarker = () => {
		if (currentMarker) {
			currentMarker.remove();
			currentMarker = null;
		}
	};

	const clearCurrentPopup = () => {
		if (currentPopup) {
			currentPopup.remove();
			currentPopup = null;
		}
	};

	const openPopupForPlace = async (place: Place) => {
		if (!map) return;
		const L = await import('leaflet');

		clearCurrentMarker();
		clearCurrentPopup();

		currentMarker = L.marker([place.lat, place.lng]).addTo(map);

		const container = document.createElement('div');
		container.style.maxWidth = '200px';
		container.innerHTML = `
			<strong>${place.name}</strong><br />
			${place.formatted_address ?? ''}<br />
		`;
		const btn = document.createElement('button');
		btn.textContent = 'Save place';
		btn.style.cssText =
			'margin-top:8px;padding:6px 12px;background:var(--md-sys-color-primary,#6750a4);color:#fff;border:none;border-radius:4px;font-size:13px;cursor:pointer';
		btn.onclick = () => {
			clearCurrentPopup();
			onsaveplace(place);
		};
		container.appendChild(btn);

		currentPopup = L.popup({ closeButton: true })
			.setLatLng([place.lat, place.lng])
			.setContent(container)
			.openOn(map);

		currentPopup.on('remove', () => {
			clearCurrentMarker();
			currentPopup = null;
		});
	};

	export const handlePlaceSelected = async (osmPlaceId: string) => {
		if (osmPlaceId in savedPlaces) {
			clearCurrentMarker();
			clearCurrentPopup();
			const saved = savedPlaces[osmPlaceId];
			onplacechange(saved);
			if (map) map.setView([saved.lat, saved.lng], 15);
			return;
		}

		const { getPlaceById } = await import('$lib/place-search');
		const place = await getPlaceById(osmPlaceId);
		if (!place) return;

		const unsaved: Place = {
			name: place.name,
			lat: place.lat,
			lng: place.lng,
			formatted_address: place.formatted_address,
			osm_place_id: place.osm_place_id
		};

		onplacechange(unsaved);
		if (map) map.setView([unsaved.lat, unsaved.lng], 15);
		await openPopupForPlace(unsaved);
	};

	const buildMarkerIcon = async (place: SavedPlace) => {
		const L = await import('leaflet');
		const category = CATEGORIES[place.type];

		const icon = document.createElement('div');
		icon.style.cssText = `
			width:32px;height:32px;border-radius:50%;
			background:${category.color};
			display:flex;align-items:center;justify-content:center;
			font-size:14px;border:2px solid rgba(0,0,0,0.2);
			cursor:pointer;
		`;
		icon.textContent = category.glyphText;

		return L.divIcon({
			html: icon.outerHTML,
			className: '',
			iconSize: [32, 32],
			iconAnchor: [16, 16],
			popupAnchor: [0, -18]
		});
	};

	const addSavedMarker = async (place: SavedPlace) => {
		if (!map) return;
		const L = await import('leaflet');
		const icon = await buildMarkerIcon(place);
		const marker = L.marker([place.lat, place.lng], { icon, title: place.name }).addTo(map);
		marker.on('click', () => {
			clearCurrentMarker();
			clearCurrentPopup();
			onplacechange(place);
			map?.setView([place.lat, place.lng], 15);
		});
		savedMarkers.set(getExternalPlaceId(place), marker);
	};

	const syncSavedMarkers = async () => {
		if (!map) return;

		const currentIds = new Set(savedMarkers.keys());
		const newIds = new Set(Object.keys(savedPlaces));

		for (const id of currentIds) {
			if (!newIds.has(id)) {
				savedMarkers.get(id)?.remove();
				savedMarkers.delete(id);
			}
		}

		for (const id of newIds) {
			if (!currentIds.has(id)) {
				await addSavedMarker(savedPlaces[id]);
			}
		}
	};

	$effect(() => {
		void savedPlaces;
		syncSavedMarkers();
	});

	onMount(async () => {
		const L = await import('leaflet');
		await import('leaflet/dist/leaflet.css');

		map = L.map(mapEl, {
			center: [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
			zoom: DEFAULT_MAP_ZOOM,
			zoomControl: true
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19
		}).addTo(map);

		map.on('click', async (e) => {
			clearCurrentMarker();
			clearCurrentPopup();
			onplacechange(null);

			const { reverseGeocode } = await import('$lib/place-search');
			const result = await reverseGeocode(e.latlng.lat, e.latlng.lng);
			if (!result) return;

			const place: Place = {
				name: result.name,
				lat: result.lat,
				lng: result.lng,
				formatted_address: result.formatted_address,
				osm_place_id: result.osm_place_id
			};

			onplacechange(place);
			await openPopupForPlace(place);
		});

		await syncSavedMarkers();
	});

	onDestroy(() => {
		map?.remove();
		map = null;
	});
</script>

<div bind:this={mapEl} class="map"></div>

<style>
	.map {
		width: 100%;
		height: 100%;
	}

	:global(.leaflet-container) {
		font-family: inherit;
	}
</style>
