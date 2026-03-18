import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { sql } from '$lib/db';
import { PlacesDao } from '$lib/dao/places';

const placesDao = new PlacesDao(sql);

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user || (!user.has_lifetime_access && !user.is_current_server_member)) {
		redirect(302, '/');
	}

	const places = await placesDao.listPlaces();
	return { places };
};
