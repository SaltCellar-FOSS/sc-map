import { SavedPlaceSchema, type SavedPlace } from '$lib/dao/saved-places/types';
import { z } from 'zod';

export const BaseSearchResultSchema = SavedPlaceSchema.omit({
	id: true,
	submitted_by: true,
	created_at: true
});

export const SearchResultSchema = z.union([SavedPlaceSchema, BaseSearchResultSchema]);

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const isSavedPlace = (searchResult: SearchResult): searchResult is SavedPlace => {
	return 'id' in searchResult;
};
