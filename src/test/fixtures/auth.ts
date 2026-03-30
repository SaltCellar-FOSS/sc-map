import 'dotenv/config';
import type { Page } from '@playwright/test';
import { createSessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';

async function getSessionCookie(userId: bigint): Promise<string> {
	return createSessionCookie(userId, 86400);
}

export async function authenticatedPage(page: Page, userId: bigint): Promise<Page> {
	const cookie = await getSessionCookie(userId);
	await page.context().addCookies([
		{
			name: SESSION_COOKIE_NAME,
			value: cookie,
			domain: 'localhost',
			path: '/'
		}
	]);
	return page;
}
