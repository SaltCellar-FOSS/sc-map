import { redirect } from '@sveltejs/kit';
import type { User } from '$lib/server/dao/users/types';

export async function requireAccess(parent: () => Promise<{ user: User | null }>): Promise<User> {
	const { user } = await parent();
	if (!user || (!user.has_lifetime_access && !user.is_current_server_member)) {
		redirect(302, '/');
	}
	return user;
}
