import { describe, it, expect } from 'bun:test';
import { processImage, validateImage } from './image-processor';

// Mock File for testing
class MockFile {
	size: number;
	type: string;
	name: string;

	constructor(content: string | Uint8Array, name: string, type: string) {
		this.name = name;
		this.type = type;
		this.size = content.length;
	}

	async arrayBuffer(): Promise<ArrayBuffer> {
		// Return empty buffer for testing
		return new ArrayBuffer(0);
	}
}

describe('validateImage', () => {
	it('should reject files over size limit', async () => {
		const largeFile = new MockFile(new Uint8Array(15 * 1024 * 1024), 'large.png', 'image/png') as any;
		largeFile.size = 15 * 1024 * 1024; // 15MB

		const result = await validateImage(largeFile);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('File size');
		}
	});

	it('should reject invalid MIME types', async () => {
		const textFile = new MockFile('not an image', 'test.txt', 'text/plain') as any;

		const result = await validateImage(textFile);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('not allowed');
		}
	});
});

describe('processImage', () => {
	it('should reject invalid input files', async () => {
		const invalidFile = new MockFile('not an image', 'test.txt', 'text/plain') as any;

		const result = await processImage(invalidFile);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('not allowed');
		}
	});
});
