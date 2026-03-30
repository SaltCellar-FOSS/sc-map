import type { User } from '$lib/server/dao/users/types';

interface TestUser {
	id: bigint;
	has_lifetime_access: boolean;
	is_current_server_member: boolean;
	description: string;
}

export const TEST_USERS: TestUser[] = [
	{
		id: 1n,
		has_lifetime_access: false,
		is_current_server_member: true,
		description: 'Member with server access'
	},
	{
		id: 2n,
		has_lifetime_access: false,
		is_current_server_member: false,
		description: 'Member without server access'
	},
	{
		id: 3n,
		has_lifetime_access: true,
		is_current_server_member: true,
		description: 'Lifetime access member'
	},
	{
		id: 4n,
		has_lifetime_access: true,
		is_current_server_member: false,
		description: 'Lifetime access (not in server)'
	}
];

export function userHasAccess(
	user: Pick<User, 'has_lifetime_access' | 'is_current_server_member'>
): boolean {
	return user.has_lifetime_access || user.is_current_server_member;
}
