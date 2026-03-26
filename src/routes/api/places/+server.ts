import { sql } from '$lib/db';
import { verifySessionCookie } from '$lib/server/cookie';
import { SavedPlacesDao } from '$lib/server/dao/saved-places';
import { errorResponse, jsonResponse } from '$lib/server/response';
import type { RequestHandler } from '@sveltejs/kit';

const savedPlacesDao = new SavedPlacesDao(sql);

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionCookie = cookies.get('session');
	const userId = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
	if (!userId) return errorResponse('Unauthorized', 401);
	console.error('userId =', userId);

	const places = await savedPlacesDao.listSavedPlaces();
	return jsonResponse(places, 200);
};
