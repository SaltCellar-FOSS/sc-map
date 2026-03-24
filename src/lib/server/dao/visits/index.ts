import { type SQL, type TransactionSQL } from 'bun';
import {
	VisitSchema,
	VisitWithUserSchema,
	type Visit,
	type VisitWithUser,
	type VisitInsert,
	type VisitUpdate
} from './types';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';

export class VisitNotFoundError extends Error {}
export class DuplicateVisitError extends Error {}
export class InvalidRatingError extends Error {}

export type InsertVisitError = DuplicateVisitError | InvalidRatingError;
export type UpdateVisitError = VisitNotFoundError | DuplicateVisitError | InvalidRatingError;
export type DeleteVisitError = VisitNotFoundError;

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
				if (e.errno === PG_ERRORS.CHECK_VIOLATION) throw new InvalidRatingError();
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
				if (e.errno === PG_ERRORS.CHECK_VIOLATION) throw new InvalidRatingError();
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
}
