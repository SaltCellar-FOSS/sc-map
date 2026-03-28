import sharp from 'sharp';
import type { Result } from './result';
import { err, ok } from './result';

export interface ImageUpload {
	file: File;
	filename: string;
}

export interface ImageProcessingOptions {
	maxWidth: number;
	maxHeight: number;
	quality: number;
	format: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImage {
	buffer: Buffer;
	filename: string;
	mimeType: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PROCESSING_OPTIONS: ImageProcessingOptions = {
	maxWidth: 1200,
	maxHeight: 1200,
	quality: 85,
	format: 'jpeg'
};

/**
 * Validates an image file for type and size constraints
 */
export async function validateImage(file: File): Promise<Result<void, string>> {
	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		return err(`File size ${file.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
	}

	// Check MIME type
	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return err(`File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
	}

	// Additional validation: try to read the file as an image
	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		const metadata = await sharp(buffer).metadata();

		if (!metadata.width || !metadata.height) {
			return err('Invalid image file: could not determine dimensions');
		}

		// Prevent extremely large images that could cause memory issues
		if (metadata.width > 10000 || metadata.height > 10000) {
			return err('Image dimensions too large (max 10000x10000 pixels)');
		}
	} catch (error) {
		return err(`Invalid image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}

	return ok(undefined);
}

/**
 * Processes an image file: validates, resizes, and converts format
 */
export async function processImage(
	file: File,
	options: Partial<ImageProcessingOptions> = {}
): Promise<Result<ProcessedImage, string>> {
	// First validate the image
	const validation = await validateImage(file);
	if (!validation.ok) {
		return validation;
	}

	const processingOptions = { ...DEFAULT_PROCESSING_OPTIONS, ...options };

	try {
		const buffer = Buffer.from(await file.arrayBuffer());

		// Generate unique filename with timestamp and random suffix
		const timestamp = Date.now();
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const extension = processingOptions.format;
		const filename = `${timestamp}-${randomSuffix}.${extension}`;

		// Process the image with Sharp
		let sharpInstance = sharp(buffer)
			.resize(processingOptions.maxWidth, processingOptions.maxHeight, {
				fit: 'inside', // Maintain aspect ratio
				withoutEnlargement: true // Don't upscale smaller images
			});

		// Apply format-specific options
		switch (processingOptions.format) {
			case 'jpeg':
				sharpInstance = sharpInstance.jpeg({ quality: processingOptions.quality });
				break;
			case 'png':
				sharpInstance = sharpInstance.png({ quality: processingOptions.quality });
				break;
			case 'webp':
				sharpInstance = sharpInstance.webp({ quality: processingOptions.quality });
				break;
		}

		const processedBuffer = await sharpInstance.toBuffer();
		const mimeType = `image/${processingOptions.format}`;

		return ok({
			buffer: processedBuffer,
			filename,
			mimeType
		});
	} catch (error) {
		return err(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}