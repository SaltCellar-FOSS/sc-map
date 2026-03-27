import { type SQL, type TransactionSQL } from 'bun';
import {
	SavedPlaceSchema,
	type SavedPlace,
	type SavedPlaceInsert,
	type SavedPlaceUpdate
} from '$lib/schemas/saved-place';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';

export class DuplicateExternalPlaceIdError extends Error {}
export class InvalidPlaceTypeError extends Error {}
export class UserNotFoundError extends Error {}
export class SavedPlaceNotFoundError extends Error {}

export type InsertSavedPlaceError =
	| DuplicateExternalPlaceIdError
	| InvalidPlaceTypeError
	| UserNotFoundError;

export type DeleteSavedPlaceError = SavedPlaceNotFoundError;
export type UpdateSavedPlaceError =
	| SavedPlaceNotFoundError
	| InvalidPlaceTypeError
	| UserNotFoundError;

export class SavedPlacesDao {
	constructor(private readonly sql: SQL) {}

	public async retrieveSavedPlace(placeId: bigint) {
		const [result] = await this.sql`SELECT * FROM saved_places WHERE id=${placeId}`;

		if (!result) throw new SavedPlaceNotFoundError(String(placeId));

		return SavedPlaceSchema.parse(result);
	}

	public async retrieveSavedPlaceByOsmPlaceId(osmPlaceId: string) {
		const [result] = await this
			.sql`SELECT * FROM saved_places WHERE osm_place_id = ${osmPlaceId}`;

		if (!result) {
			throw new SavedPlaceNotFoundError(osmPlaceId);
		}

		return SavedPlaceSchema.parse(result);
	}

	public async retrieveSavedPlaceByExternalId(externalId: string) {
		const [result] = await this.sql`
			SELECT * FROM saved_places
			WHERE osm_place_id = ${externalId} OR google_place_id = ${externalId}
		`;

		if (!result) {
			throw new SavedPlaceNotFoundError(externalId);
		}

		return SavedPlaceSchema.parse(result);
	}

	public async listSavedPlaces() {
		const results: unknown[] = await this.sql`
        SELECT * FROM saved_places;
    `;
		return results.map((row: unknown) => SavedPlaceSchema.parse(row));
	}

	public async insertSavedPlace(
		placeInsert: SavedPlaceInsert,
		tx?: TransactionSQL
	): Promise<SavedPlace> {
		const sql = tx ?? this.sql;

		try {
			const [result]: unknown[] = await sql`
	            INSERT INTO saved_places ${sql(placeInsert)}
	            RETURNING *
	        `;
			return SavedPlaceSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === PG_ERRORS.UNIQUE_VIOLATION)
					throw new DuplicateExternalPlaceIdError(
						placeInsert.osm_place_id ?? placeInsert.google_place_id ?? ''
					);
				if (e.errno === PG_ERRORS.CHECK_VIOLATION)
					throw new InvalidPlaceTypeError(placeInsert.type);
				if (e.errno === PG_ERRORS.FOREIGN_KEY_VIOLATION)
					throw new UserNotFoundError(String(placeInsert.submitted_by));
			}
			throw e;
		}
	}

	public async deleteSavedPlace(placeId: bigint, tx?: TransactionSQL): Promise<SavedPlace> {
		const sql = tx ?? this.sql;

		const [result] = await sql`DELETE FROM saved_places WHERE id=${placeId} RETURNING *`;
		if (!result) throw new SavedPlaceNotFoundError(String(placeId));
		return SavedPlaceSchema.parse(result);
	}

	public async updateSavedPlace(
		placeId: bigint,
		placeUpdate: SavedPlaceUpdate,
		tx?: TransactionSQL
	): Promise<SavedPlace> {
		const sql = tx ?? this.sql;

		try {
			const [result] =
				await sql`UPDATE saved_places SET ${sql(placeUpdate)} WHERE id = ${placeId} RETURNING *`;
			if (!result) throw new SavedPlaceNotFoundError(String(placeId));
			return SavedPlaceSchema.parse(result);
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

	public async searchSavedPlaces(q: string): Promise<SavedPlace[]> {
		const results: unknown[] = await this.sql`
			SELECT * FROM saved_places
			WHERE to_tsvector('simple', name) @@ plainto_tsquery('simple', ${q})
		`;
		return results.map((row: unknown) => SavedPlaceSchema.parse(row));
	}
}
