import { test, expect } from '../fixtures';
import { authedPost } from '../fixtures/request';
import { TEST_USERS, userHasAccess } from '../fixtures/users';
import { TEST_PLACE } from '../fixtures/test-data';

test.describe('Access control', () => {
	test('redirects unauthenticated user away from /map', async ({ page }) => {
		await page.goto('/map');
		await page.waitForURL('/');
	});

	// No-access users can VIEW the map (the guard is per-action, not per-page).
	// Verify their session is valid but actions are blocked.
	test('no-access user gets 403 on protected actions', async ({ db, request }) => {
		const place = await db.seedPlace(TEST_PLACE);
		const noAccessUser = TEST_USERS.find((u) => !userHasAccess(u))!;

		const response = await authedPost(request, noAccessUser.id, '/map?/addVisit', {
			googlePlaceId: place.google_place_id,
			summary: 'test',
			visitDate: '2025-01-15'
		});

		const body = await response.json();
		expect(body.type).toBe('failure');
		expect(body.status).toBe(403);
	});
});
