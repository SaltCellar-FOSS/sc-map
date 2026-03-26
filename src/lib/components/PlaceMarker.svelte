<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { importLibrary } from '@googlemaps/js-api-loader';
	import { type SavedPlace, SavedPlaceType } from '$lib/schemas/saved-place';

	import restaurantIcon from '$lib/icons/outlined/restaurant.svg?raw';
	import barIcon from '$lib/icons/outlined/bar.svg?raw';
	import bakeryIcon from '$lib/icons/outlined/bakery.svg?raw';
	import deliIcon from '$lib/icons/outlined/deli.svg?raw';
	import foodTruckIcon from '$lib/icons/outlined/food-truck.svg?raw';
	import dessertIcon from '$lib/icons/outlined/dessert.svg?raw';
	import otherDestinationIcon from '$lib/icons/outlined/other-destination.svg?raw';

	type Props = {
		map: google.maps.Map;
		place: SavedPlace;
		visible: boolean;
		onclick: (place: SavedPlace) => void;
	};

	const { map, place, visible, onclick }: Props = $props();

	let marker: google.maps.marker.AdvancedMarkerElement | null = $state(null);

	const iconMap: Record<SavedPlaceType, string> = {
		[SavedPlaceType.Restaurant]: restaurantIcon,
		[SavedPlaceType.Bar]: barIcon,
		[SavedPlaceType.Bakery]: bakeryIcon,
		[SavedPlaceType.Deli]: deliIcon,
		[SavedPlaceType.FoodTruck]: foodTruckIcon,
		[SavedPlaceType.Dessert]: dessertIcon,
		[SavedPlaceType.OtherDestination]: otherDestinationIcon
	};

	const buildContent = (savedPlace: SavedPlace) => {
		const content = document.createElement('div');
		content.innerHTML = iconMap[savedPlace.type];
		content.style.width = '32px';
		content.style.height = '32px';
		const svgEl = content.querySelector('svg');
		if (svgEl) {
			svgEl.setAttribute('width', '32');
			svgEl.setAttribute('height', '32');
		}
		return content;
	};

	onMount(async () => {
		const { AdvancedMarkerElement } = (await importLibrary('marker')) as google.maps.MarkerLibrary;

		marker = new AdvancedMarkerElement({
			position: { lat: place.lat, lng: place.lng },
			title: place.name,
			content: buildContent(place)
		});

		marker.addListener('click', () => {
			onclick(place);
		});
	});

	$effect(() => {
		if (marker) marker.map = visible ? map : null;
	});

	onDestroy(() => {
		if (marker) marker.map = null;
	});
</script>
