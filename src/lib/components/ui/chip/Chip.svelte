<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */

	import type { Snippet } from 'svelte';
	import { ripple } from '$lib/attachments/ripple.js';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	interface Props {
		/**
		 * Chip type — determines behaviour, anatomy, and available props:
		 *
		 *   'assist'     — triggers a smart action. No toggle. Optional icon.
		 *                  Renders as <a> when href is set, <button> otherwise.
		 *
		 *   'filter'     — toggleable. Shows checkmark when selected.
		 *                  Optional leading icon (fades out as checkmark fades in).
		 *                  bind:selected for two-way toggle control.
		 *
		 *   'input'      — represents user-entered data (e.g. an email address).
		 *                  Always has a trailing remove (×) button.
		 *                  Optional leading icon OR avatar image.
		 *
		 *   'suggestion' — dynamic suggestion (search reply, filter option etc).
		 *                  No toggle. Optional leading icon.
		 *                  Renders as <a> when href is set, <button> otherwise.
		 */
		type: 'assist' | 'filter' | 'input' | 'suggestion';

		/** The visible text label. Required. */
		label: string;

		/**
		 * Elevated variant — surface-container-low background + elevation-1 shadow.
		 * Replaces the outline. Available for assist, filter, and suggestion.
		 * Not available for input chips.
		 */
		elevated?: boolean;

		/**
		 * [filter only] Whether this chip is currently selected.
		 * Bind with bind:selected for two-way control.
		 */
		selected?: boolean;

		/** Disables the chip. */
		disabled?: boolean;

		/**
		 * Renders the root element as an <a> tag instead of <button>.
		 * Available for assist and suggestion chips.
		 */
		href?: string;

		/** Link target. Only applies when href is set. */
		target?: string;

		/**
		 * Optional leading icon snippet.
		 * Should contain a 24px SVG (it will be sized to 18px by the CSS).
		 *
		 *   {#snippet icon()}
		 *     <svg viewBox="0 0 24 24"><path d="…"/></svg>
		 *   {/snippet}
		 */
		icon?: Snippet;

		/**
		 * [input only] Avatar image URL. When set, renders a circular avatar
		 * instead of an icon. Overrides the icon snippet.
		 */
		avatarSrc?: string;

		/** Alt text for the avatar image. */
		avatarAlt?: string;

		/**
		 * [filter only] Called when the chip is toggled.
		 * Receives the new selected state.
		 */
		onchange?: (selected: boolean) => void;

		/** Called when the chip (not the remove button) is clicked. */
		onclick?: (event: MouseEvent) => void;

		/** Additional accessible label (overrides the visible label for screen readers). */
		'aria-label'?: string;

		/** Additional classes on the root element. */
		class?: string;
	}

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		type,
		label,
		elevated = false,
		selected = $bindable(false),
		disabled = false,
		href,
		target,
		icon,
		avatarSrc,
		avatarAlt = '',
		onchange,
		onclick,
		'aria-label': ariaLabel,
		class: extraClass
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Derived state
	// ---------------------------------------------------------------------------

	const hasLeading = $derived(!!icon || (type === 'input' && !!avatarSrc));

	// Filter chip: checkmark slot is always present (animates in/out).
	// The leading wrapper is visible whenever there's an icon OR for filter chips
	// (checkmark needs somewhere to live even with no icon).
	const showLeading = $derived(hasLeading || type === 'filter');

	const isLink = $derived((type === 'assist' || type === 'suggestion') && !!href);

	// ---------------------------------------------------------------------------
	// Root classes
	// ---------------------------------------------------------------------------

	const rootClasses = $derived(
		[
			'md-chip',
			`md-chip--${type}`,
			elevated && 'md-chip--elevated',
			selected && 'md-chip--selected',
			disabled && 'md-chip--disabled',
			showLeading && 'md-chip--has-icon',
			type === 'input' && avatarSrc && 'md-chip--avatar',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);

	// ---------------------------------------------------------------------------
	// Interaction
	// ---------------------------------------------------------------------------

	function handleClick(event: MouseEvent) {
		if (disabled) return;

		if (type === 'filter') {
			selected = !selected;
			onchange?.(selected);
		}

		onclick?.(event);
	}

	// ---------------------------------------------------------------------------
	// ARIA role
	// ---------------------------------------------------------------------------

	const role = $derived(
		type === 'filter' ? 'checkbox' : type === 'input' ? 'button' : undefined // assist/suggestion use native button/a semantics
	);
</script>

<!--
  Usage — Assist chip:

    <Chip type="assist" label="Add to calendar" onclick={handleAdd}>
      {#snippet icon()}
        <svg viewBox="0 0 24 24"><path d="…"/></svg>
      {/snippet}
    </Chip>

  Usage — Assist chip as link:

    <Chip type="assist" label="Open maps" href="https://maps.google.com" target="_blank" />

  Usage — Filter chip with bind:selected:

    <Chip type="filter" label="Unread" bind:selected={filterUnread}
          onchange={(v) => applyFilter(v)} />

  Usage — Filter chip with icon (icon fades out as checkmark fades in):

    <Chip type="filter" label="Starred" bind:selected={starred}>
      {#snippet icon()}<svg viewBox="0 0 24 24"><path d="…"/></svg>{/snippet}
    </Chip>

  Usage — Input chip with remove:

    <Chip type="input" label="jane@example.com"
          onremove={() => removeContact('jane')} />

  Usage — Input chip with avatar:

    <Chip type="input" label="Jane Doe"
          avatarSrc="/avatars/jane.jpg" avatarAlt="Jane Doe"
          onremove={() => removeContact('jane')} />

  Usage — Suggestion chip:

    <Chip type="suggestion" label="Sounds good!" onclick={handleSuggestion} />

  Usage — Elevated (over image backgrounds):

    <Chip type="suggestion" label="Share" elevated onclick={handleShare} />

  Usage — ChipSet (import and use alongside chips):

    <div class="md-chip-set" role="toolbar" aria-label="Filters">
      <Chip type="filter" label="All" bind:selected={all} />
      <Chip type="filter" label="Active" bind:selected={active} />
    </div>
-->

{#if isLink}
	<!-- Assist / suggestion rendered as anchor -->
	<a
		class={rootClasses}
		{href}
		{target}
		aria-label={ariaLabel}
		aria-disabled={disabled ? 'true' : undefined}
		tabindex={disabled ? -1 : undefined}
		onclick={handleClick}
		{@attach ripple({ disabled })}
	>
		<span class="md-chip__state-layer" aria-hidden="true"></span>

		{#if showLeading}
			<span class="md-chip__leading" aria-hidden="true">
				{#if icon}
					<span class="md-chip__icon">{@render icon()}</span>
				{/if}
			</span>
		{/if}

		<span class="md-chip__label">{label}</span>
	</a>
{:else}
	<!-- All other chips rendered as button -->
	<button
		class={rootClasses}
		type="button"
		{disabled}
		{role}
		aria-checked={type === 'filter' ? selected : undefined}
		aria-label={ariaLabel}
		onclick={handleClick}
		{@attach ripple({ disabled })}
	>
		<span class="md-chip__state-layer" aria-hidden="true"></span>

		{#if showLeading}
			<span class="md-chip__leading" aria-hidden="true">
				{#if type === 'input' && avatarSrc}
					<!-- Avatar image -->
					<img class="md-chip__avatar" src={avatarSrc} alt={avatarAlt} />
				{:else if icon}
					<!-- Leading icon -->
					<span class="md-chip__icon">{@render icon()}</span>
				{/if}

				{#if type === 'filter'}
					<!-- Checkmark (always rendered for filter chips; animates in on select) -->
					<span class="md-chip__checkmark" aria-hidden="true">
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</span>
				{/if}
			</span>
		{/if}

		<span class="md-chip__label">{label}</span>
	</button>
{/if}
