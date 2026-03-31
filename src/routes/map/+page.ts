import type { SavedPlace } from '$lib/schemas/saved-place';
import { parsePlaceId } from '$lib/place-slug';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, depends, url }) => {
	depends('app:places');
	const parentData = await parent();
	if (!parentData.user) {
		redirect(307, '/');
	}
	const res = await fetch('/api/places');
	const savedPlacesList: SavedPlace[] = await res.json();

	const savedPlaces: Record<string, SavedPlace> = Object.fromEntries(
		savedPlacesList.map((savedPlace) => [savedPlace.google_place_id, savedPlace])
	);

	const placeParam = url.searchParams.get('place');
	const placeId = placeParam ? parsePlaceId(placeParam) : null;
	const initialPlace = placeId
		? (Object.values(savedPlaces).find((p) => p.id === placeId) ?? null)
		: null;

	return { savedPlaces, initialPlace };
};
