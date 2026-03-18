<script lang="ts">
	import type { Component } from 'svelte';
	import FilterChip from './FilterChip.svelte';
	import FilterRestaurantIcon from '$lib/icons/FilterRestaurantIcon.svelte';
	import type { Place } from '$lib/dao/places/types';

	type FilterChipItem = {
		id: Place['type'];
		label: string;
		icon: Component;
		active: boolean;
	};

	type Props = {
		filters?: FilterChipItem[];
		onchange?: (filters: FilterChipItem[]) => void;
	};

	const defaultFilters: FilterChipItem[] = [
		{ id: 'RESTAURANT', label: 'Restaurants', icon: FilterRestaurantIcon, active: false }
	];

	let { filters = defaultFilters, onchange }: Props = $props();

	function toggleFilter(id: string) {
		filters = filters.map((f) => (f.id === id ? { ...f, active: !f.active } : f));
		onchange?.(filters);
	}
</script>

<div class="filter-chips" role="group" aria-label="Place filters">
	{#each filters as filter (filter.id)}
		<FilterChip
			label={filter.label}
			icon={filter.icon}
			active={filter.active}
			onclick={() => toggleFilter(filter.id)}
		/>
	{/each}
</div>

<style>
	.filter-chips {
		display: flex;
		gap: 8px;
		padding: 10px;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.filter-chips::-webkit-scrollbar {
		display: none;
	}
</style>
