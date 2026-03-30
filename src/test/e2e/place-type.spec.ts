import { test, expect } from '../fixtures';
import { authedPost } from '../fixtures/request';
import { TEST_PLACE } from '../fixtures/test-data';

// SvelteKit form actions always return HTTP 200.
// The actual result is in the JSON body: { type: "success" | "failure", status: number }

test.describe('editPlace', () => {
	test('updates type successfully', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const response = await authedPost(request, 1n, '/map?/editPlace', {
			placeId: String(place.id),
			type: 'RESTAURANT'
		});
		const body = await response.json();
		expect(body.type).toBe('success');
	});

	test('returns 400 for invalid type', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const response = await authedPost(request, 1n, '/map?/editPlace', {
			placeId: String(place.id),
			type: 'INVALID_TYPE'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(400);
	});

	test('returns 401 without auth', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const response = await request.post('/map?/editPlace', {
			headers: { Origin: 'http://localhost:5173' },
			form: { placeId: String(place.id), type: 'RESTAURANT' }
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(401);
	});

	test('returns 403 for user without access', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const response = await authedPost(request, 2n, '/map?/editPlace', {
			placeId: String(place.id),
			type: 'RESTAURANT'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(403);
	});

	test('returns 404 for non-existent place', async ({ request }) => {
		const response = await authedPost(request, 1n, '/map?/editPlace', {
			placeId: '99999',
			type: 'RESTAURANT'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(404);
	});
});
