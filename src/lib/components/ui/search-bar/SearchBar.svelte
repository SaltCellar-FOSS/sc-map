<script lang="ts">
	import { ripple } from '$lib/attachments/ripple.js';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	type Props = {
		/**
		 * The <input> value. Bind to this for a controlled input.
		 * If omitted the input is uncontrolled.
		 */
		value?: string;

		/** Placeholder / supporting text shown when the input is empty. */
		placeholder?: string;

		/** Native input type. Defaults to 'search'. */
		type?: HTMLInputAttributes['type'];

		/** Disables the entire bar (container + input + icons). */
		disabled?: boolean;

		/** aria-label for the input. Required when no visible label exists nearby. */
		'aria-label'?: string;

		/** Additional classes merged onto the root element. */
		class?: string;

		/**
		 * Leading icon snippet (typically a search or navigation icon).
		 * Root element should have class="md-search-bar__icon".
		 *
		 * Example:
		 *   {#snippet leadingIcon()}
		 *     <svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
		 *       <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
		 *     </svg>
		 *   {/snippet}
		 */
		leadingIcon?: Snippet;

		/**
		 * Trailing icon(s) snippet (avatar, voice, overflow menu, clear button…).
		 * Wrap each icon in <button class="md-search-bar__icon-btn"> for touch target.
		 *
		 * Example:
		 *   {#snippet trailingIcons()}
		 *     <button class="md-search-bar__icon-btn" aria-label="Clear" onclick={clear}>
		 *       <svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
		 *         <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
		 *       </svg>
		 *     </button>
		 *   {/snippet}
		 */
		trailingIcons?: Snippet;

		// Passthrough — any HTMLInputAttributes (oninput, onsearch, onkeydown, etc.)
		// are spread onto the <input> element, not the root container.
		[key: string]: unknown;
	};

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		value = $bindable(''),
		placeholder,
		type = 'search',
		disabled = false,
		'aria-label': ariaLabel,
		class: extraClass,
		leadingIcon,
		trailingIcons,
		...restProps
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Derived
	// ---------------------------------------------------------------------------

	const containerClasses = $derived(
		['md-search-bar', disabled && 'md-search-bar--disabled', extraClass].filter(Boolean).join(' ')
	);
</script>

<!--
  HTML structure:
    <div class="md-search-bar">
      <span class="md-search-bar__state-layer" />
      <div class="md-search-bar__leading">   [optional — leadingIcon snippet]
        <svg class="md-search-bar__icon" />
      </div>
      <input class="md-search-bar__input" />
      <div class="md-search-bar__trailing">  [optional — trailingIcons snippet]
        <button class="md-search-bar__icon-btn">
          <svg class="md-search-bar__icon" />
        </button>
      </div>
    </div>

  The ripple attachment fires on pointerdown on the container, giving the
  full-surface press wave. Individual trailing icon buttons handle their own
  interaction feedback via .md-search-bar__icon-btn hover styles.

  The container is a <div> (not a <button>) because it contains an <input>;
  interactive container semantics come from the inner input, not the wrapper.
  When used as a decorative trigger with no input, add role="button" and
  tabindex="0" via restProps on the container — but that use case is outside
  the scope of this purely-presentational Search Bar component.
-->

<div
	class={containerClasses}
	{@attach ripple({ disabled, color: 'var(--md-comp-search-bar-hover-state-layer-color)' })}
>
	<span class="md-search-bar__state-layer" aria-hidden="true"></span>

	{#if leadingIcon}
		<div class="md-search-bar__leading">
			{@render leadingIcon()}
		</div>
	{/if}

	<input
		class="md-search-bar__input"
		{type}
		{placeholder}
		{disabled}
		aria-label={ariaLabel}
		bind:value
		{...restProps}
	/>

	{#if trailingIcons}
		<div class="md-search-bar__trailing">
			{@render trailingIcons()}
		</div>
	{/if}
</div>
