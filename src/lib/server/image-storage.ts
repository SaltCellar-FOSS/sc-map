import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const IMAGES_DIR = process.env.IMAGES_DIR ?? './images';

async function ensureImagesDirectory(): Promise<void> {
	await mkdir(IMAGES_DIR, { recursive: true });
}

export async function saveImage(buffer: Buffer, filename: string): Promise<string> {
	await ensureImagesDirectory();
	const filePath = join(IMAGES_DIR, filename);
	await writeFile(filePath, buffer);
	return `/images/${filename}`;
}

export async function deleteImage(url: string): Promise<void> {
	const filename = url.replace('/images/', '');
	if (!filename || filename === url) {
		throw new Error('Invalid image URL format');
	}

	const filePath = join(IMAGES_DIR, filename);

	try {
		await unlink(filePath);
	} catch (error) {
		if (
			error instanceof Error &&
			'code' in error &&
			(error as NodeJS.ErrnoException).code === 'ENOENT'
		) {
			return;
		}
		throw error;
	}
}
