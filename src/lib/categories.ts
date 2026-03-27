import type { CategoryConfig } from '$lib/components/types';
import { SavedPlaceType } from '$lib/schemas/saved-place';

export const CATEGORIES: Record<SavedPlaceType, CategoryConfig> = {
	[SavedPlaceType.Restaurant]: {
		label: 'Restaurants',
		color: '#E8472A',
		glyphText: '🍽️',
		iconName: 'restaurant'
	},
	[SavedPlaceType.Bar]: {
		label: 'Bars',
		color: '#87B100',
		glyphText: '🍸',
		iconName: 'bar'
	},
	[SavedPlaceType.Bakery]: {
		label: 'Bakeries',
		color: '#C0914F',
		glyphText: '🥐',
		iconName: 'bakery'
	},
	[SavedPlaceType.Deli]: {
		label: 'Delis',
		color: '#A09700',
		glyphText: '🥪',
		iconName: 'deli'
	},
	[SavedPlaceType.FoodTruck]: {
		label: 'Food Trucks',
		color: '#7050BA',
		glyphText: '🚛',
		iconName: 'foodTruck'
	},
	[SavedPlaceType.Dessert]: {
		label: 'Desserts',
		color: '#007FA1',
		glyphText: '🍨',
		iconName: 'dessert'
	},
	[SavedPlaceType.OtherDestination]: {
		label: 'Other Destinations',
		color: '#00A146',
		glyphText: '◆',
		iconName: 'otherDestination'
	}
};
