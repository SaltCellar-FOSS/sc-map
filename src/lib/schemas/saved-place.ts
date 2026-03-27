import { z } from 'zod';

export enum SavedPlaceType {
	Bar = 'BAR',
	Bakery = 'BAKERY',
	Cafe = 'CAFE',
	Deli = 'DELI',
	Dessert = 'DESSERT',
	FoodTruck = 'FOOD_TRUCK',
	OtherDestination = 'OTHER_DESTINATION',
	Restaurant = 'RESTAURANT'
}

export const SavedPlaceSchema = z.object({
	id: z.coerce.bigint(),
	name: z.string(),
	lat: z.number(),
	lng: z.number(),
	formatted_address: z.string(),
	google_place_id: z.string(),
	type: z.enum(SavedPlaceType),
	submitted_by: z.coerce.bigint(),
	created_at: z.coerce.date()
});

export const SavedPlaceInsertSchema = SavedPlaceSchema.omit({ id: true, created_at: true });

export const SavedPlaceUpdateSchema = SavedPlaceSchema.omit({ id: true }).partial();

export function isSavedPlaceType(value: string): value is SavedPlaceType {
	return Object.values(SavedPlaceType).includes(value as SavedPlaceType);
}

export type SavedPlace = z.infer<typeof SavedPlaceSchema>;
export type SavedPlaceInsert = z.infer<typeof SavedPlaceInsertSchema>;
export type SavedPlaceUpdate = z.infer<typeof SavedPlaceUpdateSchema>;
