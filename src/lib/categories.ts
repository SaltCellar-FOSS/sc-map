import type { CategoryConfig } from '$lib/components/types';
import { SavedPlaceType } from '$lib/schemas/saved-place';

export const CATEGORIES: Record<SavedPlaceType, CategoryConfig> = {
	[SavedPlaceType.Restaurant]: {
		label: 'Restaurants',
		color: '#E8472A',
		glyphText: '🍽️'
	},
	[SavedPlaceType.Bar]: { label: 'Bars', color: '#87B100', glyphText: '🍸' },
	[SavedPlaceType.Bakery]: { label: 'Bakeries', color: '#C0914F', glyphText: '🥐' },
	[SavedPlaceType.Deli]: {
		label: 'Delis',
		color: '#A09700',
		glyphText: '🥪'
	},
	[SavedPlaceType.FoodTruck]: {
		label: 'Food Trucks',
		color: '#7050BA',
		glyphText: '🚛'
	},
	[SavedPlaceType.Dessert]: {
		label: 'Desserts',
		color: '#007FA1',
		glyphText: '🍨'
	},
	[SavedPlaceType.OtherDestination]: {
		label: 'Other Destinations',
		color: '#00A146',
		glyphText: '◆'
	}
};
