import type { Cookies } from '@sveltejs/kit';
import { sql } from '$lib/db';
import { verifySessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';
import { UsersDao } from '$lib/server/dao/users';
import type { User } from '$lib/server/dao/users/types';
import { Result } from '$lib/result';

const usersDao = new UsersDao(sql);

export class AuthError extends Error {
	constructor(
		message: string,
		public readonly status: number
	) {
		super(message);
		this.name = 'AuthError';
	}
}

export async function requireAuth(cookies: Cookies): Promise<bigint> {
	const cookie = cookies.get(SESSION_COOKIE_NAME);
	if (!cookie) throw new AuthError('Unauthorized', 401);

	const userId = await verifySessionCookie(cookie);
	if (!userId) throw new AuthError('Unauthorized', 401);

	return userId;
}

export async function requireActiveUser(userId: bigint): Promise<User> {
	const user = await usersDao.retrieveUser(userId);
	if (!user.has_lifetime_access && !user.is_current_server_member) {
		throw new AuthError('Access denied', 403);
	}
	return user;
}

export function requireOwnership<T>(
	userId: bigint,
	getOwnerId: (resource: T) => bigint,
	resource: T
): Result<true, AuthError> {
	if (getOwnerId(resource) !== userId) {
		return Result.failure(new AuthError('Forbidden', 403));
	}
	return Result.success(true);
}
