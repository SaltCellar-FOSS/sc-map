<script lang="ts">
	import BottomSheet from './ui/bottom-sheet/BottomSheet.svelte';
	import VisitList from './VisitList.svelte';
	import type { VisitWithUser } from '$lib/server/dao/visits/types';

	type Props = {
		open?: boolean;
		placeName: string;
		visits: VisitWithUser[];
		onclose?: () => void;
		onaddvisit: () => void;
	};

	let { open = $bindable(false), placeName, visits, onclose, onaddvisit }: Props = $props();
</script>

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

	<VisitList {visits} />
</BottomSheet>

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
		justify-content: space-between;
		align-items: center;
		padding-block: 8px;
		margin-bottom: 8px;
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
