import { SavedPlaceType } from '$lib/schemas/saved-place';
import type { IconName } from './components/ui/icon/Icon.svelte';

type PlaceTypeIconName = Extract<
	IconName,
	'bar' | 'bakery' | 'cafe' | 'deli' | 'dessert' | 'foodTruck' | 'otherDestination' | 'restaurant'
>;

const CATEGORIES: Record<
	SavedPlaceType,
	{
		label: string;
		color: string;
		iconName: PlaceTypeIconName;
	}
> = {
	[SavedPlaceType.Restaurant]: {
		label: 'Restaurants',
		color: '#E8472A',
		iconName: 'restaurant'
	},
	[SavedPlaceType.Bar]: { label: 'Bars', color: '#87B100', iconName: 'bar' },
	[SavedPlaceType.Bakery]: { label: 'Bakeries', color: '#C0914F', iconName: 'bakery' },
	[SavedPlaceType.Cafe]: { label: 'Cafes', color: '#C75155', iconName: 'cafe' },
	[SavedPlaceType.Deli]: {
		label: 'Delis',
		color: '#A09700',
		iconName: 'deli'
	},
	[SavedPlaceType.FoodTruck]: {
		label: 'Food Trucks',
		color: '#7050BA',
		iconName: 'foodTruck'
	},
	[SavedPlaceType.Dessert]: {
		label: 'Desserts',
		color: '#007FA1',
		iconName: 'dessert'
	},
	[SavedPlaceType.OtherDestination]: {
		label: 'Other Destinations',
		color: '#00A146',
		iconName: 'otherDestination'
	}
};

export function getPlaceIcon(type: SavedPlaceType): PlaceTypeIconName {
	return CATEGORIES[type].iconName;
}

export function getPlaceLabel(type: SavedPlaceType): string {
	return CATEGORIES[type].label;
}

export function getPlaceColor(type: SavedPlaceType): string {
	return CATEGORIES[type].color;
}
