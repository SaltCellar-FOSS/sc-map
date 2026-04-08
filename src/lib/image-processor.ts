import sharp from 'sharp';
import { Result } from './result';

interface ImageProcessingOptions {
	maxWidth: number;
	maxHeight: number;
	quality: number;
	format: 'jpeg' | 'png' | 'webp';
}

interface ProcessedImage {
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
export async function validateImage(file: File): Promise<Result<void, Error>> {
	if (file.size > MAX_FILE_SIZE) {
		return Result.failure(
			new Error(
				`File size ${file.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`
			)
		);
	}

	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return Result.failure(
			new Error(
				`File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
			)
		);
	}

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		const metadata = await sharp(buffer).metadata();

		if (!metadata.width || !metadata.height) {
			return Result.failure(new Error('Invalid image file: could not determine dimensions'));
		}

		if (metadata.width > 10000 || metadata.height > 10000) {
			return Result.failure(new Error('Image dimensions too large (max 10000x10000 pixels)'));
		}
	} catch (error) {
		return Result.failure(
			new Error(`Invalid image file: ${error instanceof Error ? error.message : 'Unknown error'}`)
		);
	}

	return Result.success();
}

/**
 * Processes an image file: validates, resizes, and converts format
 */
export async function processImage(
	file: File,
	options: Partial<ImageProcessingOptions> = {}
): Promise<Result<ProcessedImage, Error>> {
	// validateImage is PromiseLike — it rejects (throws) on failure, resolves on success
	try {
		await validateImage(file);
	} catch (e) {
		return Result.failure(e instanceof Error ? e : new Error(String(e)));
	}

	const processingOptions = { ...DEFAULT_PROCESSING_OPTIONS, ...options };

	try {
		const buffer = Buffer.from(await file.arrayBuffer());

		const timestamp = Date.now();
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const extension = processingOptions.format;
		const filename = `${timestamp}-${randomSuffix}.${extension}`;

		let sharpInstance = sharp(buffer)
			.rotate()
			.resize(processingOptions.maxWidth, processingOptions.maxHeight, {
				fit: 'inside',
				withoutEnlargement: true
			});

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

		return Result.success({ buffer: processedBuffer, filename, mimeType });
	} catch (error) {
		return Result.failure(
			new Error(
				`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			)
		);
	}
}
