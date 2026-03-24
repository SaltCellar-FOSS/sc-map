import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/svelte-query';
import { PlaceSchema, type Place } from '$lib/schemas/place';

export function submitPlaceOptions(queryClient: QueryClient) {
	return mutationOptions({
		mutationFn: async (data: {
			rating: number;
			review: string;
			photos: File[];
			googlePlaceId: Place['google_place_id'];
		}) => {
			const formData = new FormData();
			formData.append('googlePlaceId', data.googlePlaceId);
			formData.append('rating', String(data.rating));
			formData.append('review', data.review);
			for (const photo of data.photos) {
				formData.append('photos', photo);
			}
			const res = await fetch(`/places/${data.googlePlaceId}`, {
				method: 'POST',
				body: formData
			});
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] })
	});
}

export function searchPlacesOptions(query: string) {
	return queryOptions({
		queryKey: ['places', 'search', query],
		queryFn: async () => {
			const res = await fetch(`/places/search?q=${encodeURIComponent(query)}`);
			return PlaceSchema.array().parse(await res.json());
		},
		enabled: query.trim().length > 0
	});
}
