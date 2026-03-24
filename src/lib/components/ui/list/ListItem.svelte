<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { ripple } from '$lib/attachments/ripple.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	/**
	 * Line count determines min-height and vertical padding.
	 * 'auto' infers from slots: overline or supporting → two-line,
	 *        overline + supporting together → three-line.
	 */
	type Lines = 'one' | 'two' | 'three' | 'auto';

	type Props = {
		/**
		 * Number of text lines. 'auto' detects from snippet presence.
		 * Explicit values are safer if you know what you're rendering.
		 */
		lines?: Lines;

		/**
		 * When href is set, renders as <a>. When type='button', renders <button>.
		 * Otherwise renders as <li> (non-interactive).
		 */
		href?: string;
		target?: HTMLAnchorAttributes['target'];
		type?: 'button' | 'submit' | 'reset';

		disabled?: boolean;
		class?: string;

		// ---- Snippets ----

		/** Primary text (required). body-large, on-surface. */
		children: Snippet;

		/**
		 * Small text ABOVE the headline. label-small, on-surface-variant.
		 * Presence of overline + supporting → three-line.
		 */
		overline?: Snippet;

		/**
		 * Secondary text BELOW the headline. body-medium, on-surface-variant.
		 * Presence alone → two-line.
		 */
		supporting?: Snippet;

		/**
		 * Leading slot: icon (.md-list-item__icon), avatar (.md-list-item__avatar),
		 * or image (.md-list-item__image).
		 */
		leading?: Snippet;

		/**
		 * Trailing slot: icon, trailing-text (.md-list-item__trailing-text),
		 * or any control (switch, checkbox, icon button).
		 */
		trailing?: Snippet;

		[key: string]: unknown;
	};

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		lines = 'auto',
		href,
		target,
		type,
		disabled = false,
		class: extraClass,
		children,
		overline,
		supporting,
		leading,
		trailing,
		...restProps
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Derived
	// ---------------------------------------------------------------------------

	// Infer line count when 'auto': overline + supporting = three, supporting alone = two
	const resolvedLines = $derived((): Lines => {
		if (lines !== 'auto') return lines;
		if (overline && supporting) return 'three';
		if (supporting || overline) return 'two';
		return 'one';
	});

	const isInteractive = $derived(!!(href || type || restProps.onclick));

	const classes = $derived(
		[
			'md-list-item',
			resolvedLines() !== 'one' && `md-list-item--${resolvedLines()}-line`,
			isInteractive && 'md-list-item--interactive',
			disabled && 'md-list-item--disabled',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);

	const isNativeDisabled = $derived(!!(!href && disabled));
	const ariaDisabled = $derived(href && disabled ? ('true' as const) : undefined);
</script>

<!--
  Renders as:
    <a>       when href is set
    <button>  when type is set (or onclick without href)
    <li>      otherwise (non-interactive, default)

  Usage examples:

    Non-interactive one-line:
      <ListItem>
        {#snippet leading()}<svg class="md-list-item__icon">…</svg>{/snippet}
        Headline text
      </ListItem>

    Interactive two-line as button:
      <ListItem type="button" onclick={handler}>
        {#snippet leading()}<svg class="md-list-item__icon">…</svg>{/snippet}
        Headline text
        {#snippet supporting()}Secondary text{/snippet}
        {#snippet trailing()}<span class="md-list-item__trailing-text">meta</span>{/snippet}
      </ListItem>

    Three-line as link:
      <ListItem href="/detail">
        Headline text
        {#snippet overline()}CATEGORY{/snippet}
        {#snippet supporting()}Supporting text that can wrap to two lines{/snippet}
      </ListItem>

    With avatar:
      <ListItem>
        {#snippet leading()}
          <div class="md-list-item__avatar">AB</div>
        {/snippet}
        Alice Baker
      </ListItem>
-->

{#if href}
	<a
		{href}
		{target}
		class={classes}
		aria-disabled={ariaDisabled}
		tabindex={disabled ? -1 : 0}
		{@attach ripple({ disabled })}
		{...restProps}
	>
		<span class="md-list-item__state-layer" aria-hidden="true"></span>
		{#if leading}<div class="md-list-item__leading">{@render leading()}</div>{/if}
		<div class="md-list-item__content">
			{#if overline}<div class="md-list-item__overline">{@render overline()}</div>{/if}
			<div class="md-list-item__headline">{@render children()}</div>
			{#if supporting}<div class="md-list-item__supporting">{@render supporting()}</div>{/if}
		</div>
		{#if trailing}<div class="md-list-item__trailing">{@render trailing()}</div>{/if}
	</a>
{:else if type || (restProps.onclick && !href)}
	<button
		{type}
		disabled={isNativeDisabled}
		class={classes}
		{@attach ripple({ disabled })}
		{...restProps}
	>
		<span class="md-list-item__state-layer" aria-hidden="true"></span>
		{#if leading}<div class="md-list-item__leading">{@render leading()}</div>{/if}
		<div class="md-list-item__content">
			{#if overline}<div class="md-list-item__overline">{@render overline()}</div>{/if}
			<div class="md-list-item__headline">{@render children()}</div>
			{#if supporting}<div class="md-list-item__supporting">{@render supporting()}</div>{/if}
		</div>
		{#if trailing}<div class="md-list-item__trailing">{@render trailing()}</div>{/if}
	</button>
{:else}
	<li class={classes} {...restProps}>
		<span class="md-list-item__state-layer" aria-hidden="true"></span>
		{#if leading}<div class="md-list-item__leading">{@render leading()}</div>{/if}
		<div class="md-list-item__content">
			{#if overline}<div class="md-list-item__overline">{@render overline()}</div>{/if}
			<div class="md-list-item__headline">{@render children()}</div>
			{#if supporting}<div class="md-list-item__supporting">{@render supporting()}</div>{/if}
		</div>
		{#if trailing}<div class="md-list-item__trailing">{@render trailing()}</div>{/if}
	</li>
{/if}
