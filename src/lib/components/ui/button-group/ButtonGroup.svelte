<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { Snippet } from 'svelte';
	import { ripple } from '$lib/attachments/ripple.js';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	export interface ButtonGroupItem {
		/** Unique identifier for this item. Used to track selection state. */
		value: string;

		/** Label text displayed inside the button. */
		label: string;

		/**
		 * Optional accessible label override. Use when the visual label alone
		 * is not descriptive enough for screen readers.
		 */
		ariaLabel?: string;

		/**
		 * Optional icon snippet. Root element should be a 24px SVG.
		 *
		 *   icon: iconSnippet
		 *   where {#snippet iconSnippet()}<svg ...>…</svg>{/snippet}
		 */
		icon?: Snippet;

		/** Disables this specific button. */
		disabled?: boolean;

		/** Renders as an anchor tag when set. */
		href?: string;

		/** Link target. Only applies when href is set. */
		target?: string;
	}

	type ToggleMode = 'single' | 'multi' | 'none';
	type GroupVariant = 'connected' | 'standard';
	type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'elevated';

	interface Props {
		/**
		 * The button items to render.
		 */
		items: ButtonGroupItem[];

		/**
		 * Layout variant:
		 *   'connected' — 2px gaps, outer pill corners, inner small (8px) corners.
		 *                 The defining M3 Expressive connected button group look.
		 *   'standard'  — no gaps, shared borders, only end corners rounded.
		 *                 Use for dense toolbars (bold / italic / underline etc).
		 * Default: 'connected'
		 */
		variant?: GroupVariant;

		/**
		 * Button visual style. All items in the group share the same style.
		 *   'filled'   — primary background
		 *   'tonal'    — secondary-container background
		 *   'outlined' — transparent with outline border
		 *   'elevated' — surface-container-low + shadow
		 * Default: 'tonal'
		 */
		buttonVariant?: ButtonVariant;

		/**
		 * Toggle behaviour:
		 *   'single' — radio: exactly one item selected at a time.
		 *              Clicking the selected item does nothing (stays selected).
		 *   'multi'  — checkbox: any number of items can be selected.
		 *              Clicking a selected item deselects it.
		 *   'none'   — no selection state; all items are regular action buttons.
		 * Default: 'none'
		 */
		toggleMode?: ToggleMode;

		/**
		 * Currently selected item value(s).
		 * — For toggleMode='single': string | undefined
		 * — For toggleMode='multi':  string[]
		 * — For toggleMode='none':   ignored
		 *
		 * Bind with bind:selected for two-way control.
		 */
		selected?: string | string[];

		/**
		 * Accessible label for the group (role="group").
		 * Required for accessibility — describe what the group controls.
		 * E.g. "Text formatting", "Sort order", "View mode"
		 */
		'aria-label': string;

		/**
		 * Called when an item is clicked (all toggle modes and none).
		 * Receives the item value and the new full selected state.
		 */
		onchange?: (value: string, selected: string | string[] | undefined) => void;

		/** Additional classes on the group wrapper. */
		class?: string;
	}

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		items,
		variant = 'connected',
		buttonVariant = 'tonal',
		toggleMode = 'none',
		selected = $bindable(toggleMode === 'multi' ? [] : undefined),
		'aria-label': ariaLabel,
		onchange,
		class: extraClass
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Selection helpers
	// ---------------------------------------------------------------------------

	function isChecked(value: string): boolean {
		if (toggleMode === 'none') return false;
		if (toggleMode === 'single') return selected === value;
		if (toggleMode === 'multi') return Array.isArray(selected) && selected.includes(value);
		return false;
	}

	function handleClick(item: ButtonGroupItem) {
		if (item.disabled) return;

		let next: string | string[] | undefined = selected;

		if (toggleMode === 'single') {
			// Radio: select the clicked item (can't deselect in single mode)
			next = item.value;
			selected = next;
		} else if (toggleMode === 'multi') {
			const arr = Array.isArray(selected) ? [...selected] : [];
			const idx = arr.indexOf(item.value);
			if (idx >= 0) {
				arr.splice(idx, 1);
			} else {
				arr.push(item.value);
			}
			next = arr;
			selected = next;
		}
		// toggleMode === 'none': no state change, just fire onchange

		onchange?.(item.value, next);
	}

	// ---------------------------------------------------------------------------
	// Position class for each item
	// ---------------------------------------------------------------------------

	function positionClass(index: number, total: number): string {
		if (total === 1) return 'md-btn-group__item--only';
		if (index === 0) return 'md-btn-group__item--leading';
		if (index === total - 1) return 'md-btn-group__item--trailing';
		return 'md-btn-group__item--middle';
	}

	// ---------------------------------------------------------------------------
	// Derived group classes
	// ---------------------------------------------------------------------------

	const groupClasses = $derived(
		[
			'md-btn-group',
			`md-btn-group--${variant}`,
			`md-btn-group--${buttonVariant}`,
			toggleMode !== 'none' && `md-btn-group--${toggleMode}`,
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<!--
  Usage — Single-select connected tonal group:

    <ButtonGroup
      items={[
        { value: 'day',   label: 'Day' },
        { value: 'week',  label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
      toggleMode="single"
      bind:selected={viewMode}
      aria-label="Calendar view"
      onchange={(val) => console.log('Selected:', val)}
    />

  Usage — Multi-select with icons:

    <script>
      let formats = $state([]);
      const boldIcon = ...; // Snippet
    </script>

    <ButtonGroup
      items={[
        { value: 'bold',   label: 'Bold',   icon: boldIcon },
        { value: 'italic', label: 'Italic', icon: italicIcon },
        { value: 'under',  label: 'Underline', icon: underIcon },
      ]}
      toggleMode="multi"
      variant="standard"
      buttonVariant="outlined"
      bind:selected={formats}
      aria-label="Text formatting"
    />

  Usage — Non-toggle action group:

    <ButtonGroup
      items={[
        { value: 'share', label: 'Share' },
        { value: 'copy',  label: 'Copy' },
        { value: 'print', label: 'Print' },
      ]}
      toggleMode="none"
      buttonVariant="filled"
      aria-label="Document actions"
      onchange={(val) => handleAction(val)}
    />

  Notes:
  - For toggleMode='single', clicking the already-selected item keeps it selected.
  - For toggleMode='multi', clicking a selected item deselects it.
  - The checked item in connected mode gets full pill corners (pops out).
  - All items share the same buttonVariant style.
  - Disabled items retain their visual state but don't respond to interaction.
-->

<div class={groupClasses} role="group" aria-label={ariaLabel}>
	{#each items as item, i (item.value)}
		{@const checked = isChecked(item.value)}
		{@const position = positionClass(i, items.length)}
		{@const itemClasses = ['md-btn-group__item', position, checked && 'md-btn-group__item--checked']
			.filter(Boolean)
			.join(' ')}

		{#if item.href}
			<a
				class={itemClasses}
				href={item.href}
				target={item.target}
				role={toggleMode !== 'none' ? 'radio' : undefined}
				aria-checked={toggleMode !== 'none' ? checked : undefined}
				aria-label={item.ariaLabel}
				aria-disabled={item.disabled ? 'true' : undefined}
				tabindex={item.disabled ? -1 : undefined}
				onclick={() => handleClick(item)}
				{@attach ripple({ disabled: item.disabled })}
			>
				<span class="md-btn-group__state-layer" aria-hidden="true"></span>
				{#if item.icon}
					<span class="md-btn-group__icon" aria-hidden="true">
						{@render item.icon()}
					</span>
				{/if}
				<span class="md-btn-group__label">{item.label}</span>
			</a>
		{:else}
			<button
				class={itemClasses}
				type="button"
				disabled={item.disabled}
				role={toggleMode === 'single' ? 'radio' : toggleMode === 'multi' ? 'checkbox' : undefined}
				aria-checked={toggleMode !== 'none' ? checked : undefined}
				aria-label={item.ariaLabel}
				onclick={() => handleClick(item)}
				{@attach ripple({ disabled: item.disabled })}
			>
				<span class="md-btn-group__state-layer" aria-hidden="true"></span>
				{#if item.icon}
					<span class="md-btn-group__icon" aria-hidden="true">
						{@render item.icon()}
					</span>
				{/if}
				<span class="md-btn-group__label">{item.label}</span>
			</button>
		{/if}
	{/each}
</div>
