import { type SQL, type TransactionSQL } from 'bun';
import { type ZodSchema } from 'zod';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';
import { NotFoundError, DuplicateError, ForeignKeyError, CheckViolationError } from './errors';

interface BaseDaoConfig<T> {
	sql: SQL;
	tableName: string;
	schema: ZodSchema<T>;
	notFoundError: new (entity: string, id: string) => NotFoundError;
}

export abstract class BaseDao<T, TInsert, TUpdate> {
	protected readonly sql: SQL;
	protected readonly tableName: string;
	protected readonly schema: ZodSchema<T>;
	protected readonly notFoundError: new (entity: string, id: string) => NotFoundError;

	constructor(config: BaseDaoConfig<T>) {
		this.sql = config.sql;
		this.tableName = config.tableName;
		this.schema = config.schema;
		this.notFoundError = config.notFoundError;
	}

	protected abstract getUniqueViolationFields(): Record<string, string>;
	protected abstract getCheckConstraints(): Record<string, (value: unknown) => string>;

	protected getErrorHandlers() {
		return {
			handleUniqueViolation: (e: unknown) => {
				if (isPostgresError(e) && e.errno === PG_ERRORS.UNIQUE_VIOLATION) {
					const fields = this.getUniqueViolationFields();
					const field = Object.keys(fields)[0];
					throw new DuplicateError(this.tableName, fields[field] ?? field);
				}
				throw e;
			},
			handleCheckViolation: (e: unknown, data: Record<string, unknown>) => {
				if (isPostgresError(e) && e.errno === PG_ERRORS.CHECK_VIOLATION) {
					const constraints = this.getCheckConstraints();
					for (const [key, messageFn] of Object.entries(constraints)) {
						if (data[key] !== undefined) {
							throw new CheckViolationError(key, messageFn(data[key]));
						}
					}
				}
				throw e;
			},
			handleForeignKeyViolation: (e: unknown, field: string, value: unknown) => {
				if (isPostgresError(e) && e.errno === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
					throw new ForeignKeyError(this.tableName, field, String(value));
				}
				throw e;
			}
		};
	}

	async retrieve(id: bigint): Promise<T> {
		const [result] = await this.sql`SELECT * FROM ${this.sql(this.tableName)} WHERE id = ${id}`;
		if (!result) throw new this.notFoundError(this.tableName, String(id));
		return this.schema.parse(result);
	}

	async list(): Promise<T[]> {
		const results = await this.sql`SELECT * FROM ${this.sql(this.tableName)}`;
		return results.map((row: unknown) => this.schema.parse(row));
	}

	async insert(data: TInsert, tx?: TransactionSQL): Promise<T> {
		const db = tx ?? this.sql;
		const { handleUniqueViolation, handleCheckViolation, handleForeignKeyViolation } =
			this.getErrorHandlers();

		const insertData = data as Record<string, unknown>;

		try {
			const [result] =
				await db`INSERT INTO ${this.sql(this.tableName)} ${db(insertData)} RETURNING *`;
			return this.schema.parse(result);
		} catch (e) {
			handleUniqueViolation(e);
			handleCheckViolation(e, insertData);
			for (const [field, value] of Object.entries(insertData)) {
				handleForeignKeyViolation(e, field, value);
			}
			throw e;
		}
	}

	async update(id: bigint, data: TUpdate, tx?: TransactionSQL): Promise<T> {
		const db = tx ?? this.sql;
		const { handleUniqueViolation, handleCheckViolation, handleForeignKeyViolation } =
			this.getErrorHandlers();

		const updateData = data as Record<string, unknown>;

		try {
			const [result] =
				await db`UPDATE ${this.sql(this.tableName)} SET ${db(updateData)} WHERE id = ${id} RETURNING *`;
			if (!result) throw new this.notFoundError(this.tableName, String(id));
			return this.schema.parse(result);
		} catch (e) {
			handleUniqueViolation(e);
			handleCheckViolation(e, updateData);
			for (const [field, value] of Object.entries(updateData)) {
				handleForeignKeyViolation(e, field, value);
			}
			throw e;
		}
	}

	async delete(id: bigint, tx?: TransactionSQL): Promise<T> {
		const db = tx ?? this.sql;
		const [result] = await db`DELETE FROM ${this.sql(this.tableName)} WHERE id = ${id} RETURNING *`;
		if (!result) throw new this.notFoundError(this.tableName, String(id));
		return this.schema.parse(result);
	}
}
