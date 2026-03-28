<script lang="ts">
	import ChipSet from './ui/chip/ChipSet.svelte';
	import Chip from './ui/chip/Chip.svelte';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { getPlaceLabel, getPlaceIcon } from '$lib/categories';

	import Icon from './ui/icon/Icon.svelte';

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
				label={getPlaceLabel(savedPlaceType)}
				onchange={() => (selectedType = savedPlaceType)}
				selected={selectedType === savedPlaceType}
			>
				{#snippet icon()}
					<Icon name={getPlaceIcon(savedPlaceType)} />
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
