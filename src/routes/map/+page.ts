import type { SavedPlace } from '$lib/schemas/saved-place';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/places');
	const savedPlacesList: SavedPlace[] = await res.json();

	const savedPlaces: Record<string, SavedPlace> = Object.fromEntries(
		savedPlacesList.map((savedPlace) => [savedPlace.google_place_id, savedPlace])
	);

	return { savedPlaces };
};
