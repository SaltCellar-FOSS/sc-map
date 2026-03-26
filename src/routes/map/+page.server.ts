import { fail } from '@sveltejs/kit';
import { sql } from '$lib/db';
import { SavedPlaceNotFoundError, SavedPlacesDao } from '$lib/server/dao/saved-places';
import { VisitsDao } from '$lib/server/dao/visits';
import { getGooglePlaceById } from '$lib/google-places';
import { isSavedPlaceType } from '$lib/schemas/saved-place';
import { verifySessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';
import { VisitInsertSchema } from '$lib/schemas/visit.js';

const savedPlacesDao = new SavedPlacesDao(sql);
const visitsDao = new VisitsDao(sql);

const VisitInsertWithoutPlaceSchema = VisitInsertSchema.omit({ place_id: true });

export const actions = {
	addVisit: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();

		const googlePlaceId = data.get('googlePlaceId')?.toString();

		if (!googlePlaceId) return fail(400, { error: 'Missing googlePlaceId' });

		const parseResult = VisitInsertWithoutPlaceSchema.safeParse({
			user_id: userId,
			summary: data.get('review')?.toString(),
			rating: data.get('rating')?.toString(),
			visited_at: data.get('visitDate')?.toString()
		});

		if (!parseResult.success) {
			return fail(400, {
				error: parseResult.error.issues[0]?.message ?? 'Invalid input'
			});
		}

		await sql.begin(async (tx) => {
			let placeId: bigint;

			try {
				const existing = await savedPlacesDao.retrieveSavedPlaceByGooglePlaceId(googlePlaceId);

				placeId = existing.id;
			} catch (error) {
				if (!(error instanceof SavedPlaceNotFoundError)) {
					throw error;
				}

				const googlePlace = await getGooglePlaceById(googlePlaceId);
				if (!googlePlace) throw new Error(`Google place not found: ${googlePlaceId}`);

				const selectedType = data.get('selectedType')?.toString();
				if (!selectedType) {
					return fail(400, { error: 'Missing selectedType' });
				}
				if (!isSavedPlaceType(selectedType)) {
					return fail(400, { error: 'Received selectedType value was invalid.' });
				}

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
					place_id: placeId,
					...parseResult.data
				},
				tx
			);
		});

		return { success: true };
	}
};
