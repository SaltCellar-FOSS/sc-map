<script lang="ts">
	/**
	 * Material 3 List — Svelte-native, SSR-safe
	 *
	 * A semantic wrapper for ListItem components. Handles subheaders, dividers,
	 * and surface styling. Renders as a <ul> by default.
	 *
	 * Props:
	 *   subheader   — section label text rendered above the list
	 *   dividers    — 'none' | 'full' | 'inset' | 'middle'
	 *   surface     — apply surface-container background + border-radius
	 *   elevation   — 0–5, used when surface=true
	 *   class
	 *
	 * Snippet:
	 *   default — ListItem children
	 */

	type Dividers = 'none' | 'full' | 'inset' | 'middle';

	interface Props {
		subheader?: string;
		dividers?: Dividers;
		surface?: boolean;
		elevation?: 0 | 1 | 2 | 3 | 4 | 5;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		subheader = '',
		dividers = 'none',
		surface = false,
		elevation = 0,
		class: extraClass = '',
		children
	}: Props = $props();
</script>

<div
	class="list-root {extraClass}"
	class:list-root--surface={surface}
	style={surface ? `box-shadow: var(--md-sys-elevation-${elevation});` : ''}
>
	{#if subheader}
		<div class="list-subheader" role="presentation">{subheader}</div>
	{/if}

	<ul class="list list--dividers-{dividers}" role="list">
		{#if children}{@render children()}{/if}
	</ul>
</div>

<style>
	.list-root {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.list-root--surface {
		background-color: var(--md-sys-color-surface-container);
		border-radius: var(--md-sys-shape-corner-medium);
		overflow: hidden;
	}

	/* ---- Subheader ---- */
	.list-subheader {
		display: flex;
		align-items: center;
		height: var(--md-comp-list-subheader-height);
		padding: 0 var(--md-comp-list-item-padding-h);
		font-family: var(--md-sys-typescale-label-font);
		font-size: var(--md-sys-typescale-body-medium-size);
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
		letter-spacing: 0.00625em;
	}

	/* ---- List ---- */
	.list {
		list-style: none;
		margin: 0;
		padding: var(--md-comp-drawer-section-gap) 0;
		display: flex;
		flex-direction: column;
	}

	/* ---- Dividers ---- */

	/* Full-bleed divider between every item */
	.list--dividers-full :global(.li + .li)::before,
	.list--dividers-full :global(li + li)::before {
		content: '';
		display: block;
		height: var(--md-comp-list-divider-thickness);
		background-color: var(--md-sys-color-outline-variant);
		margin: 0;
	}

	/* Inset divider (aligned to text, after leading icon) */
	.list--dividers-inset :global(.li + .li)::before,
	.list--dividers-inset :global(li + li)::before {
		content: '';
		display: block;
		height: var(--md-comp-list-divider-thickness);
		background-color: var(--md-sys-color-outline-variant);
		margin-left: calc(
			var(--md-comp-list-item-padding-h) + var(--md-comp-list-item-icon-size) +
				var(--md-comp-list-item-gap)
		);
	}

	/* Middle divider (inset on both sides) */
	.list--dividers-middle :global(.li + .li)::before,
	.list--dividers-middle :global(li + li)::before {
		content: '';
		display: block;
		height: var(--md-comp-list-divider-thickness);
		background-color: var(--md-sys-color-outline-variant);
		margin: 0 var(--md-comp-list-item-padding-h);
	}
</style>
