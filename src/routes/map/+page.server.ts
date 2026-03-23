import type { PageServerLoad } from './$types';
import { sql } from '$lib/db';
import { SavedPlacesDao } from '$lib/dao/saved-places';
import { requireAccess } from '$lib/server/guards';

const placesDao = new SavedPlacesDao(sql);

export const load: PageServerLoad = async ({ parent }) => {
	await requireAccess(parent);
	const places = await placesDao.listSavedPlaces();
	return { places };
};
