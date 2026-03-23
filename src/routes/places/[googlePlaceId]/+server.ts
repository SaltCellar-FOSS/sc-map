import {
	SavedPlacesDao,
	DuplicateGooglePlaceIdError,
	InvalidPlaceTypeError
} from '$lib/dao/saved-places';
import { sql } from '$lib/db';
import { getGooglePlaceById, inferPlaceType } from '$lib/server/google-places';
import { verifySessionCookie } from '$lib/server/cookie';
import { jsonResponse, errorResponse } from '$lib/server/response';
import type { RequestHandler } from './$types';

const placesDao = new SavedPlacesDao(sql);

export const POST: RequestHandler = async ({ params, cookies }) => {
	const sessionCookie = cookies.get('session');
	const userId = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
	if (!userId) return errorResponse('Unauthorized', 401);

	const { googlePlaceId } = params;

	const googlePlace = await getGooglePlaceById(googlePlaceId);
	if (!googlePlace) return errorResponse('Google place not found', 404);

	const type = inferPlaceType(googlePlace.types);
	if (!type)
		return errorResponse('Place type could not be mapped to RESTAURANT, BAR, or BAKERY', 422);

	try {
		const place = await placesDao.insertSavedPlace({
			name: googlePlace.name,
			lat: googlePlace.geometry.location.lat,
			lng: googlePlace.geometry.location.lng,
			formatted_address: googlePlace.formatted_address,
			google_place_id: googlePlace.place_id,
			type,
			submitted_by: userId
		});

		return jsonResponse(place, 201);
	} catch (e) {
		if (e instanceof DuplicateGooglePlaceIdError) return errorResponse('Place already exists', 409);
		if (e instanceof InvalidPlaceTypeError) return errorResponse('Invalid place type', 422);
		throw e;
	}
};
