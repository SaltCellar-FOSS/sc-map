<script lang="ts">
	import type { Component } from 'svelte';

	type Props = {
		label: string;
		icon: Component;
		active?: boolean;
		onclick?: () => void;
	};

	let { label, icon: Icon, active = false, onclick }: Props = $props();
</script>

<button class="chip" class:active aria-pressed={active} {onclick}>
	<span class="chip-icon" aria-hidden="true">
		<Icon />
	</span>
	<span class="chip-label">{label}</span>
</button>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 0 16px;
		height: 34px;
		border: 1px solid #dfe1e5;
		border-radius: 17px;
		background: #fff;
		cursor: pointer;
		font-family: 'Google Sans', Roboto, Arial, sans-serif;
		font-size: 13px;
		font-weight: 500;
		color: #3c4043;
		white-space: nowrap;
		box-shadow:
			0 1px 3px rgba(60, 64, 67, 0.3),
			0 4px 8px 3px rgba(60, 64, 67, 0.15);
		transition:
			background-color 0.2s,
			box-shadow 0.2s,
			border-color 0.2s;
	}

	.chip:hover {
		background: #f1f3f4;
	}

	.chip:focus-visible {
		outline: 2px solid #1a73e8;
		outline-offset: 2px;
	}

	.chip.active {
		background: #e8f0fe;
		border-color: #d2e3fc;
		color: #1967d2;
	}

	.chip.active .chip-icon {
		color: #1967d2;
	}

	.chip-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #5f6368;
		transition: color 0.2s;
	}

	.chip-label {
		line-height: 1;
	}
</style>
