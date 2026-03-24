import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { sql } from '$lib/db';
import { UsersDao } from '$lib/dao/users';
import {
	makeRequestEvent,
	makeFormRequest,
	withAuth,
	parseJson,
	type RouteHandler
} from '$lib/test/api';
import type { SavedPlace } from '$lib/dao/saved-places/types';
import type { Visit } from '$lib/dao/visits/types';

mock.module('$env/dynamic/private', () => ({
	env: { SESSION_SECRET: 'integration-test-secret' }
}));

mock.module('$lib/server/google-places', () => ({
	getGooglePlaceById: mock(async (id: string) => ({
		place_id: id,
		name: 'Test Pizza',
		formatted_address: '1 Test St, New York, NY 10001',
		geometry: { location: { lat: 40.7128, lng: -74.006 } },
		types: ['restaurant']
	})),
	inferPlaceType: mock(() => 'RESTAURANT')
}));

const { POST } = (await import('./+server.ts')) as unknown as { POST: RouteHandler };

describe('Integration: POST /places/:googlePlaceId', () => {
	let userId: bigint;

	beforeEach(async () => {
		const user = await new UsersDao(sql).insertUser({
			discord_id: 'discord_test_user',
			discord_handle: 'testuser#0001',
			avatar_url: null,
			google_id: null,
			has_lifetime_access: false,
			is_current_server_member: true
		});
		userId = user.id;
	});

	function makeEvent(googlePlaceId: string, fields: Record<string, string> = {}) {
		return makeRequestEvent({
			params: { googlePlaceId },
			request: makeFormRequest(`/places/${googlePlaceId}`, {
				googlePlaceId,
				rating: '4',
				review: 'Great food',
				...fields
			})
		});
	}

	test('returns 401 when unauthenticated', async () => {
		const response = await POST(makeEvent('ChIJ_test'));
		expect(response.status).toBe(401);
	});

	test('returns 422 when form data is invalid', async () => {
		const event = await withAuth(
			makeRequestEvent({
				params: { googlePlaceId: 'ChIJ_test' },
				request: makeFormRequest('/places/ChIJ_test', {
					googlePlaceId: 'ChIJ_test',
					rating: '10', // invalid: max is 5
					review: 'Great food'
				})
			}),
			userId
		);
		const response = await POST(event);
		expect(response.status).toBe(422);
	});

	test('creates place and visit, returns 201', async () => {
		const event = await withAuth(makeEvent('ChIJ_new_place'), userId);
		const response = await POST(event);
		expect(response.status).toBe(201);

		const json = await parseJson<{ place: SavedPlace; visit: Visit }>(response);
		expect(json.place.name).toBe('Test Pizza');
		expect(json.place.type).toBe('RESTAURANT');
		expect(json.visit.rating).toBe(4);
		expect(json.visit.summary).toBe('Great food');
	});

	test('returns 409 when place already saved', async () => {
		const event1 = await withAuth(makeEvent('ChIJ_dupe'), userId);
		await POST(event1);

		// Rebuild the request (request body can only be read once)
		const event2 = await withAuth(makeEvent('ChIJ_dupe'), userId);
		const response = await POST(event2);
		expect(response.status).toBe(409);
	});
});
