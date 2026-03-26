import { fail } from '@sveltejs/kit';
import { sql } from '$lib/db';
import { SavedPlaceNotFoundError, SavedPlacesDao } from '$lib/server/dao/saved-places';
import { VisitsDao } from '$lib/server/dao/visits';
import { getPlaceById } from '$lib/place-search';
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

		const osmPlaceId = data.get('osmPlaceId')?.toString();

		if (!osmPlaceId) return fail(400, { error: 'Missing osmPlaceId' });

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
				const existing = await savedPlacesDao.retrieveSavedPlaceByOsmPlaceId(osmPlaceId);

				placeId = existing.id;
			} catch (error) {
				if (!(error instanceof SavedPlaceNotFoundError)) {
					throw error;
				}

				const osmPlace = await getPlaceById(osmPlaceId);
				if (!osmPlace) throw new Error(`OSM place not found: ${osmPlaceId}`);

				const selectedType = data.get('selectedType')?.toString();
				if (!selectedType) {
					return fail(400, { error: 'Missing selectedType' });
				}
				if (!isSavedPlaceType(selectedType)) {
					return fail(400, { error: 'Received selectedType value was invalid.' });
				}

				const place = await savedPlacesDao.insertSavedPlace(
					{
						name: osmPlace.name,
						lat: osmPlace.lat,
						lng: osmPlace.lng,
						formatted_address: osmPlace.formatted_address,
						osm_place_id: osmPlace.osm_place_id,
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
