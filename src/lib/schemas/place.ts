import type { SavedPlace } from '$lib/schemas/saved-place';

type BasePlace = Pick<SavedPlace, 'name' | 'lat' | 'lng' | 'formatted_address' | 'google_place_id'>;

export type Place = SavedPlace | BasePlace;

export const isSavedPlace = (place: Place): place is SavedPlace => {
	return 'id' in place;
};
