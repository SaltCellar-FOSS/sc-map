<script lang="ts">
	import barIcon from '$lib/icons/outlined/bar.svg?url';
	import bakeryIcon from '$lib/icons/outlined/bakery.svg?url';
	import cafeIcon from '$lib/icons/outlined/cafe.svg?url';
	import deliIcon from '$lib/icons/outlined/deli.svg?url';
	import dessertIcon from '$lib/icons/outlined/dessert.svg?url';
	import foodTruckIcon from '$lib/icons/outlined/food-truck.svg?url';
	import otherDestinationIcon from '$lib/icons/outlined/other-destination.svg?url';
	import restaurantIcon from '$lib/icons/outlined/restaurant.svg?url';
	import pinIcon from '$lib/icons/PinIcon.svg?url';
	import closeIcon from '$lib/icons/CloseIcon.svg?url';
	import searchIcon from '$lib/icons/SearchIcon.svg?url';
	import arrowFillIcon from '$lib/icons/ArrowFillIcon.svg?url';
	import discordIcon from '$lib/icons/DiscordIcon.svg?url';
	import reviewIcon from '$lib/icons/ReviewIcon.svg?url';

	type IconName =
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
		| 'addReview';

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
		cafe: cafeIcon,
		deli: deliIcon,
		dessert: dessertIcon,
		foodTruck: foodTruckIcon,
		otherDestination: otherDestinationIcon
	};

	let { name, size = 24, class: className = '', ariaLabel }: Props = $props();

	const src = $derived(ICONS[name]);
</script>

{#if ariaLabel}
	<img {src} alt={ariaLabel} width={size} height={size} class={className} />
{:else}
	<img {src} alt="" width={size} height={size} class={className} aria-hidden="true" />
{/if}
