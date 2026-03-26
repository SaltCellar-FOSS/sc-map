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

	let isDesktop = $state(false);

	function checkViewport() {
		isDesktop = window.innerWidth >= 768;
	}

	$effect(() => {
		checkViewport();
		window.addEventListener('resize', checkViewport);
		return () => window.removeEventListener('resize', checkViewport);
	});
</script>

{#if isDesktop}
	<SideSheet variant="standard" bind:open {onclose}>
		<div class="action-bar">
			<Button variant="tonal" onclick={onaddvisit}>
				{#snippet icon()}
					<Icon name="addReview" />
				{/snippet}

				Write a review
			</Button>
		</div>

		<VisitList {visits} {currentUserId} {oneditvisit} />
	</SideSheet>
{:else}
	<BottomSheet bind:open {onclose}>
		<h2 class="place-name">{placeName}</h2>

		<div class="action-bar">
			<button class="icon-btn" aria-label="Write a review" onclick={onaddvisit}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zM7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"
					/>
				</svg>
			</button>
		</div>

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

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--md-sys-color-on-surface-variant);
		border-radius: var(--md-sys-shape-corner-full);
		padding: 0;
	}

	.icon-btn:hover {
		background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
	}

	.icon-btn svg {
		width: 24px;
		height: 24px;
		fill: currentColor;
		display: block;
	}
</style>
