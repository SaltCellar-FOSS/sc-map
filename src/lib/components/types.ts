import type { Place } from '$lib/dao/places/types';
import type { Component } from 'svelte';

export type CategoryConfig = {
	label: string;
	color: string;
	glyphText: string;
	icon: Component;
};

export type SelectedLocation = Omit<Place, 'id' | 'created_at' | 'submitted_by' | 'type'>;
