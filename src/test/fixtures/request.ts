import type { APIRequestContext } from '@playwright/test';
import { createSessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';

export async function authedPost(
	request: APIRequestContext,
	userId: bigint,
	url: string,
	form: Record<string, string>
) {
	const cookie = await createSessionCookie(userId, 86400);
	return request.post(url, {
		headers: {
			Cookie: `${SESSION_COOKIE_NAME}=${cookie}`,
			Origin: 'http://localhost:5173'
		},
		form
	});
}

export async function authedGet(request: APIRequestContext, userId: bigint, path: string) {
	const cookie = await createSessionCookie(userId, 86400);
	return request.get(path, {
		headers: { Cookie: `${SESSION_COOKIE_NAME}=${cookie}` }
	});
}
