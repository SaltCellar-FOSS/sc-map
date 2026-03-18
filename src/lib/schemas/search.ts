import { PlaceSchema, type Place } from '$lib/dao/places/types';
import { z } from 'zod';

export const BaseSearchResultSchema = PlaceSchema.omit({
	id: true,
	submitted_by: true,
	created_at: true
});

export const SearchResultSchema = z.union([PlaceSchema, BaseSearchResultSchema]);

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const isPlace = (searchResult: SearchResult): searchResult is Place => {
	return 'id' in searchResult;
};
