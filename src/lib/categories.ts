import type { CategoryConfig } from '$lib/components/types';
import type { Place } from '$lib/dao/places/types';

export const CATEGORIES: Record<Place['type'], CategoryConfig> = {
	RESTAURANT: {
		label: 'Restaurants',
		color: '#E8472A',
		glyphText: '🍽️'
	},
	BAR: { label: 'Bars', color: '#6B4FBB', glyphText: '🍸' },
	BAKERY: { label: 'Bakeries', color: '#F0A500', glyphText: '🥐' }
};
