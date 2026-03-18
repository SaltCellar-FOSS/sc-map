import { PlacesDao, DuplicateGooglePlaceIdError, InvalidPlaceTypeError } from '$lib/dao/places';
import { sql } from '$lib/db';
import { getGooglePlaceById } from '$lib/server/google-places';
import { verifySessionCookie } from '$lib/server/cookie';
import type { RequestHandler } from './$types';

const GOOGLE_TYPE_MAP: Record<string, 'RESTAURANT' | 'BAR' | 'BAKERY'> = {
	restaurant: 'RESTAURANT',
	bar: 'BAR',
	night_club: 'BAR',
	bakery: 'BAKERY'
};

function inferType(googleTypes: string[]): 'RESTAURANT' | 'BAR' | 'BAKERY' | null {
	for (const t of googleTypes) {
		const mapped = GOOGLE_TYPE_MAP[t];
		if (mapped) return mapped;
	}
	return null;
}

const placesDao = new PlacesDao(sql);

export const POST: RequestHandler = async ({ params, cookies }) => {
	const sessionCookie = cookies.get('session');
	const userId = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
	if (!userId) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { googlePlaceId } = params;

	const googlePlace = await getGooglePlaceById(googlePlaceId);
	if (!googlePlace) {
		return new Response(JSON.stringify({ error: 'Google place not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const type = inferType(googlePlace.types);
	if (!type) {
		return new Response(
			JSON.stringify({ error: 'Place type could not be mapped to RESTAURANT, BAR, or BAKERY' }),
			{ status: 422, headers: { 'Content-Type': 'application/json' } }
		);
	}

	try {
		const place = await placesDao.insertPlace({
			name: googlePlace.name,
			lat: googlePlace.geometry.location.lat,
			lng: googlePlace.geometry.location.lng,
			formatted_address: googlePlace.formatted_address,
			google_place_id: googlePlace.place_id,
			type,
			submitted_by: userId
		});

		const serialized = {
			...place,
			id: place.id.toString(),
			submitted_by: place.submitted_by.toString(),
			created_at: place.created_at.toISOString()
		};

		return new Response(JSON.stringify(serialized), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		if (e instanceof DuplicateGooglePlaceIdError) {
			return new Response(JSON.stringify({ error: 'Place already exists' }), {
				status: 409,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		if (e instanceof InvalidPlaceTypeError) {
			return new Response(JSON.stringify({ error: 'Invalid place type' }), {
				status: 422,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw e;
	}
};
