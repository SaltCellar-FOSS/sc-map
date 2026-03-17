import { describe, expect, test, beforeEach } from 'bun:test';
import type { User, UserInsert } from './types';
import { UsersDao, UserNotFoundError, DuplicateExternalIdError, NoIdentityError } from '.';
import { createMockSQL, createErrorSQL } from '../mock';

const userRow: User = {
	id: 1n,
	discord_id: 'discord123',
	discord_handle: 'testuser#0001',
	google_id: null,
	has_lifetime_access: false,
	is_current_server_member: true,
	last_checked_at: new Date('2024-01-01'),
	created_at: new Date('2024-01-01'),
	updated_at: new Date('2024-01-01')
};

const userInsert: UserInsert = {
	discord_id: 'discord123',
	discord_handle: 'testuser#0001',
	google_id: null,
	has_lifetime_access: false,
	is_current_server_member: true
};

describe('UsersDao', () => {
	describe('retrieveUser', () => {
		describe('success', () => {
			let dao: UsersDao;
			beforeEach(() => {
				dao = new UsersDao(createMockSQL([userRow]));
			});

			test('retrieves a User', async () => {
				const user = await dao.retrieveUser(1n);
				expect(user.discord_handle).toEqual('testuser#0001');
			});
		});

		describe('errors', () => {
			test('throws UserNotFoundError when user does not exist', async () => {
				const dao = new UsersDao(createMockSQL([]));
				expect(dao.retrieveUser(1n)).rejects.toBeInstanceOf(UserNotFoundError);
			});
		});
	});

	describe('listUsers', () => {
		describe('success', () => {
			let dao: UsersDao;
			beforeEach(() => {
				dao = new UsersDao(
					createMockSQL([
						{ ...userRow, id: 1n, discord_id: 'discord001' },
						{ ...userRow, id: 2n, discord_id: 'discord002' },
						{ ...userRow, id: 3n, discord_id: 'discord003' }
					])
				);
			});

			test('lists all users', async () => {
				const users = await dao.listUsers();
				expect(users).toHaveLength(3);
			});
		});
	});

	describe('insertUser', () => {
		describe('success', () => {
			let dao: UsersDao;
			beforeEach(() => {
				dao = new UsersDao(createMockSQL([userRow]));
			});

			test('inserts and returns a user', async () => {
				const user = await dao.insertUser(userInsert);
				expect(user.id).toBeDefined();
				expect(user.discord_handle).toBe('testuser#0001');
				expect(user.discord_id).toBe('discord123');
			});
		});

		describe('errors', () => {
			test('throws DuplicateExternalIdError on duplicate external error ID', async () => {
				const dao = new UsersDao(createErrorSQL('23505'));
				expect(dao.insertUser(userInsert)).rejects.toBeInstanceOf(DuplicateExternalIdError);
			});

			test('throws NoIdentityError when neither discord_id nor google_id is set', async () => {
				const dao = new UsersDao(createErrorSQL('23514'));
				expect(dao.insertUser({ ...userInsert, discord_id: null })).rejects.toBeInstanceOf(
					NoIdentityError
				);
			});
		});
	});

	describe('updateUser', () => {
		describe('success', () => {
			let dao: UsersDao;
			beforeEach(() => {
				dao = new UsersDao(createMockSQL([{ ...userRow, discord_handle: 'newhandle#0002' }]));
			});

			test('updates user', async () => {
				const updated = await dao.updateUser(1n, { discord_handle: 'newhandle#0002' });
				expect(updated.discord_handle).toEqual('newhandle#0002');
			});
		});

		describe('errors', () => {
			test('throws UserNotFoundError when user does not exist', async () => {
				const dao = new UsersDao(createMockSQL([]));
				expect(dao.updateUser(1n, { discord_handle: 'ghost' })).rejects.toBeInstanceOf(
					UserNotFoundError
				);
			});

			test('throws DuplicateExternalIdError', async () => {
				const dao = new UsersDao(createErrorSQL('23505'));
				expect(dao.updateUser(1n, { discord_id: 'discord789' })).rejects.toBeInstanceOf(
					DuplicateExternalIdError
				);
			});

			test('throws NoIdentityError when constraint is violated', async () => {
				const dao = new UsersDao(createErrorSQL('23514'));
				expect(dao.updateUser(1n, { discord_id: null })).rejects.toBeInstanceOf(NoIdentityError);
			});
		});
	});

	describe('deleteUser', () => {
		describe('success', () => {
			let dao: UsersDao;
			beforeEach(() => {
				dao = new UsersDao(createMockSQL([userRow]));
			});

			test('deletes user', async () => {
				const deleted = await dao.deleteUser(1n);
				expect(deleted.id).toBe(1n);
			});
		});

		describe('errors', () => {
			test('throws UserNotFoundError when user does not exist', async () => {
				const dao = new UsersDao(createMockSQL([]));
				expect(dao.deleteUser(1n)).rejects.toBeInstanceOf(UserNotFoundError);
			});
		});
	});
});
