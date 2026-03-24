import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/svelte-query';
import { PlaceSchema, type Place } from '$lib/schemas/place';
import { VisitWithUserSchema } from '$lib/dao/visits/types';

export function submitPlaceOptions(queryClient: QueryClient) {
	return mutationOptions({
		mutationFn: async (data: {
			rating: number;
			review: string;
			photos: File[];
			googlePlaceId: Place['google_place_id'];
			visitDate?: string;
		}) => {
			const formData = new FormData();
			formData.append('googlePlaceId', data.googlePlaceId);
			formData.append('rating', String(data.rating));
			formData.append('review', data.review);
			if (data.visitDate) formData.append('visitDate', data.visitDate);
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

export function placeVisitsOptions(placeId: bigint) {
	return queryOptions({
		queryKey: ['places', String(placeId), 'visits'],
		queryFn: async () => {
			const res = await fetch(`/places/${placeId}/visits`);
			if (!res.ok) throw new Error(await res.text());
			return VisitWithUserSchema.array().parse(await res.json());
		}
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
