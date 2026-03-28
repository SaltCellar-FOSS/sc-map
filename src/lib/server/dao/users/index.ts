import { type SQL, type TransactionSQL } from 'bun';
import { UserSchema, type User, type UserInsert, type UserUpdate } from './types';
import { isPostgresError } from '$lib/db/utils';
import { PG_ERRORS } from '$lib/db/errors';

export class UserNotFoundError extends Error {}
export class DuplicateExternalIdError extends Error {}
export class NoIdentityError extends Error {}

export class UsersDao {
	constructor(private readonly sql: SQL) {}

	public async retrieveUser(userId: bigint): Promise<User> {
		const [result] = await this.sql`SELECT * FROM users WHERE id = ${userId}`;
		if (!result) throw new UserNotFoundError(String(userId));
		return UserSchema.parse(result);
	}

	public async findByDiscordId(discordId: string): Promise<User | null> {
		const [result] = await this.sql`SELECT * FROM users WHERE discord_id = ${discordId}`;
		if (!result) return null;
		return UserSchema.parse(result);
	}

	public async listUsers(): Promise<User[]> {
		const results = await this.sql`SELECT * FROM users`;
		return results.map((row: unknown) => UserSchema.parse(row));
	}

	public async insertUser(userInsert: UserInsert, tx?: TransactionSQL): Promise<User> {
		const sql = tx ?? this.sql;
		try {
			const [result] = await sql`INSERT INTO users ${sql(userInsert)} RETURNING *`;
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
		const sql = tx ?? this.sql;
		try {
			const [result] =
				await sql`UPDATE users SET ${sql(userUpdate)} WHERE id = ${userId} RETURNING *`;
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
		const sql = tx ?? this.sql;
		const [result] = await sql`DELETE FROM users WHERE id = ${userId} RETURNING *`;
		if (!result) throw new UserNotFoundError(String(userId));
		return UserSchema.parse(result);
	}
}
