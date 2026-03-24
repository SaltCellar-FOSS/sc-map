import { query } from '$app/server';
import { z } from 'zod';
import { sql } from '$lib/db';
import { SavedPlacesDao } from '$lib/server/dao/saved-places';
import { searchGooglePlaces, inferPlaceType } from '$lib/server/google-places';
import type { Place } from '$lib/schemas/place';

const savedPlacesDao = new SavedPlacesDao(sql);

export const searchPlaces = query(z.string(), async (q) => {
	if (!q) return [] as Place[];

	const [dbResults, ...googleResultsByType] = await Promise.all([
		savedPlacesDao.searchSavedPlaces(q),
		searchGooglePlaces(q, 'bar'),
		searchGooglePlaces(q, 'restaurant'),
		searchGooglePlaces(q, 'bakery')
	]);

	const seen = new Set<string>();
	const googleResults = googleResultsByType.flat().filter((r) => {
		if (seen.has(r.place_id)) return false;
		seen.add(r.place_id);
		return true;
	});

	const dbPlaceIds = new Set(dbResults.map((p) => p.google_place_id));
	const uniqueGoogleResults = googleResults.filter((r) => !dbPlaceIds.has(r.place_id)).slice(0, 4);

	const searchResults: Place[] = [
		...dbResults,
		...uniqueGoogleResults.map<Place>((result) => ({
			name: result.name,
			lat: result.geometry.location.lat,
			lng: result.geometry.location.lng,
			formatted_address: result.formatted_address,
			google_place_id: result.place_id,
			type: inferPlaceType(result.types) ?? 'RESTAURANT'
		}))
	];

	return searchResults;
});
