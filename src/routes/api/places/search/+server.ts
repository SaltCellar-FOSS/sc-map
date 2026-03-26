import { json } from '@sveltejs/kit';
import { searchPlaces } from '$lib/place-search';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	if (!q) return json([]);

	const results = await searchPlaces(q);
	return json(results);
};
