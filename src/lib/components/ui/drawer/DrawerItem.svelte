<script lang="ts">
	/**
	 * Material 3 DrawerItem — Svelte-native, SSR-safe
	 *
	 * A navigation item for use inside a Drawer. Renders as <a> when href
	 * is provided, otherwise as a <button>. Handles active/selected state,
	 * badge counts, and ripple.
	 *
	 * Props:
	 *   label       — item label text
	 *   active      — marks this item as the current destination
	 *   disabled
	 *   href
	 *   badge       — number to show as a badge (0 hides it)
	 *   onclick
	 *
	 * Snippets:
	 *   icon        — 24px nav icon
	 *   activeIcon  — icon to use when active (falls back to icon)
	 */

	interface Props {
		label: string;
		active?: boolean;
		disabled?: boolean;
		badge?: number;
		onclick?: (e: MouseEvent) => void;
		icon?: import('svelte').Snippet;
		activeIcon?: import('svelte').Snippet;
		class?: string;
	}

	let {
		label,
		active = false,
		disabled = false,
		badge = 0,
		onclick,
		icon,
		activeIcon,
		class: extraClass = ''
	}: Props = $props();

	// Ripple
	let ripples = $state<{ id: number; x: number; y: number }[]>([]);
	let nextId = 0;

	function handleClick(e: MouseEvent) {
		if (disabled) return;
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const id = nextId++;
		ripples = [...ripples, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }];
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== id);
		}, 600);
		onclick?.(e);
	}
</script>

{#snippet itemContent()}
	{#if icon || activeIcon}
		<span class="di-icon" aria-hidden="true">
			{#if active && activeIcon}
				{@render activeIcon()}
			{:else if icon}
				{@render icon()}
			{/if}
		</span>
	{/if}

	<span class="di-label">{label}</span>

	{#if badge > 0}
		<span class="di-badge" aria-label="{badge} notifications">
			{badge > 999 ? '999+' : badge}
		</span>
	{/if}

	<span class="di-state-layer" aria-hidden="true"></span>
	<span class="di-ripple-container" aria-hidden="true">
		{#each ripples as r (r.id)}
			<span class="di-ripple" style="left:{r.x}px;top:{r.y}px;"></span>
		{/each}
	</span>
{/snippet}

<button
	type="button"
	{disabled}
	class="di {extraClass}"
	class:di--active={active}
	aria-current={active ? 'page' : undefined}
	onclick={handleClick}
>
	{@render itemContent()}
</button>

<style>
	.di {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--md-comp-drawer-item-gap);
		width: 100%;
		height: var(--md-comp-drawer-item-height);
		padding: 0 var(--md-comp-drawer-item-padding-h);
		border: none;
		border-radius: var(--md-comp-drawer-item-border-radius);
		background-color: transparent;
		cursor: pointer;
		user-select: none;
		text-decoration: none;
		overflow: hidden;
		-webkit-tap-highlight-color: transparent;
		transition: background-color var(--md-sys-motion-duration-short2)
			var(--md-sys-motion-easing-standard);
		box-sizing: border-box;
	}

	.di:focus-visible {
		outline: 2px solid var(--md-sys-color-primary);
		outline-offset: -2px;
	}

	/* ---- Active (current destination) ---- */
	.di--active {
		background-color: var(--md-sys-color-secondary-container);
	}

	/* ---- Disabled ---- */
	.di:disabled {
		pointer-events: none;
		opacity: 0.38;
	}

	/* ---- Icon ---- */
	.di-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--md-comp-drawer-item-icon-size);
		height: var(--md-comp-drawer-item-icon-size);
		flex-shrink: 0;
		color: var(--md-sys-color-on-surface-variant);
		transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
	}
	.di--active .di-icon {
		color: var(--md-sys-color-on-secondary-container);
	}

	/* ---- Label ---- */
	.di-label {
		flex: 1;
		font-family: var(--md-sys-typescale-label-font);
		font-size: var(--md-sys-typescale-label-large-size);
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
	}
	.di--active .di-label {
		color: var(--md-sys-color-on-secondary-container);
		font-weight: 700;
	}

	/* ---- Badge ---- */
	.di-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 16px;
		height: 16px;
		padding: 0 var(--md-sys-spacing-xs);
		border-radius: var(--md-sys-shape-corner-full);
		background-color: var(--md-sys-color-error);
		color: var(--md-sys-color-on-error);
		font-family: var(--md-sys-typescale-label-font);
		font-size: var(--md-sys-typescale-label-medium-size);
		font-weight: 500;
		flex-shrink: 0;
	}

	/* ---- State layer ---- */
	.di-state-layer {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background-color: var(--md-sys-color-on-surface-variant);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
	}
	.di--active .di-state-layer {
		background-color: var(--md-sys-color-on-secondary-container);
	}
	.di:hover .di-state-layer {
		opacity: 0.08;
	}
	.di:focus-visible .di-state-layer {
		opacity: 0.12;
	}
	.di:active .di-state-layer {
		opacity: 0.12;
	}

	/* ---- Ripple ---- */
	.di-ripple-container {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		overflow: hidden;
		pointer-events: none;
	}
	.di-ripple {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--md-sys-color-on-surface-variant);
		opacity: 0.18;
		transform: translate(-50%, -50%) scale(0);
		animation: di-ripple 600ms var(--md-sys-motion-easing-standard) forwards;
		pointer-events: none;
	}
	.di--active .di-ripple {
		background-color: var(--md-sys-color-on-secondary-container);
	}
	@keyframes di-ripple {
		to {
			transform: translate(-50%, -50%) scale(40);
			opacity: 0;
		}
	}
</style>
