import { test, expect } from '@playwright/test';
import { authenticatedPage } from '../fixtures/auth';
import { TEST_USERS, userHasAccess } from '../fixtures/users';

test.describe('Home page', () => {
	test('shows login button for unauthenticated users', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: /continue with discord/i })).toBeVisible();
	});

	test('shows map for authenticated user with access', async ({ page }) => {
		const user = TEST_USERS.find((u) => userHasAccess(u))!;
		await authenticatedPage(page, user.id);
		await page.goto('/');
		await page.waitForURL(/\/map/g);
	});
});
