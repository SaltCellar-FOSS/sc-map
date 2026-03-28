import { type SQL, type TransactionSQL } from 'bun';
import {
	VisitSchema,
	VisitWithUserSchema,
	type Visit,
	type VisitWithUser,
	type VisitInsert,
	type VisitUpdate
} from '../../../schemas/visit';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';

export class VisitNotFoundError extends Error {}
export class DuplicateVisitError extends Error {}

export class VisitsDao {
	constructor(private readonly sql: SQL) {}

	public async retrieveVisit(visitId: bigint): Promise<Visit> {
		const [result] = await this.sql`SELECT * FROM visits WHERE id = ${visitId}`;
		if (!result) throw new VisitNotFoundError(String(visitId));
		return VisitSchema.parse(result);
	}

	public async listVisits(): Promise<Visit[]> {
		const results = await this.sql`SELECT * FROM visits`;
		return results.map((row: unknown) => VisitSchema.parse(row));
	}

	public async listVisitsByUser(userId: bigint): Promise<Visit[]> {
		const results = await this.sql`SELECT * FROM visits WHERE user_id = ${userId}`;
		return results.map((row: unknown) => VisitSchema.parse(row));
	}

	public async listVisitsByPlace(placeId: bigint): Promise<Visit[]> {
		const results = await this.sql`SELECT * FROM visits WHERE place_id = ${placeId}`;
		return results.map((row: unknown) => VisitSchema.parse(row));
	}

	public async listVisitsByPlaceWithUser(placeId: bigint): Promise<VisitWithUser[]> {
		const results = await this.sql`
			SELECT
				v.*,
				u.discord_handle,
				u.avatar_url,
				COALESCE(ARRAY_AGG(vp.url) FILTER (WHERE vp.url IS NOT NULL), ARRAY[]::TEXT[]) AS photo_urls
			FROM visits v
			JOIN users u ON u.id = v.user_id
			LEFT JOIN visit_photos vp ON vp.visit_id = v.id
			WHERE v.place_id = ${placeId}
			GROUP BY v.id, u.discord_handle, u.avatar_url
		`;
		return results.map((row: unknown) => VisitWithUserSchema.parse(row));
	}

	public async insertVisit(visitInsert: VisitInsert, tx?: TransactionSQL): Promise<Visit> {
		const sql = tx ?? this.sql;
		try {
			const [result] = await sql`INSERT INTO visits ${sql(visitInsert)} RETURNING *`;
			return VisitSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === PG_ERRORS.UNIQUE_VIOLATION) throw new DuplicateVisitError();
			}
			throw e;
		}
	}

	public async updateVisit(
		visitId: bigint,
		visitUpdate: VisitUpdate,
		tx?: TransactionSQL
	): Promise<Visit> {
		const sql = tx ?? this.sql;
		try {
			const [result] =
				await sql`UPDATE visits SET ${sql(visitUpdate)} WHERE id = ${visitId} RETURNING *`;
			if (!result) throw new VisitNotFoundError(String(visitId));
			return VisitSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === PG_ERRORS.UNIQUE_VIOLATION) throw new DuplicateVisitError();
			}
			throw e;
		}
	}

	public async deleteVisit(visitId: bigint, tx?: TransactionSQL): Promise<Visit> {
		const sql = tx ?? this.sql;
		const [result] = await sql`DELETE FROM visits WHERE id = ${visitId} RETURNING *`;
		if (!result) throw new VisitNotFoundError(String(visitId));
		return VisitSchema.parse(result);
	}

	public async countContributors(): Promise<number> {
		const [result] = await this.sql`SELECT COUNT(DISTINCT user_id) AS count FROM visits`;
		return Number(result.count);
	}

	public async insertVisitPhoto(visitId: bigint, url: string): Promise<void> {
		await this.sql`INSERT INTO visit_photos (visit_id, url) VALUES (${visitId}, ${url})`;
	}

	public async deleteVisitPhoto(visitId: bigint, url: string): Promise<void> {
		await this.sql`DELETE FROM visit_photos WHERE visit_id = ${visitId} AND url = ${url}`;
	}

	public async listVisitPhotos(visitId: bigint): Promise<string[]> {
		const results = await this.sql`SELECT url FROM visit_photos WHERE visit_id = ${visitId} ORDER BY created_at`;
		return results.map((row: { url: string }) => row.url);
	}
}
