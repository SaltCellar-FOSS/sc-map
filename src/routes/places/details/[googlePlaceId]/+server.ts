import { getPlaceDetails } from '$lib/server/google-places';
import { verifySessionCookie } from '$lib/server/cookie';
import { jsonResponse, errorResponse } from '$lib/server/response';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const sessionCookie = cookies.get('session');
	const userId = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
	if (!userId) return errorResponse('Unauthorized', 401);

	const details = await getPlaceDetails(params.googlePlaceId!);
	return jsonResponse(details);
};
