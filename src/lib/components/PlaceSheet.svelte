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
	import DeletePlaceConfirmationDialog from './DeletePlaceConfirmationDialog.svelte';
	import ShareDialog from './ShareDialog.svelte';
	import { isAppleDevice } from '$lib/platform';
	import { getGoogleMapsUrl } from '$lib/share';

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
		ondeleteplace?: () => void;
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
		oneditplace,
		ondeleteplace
	}: Props = $props();

	let editPlaceOpen = $state(false);
	let deletePlaceOpen = $state(false);
	let sharePlaceOpen = $state(false);

	const isApple = isAppleDevice();

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
	{#if isApple}
		<Button variant="text" onclick={() => (sharePlaceOpen = true)} title="Share place">
			{#snippet icon()}
				<Icon name="share" />
			{/snippet}
		</Button>
	{:else}
		<Button
			variant="text"
			href={getGoogleMapsUrl(place)}
			target="_blank"
			title="Open in Google Maps"
		>
			{#snippet icon()}
				<Icon name="map" />
			{/snippet}
		</Button>
	{/if}

	{#await visits then visits}
		{#if visits.length === 0}
			<Button variant="text" onclick={() => (deletePlaceOpen = true)} title="Delete place">
				{#snippet icon()}
					<Icon name="delete" />
				{/snippet}
			</Button>
		{/if}
	{/await}
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
	<DeletePlaceConfirmationDialog
		bind:open={deletePlaceOpen}
		placeId={place.id}
		onsuccess={ondeleteplace}
	/>
	{#if isApple}
		<ShareDialog bind:open={sharePlaceOpen} {place} />
	{/if}
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
