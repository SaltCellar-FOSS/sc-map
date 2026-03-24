import type { CategoryConfig } from '$lib/components/types';
import type { SavedPlace } from '$lib/schemas/saved-place';

export const CATEGORIES: Record<SavedPlace['type'], CategoryConfig> = {
	RESTAURANT: {
		label: 'Restaurants',
		color: '#E8472A',
		glyphText: '🍽️'
	},
	BAR: { label: 'Bars', color: '#6B4FBB', glyphText: '🍸' },
	BAKERY: { label: 'Bakeries', color: '#F0A500', glyphText: '🥐' }
};
