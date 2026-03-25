import { fail } from '@sveltejs/kit';
import { sql } from '$lib/db';
import { SavedPlacesDao } from '$lib/server/dao/saved-places';
import { VisitsDao } from '$lib/server/dao/visits';
import { getGooglePlaceById } from '$lib/google-places';
import { SavedPlaceSchema, type SavedPlace } from '$lib/schemas/saved-place';
import { verifySessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';

const savedPlacesDao = new SavedPlacesDao(sql);
const visitsDao = new VisitsDao(sql);

export const actions = {
	addVisit: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const googlePlaceId = data.get('googlePlaceId')?.toString();
		const ratingStr = data.get('rating')?.toString();
		const review = data.get('review')?.toString() ?? '';
		const selectedType: SavedPlace['type'] = (data.get('selectedType')?.toString() ??
			'RESTAURANT') as 'RESTAURANT' | 'BAR' | 'BAKERY';
		const visitDate = data.get('visitDate')?.toString();

		if (!googlePlaceId) return fail(400, { error: 'Missing googlePlaceId' });

		const rating = ratingStr ? Number(ratingStr) : NaN;
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, { error: 'Invalid rating' });
		}

		const visited_at = visitDate || new Date().toISOString().split('T')[0];

		await sql.begin(async (tx) => {
			const [existing] = await tx`
				SELECT * FROM saved_places WHERE google_place_id = ${googlePlaceId}
			`;

			let placeId: bigint;
			if (existing) {
				placeId = SavedPlaceSchema.parse(existing).id;
			} else {
				const googlePlace = await getGooglePlaceById(googlePlaceId);
				if (!googlePlace) throw new Error(`Google place not found: ${googlePlaceId}`);

				const place = await savedPlacesDao.insertSavedPlace(
					{
						name: googlePlace.name,
						lat: googlePlace.geometry.location.lat,
						lng: googlePlace.geometry.location.lng,
						formatted_address: googlePlace.formatted_address,
						google_place_id: googlePlace.place_id,
						type: selectedType,
						submitted_by: userId
					},
					tx
				);
				placeId = place.id;
			}

			await visitsDao.insertVisit(
				{
					user_id: userId,
					place_id: placeId,
					summary: review,
					rating,
					visited_at
				},
				tx
			);
		});

		return { success: true };
	}
};
