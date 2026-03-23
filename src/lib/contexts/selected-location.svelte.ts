import { getContext, setContext } from 'svelte';
import type { Place } from '$lib/dao/places/types';

export type SelectedLocation = Omit<Place, 'id' | 'created_at' | 'submitted_by' | 'type'>;

const KEY = Symbol('selectedLocation');

export function setSelectedLocationContext() {
	let selectedLocation = $state<SelectedLocation | null>(null);
	return setContext(KEY, {
		get selectedLocation() {
			return selectedLocation;
		},
		set selectedLocation(v) {
			selectedLocation = v;
		}
	});
}

export function getSelectedLocationContext() {
	return getContext<ReturnType<typeof setSelectedLocationContext>>(KEY);
}
