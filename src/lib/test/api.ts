/** Minimal event shape that all route handlers accept. Used to cast imported handlers in tests. */
export interface TestEvent {
	url: URL;
	params: Record<string, string>;
	request: Request;
	cookies: {
		get(name: string): string | undefined;
		set(name: string, value: string, opts?: Record<string, unknown>): void;
		delete(name: string, opts?: Record<string, unknown>): void;
		getAll(): { name: string; value: string }[];
	};
}

export type RouteHandler = (event: TestEvent) => Promise<Response>;

export interface RequestEventOverrides {
	url?: string | URL;
	params?: Record<string, string>;
	request?: Request;
	cookieMap?: Record<string, string>;
}

/** Constructs a minimal event object sufficient for invoking route handlers. */
export function makeRequestEvent(overrides: RequestEventOverrides = {}): TestEvent {
	const url =
		overrides.url instanceof URL
			? overrides.url
			: new URL(overrides.url ?? 'http://localhost/', 'http://localhost/');
	const store = new Map(Object.entries(overrides.cookieMap ?? {}));
	return {
		url,
		params: overrides.params ?? {},
		request: overrides.request ?? new Request(url),
		cookies: {
			get: (name: string) => store.get(name),
			set: (name: string, value: string) => {
				store.set(name, value);
			},
			delete: (name: string) => {
				store.delete(name);
			},
			getAll: () => [...store.entries()].map(([name, value]) => ({ name, value }))
		}
	};
}

/** Returns a new event with a valid HMAC-signed session cookie. Requires $env/dynamic/private to be mocked. */
export async function withAuth(event: TestEvent, userId: bigint): Promise<TestEvent> {
	const { createSessionCookie, SESSION_COOKIE_NAME } = await import('$lib/server/cookie');
	const cookieValue = await createSessionCookie(userId, 3600);
	return {
		...event,
		cookies: {
			get: (name: string) => (name === SESSION_COOKIE_NAME ? cookieValue : undefined),
			set: () => {},
			delete: () => {},
			getAll: () => []
		}
	};
}

/** Parses JSON response body. */
export async function parseJson<T = unknown>(response: Response): Promise<T> {
	return JSON.parse(await response.text()) as T;
}

/** Builds a POST Request with a FormData body. Supports multi-value fields via arrays. */
export function makeFormRequest(
	url: string,
	fields: Record<string, string | File | (string | File)[]>
): Request {
	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		if (Array.isArray(value)) {
			for (const v of value) form.append(key, v);
		} else {
			form.append(key, value);
		}
	}
	return new Request(`http://localhost${url}`, { method: 'POST', body: form });
}
