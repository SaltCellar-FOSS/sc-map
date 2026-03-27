import { SavedPlaceType } from '$lib/schemas/saved-place';

export const CATEGORIES: Record<
	SavedPlaceType,
	{
		label: string;
		color: string;
	}
> = {
	[SavedPlaceType.Restaurant]: {
		label: 'Restaurants',
		color: '#E8472A'
	},
	[SavedPlaceType.Bar]: { label: 'Bars', color: '#87B100' },
	[SavedPlaceType.Bakery]: { label: 'Bakeries', color: '#C0914F' },
	[SavedPlaceType.Cafe]: { label: 'Cafes', color: '#C75155' },
	[SavedPlaceType.Deli]: {
		label: 'Delis',
		color: '#A09700'
	},
	[SavedPlaceType.FoodTruck]: {
		label: 'Food Trucks',
		color: '#7050BA'
	},
	[SavedPlaceType.Dessert]: {
		label: 'Desserts',
		color: '#007FA1'
	},
	[SavedPlaceType.OtherDestination]: {
		label: 'Other Destinations',
		color: '#00A146'
	}
};
