<script lang="ts">
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import { CATEGORIES } from '$lib/categories';

	let { data } = $props();
</script>

<div class="map-root">
	<PlaceMap
		categories={CATEGORIES}
		places={data.places}
	/>
</div>

<style>
	.map-root {
		position: absolute;
		width: 100vw;
		height: 100vh;
	}
</style>
