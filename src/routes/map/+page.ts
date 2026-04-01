import { SavedPlaceSchema, type SavedPlace } from '$lib/schemas/saved-place';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, depends, url }) => {
	depends('app:places');
	const parentData = await parent();
	if (!parentData.user) {
		redirect(307, '/');
	}
	const res = await fetch('/api/places');
	const savedPlacesList: SavedPlace[] = SavedPlaceSchema.array().parse(await res.json());

	const savedPlaces: Record<string, SavedPlace> = Object.fromEntries(
		savedPlacesList.map((savedPlace) => [savedPlace.google_place_id, savedPlace])
	);

	const placeIdStr = url.searchParams.get('place_id');
	if (!placeIdStr) return { savedPlaces, initialPlace: null };

	try {
		const placeId = BigInt(placeIdStr);
		const initialPlace = savedPlacesList.find((p) => p.id === placeId) ?? null;
		return { savedPlaces, initialPlace };
	} catch {
		return { savedPlaces, initialPlace: null };
	}
};
