<script lang="ts">
	import { SavedPlaceType, type SavedPlace } from '$lib/schemas/saved-place';
	import { CATEGORIES } from '$lib/categories';
	import List from './ui/list/List.svelte';
	import ListItem from './ui/list/ListItem.svelte';
	import Icon from './ui/icon/Icon.svelte';
	import type { AutocompleteSuggestion } from '$lib/google-places';
	import type { ComponentProps } from 'svelte';

	type Props = {
		results: (AutocompleteSuggestion | SavedPlace)[];
		onsearchresultclick: (googlePlaceId: string) => void;
	};

	const { onsearchresultclick, results }: Props = $props();

	function getIndicator(result: AutocompleteSuggestion | SavedPlace) {
		if (!('id' in result)) {
			return { isSavedPlace: false };
		}

		const category = CATEGORIES[result.type];
		const bgColor = category.color;

		const needsDarkIcon = result.type === 'BAKERY';
		const iconColor = needsDarkIcon ? '#1A1A1A' : '#FFFFFF';

		return { isSaved: true, bgColor, iconColor, type: result.type };
	}

	function getIconName(type: SavedPlaceType): ComponentProps<typeof Icon>['name'] {
		switch (type) {
			case SavedPlaceType.Restaurant:
				return 'restaurant';
			case SavedPlaceType.Bar:
				return 'bar';
			case SavedPlaceType.Bakery:
				return 'bakery';
			// case SavedPlaceType.Deli:
			// 	return 'deli';
			// case SavedPlaceType.FoodTruck:
			// 	return 'food-truck';
			// case SavedPlaceType.Dessert:
			// 	return 'dessert';
			// case SavedPlaceType.OtherDestination:
			// 	return 'other-destination';
			default:
				throw new Error('This should never happen');
		}
	}
</script>

<List as="div" noPadding>
	{#each results as result (result.google_place_id)}
		{@const indicator = getIndicator(result)}
		{@const isSaved = indicator?.isSaved}
		{@const iconName = isSaved && indicator.type ? getIconName(indicator.type) : null}
		<ListItem
			type="button"
			role="option"
			aria-selected="false"
			onclick={() => onsearchresultclick(result.google_place_id)}
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

			{result.name}
			{#snippet supporting()}{result.formatted_address}{/snippet}
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
