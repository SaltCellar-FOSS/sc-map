import { test, expect, authenticatedPage } from '../fixtures';
import { TEST_USERS } from '../fixtures/users';

test.describe('Home page', () => {
	test('shows login button for unauthenticated users', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: /continue with discord/i })).toBeVisible();
	});

	test('redirects to /map for user with server access', async ({ page }) => {
		const user = TEST_USERS.find((u) => u.is_current_server_member && !u.has_lifetime_access)!;
		await authenticatedPage(page, user.id);
		await page.goto('/');
		await page.waitForURL(/\/map/);
	});

	test('stays on home for user without access', async ({ page }) => {
		const user = TEST_USERS.find((u) => !u.is_current_server_member && !u.has_lifetime_access)!;
		await authenticatedPage(page, user.id);
		await page.goto('/');
		await expect(page).toHaveURL('/');
	});

	test('redirects to /map for lifetime access user not in server', async ({ page }) => {
		const user = TEST_USERS.find((u) => u.has_lifetime_access && !u.is_current_server_member)!;
		await authenticatedPage(page, user.id);
		await page.goto('/');
		await page.waitForURL(/\/map/);
	});
});
