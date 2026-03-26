<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/**
		 * Accessible label for the chip set toolbar.
		 * Use aria-label OR aria-labelledby (pointing to an existing heading).
		 */
		'aria-label'?: string;
		'aria-labelledby'?: string;

		/** Chip children. */
		children: Snippet;

		/** Additional classes on the wrapper. */
		class?: string;
	}

	let {
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		children,
		class: extraClass
	}: Props = $props();
</script>

<!--
  ChipSet is a toolbar wrapper that handles layout and accessibility for a group
  of chips. Always wrap chips in a ChipSet.

  Usage:

    <ChipSet aria-label="Filters">
      <Chip type="filter" label="Unread" bind:selected={unread} />
      <Chip type="filter" label="Starred" bind:selected={starred} />
      <Chip type="filter" label="Attachments" bind:selected={hasAttachment} />
    </ChipSet>

  With an external heading:

    <h3 id="status-label">Status</h3>
    <ChipSet aria-labelledby="status-label">
      <Chip type="filter" label="Open" bind:selected={open} />
      <Chip type="filter" label="Closed" bind:selected={closed} />
    </ChipSet>
-->

<div
	class={['md-chip-set', extraClass].filter(Boolean).join(' ')}
	role="toolbar"
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
>
	{@render children()}
</div>
