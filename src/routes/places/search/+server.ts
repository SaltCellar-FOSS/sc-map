import { PlacesDao } from '$lib/dao/places';
import { sql } from '$lib/db';
import { searchGooglePlaces, inferPlaceType } from '$lib/server/google-places';
import { type SearchResult } from '$lib/schemas/search';
import { jsonResponse } from '$lib/server/response';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	if (!q) {
		return jsonResponse([]);
	}

	const placesDao = new PlacesDao(sql);
	const [dbResults, ...googleResultsByType] = await Promise.all([
		placesDao.searchPlaces(q),
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

	const searchResults: SearchResult[] = [
		...dbResults,
		...uniqueGoogleResults.map<SearchResult>((result) => ({
			name: result.name,
			lat: result.geometry.location.lat,
			lng: result.geometry.location.lng,
			formatted_address: result.formatted_address,
			google_place_id: result.place_id,
			type: inferPlaceType(result.types) ?? 'RESTAURANT'
		}))
	];

	return jsonResponse(searchResults);
};
