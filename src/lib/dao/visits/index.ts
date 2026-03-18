import { type SQL, type TransactionSQL } from 'bun';
import { VisitSchema, type Visit, type VisitInsert, type VisitUpdate } from './types';
import { isPostgresError } from '$lib/db/utils';

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

	public async insertVisit(visitInsert: VisitInsert, tx?: TransactionSQL): Promise<Visit> {
		const sql = tx ?? this.sql;
		try {
			const [result] = await sql`INSERT INTO visits ${sql(visitInsert)} RETURNING *`;
			return VisitSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === '23505') throw new DuplicateVisitError();
				if (e.errno === '23514') throw new InvalidRatingError();
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
				if (e.errno === '23505') throw new DuplicateVisitError();
				if (e.errno === '23514') throw new InvalidRatingError();
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
