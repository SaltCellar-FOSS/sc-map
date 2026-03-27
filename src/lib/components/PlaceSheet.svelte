<script lang="ts">
	import BottomSheet from './ui/sheet/BottomSheet.svelte';
	import SideSheet from './ui/sheet/SideSheet.svelte';
	import VisitList from './VisitList.svelte';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import Button from './ui/button/Button.svelte';
	import Icon from './ui/icon/Icon.svelte';

	type Props = {
		open?: boolean;
		placeName: string;
		visits: VisitWithUser[];
		currentUserId?: bigint;
		onclose?: () => void;
		onaddvisit: () => void;
		oneditvisit?: (visit: VisitWithUser) => void;
	};

	let {
		open = $bindable(false),
		placeName,
		visits,
		currentUserId,
		onclose,
		onaddvisit,
		oneditvisit
	}: Props = $props();

	let isDesktop = $state(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

	function checkViewport() {
		isDesktop = window.innerWidth >= 768;
	}

	$effect(() => {
		window.addEventListener('resize', checkViewport);
		return () => window.removeEventListener('resize', checkViewport);
	});
</script>

{#snippet ActionBar()}
	<div class="action-bar">
		<Button variant="tonal" onclick={onaddvisit}>
			{#snippet icon()}
				<Icon name="addReview" />
			{/snippet}

			Write a review
		</Button>
	</div>
{/snippet}

{#if isDesktop}
	<SideSheet variant="standard" bind:open {onclose}>
		{@render ActionBar()}

		<VisitList {visits} {currentUserId} {oneditvisit} />
	</SideSheet>
{:else}
	<BottomSheet bind:open {onclose}>
		<h2 class="place-name">{placeName}</h2>
		{@render ActionBar()}

		<VisitList {visits} {currentUserId} {oneditvisit} />
	</BottomSheet>
{/if}

<style>
	.place-name {
		margin: 0 0 4px;
		font-size: 2rem;
		font-weight: 400;
		line-height: 1.2;
		color: var(--md-sys-color-on-surface);
	}

	.action-bar {
		display: flex;
		justify-content: stretch;
		align-items: stretch;
		padding-block: 8px;
		margin-bottom: 8px;
	}

	.action-bar :global(button) {
		width: 100%;
	}
</style>
