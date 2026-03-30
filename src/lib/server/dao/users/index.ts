import { type SQL, type TransactionSQL } from 'bun';
import { type User, type UserInsert, type UserUpdate, UserSchema } from './types';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';
import { BaseDao } from '../base';
import { NotFoundError } from '../errors';

export class UserNotFoundError extends NotFoundError {
	constructor(id: string) {
		super('users', id);
		this.name = 'UserNotFoundError';
	}
}

export class DuplicateExternalIdError extends Error {}
export class NoIdentityError extends Error {}

export class UsersDao extends BaseDao<User, UserInsert, UserUpdate> {
	constructor(sql: SQL) {
		super({
			sql,
			tableName: 'users',
			schema: UserSchema,
			notFoundError: UserNotFoundError
		});
	}

	protected getUniqueViolationFields(): Record<string, string> {
		return { discord_id: 'discord_id' };
	}

	protected getCheckConstraints(): Record<string, (value: unknown) => string> {
		return {};
	}

	public async retrieveUser(userId: bigint): Promise<User> {
		return this.retrieve(userId);
	}

	public async findByDiscordId(discordId: string): Promise<User | null> {
		const [result] = await this.sql`SELECT * FROM users WHERE discord_id = ${discordId}`;
		if (!result) return null;
		return UserSchema.parse(result);
	}

	public async listUsers(): Promise<User[]> {
		return this.list();
	}

	public async insertUser(userInsert: UserInsert, tx?: TransactionSQL): Promise<User> {
		const db = tx ?? this.sql;
		try {
			const [result] = await db`INSERT INTO users ${db(userInsert)} RETURNING *`;
			return UserSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === PG_ERRORS.UNIQUE_VIOLATION) throw new DuplicateExternalIdError();
				if (e.errno === PG_ERRORS.CHECK_VIOLATION) throw new NoIdentityError();
			}
			throw e;
		}
	}

	public async updateUser(
		userId: bigint,
		userUpdate: UserUpdate,
		tx?: TransactionSQL
	): Promise<User> {
		const db = tx ?? this.sql;
		try {
			const [result] =
				await db`UPDATE users SET ${db(userUpdate)} WHERE id = ${userId} RETURNING *`;
			if (!result) throw new UserNotFoundError(String(userId));
			return UserSchema.parse(result);
		} catch (e) {
			if (isPostgresError(e)) {
				if (e.errno === PG_ERRORS.UNIQUE_VIOLATION) throw new DuplicateExternalIdError();
				if (e.errno === PG_ERRORS.CHECK_VIOLATION) throw new NoIdentityError();
			}
			throw e;
		}
	}

	public async deleteUser(userId: bigint, tx?: TransactionSQL): Promise<User> {
		const db = tx ?? this.sql;
		const [result] = await db`DELETE FROM users WHERE id = ${userId} RETURNING *`;
		if (!result) throw new UserNotFoundError(String(userId));
		return UserSchema.parse(result);
	}
}
