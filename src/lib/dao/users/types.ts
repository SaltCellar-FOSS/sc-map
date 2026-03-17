import { z } from 'zod';

export const UserSchema = z.object({
	id: z.bigint(),
	discord_id: z.string().nullable(),
	discord_handle: z.string().nullable(),
	google_id: z.string().nullable(),
	has_lifetime_access: z.boolean(),
	is_current_server_member: z.boolean(),
	last_checked_at: z.date(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const UserInsertSchema = UserSchema.omit({ id: true, created_at: true, updated_at: true, last_checked_at: true });

export const UserUpdateSchema = UserSchema.omit({ id: true, created_at: true, updated_at: true, last_checked_at: true }).partial();

export type User = z.infer<typeof UserSchema>;
export type UserInsert = z.infer<typeof UserInsertSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
