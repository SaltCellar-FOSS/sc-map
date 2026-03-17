import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const { method, url } = event.request;
	const pathname = new URL(url).pathname;

	const response = await resolve(event);

	const ms = Date.now() - start;
	console.log(`${method} ${pathname} ${response.status} ${ms}ms`);

	return response;
};
