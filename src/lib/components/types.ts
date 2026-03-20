import type { Place } from '$lib/dao/places/types';
import type { Component } from 'svelte';

type GlyphCategoryConfig = {
	label: string;
	color: string;
	glyphText: string;
	icon: Component;
};

type IconCategoryConfig = {
	label: string;
	color: string;
	icon: Component;
};

export type CategoryConfig = GlyphCategoryConfig | IconCategoryConfig;

export type SelectedLocation = Omit<Place, 'id' | 'created_at' | 'submitted_by' | 'type'>;
