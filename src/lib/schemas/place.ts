import { SavedPlaceSchema, type SavedPlace } from '$lib/server/dao/saved-places/types';
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
