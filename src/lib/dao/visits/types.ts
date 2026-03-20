import { z } from 'zod';

export const VisitSchema = z.object({
	id: z.coerce.bigint(),
	user_id: z.coerce.bigint(),
	place_id: z.coerce.bigint(),
	summary: z.string(),
	rating: z.number().min(1).max(5).nullable(),
	visited_at: z.date(),
	created_at: z.date(),
	updated_at: z.date()
});

export const VisitInsertSchema = VisitSchema.omit({ id: true, created_at: true, updated_at: true });

export const VisitUpdateSchema = VisitSchema.omit({
	id: true,
	created_at: true,
	updated_at: true
}).partial();

export type Visit = z.infer<typeof VisitSchema>;
export type VisitInsert = z.infer<typeof VisitInsertSchema>;
export type VisitUpdate = z.infer<typeof VisitUpdateSchema>;
