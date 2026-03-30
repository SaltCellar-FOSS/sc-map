import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { sql } from '$lib/db';
import { SavedPlaceNotFoundError, SavedPlacesDao } from '$lib/server/dao/saved-places';
import { VisitNotFoundError, VisitsDao } from '$lib/server/dao/visits';
import { getGooglePlaceById } from '$lib/google-places';
import { isSavedPlaceType } from '$lib/schemas/saved-place';
import { VisitInsertSchema, VisitUpdateSchema } from '$lib/schemas/visit.js';
import { requireAuth, requireActiveUser, requireOwnership, AuthError } from '$lib/server/guards';

const savedPlacesDao = new SavedPlacesDao(sql);
const visitsDao = new VisitsDao(sql);

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

			await visitsDao.insertVisit(
				{
					place_id: placeId,
					...parseResult.data
				},
				tx
			);
		});

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

		try {
			await visitsDao.deleteVisit(visitId);
		} catch (e) {
			if (e instanceof VisitNotFoundError) return fail(404, { error: 'Visit not found' });
			throw e;
		}

		return { success: true };
	}
};
