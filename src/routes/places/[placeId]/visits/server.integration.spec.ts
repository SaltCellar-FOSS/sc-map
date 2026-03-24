import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { sql } from '$lib/db';
import { UsersDao } from '$lib/dao/users';
import { SavedPlacesDao } from '$lib/dao/saved-places';
import { VisitsDao } from '$lib/dao/visits';
import type { VisitWithUser } from '$lib/dao/visits/types';
import { makeRequestEvent, withAuth, parseJson, type RouteHandler } from '$lib/test/api';

mock.module('$env/dynamic/private', () => ({
	env: { SESSION_SECRET: 'integration-test-secret' }
}));

const { GET } = (await import('./+server.ts')) as unknown as { GET: RouteHandler };

describe('Integration: GET /places/:placeId/visits', () => {
	let userId: bigint;
	let placeId: bigint;

	beforeEach(async () => {
		const usersDao = new UsersDao(sql);
		const placesDao = new SavedPlacesDao(sql);

		const user = await usersDao.insertUser({
			discord_id: 'discord_test_user',
			discord_handle: 'testuser#0001',
			avatar_url: null,
			google_id: null,
			has_lifetime_access: false,
			is_current_server_member: true
		});
		userId = user.id;

		const place = await placesDao.insertSavedPlace({
			name: 'Test Restaurant',
			lat: 40.7128,
			lng: -74.006,
			formatted_address: '123 Test St, New York, NY 10001',
			google_place_id: 'test_google_place_id',
			type: 'RESTAURANT',
			submitted_by: userId
		});
		placeId = place.id;
	});

	test('returns 401 when unauthenticated', async () => {
		const event = makeRequestEvent({ params: { placeId: String(placeId) } });
		const response = await GET(event);
		expect(response.status).toBe(401);
	});

	test('returns empty array when place has no visits', async () => {
		const event = await withAuth(
			makeRequestEvent({ params: { placeId: String(placeId) } }),
			userId
		);
		const response = await GET(event);
		expect(response.status).toBe(200);
		expect(await parseJson<unknown[]>(response)).toHaveLength(0);
	});

	test('returns visits with user info', async () => {
		const visitsDao = new VisitsDao(sql);
		await visitsDao.insertVisit({
			user_id: userId,
			place_id: placeId,
			summary: 'Great tacos',
			rating: 5,
			visited_at: '2024-06-01'
		});

		const event = await withAuth(
			makeRequestEvent({ params: { placeId: String(placeId) } }),
			userId
		);
		const response = await GET(event);
		expect(response.status).toBe(200);

		const visits = await parseJson<VisitWithUser[]>(response);
		expect(visits).toHaveLength(1);
		expect(visits[0].summary).toBe('Great tacos');
		expect(visits[0].discord_handle).toBe('testuser#0001');
		expect(visits[0].photo_urls).toEqual([]);
	});

	test('returns only visits for the requested place', async () => {
		const placesDao = new SavedPlacesDao(sql);
		const visitsDao = new VisitsDao(sql);

		const otherPlace = await placesDao.insertSavedPlace({
			name: 'Other Place',
			lat: 40.0,
			lng: -73.0,
			formatted_address: '456 Other St, New York, NY 10002',
			google_place_id: 'other_google_place_id',
			type: 'BAR',
			submitted_by: userId
		});

		await visitsDao.insertVisit({
			user_id: userId,
			place_id: placeId,
			summary: 'Visit to test place',
			rating: 4,
			visited_at: '2024-06-01'
		});
		await visitsDao.insertVisit({
			user_id: userId,
			place_id: otherPlace.id,
			summary: 'Visit to other place',
			rating: 3,
			visited_at: '2024-06-02'
		});

		const event = await withAuth(
			makeRequestEvent({ params: { placeId: String(placeId) } }),
			userId
		);
		const visits = await parseJson<VisitWithUser[]>(await GET(event));
		expect(visits).toHaveLength(1);
		expect(visits[0].summary).toBe('Visit to test place');
	});
});
