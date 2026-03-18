import { PlacesDao } from '$lib/dao/places';
import { sql } from '$lib/db';
import { searchGooglePlaces } from '$lib/server/google-places';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	if (!q) {
		return new Response(JSON.stringify([]), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const placesDao = new PlacesDao(sql);
	const [dbResults, googleResults] = await Promise.all([
		placesDao.searchPlaces(q),
		searchGooglePlaces(q)
	]);

	const dbPlaceIds = new Set(dbResults.map((p) => p.google_place_id));
	const uniqueGoogleResults = googleResults.filter((r) => !dbPlaceIds.has(r.place_id));

	const combined: Array<{ source: 'db' | 'google'; data: unknown }> = [
		...dbResults.map((p) => ({ source: 'db' as const, data: p })),
		...uniqueGoogleResults.map((r) => ({ source: 'google' as const, data: r }))
	];

	return new Response(JSON.stringify(combined), {
		headers: { 'Content-Type': 'application/json' }
	});
};
