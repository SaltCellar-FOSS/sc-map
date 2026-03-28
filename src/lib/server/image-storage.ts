import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Result } from '../result';
import { ok, err } from '../result';

const IMAGES_DIR = '/app/images';

/**
 * Ensures the images directory exists
 */
async function ensureImagesDirectory(): Promise<Result<void, string>> {
	try {
		await mkdir(IMAGES_DIR, { recursive: true });
		return ok(undefined);
	} catch (error) {
		return err(`Failed to create images directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Saves an image buffer to the file system
 */
export async function saveImage(buffer: Buffer, filename: string): Promise<Result<string, string>> {
	// Ensure directory exists
	const dirResult = await ensureImagesDirectory();
	if (!dirResult.ok) {
		return dirResult;
	}

	const filePath = join(IMAGES_DIR, filename);

	try {
		await writeFile(filePath, buffer);
		// Return the URL path that will be used to serve the image
		return ok(`/images/${filename}`);
	} catch (error) {
		return err(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Deletes an image from the file system
 */
export async function deleteImage(url: string): Promise<Result<void, string>> {
	// Extract filename from URL path
	const filename = url.replace('/images/', '');
	if (!filename || filename === url) {
		return err('Invalid image URL format');
	}

	const filePath = join(IMAGES_DIR, filename);

	try {
		await unlink(filePath);
		return ok(undefined);
	} catch (error) {
		// If file doesn't exist, consider it successfully deleted
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return ok(undefined);
		}
		return err(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Checks if an image exists on the file system
 */
export async function imageExists(url: string): Promise<boolean> {
	const filename = url.replace('/images/', '');
	if (!filename || filename === url) {
		return false;
	}

	const filePath = join(IMAGES_DIR, filename);

	try {
		await writeFile(filePath, Buffer.alloc(0), { flag: 'wx' });
		// If we get here, file doesn't exist (wx flag would fail)
		return false;
	} catch (error) {
		// If error code is EEXIST, file exists
		if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
			return true;
		}
		// For other errors, assume file doesn't exist or is inaccessible
		return false;
	}
}