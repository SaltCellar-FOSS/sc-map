import type { PageServerLoad } from './$types';
import { sql } from '$lib/db';
import { PlacesDao } from '$lib/dao/places';
import { requireAccess } from '$lib/server/guards';

const placesDao = new PlacesDao(sql);

export const load: PageServerLoad = async ({ parent }) => {
	await requireAccess(parent);
	const places = await placesDao.listPlaces();
	return { places };
};
