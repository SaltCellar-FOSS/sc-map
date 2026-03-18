import { mutationOptions } from '@tanstack/svelte-query';
import { queryOptions } from '@tanstack/svelte-query';
import { SuggestionSchema } from '$lib/schemas/search';

export const addPlaceOptions = mutationOptions({
	mutationFn: async (googlePlaceId: string) => {
		const res = await fetch(`/places/${googlePlaceId}`, { method: 'POST' });
		if (!res.ok) throw new Error(await res.text());
		return res.json();
	}
});

export function searchPlacesOptions(query: string) {
	return queryOptions({
		queryKey: ['places', 'search', query],
		queryFn: async () => {
			const res = await fetch(`/places/search?q=${encodeURIComponent(query)}`);
			return SuggestionSchema.array().parse(await res.json());
		},
		enabled: query.trim().length > 0
	});
}
