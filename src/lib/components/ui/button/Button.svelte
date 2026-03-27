<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { ripple } from '$lib/attachments/ripple.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	export type ButtonVariant = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
	type ButtonType = 'button' | 'submit' | 'reset';

	type Props = {
		/** Visual variant. Defaults to 'filled'. */
		variant?: ButtonVariant;

		/**
		 * When provided, renders an <a> tag instead of <button>.
		 * disabled and type props are ignored when href is set.
		 */
		href?: string;

		/** Where to open the linked URL. Only applies when href is set. */
		target?: HTMLAnchorAttributes['target'];

		/** Native button type. Ignored when href is set. */
		type?: ButtonType;

		/** Disables the button. Ignored when href is set. */
		disabled?: boolean;

		/**
		 * Soft-disabled: visually and aria-disabled but still keyboard-focusable.
		 * Useful in toolbars per ARIA guidelines on focusable disabled controls.
		 */
		softDisabled?: boolean;

		/** Additional classes merged onto the root element. */
		class?: string;

		/** Label content. */
		children?: Snippet;

		/**
		 * Optional leading icon snippet.
		 * The root element of the snippet must carry class="md-btn__icon"
		 * so that sizing and colour tokens apply correctly.
		 */
		icon?: Snippet;

		/**
		 * Optional trailing icon snippet.
		 * Root element must carry class="md-btn__icon md-btn__icon--trailing".
		 */
		trailingIcon?: Snippet;

		// Passthrough — any unrecognised props (aria-*, data-*, form, name…)
		// are spread onto the root element.
		[key: string]: unknown;
	};

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		variant = 'filled',
		href,
		target,
		type = 'button',
		disabled = false,
		softDisabled = false,
		class: extraClass,
		children,
		icon,
		trailingIcon,
		...restProps
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Derived state
	// ---------------------------------------------------------------------------

	const classes = $derived(['md-btn', `md-btn--${variant}`, extraClass].filter(Boolean).join(' '));

	// Native disabled only applies to <button>; links use aria-disabled only.
	const isNativeDisabled = $derived(!href && (disabled || softDisabled));

	// aria-disabled on <a> covers both disabled states.
	// On <button> it covers softDisabled only (native `disabled` covers the rest).
	const ariaDisabled = $derived(
		(href && (disabled || softDisabled)) || (!href && softDisabled) ? ('true' as const) : undefined
	);

	// ripple() is a factory — passing `disabled` as a plain value is fine here
	// because $derived re-evaluates the whole expression when it changes, which
	// causes {@attach ripple(...)} to destroy the old attachment and create a
	// fresh one. No update() hook needed.
	const rippleDisabled = $derived(disabled || softDisabled);
</script>

<!--
  Renders as <a> when href is set, <button> otherwise.

  Slot usage:

    Label only:
      <Button variant="filled">Save</Button>

    With leading icon:
      <Button variant="filled">
        {#snippet icon()}
          <svg class="md-btn__icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M17 3H5a2 2 0 0 0-2 2v14l7-3 7 3V5a2 2 0 0 0-2-2z"/>
          </svg>
        {/snippet}
        Save
      </Button>

    With trailing icon:
      <Button variant="text">
        Open
        {#snippet trailingIcon()}
          <svg class="md-btn__icon md-btn__icon--trailing" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/>
            <path d="M14 3v2h3.59L8.76 13.83l1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        {/snippet}
      </Button>

    As a link:
      <Button variant="outlined" href="/dashboard">Dashboard</Button>

    Soft-disabled (focusable):
      <Button variant="text" softDisabled>Paste</Button>
-->

{#if href}
	<a
		{href}
		{target}
		role="button"
		class={classes}
		aria-disabled={ariaDisabled}
		tabindex={disabled ? -1 : undefined}
		{@attach ripple({ disabled: rippleDisabled })}
		{...restProps}
	>
		<span class="md-btn__state-layer" aria-hidden="true"></span>
		{#if icon}{@render icon()}{/if}
		{#if children}<span class="md-btn__label">{@render children()}</span>{/if}
		{#if trailingIcon}{@render trailingIcon()}{/if}
	</a>
{:else}
	<button
		{type}
		disabled={isNativeDisabled}
		aria-disabled={ariaDisabled}
		class={classes}
		{@attach ripple({ disabled: rippleDisabled })}
		{...restProps}
	>
		<span class="md-btn__state-layer" aria-hidden="true"></span>
		{#if icon}{@render icon()}{/if}
		{#if children}<span class="md-btn__label">{@render children()}</span>{/if}
		{#if trailingIcon}{@render trailingIcon()}{/if}
	</button>
{/if}
