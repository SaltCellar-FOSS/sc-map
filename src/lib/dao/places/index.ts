import { type SQL, type TransactionSQL } from 'bun';
import { PlaceSchema, type Place, type PlaceInsert, type PlaceUpdate } from './types';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';

export class DuplicateGooglePlaceIdError extends Error {}
export class InvalidPlaceTypeError extends Error {}
export class UserNotFoundError extends Error {}
export class PlaceNotFoundError extends Error {}

export type InsertPlaceError =
	| DuplicateGooglePlaceIdError
	| InvalidPlaceTypeError
	| UserNotFoundError;

export type DeletePlaceError = PlaceNotFoundError;
export type UpdatePlaceError = PlaceNotFoundError | InvalidPlaceTypeError | UserNotFoundError;

export class PlacesDao {
	constructor(private readonly sql: SQL) {}

	public async retrievePlace(placeId: bigint) {
		const [result] = await this.sql`SELECT * FROM places WHERE id=${placeId}`;

		if (!result) throw new PlaceNotFoundError(String(placeId));

		return PlaceSchema.parse(result);
	}

	public async listPlaces() {
		const results: unknown[] = await this.sql`
        SELECT * FROM places;
    `;
		return results.map((row: unknown) => PlaceSchema.parse(row));
	}

	public async insertPlace(placeInsert: PlaceInsert, tx?: TransactionSQL): Promise<Place> {
		const sql = tx ?? this.sql;

		try {
			const [result]: unknown[] = await sql`
	            INSERT INTO places ${sql(placeInsert)}
	            RETURNING *
	        `;
			return PlaceSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === PG_ERRORS.UNIQUE_VIOLATION)
					throw new DuplicateGooglePlaceIdError(placeInsert.google_place_id);
				if (e.errno === PG_ERRORS.CHECK_VIOLATION)
					throw new InvalidPlaceTypeError(placeInsert.type);
				if (e.errno === PG_ERRORS.FOREIGN_KEY_VIOLATION)
					throw new UserNotFoundError(String(placeInsert.submitted_by));
			}
			throw e;
		}
	}

	public async deletePlace(placeId: bigint, tx?: TransactionSQL): Promise<Place> {
		const sql = tx ?? this.sql;

		const [result] = await sql`DELETE FROM places WHERE id=${placeId} RETURNING *`;
		if (!result) throw new PlaceNotFoundError(String(placeId));
		return PlaceSchema.parse(result);
	}

	public async updatePlace(
		placeId: bigint,
		placeUpdate: PlaceUpdate,
		tx?: TransactionSQL
	): Promise<Place> {
		const sql = tx ?? this.sql;

		try {
			const [result] =
				await sql`UPDATE places SET ${sql(placeUpdate)} WHERE id = ${placeId} RETURNING *`;
			if (!result) throw new PlaceNotFoundError(String(placeId));
			return PlaceSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === PG_ERRORS.CHECK_VIOLATION)
					throw new InvalidPlaceTypeError(String(placeUpdate.type));
				if (e.errno === PG_ERRORS.FOREIGN_KEY_VIOLATION)
					throw new UserNotFoundError(String(placeUpdate.submitted_by));
			}
			throw e;
		}
	}

	public async searchPlaces(q: string): Promise<Place[]> {
		const results: unknown[] = await this.sql`
			SELECT * FROM places
			WHERE to_tsvector('simple', name) @@ plainto_tsquery('simple', ${q})
		`;
		return results.map((row: unknown) => PlaceSchema.parse(row));
	}
}
