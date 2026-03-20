<script lang="ts">
	import Chip from '$lib/components/ui/chip/Chip.svelte';
	import type { Place } from '$lib/dao/places/types';
	import type { CategoryConfig } from './types';

	type Props = {
		filters: Record<Place['type'], CategoryConfig>;
		activeFilter: Place['type'] | null;
		onchange?: (activeFilter: Place['type'] | null) => void;
	};

	let { filters, activeFilter = null, onchange }: Props = $props();

	function toggleFilter(id: Place['type']) {
		let newFilter: Place['type'] | null = null;
		if (activeFilter !== id) {
			newFilter = id;
		}
		onchange?.(newFilter);
	}
</script>

<div class="filter-chips" role="group" aria-label="Place filters">
	{#each Object.entries(filters) as [id, filter] (id)}
		{@const filterId = id as Place['type']}
		{@const Icon = filter.icon}
		<Chip
			variant="filter"
			label={filter.label}
			selected={filterId === activeFilter}
			onclick={() => toggleFilter(filterId)}
		>
			{#snippet icon()}<Icon />{/snippet}
		</Chip>
	{/each}
</div>

<style>
	.filter-chips {
		display: flex;
		gap: var(--md-sys-spacing-sm);
		padding: var(--md-sys-spacing-sm) var(--md-sys-spacing-md);
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.filter-chips::-webkit-scrollbar {
		display: none;
	}
</style>
