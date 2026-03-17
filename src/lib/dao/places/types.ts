import { z } from 'zod';

export const PlaceSchema = z.object({
	id: z.bigint(),
	name: z.string(),
	lat: z.number(),
	lng: z.number(),
	google_place_id: z.string(),
	type: z.enum(['RESTAURANT', 'BAR', 'BAKERY']),
	submitted_by: z.bigint(),
	created_at: z.date(),
});

export const PlaceInsertSchema = PlaceSchema.omit({ id: true, created_at: true });

export const PlaceUpdateSchema = PlaceSchema.omit({ id: true }).partial();

export type Place = z.infer<typeof PlaceSchema>;
export type PlaceInsert = z.infer<typeof PlaceInsertSchema>;
export type PlaceUpdate = z.infer<typeof PlaceUpdateSchema>;
