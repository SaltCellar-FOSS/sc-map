<script lang="ts">
	/**
	 * Material 3 Chip — Svelte-native, SSR-safe
	 *
	 * Covers all four M3 chip types via the `variant` prop:
	 *
	 *   'assist'   — contextual actions (non-interactive label + icon)
	 *   'filter'   — toggleable selection state with optional checkmark
	 *   'input'    — represents typed input; has a remove (×) button
	 *   'suggestion'— single-select; tappable, no remove
	 *
	 * Props:
	 *   variant     — 'assist' | 'filter' | 'input' | 'suggestion'
	 *   label       — chip text
	 *   selected    — bindable; filter/suggestion toggle state
	 *   elevated    — use elevated (outlined → filled-tonal) surface
	 *   disabled
	 *   href        — render as <a> (assist/suggestion)
	 *   onremove    — called when × is clicked (input chips)
	 *   onclick
	 *
	 * Snippets:
	 *   icon        — leading icon (18px); for filter chips shown only when not selected
	 *   selectedIcon— icon to show when filter chip is selected (defaults to ✓)
	 */

	import { createRipple } from '$lib/components/ui/ripple.svelte';

	type Variant = 'assist' | 'filter' | 'input' | 'suggestion';

	interface Props {
		variant?: Variant;
		label: string;
		selected?: boolean;
		elevated?: boolean;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		onremove?: (e: MouseEvent) => void;
		icon?: import('svelte').Snippet;
		selectedIcon?: import('svelte').Snippet;
		class?: string;
	}

	let {
		variant = 'assist',
		label,
		selected = $bindable(false),
		elevated = false,
		disabled = false,
		onclick,
		onremove,
		icon,
		selectedIcon,
		class: extraClass = ''
	}: Props = $props();

	const ripple = createRipple();

	function handleClick(e: MouseEvent) {
		if (disabled) return;
		if (variant === 'filter' || variant === 'suggestion') {
			selected = !selected;
		}
		ripple.addRipple(e);
		onclick?.(e);
	}

	function handleRemove(e: MouseEvent) {
		e.stopPropagation();
		if (disabled) return;
		onremove?.(e);
	}

	// Show leading icon area?
	const hasLeadingIcon = $derived(!!icon || (variant === 'filter' && selected));
</script>

{#snippet chipContent()}
	<!-- Leading icon / checkmark -->
	{#if variant === 'filter'}
		{#if selected}
			<span class="chip-icon chip-icon--leading" aria-hidden="true">
				{#if selectedIcon}{@render selectedIcon()}{:else}✓{/if}
			</span>
		{:else if icon}
			<span class="chip-icon chip-icon--leading" aria-hidden="true">
				{@render icon()}
			</span>
		{/if}
	{:else if icon}
		<span class="chip-icon chip-icon--leading" aria-hidden="true">
			{@render icon()}
		</span>
	{/if}

	<span class="chip-label">{label}</span>

	<!-- Remove button (input chips) -->
	{#if variant === 'input'}
		<button
			class="chip-remove"
			type="button"
			aria-label="Remove {label}"
			{disabled}
			onclick={handleRemove}
			tabindex={disabled ? -1 : 0}>×</button
		>
	{/if}

	<!-- State layer + ripple -->
	<span class="chip-state-layer" aria-hidden="true"></span>
	<span class="chip-ripple-container" aria-hidden="true">
		{#each ripple.ripples as r (r.id)}
			<span class="chip-ripple" style="left:{r.x}px;top:{r.y}px;"></span>
		{/each}
	</span>
{/snippet}

<button
	type="button"
	{disabled}
	class="chip chip--{variant} {extraClass}"
	class:chip--selected={selected}
	class:chip--elevated={elevated}
	class:chip--has-icon={hasLeadingIcon}
	onclick={handleClick}
	aria-pressed={variant === 'filter' || variant === 'suggestion' ? selected : undefined}
>
	{@render chipContent()}
</button>

<style>
	/* ---- Base ---- */
	.chip {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--md-comp-chip-gap);
		height: var(--md-comp-chip-height);
		padding: 0 var(--md-comp-chip-padding-h);
		border-radius: var(--md-comp-chip-border-radius);
		border: 1px solid var(--md-sys-color-outline);
		background-color: var(--md-sys-color-surface);
		cursor: pointer;
		user-select: none;
		overflow: hidden;
		text-decoration: none;
		font-family: var(--md-sys-typescale-label-font);
		font-size: var(--md-sys-typescale-label-large-size);
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
		transition:
			background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard),
			box-shadow var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard),
			border-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
		-webkit-tap-highlight-color: transparent;
		white-space: nowrap;
	}

	.chip:focus-visible {
		outline: 2px solid var(--md-sys-color-primary);
		outline-offset: 2px;
	}

	/* Shift padding when leading icon present */
	.chip--has-icon {
		padding-left: var(--md-comp-chip-padding-h-icon);
	}

	/* ---- Elevated modifier ---- */
	.chip--elevated {
		border-color: transparent;
		background-color: var(--md-sys-color-surface-container-low);
		box-shadow: var(--md-sys-elevation-1);
	}
	.chip--elevated:hover {
		box-shadow: var(--md-sys-elevation-2);
	}

	/* ---- Selected state ---- */
	.chip--selected {
		background-color: var(--md-sys-color-secondary-container);
		border-color: transparent;
		color: var(--md-sys-color-on-secondary-container);
	}
	.chip--selected.chip--elevated {
		box-shadow: var(--md-sys-elevation-1);
	}

	/* ---- Disabled ---- */
	.chip:disabled {
		pointer-events: none;
		opacity: 0.38;
		box-shadow: none;
	}

	/* ---- Label ---- */
	.chip-label {
		line-height: 1;
	}

	/* ---- Icons ---- */
	.chip-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--md-comp-chip-icon-size);
		height: var(--md-comp-chip-icon-size);
		flex-shrink: 0;
		font-size: var(--md-comp-chip-icon-size);
		line-height: 1;
	}

	/* ---- Remove button (input chip) ---- */
	.chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--md-comp-chip-icon-size);
		height: var(--md-comp-chip-icon-size);
		flex-shrink: 0;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		font-size: 1rem;
		line-height: 1;
		border-radius: 50%;
		transition: background-color var(--md-sys-motion-duration-short2)
			var(--md-sys-motion-easing-standard);
		/* Remove button gets its own state layer via background */
	}
	.chip-remove:hover {
		background-color: color-mix(in srgb, currentColor 12%, transparent);
	}
	.chip-remove:focus-visible {
		outline: 2px solid var(--md-sys-color-primary);
	}

	/* ---- State layer ---- */
	.chip-state-layer {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background-color: var(--md-sys-color-on-surface-variant);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
	}
	.chip--selected .chip-state-layer {
		background-color: var(--md-sys-color-on-secondary-container);
	}
	.chip:hover .chip-state-layer {
		opacity: 0.08;
	}
	.chip:focus-visible .chip-state-layer {
		opacity: 0.12;
	}
	.chip:active .chip-state-layer {
		opacity: 0.12;
	}

	/* ---- Ripple ---- */
	.chip-ripple-container {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		overflow: hidden;
		pointer-events: none;
	}
	.chip-ripple {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: currentColor;
		opacity: 0.2;
		transform: translate(-50%, -50%) scale(0);
		animation: chip-ripple 600ms var(--md-sys-motion-easing-standard) forwards;
		pointer-events: none;
	}
	@keyframes chip-ripple {
		to {
			transform: translate(-50%, -50%) scale(20);
			opacity: 0;
		}
	}
</style>
