<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { importLibrary } from '@googlemaps/js-api-loader';
	import { type Place } from '$lib/dao/places/types';
	import type { CategoryConfig } from './types';

	let {
		map,
		place,
		visible,
		onclick,
		categoryConfig
	}: {
		map: google.maps.Map;
		place: Place;
		visible: boolean;
		onclick: (place: Place) => void;
		categoryConfig: CategoryConfig;
	} = $props();

	let marker: google.maps.marker.AdvancedMarkerElement | null = $state(null);

	onMount(async () => {
		const { AdvancedMarkerElement, PinElement } = (await importLibrary(
			'marker'
		)) as google.maps.MarkerLibrary;

		const { color } = categoryConfig;

		const pin = new PinElement({
			background: color,
			borderColor: color,
			glyphColor: 'white',
			glyph: 'glyphText' in categoryConfig ? categoryConfig.glyphText : undefined
		} as google.maps.marker.PinElementOptions);

		pin.element.style.cursor = 'pointer';

		marker = new AdvancedMarkerElement({
			position: { lat: place.lat, lng: place.lng },
			title: place.name,
			content: pin.element
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
