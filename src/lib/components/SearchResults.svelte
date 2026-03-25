<script lang="ts">
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import { CATEGORIES } from '$lib/categories';
	import List from './ui/list/List.svelte';
	import ListItem from './ui/list/ListItem.svelte';
	import Icon from './ui/icon/Icon.svelte';
	import type { AutocompleteSuggestion } from '$lib/google-places';

	type Props = {
		results: (AutocompleteSuggestion | SavedPlace)[];
		onlistitemclick: (result: AutocompleteSuggestion | SavedPlace) => void;
	};

	const { onlistitemclick, results }: Props = $props();

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
	{#each results as result (result.google_place_id)}
		{@const indicator = getIndicator(result)}
		{@const isSaved = indicator?.isSaved}
		{@const iconName = isSaved && indicator.type ? getIconName(indicator.type) : null}
		<ListItem
			type="button"
			role="option"
			aria-selected="false"
			onclick={() => onlistitemclick(result)}
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
