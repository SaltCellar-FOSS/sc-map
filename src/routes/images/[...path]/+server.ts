import { error } from '@sveltejs/kit';
import { join, normalize, extname } from 'node:path';
import type { RequestHandler } from './$types';

const IMAGES_DIR = process.env.IMAGES_DIR ?? './images';

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};

export const GET: RequestHandler = async ({ params, request }) => {
	const normalized = normalize(params.path);
	if (normalized.includes('..') || normalized.startsWith('/')) error(400, 'Invalid path');

	const ext = extname(normalized).toLowerCase();
	const mimeType = MIME_TYPES[ext];
	if (!mimeType) error(404, 'Not found');

	const file = Bun.file(join(IMAGES_DIR, normalized));
	if (!(await file.exists())) error(404, 'Not found');

	const etag = `"${file.lastModified.toString(16)}-${file.size.toString(16)}"`;
	if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304 });

	return new Response(file, {
		headers: {
			'Content-Type': mimeType,
			'Cache-Control': 'public, max-age=31536000, immutable',
			ETag: etag
		}
	});
};
