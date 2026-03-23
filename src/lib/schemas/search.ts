import { SavedPlaceSchema, type SavedPlace } from '$lib/dao/saved-places/types';
import { z } from 'zod';

export const BasePlaceSchema = SavedPlaceSchema.omit({
	id: true,
	submitted_by: true,
	created_at: true,
	type: true
});

export const PlaceSchema = z.union([SavedPlaceSchema, BasePlaceSchema]);

export type Place = z.infer<typeof PlaceSchema>;

export const isSavedPlace = (searchResult: Place): searchResult is SavedPlace => {
	return 'id' in searchResult;
};
