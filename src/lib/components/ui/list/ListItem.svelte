<script lang="ts">
	/**
	 * Material 3 ListItem — Svelte-native, SSR-safe
	 *
	 * Props:
	 *   headline      — primary text (required)
	 *   supportingText — secondary line (triggers two-line layout)
	 *   trailingSupportingText — e.g. timestamps, counts (right-aligned small text)
	 *   lines         — 'one' | 'two' | 'three' (auto-inferred if omitted)
	 *   interactive   — adds hover/press states + role="button" (default: false)
	 *   selected      — highlight as selected (activated) item
	 *   disabled
	 *   href          — render as <a>
	 *   onclick
	 *
	 * Snippets:
	 *   leadingIcon   — 24px icon or avatar area (left)
	 *   trailingIcon  — 24px icon area (right, e.g. chevron, checkbox)
	 */

	import { createRipple } from '$lib/components/ui/ripple.svelte';

	type Lines = 'one' | 'two' | 'three';

	interface Props {
		headline: string;
		supportingText?: string;
		trailingSupportingText?: string;
		lines?: Lines;
		interactive?: boolean;
		selected?: boolean;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		leadingIcon?: import('svelte').Snippet;
		trailingIcon?: import('svelte').Snippet;
		class?: string;
	}

	let {
		headline,
		supportingText = '',
		trailingSupportingText = '',
		lines,
		interactive = false,
		selected = false,
		disabled = false,
		onclick,
		leadingIcon,
		trailingIcon,
		class: extraClass = ''
	}: Props = $props();

	// Auto-infer line count from content when not explicit
	const resolvedLines = $derived(lines ?? (supportingText ? 'two' : 'one'));

	const ripple = createRipple();

	function handleClick(e: MouseEvent) {
		if (disabled || !interactive) return;
		ripple.addRipple(e);
		onclick?.(e);
	}
</script>

