import z from 'zod';
import type { RequestHandler } from './$types';
import {
	SavedPlacesDao,
	DuplicateGooglePlaceIdError,
	InvalidPlaceTypeError
} from '$lib/dao/saved-places';
import { SavedPlaceSchema } from '$lib/dao/saved-places/types';
import { VisitsDao } from '$lib/dao/visits';
import { sql } from '$lib/db';
import { getGooglePlaceById, inferPlaceType } from '$lib/server/google-places';
import { verifySessionCookie } from '$lib/server/cookie';
import { jsonResponse, errorResponse } from '$lib/server/response';

const placesDao = new SavedPlacesDao(sql);
const visitsDao = new VisitsDao(sql);

const CreatePlacePayloadSchema = z.object({
	googlePlaceId: SavedPlaceSchema.shape['google_place_id'],
	visit: z.object({
		rating: z.coerce.number().min(1).max(5),
		review: z.string().min(1),
		visitDate: z.iso.date().optional(),
		photos: z
			.file()
			.refine((f) => f.size < 5_000_000, 'Max 5MB per photo')
			.refine((f) => f.type.startsWith('image/'), 'Must be an image')
			.array()
			.max(10, 'Maximum 10 photos')
	})
});

export type CreatePlacePayload = z.infer<typeof CreatePlacePayloadSchema>;

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const sessionCookie = cookies.get('session');
	const userId = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
	if (!userId) return errorResponse('Unauthorized', 401);

	const formData = await request.formData();
	const parsed = CreatePlacePayloadSchema.safeParse({
		googlePlaceId: formData.get('googlePlaceId'),
		visit: {
			rating: formData.get('rating'),
			review: formData.get('review'),
			visitDate: formData.get('visitDate') ?? undefined,
			photos: formData.getAll('photos')
		}
	});
	if (!parsed.success) return errorResponse(z.prettifyError(parsed.error), 422);

	const { googlePlaceId } = params;

	const googlePlace = await getGooglePlaceById(googlePlaceId);
	if (!googlePlace) return errorResponse('Google place not found', 404);

	const type = inferPlaceType(googlePlace.types);
	if (!type)
		return errorResponse('Place type could not be mapped to RESTAURANT, BAR, or BAKERY', 422);

	const { visit } = parsed.data;

	try {
		const { place, insertedVisit } = await sql.begin(async (tx) => {
			const place = await placesDao.insertSavedPlace(
				{
					name: googlePlace.name,
					lat: googlePlace.geometry.location.lat,
					lng: googlePlace.geometry.location.lng,
					formatted_address: googlePlace.formatted_address,
					google_place_id: googlePlace.place_id,
					type,
					submitted_by: userId
				},
				tx
			);

			const insertedVisit = await visitsDao.insertVisit(
				{
					place_id: place.id,
					user_id: userId,
					rating: visit.rating,
					summary: visit.review,
					visited_at: visit.visitDate ?? new Date().toISOString().slice(0, 10)
				},
				tx
			);

			return { place, insertedVisit };
		});

		return jsonResponse({ place, visit: insertedVisit }, 201);
	} catch (e) {
		if (e instanceof DuplicateGooglePlaceIdError) return errorResponse('Place already exists', 409);
		if (e instanceof InvalidPlaceTypeError) return errorResponse('Invalid place type', 422);
		throw e;
	}
};
