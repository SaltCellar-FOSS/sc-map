import type { User } from '$lib/server/dao/users/types';
import { describe, test, expect, mock, beforeEach } from 'bun:test';

// Mutable state shared between mock implementations and tests.
// Must be set before each test that drives different behavior.
let mockRows: unknown[] = [];
let verifyResult: bigint | null = null;

mock.module('$env/static/private', () => ({
	SESSION_SECRET: 'test-secret'
}));

mock.module('$lib/db', () => ({
	sql: (strings: unknown) => {
		if (Array.isArray(strings) && 'raw' in (strings as object)) {
			return Promise.resolve(mockRows);
		}
		return strings;
	}
}));

mock.module('$lib/server/cookie', () => ({
	SESSION_COOKIE_NAME: 'session',
	verifySessionCookie: mock(async () => verifyResult)
}));

// Dynamic import so mocks above are applied first
type LoadFn = (event: { cookies: { get: (name: string) => string | undefined } }) => Promise<{
	user: User | null;
}>;
const { load } = (await import('./+layout.server.ts')) as { load: LoadFn };

const baseUser: User = {
	id: 1n,
	discord_id: 'discord123',
	discord_handle: 'testuser',
	avatar_url: null,
	google_id: null,
	has_lifetime_access: false,
	is_current_server_member: true,
	last_checked_at: new Date('2024-01-01'),
	created_at: new Date('2024-01-01'),
	updated_at: new Date('2024-01-01')
};

function makeCookies(value: string | undefined) {
	return { get: () => value };
}

describe('layout load', () => {
	beforeEach(() => {
		mockRows = [];
		verifyResult = null;
	});

	// --- null user cases (renders <LoginWithDiscord />) ---

	test('returns null user when no session cookie', async () => {
		const result = await load({ cookies: makeCookies(undefined) });
		expect(result.user).toBeNull();
	});

	test('returns null user when cookie fails verification', async () => {
		verifyResult = null;
		const result = await load({ cookies: makeCookies('bad-cookie') });
		expect(result.user).toBeNull();
	});

	// --- user with access (renders welcome message) ---

	test('returns user with lifetime access', async () => {
		verifyResult = 1n;
		mockRows = [{ ...baseUser, has_lifetime_access: true, is_current_server_member: false }];
		const result = await load({ cookies: makeCookies('valid-cookie') });
		expect(result.user?.has_lifetime_access).toBe(true);
	});

	test('returns user who is a current server member', async () => {
		verifyResult = 1n;
		mockRows = [{ ...baseUser, has_lifetime_access: false, is_current_server_member: true }];
		const result = await load({ cookies: makeCookies('valid-cookie') });
		expect(result.user?.is_current_server_member).toBe(true);
	});

	// --- user who left the server ---

	test('returns user who has left the server with no lifetime access', async () => {
		verifyResult = 1n;
		mockRows = [{ ...baseUser, has_lifetime_access: false, is_current_server_member: false }];
		const result = await load({ cookies: makeCookies('valid-cookie') });
		expect(result.user?.is_current_server_member).toBe(false);
		expect(result.user?.has_lifetime_access).toBe(false);
	});
});
