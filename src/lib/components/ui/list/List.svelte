<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		/**
		 * The HTML element to render as.
		 * Use 'ul' or 'ol' for semantic lists, 'div' when semantics are
		 * provided by the parent context (e.g. role="listbox" in SearchView).
		 */
		as?: 'ul' | 'ol' | 'div' | 'nav';

		/** Remove the default 8px block padding (e.g. when inside a card). */
		noPadding?: boolean;

		/** ARIA role override. Defaults to 'list' for ul/ol, nothing for div. */
		role?: string;

		class?: string;
		children: Snippet;

		[key: string]: unknown;
	};

	let {
		as = 'ul',
		noPadding = false,
		role,
		class: extraClass,
		children,
		...restProps
	}: Props = $props();

	const classes = $derived(
		['md-list', noPadding && 'md-list--no-padding', extraClass].filter(Boolean).join(' ')
	);
</script>

<svelte:element this={as} class={classes} {role} {...restProps}>
	{@render children()}
</svelte:element>
