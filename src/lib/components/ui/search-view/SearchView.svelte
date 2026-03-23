<script lang="ts">
	import type { Snippet } from 'svelte';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	interface Props {
		/**
		 * The shared query value — single source of truth for both the
		 * triggering bar (via the children snippet argument) and the
		 * header input inside the panel. Bind with bind:value.
		 */
		value?: string;

		/** Placeholder shown in the header input when value is empty. */
		placeholder?: string;

		/** Additional classes merged onto the root element. */
		class?: string;

		/**
		 * The triggering SearchBar (or any element).
		 * Receives `{ open, value }` so it can reflect state:
		 *
		 *   {#snippet children({ open, value })}
		 *     <SearchBar
		 *       bind:value
		 *       placeholder="Search"
		 *       aria-expanded={open}
		 *     />
		 *   {/snippet}
		 *
		 * Clicking anywhere inside this slot opens the view.
		 */
		children: Snippet<[{ open: boolean; value: string }]>;

		/**
		 * The results / suggestions content rendered inside the scrollable
		 * panel region. Receives the live `value` so it can filter:
		 *
		 *   {#snippet results({ value })}
		 *     {#each filter(items, value) as item}
		 *       <div class="result-item">{item.label}</div>
		 *     {/each}
		 *   {/snippet}
		 */
		results?: Snippet<[{ value: string; close: () => void }]>;

		/**
		 * Optional trailing icons inside the panel header (e.g. a clear button).
		 * Use .md-search-view__icon-btn for correct touch targets.
		 */
		trailingIcons?: Snippet;

		/** Called when the user submits (Enter / search IME action). */
		onsearch?: (value: string) => void;

		/** Start with the panel open (useful for Storybook / testing). */
		initialOpen?: boolean;
	}

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		value = $bindable(''),
		placeholder,
		class: extraClass,
		children,
		results,
		trailingIcons,
		onsearch,
		initialOpen = false
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Internal state
	// ---------------------------------------------------------------------------

	let open = $state(initialOpen);
	let closing = $state(false); // true during the exit animation

	// Refs
	let rootEl = $state<HTMLElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	let triggerEl = $state<HTMLElement | null>(null); // element to restore focus to

	// ---------------------------------------------------------------------------
	// Derived
	// ---------------------------------------------------------------------------

	const rootClasses = $derived(
		[
			'md-search-view',
			open && 'md-search-view--open',
			closing && 'md-search-view--closing',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);

	// Duration in ms for the closing animation, read from CSS token at runtime.
	// Falls back to 250ms if the token isn't available (SSR / headless test).
	function closingDurationMs(): number {
		if (typeof document === 'undefined') return 250;
		const raw = getComputedStyle(document.documentElement)
			.getPropertyValue('--md-sys-motion-duration-medium1')
			.trim();
		const scale = parseFloat(
			getComputedStyle(document.documentElement)
				.getPropertyValue('--md-sys-motion-duration-scale')
				.trim() || '1'
		);
		const base = raw.endsWith('ms')
			? parseFloat(raw)
			: raw.endsWith('s')
				? parseFloat(raw) * 1000
				: 250;
		return base * scale;
	}

	// ---------------------------------------------------------------------------
	// Open / close
	// ---------------------------------------------------------------------------

	function openView() {
		if (open || closing) return;
		// Store the currently focused element so we can restore focus on close
		triggerEl = document.activeElement as HTMLElement | null;
		open = true;
	}

	function closeView() {
		if (!open) return;
		closing = true;
		open = false;

		// Wait for the exit animation to finish before hiding the panel
		setTimeout(() => {
			closing = false;
			// Restore focus to the triggering element
			triggerEl?.focus();
			triggerEl = null;
		}, closingDurationMs());
	}

	// ---------------------------------------------------------------------------
	// Focus management
	// ---------------------------------------------------------------------------

	$effect(() => {
		if (open && inputEl) {
			// Defer one microtask so the panel is visible before we call focus()
			Promise.resolve().then(() => inputEl?.focus());
		}
	});

	// ---------------------------------------------------------------------------
	// Keyboard handling
	// ---------------------------------------------------------------------------

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeView();
		}
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			onsearch?.(value);
		}
	}

	// ---------------------------------------------------------------------------
	// Click-outside to close
	// ---------------------------------------------------------------------------

	function handleDocumentPointerdown(event: PointerEvent) {
		if (!open) return;
		if (!rootEl) return;
		if (!rootEl.contains(event.target as Node)) {
			closeView();
		}
	}

	$effect(() => {
		document.addEventListener('pointerdown', handleDocumentPointerdown);
		return () => {
			document.removeEventListener('pointerdown', handleDocumentPointerdown);
		};
	});
</script>

<!--
  Usage:

    <SearchView bind:value={query} placeholder="Search…" {onsearch}>

      {#snippet children({ open, value })}
        <SearchBar
          bind:value
          {placeholder}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {#snippet leadingIcon()}
            <svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          {/snippet}
        </SearchBar>
      {/snippet}

      {#snippet results({ value })}
        {#each filteredItems(value) as item}
          <div role="option" class="result-item">{item.label}</div>
        {/each}
      {/snippet}

    </SearchView>

  The view closes on: back button click, Escape key, or click outside.
  Focus is auto-moved to the header input on open, and restored on close.
-->

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={rootClasses} bind:this={rootEl} onkeydown={handleKeydown}>
	<!-- Bar slot — clicking anywhere here opens the view -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="md-search-view__bar" onclick={openView} role="search">
		{@render children({ open, value })}
	</div>

	<!-- Panel -->
	<div
		class="md-search-view__panel"
		role="dialog"
		aria-label={placeholder ?? 'Search'}
		aria-modal="false"
	>
		<!-- Header -->
		<div class="md-search-view__header">
			<!-- Back button -->
			<button
				class="md-search-view__back"
				aria-label="Close search"
				type="button"
				onclick={closeView}
			>
				<svg
					class="md-search-view__back-icon"
					viewBox="0 0 24 24"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
				</svg>
			</button>

			<!-- Live input -->
			<input
				class="md-search-view__input"
				type="search"
				{placeholder}
				bind:value
				bind:this={inputEl}
				onkeydown={handleInputKeydown}
				autocomplete="off"
				aria-autocomplete="list"
				role="combobox"
				aria-expanded={open}
				aria-controls="md-search-view-results"
			/>

			<!-- Optional trailing icons -->
			{#if trailingIcons}
				<div class="md-search-view__trailing">
					{@render trailingIcons()}
				</div>
			{/if}
		</div>

		<!-- Divider -->
		<hr class="md-search-view__divider" aria-hidden="true" />

		<!-- Results -->
		<div class="md-search-view__results" id="md-search-view-results" role="listbox" tabindex="-1">
			{#if results}
				{@render results({ value, close: closeView })}
			{/if}
		</div>
	</div>
</div>
