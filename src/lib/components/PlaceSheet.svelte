<script lang="ts">
	import BottomSheet from './ui/sheet/BottomSheet.svelte';
	import SideSheet from './ui/sheet/SideSheet.svelte';
	import VisitCard from './VisitCard.svelte';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import Button from './ui/button/Button.svelte';
	import Icon from './ui/icon/Icon.svelte';
	import { type SavedPlace } from '$lib/schemas/saved-place';
	import { getPlaceIcon } from '$lib/categories';
	import EditPlaceDialog from './EditPlaceDialog.svelte';

	type Props = {
		open?: boolean;
		place: SavedPlace;
		visits: Promise<VisitWithUser[]>;
		currentUserId?: bigint;
		onclose?: () => void;
		onaddvisit: () => void;
		oneditvisit?: (visit: VisitWithUser) => void;
		ondeletevisit?: (visit: VisitWithUser) => void;
		oneditplace?: () => void;
	};

	let {
		open = $bindable(false),
		place,
		visits,
		currentUserId,
		onclose,
		onaddvisit,
		oneditvisit,
		ondeletevisit,
		oneditplace
	}: Props = $props();

	let editPlaceOpen = $state(false);

	function getMapsUrl(): string {
		const { lat, lng, name } = place;
		const isApple = /iPad|iPhone/.test(navigator.userAgent);
		if (isApple) {
			return `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(name)}`;
		}
		return `https://www.google.com/maps/place/?q=place_id:${place.google_place_id}`;
	}

	let isDesktop = $state(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

	function checkViewport() {
		isDesktop = window.innerWidth >= 768;
	}

	$effect(() => {
		window.addEventListener('resize', checkViewport);
		return () => window.removeEventListener('resize', checkViewport);
	});
</script>

{#snippet sheetContent(contentClass: string)}
	<Button variant="tonal" onclick={onaddvisit} class="add-visit">
		{#snippet icon()}
			<Icon name="addReview" />
		{/snippet}
		Add Review
	</Button>
	<div class:contentClass>
		{#await visits}
			<p class="empty-state">Loading...</p>
		{:then resolvedVisits}
			{#if resolvedVisits.length === 0}
				<p class="empty-state">No visits yet.</p>
			{:else}
				<div class="visit-list">
					{#each resolvedVisits as visit (visit.id)}
						<VisitCard {visit} {currentUserId} {oneditvisit} {ondeletevisit} />
					{/each}
				</div>
			{/if}
		{/await}
	</div>
{/snippet}

{#snippet headerActions()}
	<Button variant="text" href={getMapsUrl()} target="_blank" title="Open in maps">
		{#snippet icon()}
			<Icon name="map" />
		{/snippet}
	</Button>
{/snippet}

{#snippet title()}
	<div class="icon-title">
		<Button variant="text" onclick={() => (editPlaceOpen = true)}>
			{#snippet icon()}
				<Icon name={getPlaceIcon(place.type)} size={32} />
			{/snippet}
		</Button>
		{place.name}
	</div>
{/snippet}

{#key place.id}
	<EditPlaceDialog bind:open={editPlaceOpen} savedPlace={place} onsuccess={oneditplace} />
{/key}

{#if isDesktop}
	<SideSheet variant="standard" bind:open {onclose} {headerActions} {title}>
		{@render sheetContent('md-side-sheet__content')}
	</SideSheet>
{:else}
	<BottomSheet variant="modal" bind:open {onclose} {headerActions} {title}>
		{@render sheetContent('md-bottom-sheet__content')}
	</BottomSheet>
{/if}

<style>
	.visit-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 4px 2px;
	}

	.empty-state {
		text-align: center;
		color: var(--md-sys-color-on-surface-variant);
		padding: 24px 0;
		margin: 0;
	}

	:global(.md-side-sheet__header) {
		margin-top: 100px;
		margin-inline: 8px;
	}

	.icon-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	.icon-title :global(button) {
		width: 48px;
		height: 48px;
		min-width: 48px;
		border-radius: 50%;
		padding: 0;
	}

	:global(.add-visit) {
		width: 100%;
		margin-bottom: 12px;
		border-radius: var(--md-sys-shape-corner-medium);
	}
</style>
