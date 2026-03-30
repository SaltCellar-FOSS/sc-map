import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Result } from '$lib/result';

const IMAGES_DIR = '/app/images';

async function ensureImagesDirectory(): Promise<void> {
	await mkdir(IMAGES_DIR, { recursive: true });
}

/**
 * Saves an image buffer to the file system
 */
export async function saveImage(buffer: Buffer, filename: string): Promise<Result<string, Error>> {
	try {
		await ensureImagesDirectory();
		const filePath = join(IMAGES_DIR, filename);
		await writeFile(filePath, buffer);
		return Result.success(`/images/${filename}`);
	} catch (error) {
		return Result.failure(
			new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`)
		);
	}
}

/**
 * Deletes an image from the file system
 */
export async function deleteImage(url: string): Promise<Result<void, Error>> {
	const filename = url.replace('/images/', '');
	if (!filename || filename === url) {
		return Result.failure(new Error('Invalid image URL format'));
	}

	const filePath = join(IMAGES_DIR, filename);

	try {
		await unlink(filePath);
		return Result.success();
	} catch (error) {
		// If file doesn't exist, consider it successfully deleted
		if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
			return Result.success();
		}
		return Result.failure(
			new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`)
		);
	}
}
