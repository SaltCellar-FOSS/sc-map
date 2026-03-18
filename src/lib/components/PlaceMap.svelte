<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import { SvelteSet } from 'svelte/reactivity';
	import type { Place } from '$lib/dao/places/types';
	import PlaceMarker from './PlaceMarker.svelte';
	import type { CategoryConfig } from './types';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';

	type Category = Place['type'];

	const CATEGORIES: Record<Category, CategoryConfig> = {
		RESTAURANT: {
			label: 'Restaurants',
			color: '#E8472A',
			glyphText: '🍽️'
		},
		BAR: {
			label: 'Bars',
			color: '#6B4FBB',
			glyphText: '🍸'
		},
		BAKERY: {
			label: 'Bakeries',
			color: '#F0A500',
			glyphText: '🥐'
		}
	};

	let { places, onplaceclick }: { places: Place[]; onplaceclick: (place: Place) => void } =
		$props();

	let mapEl: HTMLDivElement;
	let map: google.maps.Map | null = $state(null);
	let activeCategories = new SvelteSet<Place['type']>(Object.keys(CATEGORIES) as Category[]);
	function toggleCategory(category: Category) {
		if (activeCategories.has(category)) {
			activeCategories.delete(category);
		} else {
			activeCategories.add(category);
		}
	}

	onMount(async () => {
		setOptions({ key: PUBLIC_GOOGLE_MAPS_API_KEY });

		const { Map } = await importLibrary('maps');

		map = new Map(mapEl, {
			center: { lat: 39.5, lng: -98.35 },
			zoom: 4,
			mapId: 'sc-map',
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false
		});
	});
</script>

<div bind:this={mapEl} style="width: 100%; height: 100vh;"></div>

{#if map}
	{#each places as place (place.id)}
		<PlaceMarker
			{map}
			{place}
			visible={activeCategories.has(place.type)}
			onclick={onplaceclick}
			categoryConfig={CATEGORIES[place.type]}
		/>
	{/each}
{/if}

<div class="filter-bar">
	{#each Object.entries(CATEGORIES) as [key, { label, color }] (key)}
		<button
			class="filter-btn"
			class:active={activeCategories.has(key as Category)}
			style="--color: {color}"
			onclick={() => toggleCategory(key as Category)}
		>
			{label}
		</button>
	{/each}
</div>

<style>
	.filter-bar {
		position: fixed;
		top: 2rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		background: white;
		padding: 0.5rem;
		border-radius: 2rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
	}

	.filter-btn {
		padding: 0.4rem 1rem;
		border-radius: 1.5rem;
		border: 2px solid var(--color);
		background: white;
		color: var(--color);
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.filter-btn.active {
		background: var(--color);
		color: white;
	}
</style>
