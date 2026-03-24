import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/places');
	const savedPlaces = await res.json();

	return { savedPlaces };
};
