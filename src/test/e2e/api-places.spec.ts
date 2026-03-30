import { test, expect } from '../fixtures';
import { authedGet } from '../fixtures/request';
import { TEST_PLACE } from '../fixtures/test-data';

test.describe('GET /api/places', () => {
	test('returns 401 for unauthenticated request', async ({ request }) => {
		const response = await request.get('/api/places');
		expect(response.status()).toBe(401);
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	test('returns empty array when no places exist', async ({ db: _db, request }) => {
		// _db is included to trigger truncation of saved_places before this test
		const response = await authedGet(request, 1n, '/api/places');
		expect(response.status()).toBe(200);
		const body = await response.json();
		expect(body).toEqual([]);
	});

	test('returns seeded place in list', async ({ db, request }) => {
		await db.seedPlace(TEST_PLACE);
		const response = await authedGet(request, 1n, '/api/places');
		expect(response.status()).toBe(200);
		const body = await response.json();
		expect(body).toHaveLength(1);
		expect(body[0].google_place_id).toBe(TEST_PLACE.google_place_id);
	});
});
