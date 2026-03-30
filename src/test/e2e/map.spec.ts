import { test, expect, authenticatedPage } from '../fixtures';
import { TEST_USERS, userHasAccess } from '../fixtures/users';

test.describe('Map page', () => {
	test('redirects unauthenticated user to home', async ({ page }) => {
		await page.goto('/map');
		await page.waitForURL('/');
	});

	test('renders search bar for authenticated user with access', async ({ page }) => {
		// Abort Google Maps requests to avoid network flakiness
		await page.route('**/maps.googleapis.com/**', (route) => route.abort());

		const user = TEST_USERS.find((u) => userHasAccess(u))!;
		await authenticatedPage(page, user.id);
		await page.goto('/map');

		await expect(page).toHaveURL(/\/map/);
		await expect(page.getByRole('searchbox', { name: 'Search places' })).toBeVisible();
	});
});
