import type { RequestHandler } from './$types';
import { VisitsDao } from '$lib/dao/visits';
import { sql } from '$lib/db';
import { jsonResponse } from '$lib/server/response';

const visitsDao = new VisitsDao(sql);

export const GET: RequestHandler = async ({ params }) => {
	const placeId = BigInt(params.placeId);
	const visits = await visitsDao.listVisitsByPlaceWithUser(placeId);
	return jsonResponse(visits);
};
