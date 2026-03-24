import { env } from '$env/dynamic/private';
const { SESSION_SECRET } = env;

export const SESSION_COOKIE_NAME = 'session';

export async function createSessionCookie(userId: bigint, maxAge: number): Promise<string> {
	const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
	const payload = `${userId}:${expiresAt}`;
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(SESSION_SECRET),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	const sigB64 = Buffer.from(signature).toString('base64');
	return `${payload}.${sigB64}`;
}
export async function verifySessionCookie(cookie: string): Promise<bigint | null> {
	const dot = cookie.lastIndexOf('.');
	if (dot === -1) return null;

	const payload = cookie.slice(0, dot);
	const sigB64 = cookie.slice(dot + 1);

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(SESSION_SECRET),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['verify']
	);

	const sig = Buffer.from(sigB64, 'base64');

	const valid = await crypto.subtle.verify('HMAC', key, sig, encoder.encode(payload));
	if (!valid) return null;

	const colon = payload.indexOf(':');
	if (colon === -1) return null;

	const expiresAt = Number(payload.slice(colon + 1));
	if (!Number.isFinite(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) return null;

	try {
		return BigInt(payload.slice(0, colon));
	} catch {
		return null;
	}
}
