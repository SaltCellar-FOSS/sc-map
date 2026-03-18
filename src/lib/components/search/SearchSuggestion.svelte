<script lang="ts">
	import HistoryIcon from '$lib/icons/HistoryIcon.svelte';
	import PinIcon from '$lib/icons/PinIcon.svelte';
	import ArrowFillIcon from '$lib/icons/ArrowFillIcon.svelte';

	type Props = {
		icon: 'pin' | 'history';
		primary: string;
		secondary: string;
		onclick?: () => void;
	};

	let { icon, primary, secondary, onclick }: Props = $props();
</script>

<button class="suggestion-item" {onclick}>
	<div class="suggestion-icon">
		{#if icon === 'history'}
			<HistoryIcon />
		{:else}
			<PinIcon />
		{/if}
	</div>

	<div class="suggestion-text">
		<span class="suggestion-primary">{primary}</span>
		<span class="suggestion-secondary">{secondary}</span>
	</div>

	<div class="suggestion-fill" aria-hidden="true">
		<ArrowFillIcon />
	</div>
</button>

<style>
	.suggestion-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0 16px 0 8px;
		height: 52px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		gap: 12px;
		font-family: 'Google Sans', Roboto, Arial, sans-serif;
		transition: background-color 0.15s;
	}

	.suggestion-item:hover {
		background-color: #f1f3f4;
	}

	.suggestion-item:hover .suggestion-fill {
		opacity: 1;
	}

	.suggestion-icon {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background: #e8eaed;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #5f6368;
	}

	.suggestion-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.suggestion-primary {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: #202124;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 20px;
	}

	.suggestion-secondary {
		display: block;
		font-size: 12px;
		color: #70757a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 18px;
	}

	.suggestion-fill {
		flex-shrink: 0;
		color: #70757a;
		opacity: 0;
		transition: opacity 0.15s;
		display: flex;
		align-items: center;
	}
</style>
