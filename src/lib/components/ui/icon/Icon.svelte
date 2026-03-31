<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */

	import barIcon from '$lib/icons/outlined/bar.svg?raw';
	import bakeryIcon from '$lib/icons/outlined/bakery.svg?raw';
	import cafeIcon from '$lib/icons/outlined/cafe.svg?raw';
	import deliIcon from '$lib/icons/outlined/deli.svg?raw';
	import dessertIcon from '$lib/icons/outlined/dessert.svg?raw';
	import foodTruckIcon from '$lib/icons/outlined/food-truck.svg?raw';
	import otherDestinationIcon from '$lib/icons/outlined/other-destination.svg?raw';
	import restaurantIcon from '$lib/icons/outlined/restaurant.svg?raw';
	import pinIcon from '$lib/icons/PinIcon.svg?raw';
	import closeIcon from '$lib/icons/CloseIcon.svg?raw';
	import searchIcon from '$lib/icons/SearchIcon.svg?raw';
	import arrowFillIcon from '$lib/icons/ArrowFillIcon.svg?raw';
	import discordIcon from '$lib/icons/DiscordIcon.svg?raw';
	import reviewIcon from '$lib/icons/ReviewIcon.svg?raw';
	import editIcon from '$lib/icons/EditIcon.svg?raw';
	import deleteIcon from '$lib/icons/DeleteIcon.svg?raw';
	import mapIcon from '$lib/icons/MapIcon.svg?raw';
	import photoIcon from '$lib/icons/PhotoIcon.svg?raw';

	export type IconName =
		| 'bar'
		| 'bakery'
		| 'cafe'
		| 'deli'
		| 'dessert'
		| 'foodTruck'
		| 'otherDestination'
		| 'restaurant'
		| 'pin'
		| 'close'
		| 'search'
		| 'arrowFill'
		| 'discord'
		| 'addReview'
		| 'edit'
		| 'delete'
		| 'map'
		| 'photo';

	type Props = {
		name: IconName;
		size?: number;
		class?: string;
		ariaLabel?: string;
	};

	const ICONS: Record<IconName, string> = {
		restaurant: restaurantIcon,
		bar: barIcon,
		bakery: bakeryIcon,
		pin: pinIcon,
		close: closeIcon,
		search: searchIcon,
		arrowFill: arrowFillIcon,
		discord: discordIcon,
		addReview: reviewIcon,
		edit: editIcon,
		delete: deleteIcon,
		cafe: cafeIcon,
		deli: deliIcon,
		dessert: dessertIcon,
		foodTruck: foodTruckIcon,
		otherDestination: otherDestinationIcon,
		map: mapIcon,
		photo: photoIcon
	};

	let { name, size = 24, class: className = '', ariaLabel }: Props = $props();

	const src = $derived(ICONS[name]);
</script>

{#if ariaLabel}
	<span
		role="img"
		aria-label={ariaLabel}
		class={className}
		style="width: {size}px; height: {size}px;"
	>
		{@html src}
	</span>
{:else}
	<span aria-hidden="true" class={className} style="width: {size}px; height: {size}px;">
		{@html src}
	</span>
{/if}

<style>
	span {
		display: inline-flex;
		flex-shrink: 0;
	}

	span :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
