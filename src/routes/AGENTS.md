# Routes

## File types

SvelteKit route files and their responsibilities:

| File                | Purpose                                                                        |
| ------------------- | ------------------------------------------------------------------------------ |
| `+layout.server.ts` | Runs on every request; verifies session cookie and exposes `user` to all pages |
| `+layout.svelte`    | Shell markup wrapping all pages                                                |
| `+page.server.ts`   | Server-only load + form actions for a specific page                            |
| `+page.ts`          | Universal load (runs on server + client); fetches data via `fetch`             |
| `+page.svelte`      | Page UI                                                                        |
| `+server.ts`        | API endpoint (`GET`, `POST`, etc.)                                             |
| `*.remote.ts`       | Server-only remote queries (SvelteKit `query()` from `$app/server`)            |

## Auth pattern

`user` (or `null`) is available on every page via layout data. Access it with `parent()`:

```ts
export const load: PageLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) redirect(307, '/');
	// ...
};
```

A user has access when `user.has_lifetime_access || user.is_current_server_member`. Both conditions must be checked together — never check only one.

## Form actions

Actions live in `+page.server.ts`. Every action must:

1. Verify the session cookie and return `fail(401)` if missing or invalid.
2. Parse and validate all form data through a Zod schema; return `fail(400)` with the first issue message on failure.
3. Return `{ success: true }` on success.

```ts
export const actions = {
	myAction: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const parseResult = MySchema.safeParse({
			/* fields */
		});
		if (!parseResult.success) {
			return fail(400, { error: parseResult.error.issues[0]?.message ?? 'Invalid input' });
		}

		// ... perform operation ...

		return { success: true };
	}
};
```

Narrow domain errors (e.g. `EntityNotFoundError`) to the appropriate HTTP status code using `fail()`. Re-throw anything unexpected.

## API endpoints (`+server.ts`)

Use `jsonResponse` / `errorResponse` from `$lib/server/response`. Verify the session cookie manually — these endpoints are outside the layout load.

```ts
export const GET: RequestHandler = async ({ cookies }) => {
	const userId = await verifySessionCookie(cookies.get('session') ?? '');
	if (!userId) return errorResponse('Unauthorized', 401);

	const data = await someDao.list();
	return jsonResponse(data, 200);
};
```

## Remote queries (`.remote.ts`)

Use SvelteKit's `query()` from `$app/server` for server-only queries called from `+page.svelte`. Validate the input with a Zod schema as the first argument.

```ts
import { query } from '$app/server';
import { z } from 'zod';

export const getThingsForEntity = query(z.coerce.bigint(), async (entityId) => {
	return someDao.listByEntity(entityId);
});
```

## Testing

Test files are named `<route-file>.test.ts` and co-located with the route file (e.g. `layout.server.test.ts` alongside `+layout.server.ts`).

**Setup pattern:**

1. Mock all external modules (`$lib/db`, `$lib/server/cookie`, `$env/static/private`, etc.) with `mock.module()` at the top of the file, before any imports of the module under test.
2. Use mutable variables shared between the mock implementations and tests to control mock behavior per-test.
3. Dynamically `import()` the route file _after_ all mocks are in place so the mocks take effect.
4. Reset shared state in `beforeEach`.

```ts
import { describe, test, expect, mock, beforeEach } from 'bun:test';

let mockRows: unknown[] = [];
let verifyResult: bigint | null = null;

mock.module('$env/static/private', () => ({ SESSION_SECRET: 'test-secret' }));

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

const { load } = await import('./+layout.server.ts');

beforeEach(() => {
	mockRows = [];
	verifyResult = null;
});
```

Cover: missing cookie → null/401, invalid cookie → null/401, valid cookie with access, valid cookie without access.
