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
		const largeFile = new MockFile(new Uint8Array(15 * 1024 * 1024), 'large.png', 'image/png');
		largeFile.size = 15 * 1024 * 1024; // 15MB

		await expect(validateImage(largeFile as unknown as File)).rejects.toThrow('File size');
	});

	it('should reject invalid MIME types', async () => {
		const textFile = new MockFile('not an image', 'test.txt', 'text/plain');

		await expect(validateImage(textFile as unknown as File)).rejects.toThrow('not allowed');
	});
});

describe('processImage', () => {
	it('should reject invalid input files', async () => {
		const invalidFile = new MockFile('not an image', 'test.txt', 'text/plain');

		await expect(processImage(invalidFile as unknown as File)).rejects.toThrow('not allowed');
	});
});
