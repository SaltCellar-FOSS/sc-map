<script lang="ts">
	import type { Place } from '$lib/schemas/search';
	import List from './ui/list/List.svelte';
	import ListItem from './ui/list/ListItem.svelte';

	type Props = {
		places: Place[];
		onlistitemclick: (place: Place) => void;
	};

	const { onlistitemclick, places }: Props = $props();
</script>

<List as="div" noPadding>
	{#each places as place (place.google_place_id)}
		<ListItem
			type="button"
			role="option"
			aria-selected="false"
			onclick={() => onlistitemclick(place)}
		>
			{place.name}
			{#snippet supporting()}{place.formatted_address}{/snippet}
		</ListItem>
	{/each}
</List>
