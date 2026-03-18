<script lang="ts">
	let {
		open = $bindable(false),
		title = '',
		children,
		width = '380px'
	}: {
		open?: boolean;
		title?: string;
		width?: string;
		children?: import('svelte').Snippet;
	} = $props();

	let showTooltip = $state(false);

	function toggle() {
		open = !open;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="maps-drawer-wrapper" style:--drawer-width={width}>
	{#if open}
		<div class="drawer-content">
			{#if title}
				<div class="drawer-header">
					<h2 class="drawer-title">{title}</h2>
				</div>
			{/if}

			<div class="drawer-body">
				{@render children?.()}
			</div>
		</div>

		<button
			class="drawer-toggle"
			onclick={toggle}
			aria-label={open ? 'Collapse side panel' : 'Expand side panel'}
			onmouseenter={() => (showTooltip = true)}
			onmouseleave={() => (showTooltip = false)}
			onfocus={() => (showTooltip = true)}
			onblur={() => (showTooltip = false)}
		>
			<svg
				class="toggle-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>

			{#if showTooltip}
				<span class="toggle-tooltip" role="tooltip">
					{open ? 'Collapse side panel' : 'Expand side panel'}
				</span>
			{/if}
		</button>
	{/if}
</div>

<style>
	.maps-drawer-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		z-index: 99;
		pointer-events: none;
	}

	.maps-drawer-wrapper:has(.drawer-content) {
		pointer-events: auto;
	}

	.drawer-toggle {
		position: fixed;
		left: var(--drawer-width, 380px);
		top: 50%;
		transform: translateY(-50%);
		width: 24px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--gm-background, white);
		border: none;
		border-radius: 0 8px 8px 0;
		box-shadow:
			2px 0 4px rgba(0, 0, 0, 0.05),
			1px 0 2px rgba(0, 0, 0, 0.03);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			box-shadow 0.15s ease;
		z-index: 100;
	}

	.drawer-toggle:hover {
		background: var(--gm-surface-hover, #f5f5f5);
	}

	.drawer-toggle:active {
		background: var(--gm-surface-pressed, #e8e8e8);
	}

	.toggle-icon {
		width: 20px;
		height: 20px;
		color: var(--gm-on-surface, #5f6368);
	}

	.toggle-tooltip {
		position: absolute;
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
		padding: 6px 12px;
		background: var(--gm-tooltip-bg, #303030);
		color: var(--gm-tooltip-color, white);
		font-size: 12px;
		font-family: Roboto, Arial, sans-serif;
		white-space: nowrap;
		border-radius: 4px;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.2),
			0 1px 1px rgba(0, 0, 0, 0.14);
		pointer-events: none;
		z-index: 110;
	}

	.drawer-content {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		width: var(--drawer-width);
		max-width: calc(100dvw - 60px);
		height: 100%;
		background: var(--gm-background, white);
		border-right: 1px solid var(--gm-outline-variant, #e0e0e0);
		box-shadow:
			2px 0 4px rgba(0, 0, 0, 0.05),
			1px 0 2px rgba(0, 0, 0, 0.03);
		overflow: hidden;
	}

	.drawer-header {
		flex-shrink: 0;
		padding: 20px;
		border-bottom: 1px solid var(--gm-outline-variant, #e0e0e0);
	}

	.drawer-title {
		margin: 0;
		font-size: 20px;
		font-weight: 400;
		font-family: 'Google Sans', Roboto, Arial, sans-serif;
		color: var(--gm-on-surface, #202124);
		line-height: 28px;
	}

	.drawer-body {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--gm-background: #202124;
			--gm-surface-hover: #2d2d2d;
			--gm-surface-pressed: #373737;
			--gm-on-surface: #e8eaed;
			--gm-outline-variant: #3c4043;
			--gm-tooltip-bg: #f1f3f4;
			--gm-tooltip-color: #202124;
		}
	}
</style>
