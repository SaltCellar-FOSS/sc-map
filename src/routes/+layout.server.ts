import type { LayoutServerLoad } from './$types';
import { sql } from '$lib/db';
import { UsersDao, UserNotFoundError } from '$lib/dao/users';
import type { User } from '$lib/dao/users/types';
import { verifySessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';

const usersDao = new UsersDao(sql);

export const load: LayoutServerLoad = async ({ cookies }): Promise<{ user: User | null }> => {
	const cookie = cookies.get(SESSION_COOKIE_NAME);
	if (!cookie) return { user: null };

	const userId = await verifySessionCookie(cookie);
	if (!userId) return { user: null };

	try {
		return { user: await usersDao.retrieveUser(userId) };
	} catch (e) {
		if (e instanceof UserNotFoundError) return { user: null };
		throw e;
	}
};
