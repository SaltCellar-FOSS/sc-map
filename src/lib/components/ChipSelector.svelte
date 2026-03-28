<script lang="ts">
	import ChipSet from './ui/chip/ChipSet.svelte';
	import Chip from './ui/chip/Chip.svelte';
	import { SavedPlaceType } from '$lib/schemas/saved-place';

	import type { ComponentProps } from 'svelte';
	import Icon from './ui/icon/Icon.svelte';
	const savedPlaceTypeMap: Record<
		SavedPlaceType,
		{
			iconName: Extract<
				ComponentProps<typeof Icon>['name'],
				| 'restaurant'
				| 'bar'
				| 'bakery'
				| 'cafe'
				| 'deli'
				| 'foodTruck'
				| 'dessert'
				| 'otherDestination'
			>;
			label: string;
		}
	> = {
		[SavedPlaceType.Restaurant]: { iconName: 'restaurant', label: 'Restaurant' },
		[SavedPlaceType.Bar]: { iconName: 'bar', label: 'Bar' },
		[SavedPlaceType.Bakery]: { iconName: 'bakery', label: 'Bakery' },
		[SavedPlaceType.Cafe]: { iconName: 'cafe', label: 'Cafe' },
		[SavedPlaceType.Deli]: { iconName: 'deli', label: 'Deli' },
		[SavedPlaceType.FoodTruck]: { iconName: 'foodTruck', label: 'Food Truck' },
		[SavedPlaceType.Dessert]: { iconName: 'dessert', label: 'Dessert' },
		[SavedPlaceType.OtherDestination]: { iconName: 'otherDestination', label: 'Other Destination' }
	};

	type Props = {
		selectedType?: SavedPlaceType;
	};

	let { selectedType = $bindable() }: Props = $props();
</script>

<div class="field-row">
	<ChipSet>
		{#each Object.values(SavedPlaceType) as savedPlaceType (savedPlaceType)}
			<Chip
				type="filter"
				label={savedPlaceTypeMap[savedPlaceType].label}
				onchange={() => (selectedType = savedPlaceType)}
				selected={selectedType === savedPlaceType}
			>
				{#snippet icon()}
					<Icon name={savedPlaceTypeMap[savedPlaceType].iconName} />
				{/snippet}
			</Chip>
		{/each}
	</ChipSet>
</div>

<style>
	.field-row {
		width: 100%;
	}
</style>
