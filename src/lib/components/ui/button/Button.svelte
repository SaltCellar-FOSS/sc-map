<script lang="ts">
	/**
	 * Material 3 Button — Svelte-native, SSR-safe
	 *
	 * Props:
	 *   variant  — 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
	 *   disabled — boolean
	 *   type     — HTMLButtonElement type
	 *   href     — renders an <a> tag when provided
	 *   onclick  — event handler
	 */

	type Variant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';

	interface Props {
		variant?: Variant;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
		leadingIcon?: import('svelte').Snippet;
		trailingIcon?: import('svelte').Snippet;
		class?: string;
	}

	let {
		variant = 'filled',
		disabled = false,
		type = 'button',
		onclick,
		children,
		leadingIcon,
		trailingIcon,
		class: extraClass = ''
	}: Props = $props();

	// Ripple state
	let ripples = $state<{ id: number; x: number; y: number }[]>([]);
	let nextId = 0;

	function handleClick(e: MouseEvent) {
		if (disabled) return;

		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const id = nextId++;

		ripples = [...ripples, { id, x, y }];
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== id);
		}, 600);

		onclick?.(e);
	}
</script>

{#snippet buttonContent()}
	{#if leadingIcon}
		<span class="btn-icon btn-icon--leading" aria-hidden="true">
			{@render leadingIcon()}
		</span>
	{/if}

	<span class="btn-label">
		{#if children}{@render children()}{/if}
	</span>

	{#if trailingIcon}
		<span class="btn-icon btn-icon--trailing" aria-hidden="true">
			{@render trailingIcon()}
		</span>
	{/if}

	<!-- State layer (hover/focus/pressed) -->
	<span class="btn-state-layer" aria-hidden="true"></span>

	<!-- Ripple container -->
	<span class="btn-ripple-container" aria-hidden="true">
		{#each ripples as ripple (ripple.id)}
			<span class="btn-ripple" style="left:{ripple.x}px; top:{ripple.y}px;"></span>
		{/each}
	</span>
{/snippet}

<button
	{type}
	{disabled}
	class="btn btn--{variant} {extraClass}"
	onclick={handleClick}
	aria-disabled={disabled}
>
	{@render buttonContent()}
</button>

<style>
	/* ---- Base ---- */
	.btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--md-comp-button-gap);
		overflow: hidden;
		cursor: pointer;
		border: none;
		outline: none;
		text-decoration: none;
		padding: 0 var(--md-comp-button-padding-h);
		height: var(--md-comp-button-height);
		border-radius: var(--md-sys-shape-corner-full);
		font-family: var(--md-sys-typescale-label-font);
		font-size: var(--md-sys-typescale-label-large-size);
		font-weight: 500;
		letter-spacing: 0.00625em;
		white-space: nowrap;
		user-select: none;
		transition:
			box-shadow var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
			background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
		-webkit-tap-highlight-color: transparent;
	}

	.btn:focus-visible {
		outline: 3px solid var(--md-sys-color-primary);
		outline-offset: 2px;
	}

	/* With leading/trailing icon */
	.btn:has(.btn-icon--leading) {
		padding-left: var(--md-comp-button-padding-h-icon);
	}
	.btn:has(.btn-icon--trailing) {
		padding-right: var(--md-comp-button-padding-h-icon);
	}

	/* ---- Variants ---- */

	/* Filled */
	.btn--filled {
		background-color: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
	}
	.btn--filled:hover {
		box-shadow: var(--md-sys-elevation-1);
	}
	.btn--filled:active {
		box-shadow: none;
	}
	.btn--filled .btn-state-layer {
		background-color: var(--md-sys-color-on-primary);
	}

	/* Tonal */
	.btn--tonal {
		background-color: var(--md-sys-color-secondary-container);
		color: var(--md-sys-color-on-secondary-container);
	}
	.btn--tonal:hover {
		box-shadow: var(--md-sys-elevation-1);
	}
	.btn--tonal .btn-state-layer {
		background-color: var(--md-sys-color-on-secondary-container);
	}

	/* Outlined */
	.btn--outlined {
		background-color: transparent;
		color: var(--md-sys-color-primary);
		border: 1px solid var(--md-sys-color-outline);
		padding: 0 calc(var(--md-comp-button-padding-h) - 1px); /* compensate for border */
	}
	.btn--outlined:has(.btn-icon--leading) {
		padding-left: calc(var(--md-comp-button-padding-h-icon) - 1px);
	}
	.btn--outlined:has(.btn-icon--trailing) {
		padding-right: calc(var(--md-comp-button-padding-h-icon) - 1px);
	}
	.btn--outlined:focus-visible {
		border-color: var(--md-sys-color-primary);
	}
	.btn--outlined .btn-state-layer {
		background-color: var(--md-sys-color-primary);
	}

	/* Text */
	.btn--text {
		background-color: transparent;
		color: var(--md-sys-color-primary);
		padding: 0 var(--md-sys-spacing-md);
	}
	.btn--text:has(.btn-icon--leading) {
		padding-left: var(--md-sys-spacing-md);
	}
	.btn--text:has(.btn-icon--trailing) {
		padding-right: var(--md-sys-spacing-md);
	}
	.btn--text .btn-state-layer {
		background-color: var(--md-sys-color-primary);
	}

	/* Elevated */
	.btn--elevated {
		background-color: var(--md-sys-color-surface-container-low);
		color: var(--md-sys-color-primary);
		box-shadow: var(--md-sys-elevation-1);
	}
	.btn--elevated:hover {
		box-shadow: var(--md-sys-elevation-2);
	}
	.btn--elevated:active {
		box-shadow: var(--md-sys-elevation-1);
	}
	.btn--elevated .btn-state-layer {
		background-color: var(--md-sys-color-primary);
	}

	/* ---- Disabled state ---- */
	.btn:disabled,
	.btn[aria-disabled='true'] {
		pointer-events: none;
		cursor: default;
		box-shadow: none;
		background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
		color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
		border-color: transparent;
	}
	.btn--outlined:disabled,
	.btn--outlined[aria-disabled='true'] {
		border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
	}
	.btn--text:disabled,
	.btn--text[aria-disabled='true'],
	.btn--elevated:disabled,
	.btn--elevated[aria-disabled='true'] {
		background-color: transparent;
	}

	/* ---- State layer (hover / focus) ---- */
	.btn-state-layer {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
	}
	.btn:hover .btn-state-layer {
		opacity: 0.08;
	}
	.btn:focus-visible .btn-state-layer {
		opacity: 0.12;
	}
	.btn:active .btn-state-layer {
		opacity: 0.12;
	}

	/* ---- Ripple ---- */
	.btn-ripple-container {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		overflow: hidden;
		pointer-events: none;
	}

	.btn-ripple {
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: currentColor;
		opacity: 0.24;
		transform: translate(-50%, -50%) scale(0);
		animation: ripple-expand 600ms var(--md-sys-motion-easing-standard) forwards;
		pointer-events: none;
	}

	@keyframes ripple-expand {
		to {
			transform: translate(-50%, -50%) scale(30);
			opacity: 0;
		}
	}

	/* ---- Icons ---- */
	.btn-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--md-comp-button-icon-size);
		height: var(--md-comp-button-icon-size);
		flex-shrink: 0;
	}
</style>
