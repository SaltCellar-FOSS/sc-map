import { SavedPlaceSchema, type SavedPlace } from '$lib/schemas/saved-place';
import { z } from 'zod';

export const BasePlaceSchema = SavedPlaceSchema.omit({
	id: true,
	submitted_by: true,
	created_at: true,
	type: true
});

export const PlaceSchema = z.union([SavedPlaceSchema, BasePlaceSchema]);

export type Place = z.infer<typeof PlaceSchema>;

export const isSavedPlace = (place: Place): place is SavedPlace => {
	return 'id' in place;
};

/** Returns the OSM place ID if available, falling back to google_place_id for legacy places. */
export function getExternalPlaceId(place: Place): string {
	return place.osm_place_id ?? place.google_place_id ?? '';
}

/** Returns the appropriate ID for indexing/lookup, preferring OSM but falling back to Google or database ID. */
export function normalizePlaceIdForLookup(place: Place): string {
	return place.osm_place_id ?? place.google_place_id ?? String((place as any).id ?? '');
}
