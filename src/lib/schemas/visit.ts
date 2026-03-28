import { z } from 'zod';

const MAX_SUMMARY_CHARS = 2_000;

export const VisitSchema = z.object({
	id: z.coerce.bigint(),
	user_id: z.coerce.bigint(),
	place_id: z.coerce.bigint(),
	summary: z.string().max(MAX_SUMMARY_CHARS),
	visited_at: z.coerce.date(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date()
});

export const VisitInsertSchema = VisitSchema.omit({
	id: true,
	created_at: true,
	updated_at: true
}).extend({
	visited_at: z.coerce.date()
});

export const VisitUpdateSchema = VisitSchema.omit({
	id: true,
	created_at: true,
	updated_at: true
})
	.extend({
		visited_at: z.coerce.date()
	})
	.partial();

export const VisitWithUserSchema = VisitSchema.extend({
	discord_handle: z.string().nullable(),
	avatar_url: z.string().nullable(),
	photo_urls: z
		.string()
		.array()
		.nullish()
		.transform((v) => v ?? [])
});

export type Visit = z.infer<typeof VisitSchema>;
export type VisitWithUser = z.infer<typeof VisitWithUserSchema>;
export type VisitInsert = z.infer<typeof VisitInsertSchema>;
export type VisitUpdate = z.infer<typeof VisitUpdateSchema>;
