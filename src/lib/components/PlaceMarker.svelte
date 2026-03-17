<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { importLibrary } from '@googlemaps/js-api-loader';
	import { CATEGORIES, type Place } from '$lib/types';

	let {
		map,
		place,
		visible,
		onclick
	}: {
		map: google.maps.Map;
		place: Place;
		visible: boolean;
		onclick: (place: Place) => void;
	} = $props();

	let marker: google.maps.marker.AdvancedMarkerElement | null = $state(null);

	onMount(async () => {
		const { AdvancedMarkerElement, PinElement } = (await importLibrary(
			'marker'
		)) as google.maps.MarkerLibrary;

		const { color, glyphText } = CATEGORIES[place.category];

		const pin = new PinElement({
			background: color,
			borderColor: color,
			glyphColor: 'white',
			glyph: glyphText,
		} as google.maps.marker.PinElementOptions);

		pin.element.style.cursor = 'pointer';

		marker = new AdvancedMarkerElement({
			position: { lat: place.lat, lng: place.lng },
			title: place.name,
			content: pin.element
		});

		marker.addEventListener('click', () => onclick(place));
	});

	$effect(() => {
		if (marker) marker.map = visible ? map : null;
	});

	onDestroy(() => {
		if (marker) marker.map = null;
	});
</script>
