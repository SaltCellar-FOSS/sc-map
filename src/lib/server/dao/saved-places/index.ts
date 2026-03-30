import { type SQL, type TransactionSQL } from 'bun';
import {
	SavedPlaceSchema,
	type SavedPlace,
	type SavedPlaceInsert,
	type SavedPlaceUpdate
} from '$lib/schemas/saved-place';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';
import { BaseDao } from '../base';
import { NotFoundError } from '../errors';
import { UserNotFoundError } from '../users';

export { UserNotFoundError } from '../users';

export class SavedPlaceNotFoundError extends NotFoundError {
	constructor(id: string) {
		super('saved_places', id);
		this.name = 'SavedPlaceNotFoundError';
	}
}

export class DuplicateGooglePlaceIdError extends Error {}
export class InvalidPlaceTypeError extends Error {}

export class SavedPlacesDao extends BaseDao<SavedPlace, SavedPlaceInsert, SavedPlaceUpdate> {
	constructor(sql: SQL) {
		super({
			sql,
			tableName: 'saved_places',
			schema: SavedPlaceSchema,
			notFoundError: SavedPlaceNotFoundError
		});
	}

	protected getUniqueViolationFields(): Record<string, string> {
		return { google_place_id: 'google_place_id' };
	}

	protected getCheckConstraints(): Record<string, (value: unknown) => string> {
		return { type: (v) => `Invalid place type: ${v}` };
	}

	public async retrieveSavedPlace(placeId: bigint): Promise<SavedPlace> {
		return this.retrieve(placeId);
	}

	public async retrieveSavedPlaceByGooglePlaceId(googlePlaceId: string): Promise<SavedPlace> {
		const [result] = await this
			.sql`SELECT * FROM saved_places WHERE google_place_id = ${googlePlaceId}`;
		if (!result) throw new SavedPlaceNotFoundError(googlePlaceId);
		return SavedPlaceSchema.parse(result);
	}

	public async listSavedPlaces(): Promise<SavedPlace[]> {
		return this.list();
	}

	public async insertSavedPlace(
		placeInsert: SavedPlaceInsert,
		tx?: TransactionSQL
	): Promise<SavedPlace> {
		const db = tx ?? this.sql;
		try {
			const [result] = await db`INSERT INTO saved_places ${db(placeInsert)} RETURNING *`;
			return SavedPlaceSchema.parse(result);
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

	public async deleteSavedPlace(placeId: bigint, tx?: TransactionSQL): Promise<SavedPlace> {
		return this.delete(placeId, tx);
	}

	public async updateSavedPlace(
		placeId: bigint,
		placeUpdate: SavedPlaceUpdate,
		tx?: TransactionSQL
	): Promise<SavedPlace> {
		const db = tx ?? this.sql;
		try {
			const [result] =
				await db`UPDATE saved_places SET ${db(placeUpdate)} WHERE id = ${placeId} RETURNING *`;
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
		const results = await this.sql`
			SELECT * FROM saved_places
			WHERE to_tsvector('simple', name) @@ plainto_tsquery('simple', ${q})
		`;
		return results.map((row: unknown) => SavedPlaceSchema.parse(row));
	}

	public async countPins(): Promise<number> {
		const [result] = await this.sql`SELECT COUNT(*) AS count FROM saved_places`;
		return Number(result.count);
	}
}