{#snippet content()}
	{#if leadingIcon}
		<span class="li-leading" aria-hidden="true">
			{@render leadingIcon()}
		</span>
	{/if}

	<span class="li-text">
		<span class="li-headline">{headline}</span>
		{#if supportingText}
			<span class="li-supporting">{supportingText}</span>
		{/if}
	</span>

	{#if trailingSupportingText || trailingIcon}
		<span class="li-trailing">
			{#if trailingSupportingText}
				<span class="li-trailing-text">{trailingSupportingText}</span>
			{/if}
			{#if trailingIcon}
				<span class="li-trailing-icon" aria-hidden="true">
					{@render trailingIcon()}
				</span>
			{/if}
		</span>
	{/if}

	{#if interactive}
		<span class="li-state-layer" aria-hidden="true"></span>
		<span class="li-ripple-container" aria-hidden="true">
			{#each ripple.ripples as r (r.id)}
				<span class="li-ripple" style="left:{r.x}px;top:{r.y}px;"></span>
			{/each}
		</span>
	{/if}
{/snippet}

{#if interactive}
	<div
		class="li li--interactive li--{resolvedLines} {extraClass}"
		class:li--selected={selected}
		class:li--disabled={disabled}
		role="button"
		aria-disabled={disabled || undefined}
		onclick={handleClick}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleClick(e as unknown as MouseEvent);
			}
		}}
		tabindex={disabled ? -1 : 0}
	>
		{@render content()}
	</div>
{:else}
	<div
		class="li li--{resolvedLines} {extraClass}"
		class:li--selected={selected}
		class:li--disabled={disabled}
		aria-disabled={disabled || undefined}
	>
		{@render content()}
	</div>
{/if}

<style>
	.li {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--md-comp-list-item-gap);
		padding: var(--md-comp-list-item-padding-v) var(--md-comp-list-item-padding-h);
		min-height: var(--md-comp-list-item-height-one);
		border-radius: var(--md-comp-list-item-border-radius);
		background-color: transparent;
		text-decoration: none;
		color: inherit;
		overflow: hidden;
		box-sizing: border-box;
		width: 100%;
	}

	.li--two {
		min-height: var(--md-comp-list-item-height-two);
		align-items: flex-start;
		padding-top: var(--md-comp-list-item-padding-v);
		padding-bottom: var(--md-comp-list-item-padding-v);
	}
	.li--three {
		min-height: var(--md-comp-list-item-height-three);
		align-items: flex-start;
	}

	/* Two/three-line: re-center leading icon */
	.li--two .li-leading,
	.li--three .li-leading {
		margin-top: calc(
			(var(--md-comp-list-item-height-one) - var(--md-comp-list-item-icon-size)) / 2 -
				var(--md-comp-list-item-padding-v)
		);
	}

	/* ---- Interactive ---- */
	.li--interactive {
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	.li--interactive:focus-visible {
		outline: 2px solid var(--md-sys-color-primary);
		outline-offset: -2px;
	}

	/* ---- Selected ---- */
	.li--selected {
		background-color: var(--md-sys-color-secondary-container);
		color: var(--md-sys-color-on-secondary-container);
	}
	.li--selected .li-supporting {
		color: var(--md-sys-color-on-secondary-container);
	}
	.li--selected .li-leading {
		color: var(--md-sys-color-on-secondary-container);
	}

	/* ---- Disabled ---- */
	.li--disabled {
		pointer-events: none;
		opacity: 0.38;
	}

	/* ---- Leading ---- */
	.li-leading {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--md-comp-list-item-icon-size);
		height: var(--md-comp-list-item-icon-size);
		flex-shrink: 0;
		color: var(--md-sys-color-on-surface-variant);
	}

	/* ---- Text block ---- */
	.li-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2px;
		min-width: 0;
	}

	.li-headline {
		font-family: var(--md-sys-typescale-body-font);
		font-size: var(--md-sys-typescale-body-large-size);
		font-weight: 400;
		color: var(--md-sys-color-on-surface);
		line-height: 1.5;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.li--three .li-headline {
		white-space: normal;
	}

	.li-supporting {
		font-family: var(--md-sys-typescale-body-font);
		font-size: var(--md-sys-typescale-body-medium-size);
		color: var(--md-sys-color-on-surface-variant);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		overflow: hidden;
	}
	.li--three .li-supporting {
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	/* ---- Trailing ---- */
	.li-trailing {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--md-sys-spacing-xs);
		flex-shrink: 0;
	}

	.li-trailing-text {
		font-family: var(--md-sys-typescale-label-font);
		font-size: var(--md-sys-typescale-label-medium-size);
		color: var(--md-sys-color-on-surface-variant);
		white-space: nowrap;
	}

	.li-trailing-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--md-comp-list-item-icon-size);
		height: var(--md-comp-list-item-icon-size);
		color: var(--md-sys-color-on-surface-variant);
	}

	/* ---- State layer ---- */
	.li-state-layer {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background-color: var(--md-sys-color-on-surface);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
	}
	.li--selected .li-state-layer {
		background-color: var(--md-sys-color-on-secondary-container);
	}
	.li--interactive:hover .li-state-layer {
		opacity: 0.08;
	}
	.li--interactive:focus-visible .li-state-layer {
		opacity: 0.12;
	}
	.li--interactive:active .li-state-layer {
		opacity: 0.12;
	}

	/* ---- Ripple ---- */
	.li-ripple-container {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		overflow: hidden;
		pointer-events: none;
	}
	.li-ripple {
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--md-sys-color-on-surface);
		opacity: 0.18;
		transform: translate(-50%, -50%) scale(0);
		animation: li-ripple 600ms var(--md-sys-motion-easing-standard) forwards;
		pointer-events: none;
	}
	@keyframes li-ripple {
		to {
			transform: translate(-50%, -50%) scale(40);
			opacity: 0;
		}
	}
</style>
