<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { ripple } from '$lib/attachments/ripple.js';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	export type CardVariant = 'elevated' | 'filled' | 'outlined';

	type Props = {
		/**
		 * Visual variant.
		 *   elevated  — surface-container-low + elevation-1 shadow
		 *   filled    — surface-container-highest + no shadow
		 *   outlined  — surface + 1px outline-variant border
		 */
		variant?: CardVariant;

		/**
		 * When set, renders the card as an <a> element (interactive link card).
		 * Adds state layer interaction, hover elevation, and ripple.
		 */
		href?: string;

		/** Link target. Only applies when href is set. */
		target?: HTMLAnchorAttributes['target'];

		/**
		 * When true, renders a non-link interactive card as a <div role="button">.
		 * Adds state layer, hover elevation, ripple, and keyboard interaction.
		 * Use this when the card triggers an action rather than navigating.
		 */
		interactive?: boolean;

		/** Disables interaction. Applies 38% opacity and removes pointer events. */
		disabled?: boolean;

		/** Additional classes merged onto the root element. */
		class?: string;

		/**
		 * Full-width media region, rendered at the top before the header.
		 * Clips to the card's top corners.
		 *
		 *   {#snippet media()}
		 *     <img src="…" alt="…" />
		 *   {/snippet}
		 */
		media?: Snippet;

		/**
		 * Optional header row with title, subhead, and thumbnail.
		 * If omitted, use the body slot for fully custom layouts.
		 *
		 * When using the header slot, the component renders the standard
		 * header layout (.md-card__header). Compose using:
		 *   {#snippet header()}
		 *     <span class="md-card__title">Title</span>
		 *     <span class="md-card__subhead">Subhead</span>
		 *   {/snippet}
		 */
		header?: Snippet;

		/**
		 * Optional thumbnail inside the header row (avatar or icon).
		 * Renders a 40px circle at the leading edge of the header.
		 *
		 *   {#snippet thumbnail()}
		 *     <img src="avatar.jpg" alt="Jane" />
		 *   {/snippet}
		 */
		thumbnail?: Snippet;

		/**
		 * Main body / supporting text area. Receives 16px padding.
		 * If you want fully custom layout, put everything here and omit header.
		 */
		children?: Snippet;

		/**
		 * Optional actions row at the bottom.
		 * Usually contains text or outlined Button components.
		 *
		 *   {#snippet actions()}
		 *     <Button variant="text">Share</Button>
		 *     <Button variant="text">Learn More</Button>
		 *   {/snippet}
		 */
		actions?: Snippet;

		// Passthrough
		[key: string]: unknown;
	};

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		variant = 'elevated',
		href,
		target,
		interactive = false,
		disabled = false,
		class: extraClass,
		media,
		header,
		thumbnail,
		children,
		actions,
		...restProps
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Derived
	// ---------------------------------------------------------------------------

	const isInteractive = $derived(!!(href || interactive));

	const classes = $derived(
		['md-card', `md-card--${variant}`, extraClass].filter(Boolean).join(' ')
	);

	// Ripple is only enabled for interactive, non-disabled cards
	const rippleDisabled = $derived(disabled || !isInteractive);
</script>

<!--
  Usage — Static card (no interaction):
    <Card variant="elevated">
      {#snippet header()}
        <span class="md-card__title">Card title</span>
        <span class="md-card__subhead">Subhead</span>
      {/snippet}
      {#snippet children()}
        <p>Supporting text describing the card content.</p>
      {/snippet}
      {#snippet actions()}
        <Button variant="text">Action</Button>
      {/snippet}
    </Card>

  Usage — Link card:
    <Card variant="outlined" href="/detail/123">
      {#snippet header()}
        <span class="md-card__title">Clickable card</span>
      {/snippet}
    </Card>

  Usage — Interactive action card:
    <Card variant="filled" interactive onclick={handleClick}>
      {#snippet children()}
        <p>Click me</p>
      {/snippet}
    </Card>

  Usage — Card with media:
    <Card variant="elevated">
      {#snippet media()}
        <img src="hero.jpg" alt="Hero image" />
      {/snippet}
      {#snippet header()}
        <span class="md-card__title">With Media</span>
      {/snippet}
    </Card>
-->

{#if href}
	<!-- Link card -->
	<a
		{href}
		{target}
		class={classes}
		aria-disabled={disabled ? 'true' : undefined}
		tabindex={disabled ? -1 : undefined}
		{@attach ripple({ disabled: rippleDisabled })}
		{...restProps}
	>
		<span class="md-card__state-layer" aria-hidden="true"></span>

		{#if media}
			<div class="md-card__media">
				{@render media()}
			</div>
		{/if}

		{#if header}
			<div class="md-card__header">
				{#if thumbnail}
					<div class="md-card__thumbnail">{@render thumbnail()}</div>
				{/if}
				<div class="md-card__header-text">
					{@render header()}
				</div>
			</div>
		{/if}

		{#if children}
			<div class="md-card__body">{@render children()}</div>
		{/if}

		{#if actions}
			<div class="md-card__actions">{@render actions()}</div>
		{/if}
	</a>
{:else if interactive}
	<!-- Interactive div card -->
	<div
		role="button"
		tabindex={disabled ? -1 : 0}
		class={classes}
		aria-disabled={disabled ? 'true' : undefined}
		{@attach ripple({ disabled: rippleDisabled })}
		{...restProps}
	>
		<span class="md-card__state-layer" aria-hidden="true"></span>

		{#if media}
			<div class="md-card__media">
				{@render media()}
			</div>
		{/if}

		{#if header}
			<div class="md-card__header">
				{#if thumbnail}
					<div class="md-card__thumbnail">{@render thumbnail()}</div>
				{/if}
				<div class="md-card__header-text">
					{@render header()}
				</div>
			</div>
		{/if}

		{#if children}
			<div class="md-card__body">{@render children()}</div>
		{/if}

		{#if actions}
			<div class="md-card__actions">{@render actions()}</div>
		{/if}
	</div>
{:else}
	<!-- Static card -->
	<div class={classes} {...restProps}>
		<!-- No state layer on static cards -->

		{#if media}
			<div class="md-card__media">
				{@render media()}
			</div>
		{/if}

		{#if header}
			<div class="md-card__header">
				{#if thumbnail}
					<div class="md-card__thumbnail">{@render thumbnail()}</div>
				{/if}
				<div class="md-card__header-text">
					{@render header()}
				</div>
			</div>
		{/if}

		{#if children}
			<div class="md-card__body">{@render children()}</div>
		{/if}

		{#if actions}
			<div class="md-card__actions">{@render actions()}</div>
		{/if}
	</div>
{/if}
