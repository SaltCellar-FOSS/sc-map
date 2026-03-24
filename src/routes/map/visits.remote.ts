import { query } from '$app/server';
import { z } from 'zod';
import { sql } from '$lib/db';
import { VisitsDao } from '$lib/server/dao/visits';

const visitsDao = new VisitsDao(sql);

export const getVisitsForPlace = query(z.coerce.bigint(), async (placeId) => {
	return visitsDao.listVisitsByPlaceWithUser(placeId);
});
