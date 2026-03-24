import type { RequestHandler } from './$types';
import { VisitsDao } from '$lib/dao/visits';
import { sql } from '$lib/db';
import { errorResponse, jsonResponse } from '$lib/server/response';
import { verifySessionCookie, SESSION_COOKIE_NAME } from '$lib/server/cookie';

const visitsDao = new VisitsDao(sql);

export const GET: RequestHandler = async ({ params, cookies }) => {
	const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
	const userId = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
	if (!userId) return errorResponse('Unauthorized', 401);
	const placeId = BigInt(params.placeId);
	const visits = await visitsDao.listVisitsByPlaceWithUser(placeId);
	return jsonResponse(visits);
};
