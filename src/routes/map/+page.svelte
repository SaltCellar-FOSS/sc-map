<script lang="ts">
	import FilterChips from '$lib/components/FilterChips.svelte';
	import PlaceMap from '$lib/components/PlaceMap.svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import AvatarButton from '$lib/components/AvatarButton.svelte';
	import Drawer from '$lib/components/ui/drawer/Drawer.svelte';
	import { CATEGORIES } from '$lib/categories';
	import type { Place } from '$lib/dao/places/types.js';
	import type { SelectedLocation } from '$lib/components/types.js';
	import Modal from '$lib/components/ui/modal/Modal.svelte';

	let { data } = $props();

	let activeFilter = $state<Place['type'] | null>(null);
	let selectedLocation = $state<SelectedLocation | null>(null);
	let drawerOpen = $state(false);
	let modalOpen = $state(false);

	let filteredPlaces = $derived(
		activeFilter ? data.places.filter((place) => place.type === activeFilter) : data.places
	);

	$effect(() => {
		if (selectedLocation === null) {
			drawerOpen = false;
			return;
		}

		if ('id' in selectedLocation) {
			drawerOpen = true;
		}
	});
</script>

<div class="map-root">
	<PlaceMap
		categories={CATEGORIES}
		places={filteredPlaces}
		bind:selectedLocation
		onaddtolist={() => (modalOpen = true)}
	/>
</div>

<Drawer
	bind:open={drawerOpen}
	onclose={() => (selectedLocation = null)}
	class="place-drawer"
	variant="modal"
>
	{#snippet header()}
		<span>{selectedLocation?.name ?? ''}</span>
	{/snippet}
	{#if selectedLocation !== null}
		<div class="place-details">
			<p class="place-type">
				{data.places.find((p) => p.google_place_id === selectedLocation!.google_place_id)?.type ??
					'Place'}
			</p>
			<p class="place-address">{selectedLocation.formatted_address}</p>
		</div>
	{/if}
</Drawer>
<div class="controls">
	<SearchBar placeholder="Search for something yummy" bind:selectedLocation />
	<FilterChips
		filters={CATEGORIES}
		{activeFilter}
		onchange={(newFilter) => (activeFilter = newFilter)}
	/>
</div>
<AvatarButton alt="User profile" src={data.user?.avatar_url ?? undefined} />
<Modal bind:open={modalOpen}>TODO</Modal>

<style>
	:global(.place-drawer) {
		--md-comp-drawer-width: 396px;
	}

	.controls {
		position: fixed;
		display: flex;
		flex-direction: row;
		top: 10px;
		left: 10px;
		z-index: 300;
		gap: var(--space-2);
	}

	@media (max-width: 600px) {
		.controls {
			flex-direction: column;
			gap: var(--space-2);
		}
	}

	.place-details {
		padding: var(--space-6);
	}

	.place-type {
		font-size: var(--text-md);
		font-weight: 500;
		color: var(--color-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 var(--space-2) 0;
	}

	.place-address {
		font-size: var(--text-md);
		color: var(--color-on-surface-variant);
		margin: 0;
		line-height: 1.5;
	}

	.map-root {
		position: absolute;
		width: 100vw;
		height: 100vh;
	}
</style>
