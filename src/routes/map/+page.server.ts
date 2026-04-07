import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { sql } from '$lib/db';
import { SavedPlaceNotFoundError, SavedPlacesDao } from '$lib/server/dao/saved-places';
import { VisitNotFoundError, VisitsDao } from '$lib/server/dao/visits';
import { getGooglePlaceById } from '$lib/google-places';
import { isSavedPlaceType } from '$lib/schemas/saved-place';
import { VisitInsertSchema, VisitUpdateSchema } from '$lib/schemas/visit.js';
import { processImage } from '$lib/image-processor';
import { saveImage, deleteImage } from '$lib/server/image-storage';
import { requireAuth, requireActiveUser, requireOwnership, AuthError } from '$lib/server/guards';

const savedPlacesDao = new SavedPlacesDao(sql);
const visitsDao = new VisitsDao(sql);

class InvalidPlaceTypeError extends Error {
	constructor() {
		super('Missing or invalid selectedType');
		this.name = 'InvalidPlaceTypeError';
	}
}

const VisitInsertWithoutPlaceSchema = VisitInsertSchema.omit({ place_id: true });

const EditableFieldsSchema = VisitUpdateSchema.pick({
	summary: true,
	visited_at: true
}).strict();

export const actions: Actions = {
	addVisit: async ({ request, cookies }) => {
		let userId: bigint;
		try {
			userId = await requireAuth(cookies);
			await requireActiveUser(userId);
		} catch (e) {
			if (e instanceof AuthError) return fail(e.status, { error: e.message });
			throw e;
		}

		const data = await request.formData();

		const googlePlaceId = data.get('googlePlaceId')?.toString();

		if (!googlePlaceId) return fail(400, { error: 'Missing googlePlaceId' });

		const parseResult = VisitInsertWithoutPlaceSchema.safeParse({
			user_id: userId,
			summary: data.get('summary')?.toString(),
			visited_at: data.get('visitDate')?.toString()
		});

		if (!parseResult.success) {
			return fail(400, {
				error: parseResult.error.issues[0]?.message ?? 'Invalid input'
			});
		}

		let visitId: bigint | undefined;

		try {
			await sql.begin(async (tx) => {
				let placeId: bigint;

				try {
					const existing = await savedPlacesDao.retrieveSavedPlaceByGooglePlaceId(googlePlaceId);
					placeId = existing.id;
				} catch (error) {
					if (!(error instanceof SavedPlaceNotFoundError)) throw error;

					const googlePlace = await getGooglePlaceById(googlePlaceId);
					if (!googlePlace) throw new Error(`Google place not found: ${googlePlaceId}`);

					// selectedType is only required when creating a new place
					const rawSelectedType = data.get('selectedType')?.toString() ?? '';
					if (!isSavedPlaceType(rawSelectedType)) throw new InvalidPlaceTypeError();

					const place = await savedPlacesDao.insertSavedPlace(
						{
							name: googlePlace.name,
							lat: googlePlace.geometry.location.lat,
							lng: googlePlace.geometry.location.lng,
							formatted_address: googlePlace.formatted_address,
							google_place_id: googlePlace.place_id,
							type: rawSelectedType,
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
		} catch (e) {
			if (e instanceof InvalidPlaceTypeError) return fail(400, { error: e.message });
			throw e;
		}

		// Handle image uploads after visit creation
		// Result values are awaitable (PromiseLike): success resolves, failure rejects
		if (visitId) {
			// Server-side enforcement: max 4 photos per visit
			const imageFiles = (data.getAll('images') as File[]).slice(0, 4);
			for (const file of imageFiles) {
				if (!(file instanceof File) || file.size === 0) continue;

				try {
					const processed = await processImage(file);
					const url = await saveImage(processed.buffer, processed.filename);
					await visitsDao.insertVisitPhoto(visitId, url);
				} catch (e) {
					console.error('Failed to process/save image:', e instanceof Error ? e.message : e);
				}
			}
		}

		return { success: true };
	},

	editVisit: async ({ request, cookies }) => {
		let userId: bigint;
		try {
			userId = await requireAuth(cookies);
		} catch (e) {
			if (e instanceof AuthError) return fail(e.status, { error: e.message });
			throw e;
		}

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

		const ownershipResult = requireOwnership(userId, (v) => v.user_id, existing);
		if (!ownershipResult.ok) return fail(403, { error: ownershipResult.error.message });

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
		let userId: bigint;
		try {
			userId = await requireAuth(cookies);
			await requireActiveUser(userId);
		} catch (e) {
			if (e instanceof AuthError) return fail(e.status, { error: e.message });
			throw e;
		}

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
		let userId: bigint;
		try {
			userId = await requireAuth(cookies);
		} catch (e) {
			if (e instanceof AuthError) return fail(e.status, { error: e.message });
			throw e;
		}

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

		const ownershipResult = requireOwnership(userId, (v) => v.user_id, existing);
		if (!ownershipResult.ok) return fail(403, { error: ownershipResult.error.message });

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
			try {
				await deleteImage(url);
			} catch (e) {
				console.error(
					'Failed to delete image file during visit deletion:',
					e instanceof Error ? e.message : e
				);
			}
		}

		return { success: true };
	},

	uploadPhoto: async ({ request, cookies }) => {
		let userId: bigint;
		try {
			userId = await requireAuth(cookies);
		} catch (e) {
			if (e instanceof AuthError) return fail(e.status, { error: e.message });
			throw e;
		}

		const data = await request.formData();

		const visitIdResult = z.coerce.bigint().optional().safeParse(data.get('visitId')?.toString());
		if (!visitIdResult.success) return fail(400, { error: 'Invalid visitId' });
		const visitId = visitIdResult.data;

		if (!visitId) {
			return fail(400, { error: 'visitId is required for photo uploads' });
		}

		let visit;
		try {
			visit = await visitsDao.retrieveVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		const ownershipResult = requireOwnership(userId, (v) => v.user_id, visit);
		if (!ownershipResult.ok) return fail(403, { error: ownershipResult.error.message });

		// Check current photo count
		const currentPhotos = await visitsDao.listVisitPhotos(visitId);
		if (currentPhotos.length >= 4) {
			return fail(400, { error: 'Maximum 4 photos allowed per visit' });
		}

		const file = data.get('images') as File;
		if (!file || !(file instanceof File)) {
			return fail(400, { error: 'No file uploaded' });
		}

		let imageUrl: string;
		try {
			const processed = await processImage(file);
			imageUrl = await saveImage(processed.buffer, processed.filename);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Image processing failed';
			return fail(400, { error: message });
		}

		try {
			await visitsDao.insertVisitPhoto(visitId, imageUrl);
		} catch (e) {
			// DB insert failed — clean up the saved file
			try {
				await deleteImage(imageUrl);
			} catch {
				/* best-effort */
			}
			throw e;
		}

		return { success: true, imageUrl };
	},

	deletePhoto: async ({ request, cookies }) => {
		let userId: bigint;
		try {
			userId = await requireAuth(cookies);
		} catch (e) {
			if (e instanceof AuthError) return fail(e.status, { error: e.message });
			throw e;
		}

		const data = await request.formData();

		const visitIdResult = z.coerce.bigint().safeParse(data.get('visitId')?.toString());
		if (!visitIdResult.success) return fail(400, { error: 'Invalid visitId' });
		const visitId = visitIdResult.data;

		const imageUrl = data.get('imageUrl')?.toString();
		if (!imageUrl) return fail(400, { error: 'Missing imageUrl' });

		let visit;
		try {
			visit = await visitsDao.retrieveVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		const ownershipResult = requireOwnership(userId, (v) => v.user_id, visit);
		if (!ownershipResult.ok) return fail(403, { error: ownershipResult.error.message });

		const visitPhotos = await visitsDao.listVisitPhotos(visitId);
		if (!visitPhotos.includes(imageUrl)) {
			return fail(404, { error: 'Image not found for this visit' });
		}

		await visitsDao.deleteVisitPhoto(visitId, imageUrl);

		try {
			await deleteImage(imageUrl);
		} catch (e) {
			console.error('Failed to delete image file:', e instanceof Error ? e.message : e);
		}

		return { success: true };
	},

	deletePlace: async ({ request, cookies }) => {
		try {
			await requireAuth(cookies);
		} catch (e) {
			if (e instanceof AuthError) return fail(e.status, { error: e.message });
			throw e;
		}

		const data = await request.formData();

		const placeIdResult = z.coerce.bigint().safeParse(data.get('placeId')?.toString());

		if (!placeIdResult.success) {
			return fail(400, { error: 'Invalid placeId' });
		}

		const placeId = placeIdResult.data;

		try {
			await savedPlacesDao.retrieveSavedPlace(placeId);
			const visits = await visitsDao.listVisitsByPlace(placeId);
			if (visits.length > 0) {
				return fail(400, { error: 'Cannot delete a saved place with attached visits' });
			}
		} catch (e) {
			if (e instanceof SavedPlaceNotFoundError) return fail(404, { error: 'Place not found' });
			throw e;
		}

		try {
			await savedPlacesDao.deleteSavedPlace(placeId);
		} catch (e) {
			if (e instanceof SavedPlaceNotFoundError) return fail(404, { error: 'Place not found' });
			throw e;
		}
	}
};
