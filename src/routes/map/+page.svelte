<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';

	let { data } = $props();
</script>

<PlaceMap places={data.places} onplaceclick={() => {}} />
