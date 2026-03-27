import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { sql } from '$lib/db';
import { VisitsDao } from '$lib/server/dao/visits';
import { SavedPlacesDao } from '$lib/server/dao/saved-places';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (user && (user.has_lifetime_access || user.is_current_server_member)) {
		redirect(302, '/map');
	}

	const [contributors, pins] = await Promise.all([
		new VisitsDao(sql).countContributors(),
		new SavedPlacesDao(sql).countPins()
	]);

	return { contributors, pins };
};
