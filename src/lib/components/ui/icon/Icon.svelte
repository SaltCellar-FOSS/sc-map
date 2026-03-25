<script lang="ts">
	import restaurantIcon from '$lib/icons/RestaurantIcon.svg?url';
	import barIcon from '$lib/icons/LocalBarIcon.svg?url';
	import bakeryIcon from '$lib/icons/BakeryIcon.svg?url';
	import pinIcon from '$lib/icons/PinIcon.svg?url';
	import closeIcon from '$lib/icons/CloseIcon.svg?url';
	import searchIcon from '$lib/icons/SearchIcon.svg?url';
	import arrowFillIcon from '$lib/icons/ArrowFillIcon.svg?url';
	import discordIcon from '$lib/icons/DiscordIcon.svg?url';
	import reviewIcon from '$lib/icons/ReviewIcon.svg?url';

	type IconName =
		| 'restaurant'
		| 'bar'
		| 'bakery'
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
		addReview: reviewIcon
	};

	let { name, size = 24, class: className = '', ariaLabel }: Props = $props();

	const src = $derived(ICONS[name]);
</script>

{#if ariaLabel}
	<img {src} alt={ariaLabel} width={size} height={size} class={className} />
{:else}
	<img {src} alt="" width={size} height={size} class={className} aria-hidden="true" />
{/if}
