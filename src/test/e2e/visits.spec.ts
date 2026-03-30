import { test, expect } from '../fixtures';
import { authedPost } from '../fixtures/request';
import { TEST_PLACE, makeVisit } from '../fixtures/test-data';

// SvelteKit form actions always return HTTP 200.
// The actual result is in the JSON body: { type: "success" | "failure", status: number }

test.describe('addVisit', () => {
	test('returns 401 without auth', async ({ request }) => {
		const response = await request.post('/map?/addVisit', {
			headers: { Origin: 'http://localhost:5173' },
			form: { googlePlaceId: TEST_PLACE.google_place_id, summary: 'test', visitDate: '2025-01-15' }
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(401);
	});

	test('returns 403 for user without access', async ({ db, request }) => {
		await db.seedPlace(TEST_PLACE);
		const response = await authedPost(request, 2n, '/map?/addVisit', {
			googlePlaceId: TEST_PLACE.google_place_id,
			summary: 'test',
			visitDate: '2025-01-15'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(403);
	});

	test('returns 400 for missing googlePlaceId', async ({ request }) => {
		const response = await authedPost(request, 1n, '/map?/addVisit', {
			summary: 'test',
			visitDate: '2025-01-15'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(400);
	});

	test('returns 400 for summary exceeding 2000 chars', async ({ db, request }) => {
		await db.seedPlace(TEST_PLACE);
		const response = await authedPost(request, 1n, '/map?/addVisit', {
			googlePlaceId: TEST_PLACE.google_place_id,
			summary: 'a'.repeat(2001),
			visitDate: '2025-01-15'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(400);
	});

	test('succeeds for an existing saved place', async ({ db, request }) => {
		await db.seedPlace(TEST_PLACE);
		const response = await authedPost(request, 1n, '/map?/addVisit', {
			googlePlaceId: TEST_PLACE.google_place_id,
			summary: 'Excellent espresso',
			visitDate: '2025-01-15'
		});
		const body = await response.json();
		expect(body.type).toBe('success');
	});
});

test.describe('editVisit', () => {
	test('updates summary and date', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const visit = await db.seedVisit(makeVisit(place.id));
		const response = await authedPost(request, 1n, '/map?/editVisit', {
			visitId: String(visit.id),
			summary: 'Updated review',
			visitDate: '2025-06-01'
		});
		const body = await response.json();
		expect(body.type).toBe('success');
	});

	test('returns 403 for non-owner', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const visit = await db.seedVisit(makeVisit(place.id, 1n));
		const response = await authedPost(request, 3n, '/map?/editVisit', {
			visitId: String(visit.id),
			summary: 'Unauthorized edit',
			visitDate: '2025-06-01'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(403);
	});

	test('returns 404 for non-existent visit', async ({ request }) => {
		const response = await authedPost(request, 1n, '/map?/editVisit', {
			visitId: '99999',
			summary: 'Does not exist',
			visitDate: '2025-06-01'
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(404);
	});
});

test.describe('deleteVisit', () => {
	test('removes visit', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const visit = await db.seedVisit(makeVisit(place.id));
		const response = await authedPost(request, 1n, '/map?/deleteVisit', {
			visitId: String(visit.id)
		});
		const body = await response.json();
		expect(body.type).toBe('success');
	});

	test('returns 403 for non-owner', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const visit = await db.seedVisit(makeVisit(place.id, 1n));
		const response = await authedPost(request, 3n, '/map?/deleteVisit', {
			visitId: String(visit.id)
		});
		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(403);
	});
});
