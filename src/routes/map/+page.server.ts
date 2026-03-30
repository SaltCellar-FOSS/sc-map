import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { sql } from '$lib/db';
import { SavedPlaceNotFoundError, SavedPlacesDao } from '$lib/server/dao/saved-places';
import { VisitNotFoundError, VisitsDao } from '$lib/server/dao/visits';
import { getGooglePlaceById } from '$lib/google-places';
import { isSavedPlaceType } from '$lib/schemas/saved-place';
import { verifySessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';
import { VisitInsertSchema, VisitUpdateSchema } from '$lib/schemas/visit.js';
import { processImage } from '$lib/image-processor';
import { saveImage, deleteImage } from '$lib/server/image-storage';

const savedPlacesDao = new SavedPlacesDao(sql);
const visitsDao = new VisitsDao(sql);

const VisitInsertWithoutPlaceSchema = VisitInsertSchema.omit({ place_id: true });

const EditableFieldsSchema = VisitUpdateSchema.pick({
	summary: true,
	visited_at: true
}).strict();

export const actions = {
	addVisit: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();

		const googlePlaceId = data.get('googlePlaceId')?.toString();

		if (!googlePlaceId) return fail(400, { error: 'Missing googlePlaceId' });

		const parseResult = VisitInsertWithoutPlaceSchema.safeParse({
			user_id: userId,
			summary: data.get('review')?.toString(),
			visited_at: data.get('visitDate')?.toString()
		});

		if (!parseResult.success) {
			return fail(400, {
				error: parseResult.error.issues[0]?.message ?? 'Invalid input'
			});
		}

		let visitId: bigint | undefined;

		await sql.begin(async (tx) => {
			let placeId: bigint;

			try {
				const existing = await savedPlacesDao.retrieveSavedPlaceByGooglePlaceId(googlePlaceId);

				placeId = existing.id;
			} catch (error) {
				if (!(error instanceof SavedPlaceNotFoundError)) {
					throw error;
				}

				const googlePlace = await getGooglePlaceById(googlePlaceId);
				if (!googlePlace) throw new Error(`Google place not found: ${googlePlaceId}`);

				const selectedType = data.get('selectedType')?.toString();
				if (!selectedType) {
					return fail(400, { error: 'Missing selectedType' });
				}
				if (!isSavedPlaceType(selectedType)) {
					return fail(400, { error: 'Received selectedType value was invalid.' });
				}

				const place = await savedPlacesDao.insertSavedPlace(
					{
						name: googlePlace.name,
						lat: googlePlace.geometry.location.lat,
						lng: googlePlace.geometry.location.lng,
						formatted_address: googlePlace.formatted_address,
						google_place_id: googlePlace.place_id,
						type: selectedType,
						submitted_by: userId
					},
					tx
				);
				placeId = place.id;
			}

			const visit = await visitsDao.insertVisit(
				{
					place_id: placeId,
					...parseResult.data
				},
				tx
			);
			visitId = visit.id;
		});

		// Handle image uploads after visit creation
		if (visitId) {
			// Server-side enforcement: max 3 photos per visit
			const imageFiles = (data.getAll('images') as File[]).slice(0, 3);
			for (const file of imageFiles) {
				if (!(file instanceof File) || file.size === 0) continue;

				const processedImage = await processImage(file);
				if (!processedImage.ok) {
					console.error('Failed to process image:', processedImage.error);
					continue;
				}

				const savedImage = await saveImage(processedImage.value.buffer, processedImage.value.filename);
				if (!savedImage.ok) {
					console.error('Failed to save image:', savedImage.error);
					continue;
				}

				try {
					await visitsDao.insertVisitPhoto(visitId, savedImage.value);
				} catch (error) {
					await deleteImage(savedImage.value);
					console.error('Failed to save image URL to database:', error);
				}
			}
		}

		return { success: true };
	},

	editVisit: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();

		const visitIdResult = z.coerce.bigint().safeParse(data.get('visitId')?.toString());
		if (!visitIdResult.success) return fail(400, { error: 'Invalid visitId' });
		const visitId = visitIdResult.data;

		let existing;
		try {
			existing = await visitsDao.retrieveVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		if (existing.user_id !== userId) return fail(401, { error: 'Unauthorized' });

		const parseResult = EditableFieldsSchema.safeParse({
			summary: data.get('summary')?.toString(),
			visited_at: data.get('visitDate')?.toString()
		});

		if (!parseResult.success) {
			return fail(400, { error: parseResult.error.issues[0]?.message ?? 'Invalid input' });
		}

		await visitsDao.updateVisit(visitId, parseResult.data);

		return { success: true };
	},

	editPlace: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();

		const placeIdResult = z.coerce.bigint().safeParse(data.get('placeId')?.toString());
		if (!placeIdResult.success) return fail(400, { error: 'Invalid placeId' });
		const placeId = placeIdResult.data;

		try {
			await savedPlacesDao.retrieveSavedPlace(placeId);
		} catch (e) {
			if (e instanceof SavedPlaceNotFoundError) return fail(404, { error: 'Place not found' });
			throw e;
		}

		const type = data.get('type')?.toString();
		if (!type) return fail(400, { error: 'Missing type' });
		if (!isSavedPlaceType(type)) return fail(400, { error: 'Invalid type' });

		await savedPlacesDao.updateSavedPlace(placeId, { type });

		return { success: true };
	},

	deleteVisit: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();

		const visitIdResult = z.coerce.bigint().safeParse(data.get('visitId')?.toString());
		if (!visitIdResult.success) return fail(400, { error: 'Invalid visitId' });
		const visitId = visitIdResult.data;

		let existing;
		try {
			existing = await visitsDao.retrieveVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		if (existing.user_id !== userId) return fail(403, { error: 'Forbidden' });

		// Capture photo URLs before deletion so we can clean up files afterward
		const photoUrls = await visitsDao.listVisitPhotos(visitId);

		try {
			await visitsDao.deleteVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		// Delete image files after DB deletion succeeds (DB rows are cascade-deleted)
		for (const url of photoUrls) {
			const result = await deleteImage(url);
			if (!result.ok) {
				console.error('Failed to delete image file during visit deletion:', result.error);
			}
		}

		return { success: true };
	},

	uploadPhoto: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();

		const visitIdResult = z.coerce.bigint().optional().safeParse(data.get('visitId')?.toString());
		if (!visitIdResult.success) return fail(400, { error: 'Invalid visitId' });
		const visitId = visitIdResult.data;

		if (!visitId) {
			return fail(400, { error: 'visitId is required for photo uploads' });
		}

		// Verify the user owns this visit
		let visit;
		try {
			visit = await visitsDao.retrieveVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		if (visit.user_id !== userId) return fail(403, { error: 'Forbidden' });

		// Check current photo count
		const currentPhotos = await visitsDao.listVisitPhotos(visitId);
		if (currentPhotos.length >= 3) {
			return fail(400, { error: 'Maximum 3 photos allowed per visit' });
		}

		// Get the uploaded file
		const file = data.get('images') as File;
		if (!file || !(file instanceof File)) {
			return fail(400, { error: 'No file uploaded' });
		}

		// Process the image
		const processedImage = await processImage(file);
		if (!processedImage.ok) {
			return fail(400, { error: processedImage.error });
		}

		// Save the image to disk
		const savedImage = await saveImage(processedImage.value.buffer, processedImage.value.filename);
		if (!savedImage.ok) {
			return fail(500, { error: savedImage.error });
		}

		// Save the URL to the database
		try {
			await visitsDao.insertVisitPhoto(visitId, savedImage.value);
		} catch (error) {
			await deleteImage(savedImage.value);
			throw error;
		}

		return { success: true, imageUrl: savedImage.value };
	},

	deletePhoto: async ({ request, cookies }) => {
		const cookie = cookies.get(SESSION_COOKIE_NAME);
		if (!cookie) return fail(401, { error: 'Unauthorized' });

		const userId = await verifySessionCookie(cookie);
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();

		const visitIdResult = z.coerce.bigint().safeParse(data.get('visitId')?.toString());
		if (!visitIdResult.success) return fail(400, { error: 'Invalid visitId' });
		const visitId = visitIdResult.data;

		const imageUrl = data.get('imageUrl')?.toString();
		if (!imageUrl) return fail(400, { error: 'Missing imageUrl' });

		// Verify the user owns this visit
		let visit;
		try {
			visit = await visitsDao.retrieveVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		if (visit.user_id !== userId) return fail(403, { error: 'Forbidden' });

		// Check if the image belongs to this visit
		const visitPhotos = await visitsDao.listVisitPhotos(visitId);
		if (!visitPhotos.includes(imageUrl)) {
			return fail(404, { error: 'Image not found for this visit' });
		}

		// Delete from database first
		await visitsDao.deleteVisitPhoto(visitId, imageUrl);

		// Then delete from file system
		const deleteResult = await deleteImage(imageUrl);
		if (!deleteResult.ok) {
			console.error('Failed to delete image file:', deleteResult.error);
		}

		return { success: true };
	}
};
