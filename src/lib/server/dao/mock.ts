import type { SQL } from 'bun';
import { mock } from 'bun:test';

export function createMockSQL(rows: unknown[] = []): SQL {
	const mockFn = mock(() => Promise.resolve(rows));
	return ((strings: unknown) => {
		if (Array.isArray(strings) && 'raw' in (strings as object)) {
			return mockFn();
		}
		return strings;
	}) as unknown as SQL;
}

export function createErrorSQL(errno: string): SQL {
	const mockFn = mock(() => Promise.reject(Object.assign(new Error('db error'), { errno })));
	return ((strings: unknown) => {
		if (Array.isArray(strings) && 'raw' in (strings as object)) {
			return mockFn();
		}
		return strings;
	}) as unknown as SQL;
}
