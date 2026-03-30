import { type SQL, type TransactionSQL } from 'bun';
import {
	VisitSchema,
	VisitWithUserSchema,
	type Visit,
	type VisitWithUser,
	type VisitInsert,
	type VisitUpdate
} from '$lib/schemas/visit';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';
import { BaseDao } from '../base';
import { NotFoundError } from '../errors';

export class VisitNotFoundError extends NotFoundError {
	constructor(id: string) {
		super('visits', id);
		this.name = 'VisitNotFoundError';
	}
}

export class DuplicateVisitError extends Error {}

export class VisitsDao extends BaseDao<Visit, VisitInsert, VisitUpdate> {
	constructor(sql: SQL) {
		super({
			sql,
			tableName: 'visits',
			schema: VisitSchema,
			notFoundError: VisitNotFoundError
		});
	}

	protected getUniqueViolationFields(): Record<string, string> {
		return {};
	}

	protected getCheckConstraints(): Record<string, (value: unknown) => string> {
		return {};
	}

	public async retrieveVisit(visitId: bigint): Promise<Visit> {
		return this.retrieve(visitId);
	}

	public async listVisits(): Promise<Visit[]> {
		return this.list();
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
		const db = tx ?? this.sql;
		try {
			const [result] = await db`INSERT INTO visits ${db(visitInsert)} RETURNING *`;
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
		return this.update(visitId, visitUpdate, tx);
	}

	public async deleteVisit(visitId: bigint, tx?: TransactionSQL): Promise<Visit> {
		return this.delete(visitId, tx);
	}

	public async countContributors(): Promise<number> {
		const [result] = await this.sql`SELECT COUNT(DISTINCT user_id) AS count FROM visits`;
		return Number(result.count);
	}
}
