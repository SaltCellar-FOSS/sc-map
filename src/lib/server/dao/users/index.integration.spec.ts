import { sql } from '$lib/db';
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import type { UserInsert } from './types';
import { UsersDao, DuplicateExternalIdError, NoIdentityError, UserNotFoundError } from '.';

describe('Integration', () => {
	let dao: UsersDao;

	beforeEach(() => {
		dao = new UsersDao(sql);
	});

	afterEach(async () => {
		await sql`DELETE FROM users`;
	});

	describe('UsersDao', () => {
		const baseInsert: UserInsert = {
			discord_id: 'discord_test_1',
			discord_handle: 'testuser#0001',
			avatar_url: null,
			google_id: null,
			has_lifetime_access: false,
			is_current_server_member: true
		};

		describe('insertUser', () => {
			describe('success', () => {
				test('inserts a user with only discord_id', async () => {
					const user = await dao.insertUser(baseInsert);
					expect(user.id).toBeDefined();
					expect(user.discord_id).toBe('discord_test_1');
					expect(user.google_id).toBeNull();
				});

				test('inserts a user with only google_id', async () => {
					const user = await dao.insertUser({
						...baseInsert,
						discord_id: null,
						google_id: 'google_test_1'
					});
					expect(user.google_id).toBe('google_test_1');
					expect(user.discord_id).toBeNull();
				});

				test('inserts a user with both discord_id and google_id', async () => {
					const user = await dao.insertUser({
						...baseInsert,
						google_id: 'google_test_2'
					});
					expect(user.discord_id).toBe('discord_test_1');
					expect(user.google_id).toBe('google_test_2');
				});
			});

			describe('constraints', () => {
				test('throws DuplicateExternalIdError on duplicate discord_id', async () => {
					await dao.insertUser(baseInsert);
					expect(
						dao.insertUser({ ...baseInsert, discord_handle: 'other#0002' })
					).rejects.toBeInstanceOf(DuplicateExternalIdError);
				});

				test('throws DuplicateExternalIdError on duplicate google_id', async () => {
					await dao.insertUser({ ...baseInsert, google_id: 'google_dup' });
					expect(
						dao.insertUser({
							discord_id: 'discord_other',
							discord_handle: 'other#0003',
							avatar_url: null,
							google_id: 'google_dup',
							has_lifetime_access: false,
							is_current_server_member: false
						})
					).rejects.toBeInstanceOf(DuplicateExternalIdError);
				});

				test('throws NoIdentityError when both discord_id and google_id are null', async () => {
					expect(
						dao.insertUser({ ...baseInsert, discord_id: null, google_id: null })
					).rejects.toBeInstanceOf(NoIdentityError);
				});
			});
		});

		describe('updateUser', () => {
			describe('constraints', () => {
				test('throws DuplicateExternalIdError when updating discord_id to an existing one', async () => {
					await dao.insertUser(baseInsert);
					const second = await dao.insertUser({
						discord_id: 'discord_test_2',
						discord_handle: 'second#0002',
						avatar_url: null,
						google_id: null,
						has_lifetime_access: false,
						is_current_server_member: false
					});
					expect(
						dao.updateUser(second.id, { discord_id: 'discord_test_1' })
					).rejects.toBeInstanceOf(DuplicateExternalIdError);
				});

				test('throws DuplicateExternalIdError when updating google_id to an existing one', async () => {
					await dao.insertUser({ ...baseInsert, google_id: 'google_shared' });
					const second = await dao.insertUser({
						discord_id: 'discord_test_2',
						discord_handle: 'second#0002',
						avatar_url: null,
						google_id: null,
						has_lifetime_access: false,
						is_current_server_member: false
					});
					expect(dao.updateUser(second.id, { google_id: 'google_shared' })).rejects.toBeInstanceOf(
						DuplicateExternalIdError
					);
				});

				test('throws NoIdentityError when update nullifies the only identity', async () => {
					const user = await dao.insertUser(baseInsert); // only discord_id set
					expect(dao.updateUser(user.id, { discord_id: null })).rejects.toBeInstanceOf(
						NoIdentityError
					);
				});

				test('throws UserNotFoundError when updating a non-existent user', async () => {
					expect(dao.updateUser(999999n, { discord_handle: 'ghost#0000' })).rejects.toBeInstanceOf(
						UserNotFoundError
					);
				});
			});
		});

		describe('deleteUser', () => {
			describe('constraints', () => {
				test('throws UserNotFoundError when deleting a non-existent user', async () => {
					expect(dao.deleteUser(999999n)).rejects.toBeInstanceOf(UserNotFoundError);
				});
			});
		});
	});
});
