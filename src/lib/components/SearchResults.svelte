<script lang="ts">
	import type { Place } from '$lib/schemas/place';
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import { isSavedPlace } from '$lib/schemas/place';
	import { CATEGORIES } from '$lib/categories';
	import List from './ui/list/List.svelte';
	import ListItem from './ui/list/ListItem.svelte';
	import Icon from './ui/icon/Icon.svelte';

	type Props = {
		places: Place[];
		onlistitemclick: (place: Place) => void;
	};

	const { onlistitemclick, places }: Props = $props();

	function getIndicator(place: Place) {
		if (!isSavedPlace(place)) {
			return { isSaved: false };
		}

		const savedPlace = place as SavedPlace;
		const category = CATEGORIES[savedPlace.type];
		const bgColor = category.color;

		const needsDarkIcon = savedPlace.type === 'BAKERY';
		const iconColor = needsDarkIcon ? '#1A1A1A' : '#FFFFFF';

		return { isSaved: true, bgColor, iconColor, type: savedPlace.type };
	}

	function getIconName(type: SavedPlace['type']) {
		switch (type) {
			case 'RESTAURANT':
				return 'restaurant';
			case 'BAR':
				return 'bar';
			case 'BAKERY':
				return 'bakery';
		}
	}
</script>

<List as="div" noPadding>
	{#each places as place (place.google_place_id)}
		{@const indicator = getIndicator(place)}
		{@const isSaved = indicator?.isSaved}
		{@const iconName = isSaved && indicator.type ? getIconName(indicator.type) : null}
		<ListItem
			type="button"
			role="option"
			aria-selected="false"
			onclick={() => onlistitemclick(place)}
		>
			{#snippet leading()}
				{#if isSaved && iconName}
					<div
						class="indicator"
						style="background-color: {indicator.bgColor}; color: {indicator.iconColor}"
					>
						<Icon name={iconName} size={16} />
					</div>
				{:else}
					<div class="indicator unsaved">
						<Icon name="pin" size={20} />
					</div>
				{/if}
			{/snippet}

			{place.name}
			{#snippet supporting()}{place.formatted_address}{/snippet}
		</ListItem>
	{/each}
</List>

<style>
	.indicator {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.indicator.unsaved {
		background-color: var(--md-sys-color-surface-container-high);
		color: var(--md-sys-color-on-surface-variant);
	}
</style>
