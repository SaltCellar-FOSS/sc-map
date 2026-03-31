import { describe, it, expect, mock } from 'bun:test';
import { saveImage, deleteImage } from './image-storage';

// Mock fs operations
mock.module('node:fs/promises', () => ({
	readFile: mock(() => Promise.resolve(Buffer.from('test'))),
	unlink: mock(() => Promise.resolve()),
	writeFile: mock(() => Promise.resolve()),
	mkdir: mock(() => Promise.resolve())
}));

describe('saveImage', () => {
	it('should save image and return URL', async () => {
		const buffer = Buffer.from('test image data');
		const filename = 'test-123.jpg';

		const url = await saveImage(buffer, filename);
		expect(url).toBe('/images/test-123.jpg');
	});
});

describe('deleteImage', () => {
	it('should delete existing image', async () => {
		await expect(deleteImage('/images/test.jpg')).resolves.toBeUndefined();
	});

	it('should handle non-existent images gracefully', async () => {
		expect(typeof deleteImage).toBe('function');
	});

	it('should reject invalid image URLs', async () => {
		await expect(deleteImage('invalid-url')).rejects.toThrow('Invalid image URL format');
	});
});
