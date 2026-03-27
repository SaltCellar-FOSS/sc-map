import type { SavedPlace } from '$lib/schemas/saved-place';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, depends }) => {
	depends('app:places');
	const parentData = await parent();
	if (!parentData.user) {
		redirect(307, '/');
	}
	const res = await fetch('/api/places');
	const savedPlacesList: SavedPlace[] = await res.json();

	const savedPlaces: Record<string, SavedPlace> = Object.fromEntries(
		savedPlacesList.map((savedPlace) => [
			savedPlace.osm_place_id ?? savedPlace.google_place_id ?? String(savedPlace.id),
			savedPlace
		])
	);

	return { savedPlaces };
};
