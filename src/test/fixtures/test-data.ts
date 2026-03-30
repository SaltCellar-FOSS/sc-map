import { Temporal } from '@js-temporal/polyfill';
import { SavedPlaceType, type SavedPlaceInsert } from '$lib/schemas/saved-place';
import type { VisitInsert } from '$lib/schemas/visit';

export const TEST_PLACE = {
	name: 'Test Cafe',
	lat: 37.7749,
	lng: -122.4194,
	formatted_address: '123 Test St, San Francisco, CA',
	google_place_id: 'test-gplace-abc123',
	type: SavedPlaceType.Cafe,
	submitted_by: 1n
} satisfies SavedPlaceInsert;

export function makeVisit(placeId: bigint, userId = 1n): VisitInsert {
	return {
		user_id: userId,
		place_id: placeId,
		summary: 'Great coffee and ambiance',
		visited_at: Temporal.PlainDate.from('2025-01-15')
	};
}
