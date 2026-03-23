import { getContext, setContext } from 'svelte';
import type { Place } from '$lib/schemas/search';

const KEY = Symbol('selectedPlace');

export function setSelectedPlaceContext() {
	let selectedPlace = $state<Place | null>(null);
	return setContext(KEY, {
		get selectedPlace() {
			return selectedPlace;
		},
		set selectedPlace(v) {
			selectedPlace = v;
		}
	});
}

export function getSelectedPlaceContext() {
	return getContext<ReturnType<typeof setSelectedPlaceContext>>(KEY);
}
