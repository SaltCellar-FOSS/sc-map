<script lang="ts">
	import type { Snippet } from 'svelte';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	type Props = {
		/**
		 * Sheet variant:
		 *   'standard' — co-exists with main content, no scrim. Use on tablet/desktop.
		 *   'modal'    — blocks main content with a scrim. Use on mobile or for
		 *                focused flows (e.g. checkout). Dismissed on scrim tap or Escape.
		 */
		variant?: 'standard' | 'modal';

		/**
		 * Whether the sheet is currently open.
		 * Bind with bind:open for two-way control.
		 */
		open?: boolean;

		/** Title text shown in the sheet header. */
		title?: string;

		/**
		 * Called when the sheet requests to close (close button, scrim tap, Escape).
		 * Consumer is responsible for updating `open`. This matches the M3 pattern
		 * of the component being controlled from outside.
		 */
		onclose?: () => void;

		/** Sheet body content. */
		children?: Snippet;

		/**
		 * Optional trailing icon buttons in the header row (e.g. a menu or pin icon).
		 * Use .md-side-sheet__close as a template for accessible icon buttons.
		 */
		headerActions?: Snippet;

		/** Additional classes merged onto the root wrapper element. */
		class?: string;
	};

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		variant = 'modal',
		open = $bindable(false),
		title,
		onclose,
		children,
		headerActions,
		class: extraClass
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Internal state
	// ---------------------------------------------------------------------------

	let closing = $state(false);

	/** The element that had focus before the sheet opened — restored on close. */
	let triggerEl = $state<HTMLElement | null>(null);

	/** The close button — receives focus when the sheet opens (modal only). */
	let closeButtonEl = $state<HTMLButtonElement | null>(null);

	// ---------------------------------------------------------------------------
	// Derived classes
	// ---------------------------------------------------------------------------

	const rootClasses = $derived(
		[
			'md-side-sheet-root',
			variant === 'modal' && 'md-side-sheet-root--modal',
			open && 'md-side-sheet-root--open',
			closing && 'md-side-sheet-root--closing',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);

	const sheetClasses = $derived(
		[
			'md-side-sheet',
			variant === 'modal' && 'md-side-sheet--modal',
			variant === 'modal' && 'md-elevation-1',
			variant === 'standard' && 'md-side-sheet--standard',
			variant === 'standard' && 'md-elevation-0'
		]
			.filter(Boolean)
			.join(' ')
	);

	// ---------------------------------------------------------------------------
	// Animation duration — read from CSS token at runtime
	// Mirrors the pattern used in SearchView.
	// ---------------------------------------------------------------------------

	function exitDurationMs(): number {
		if (typeof document === 'undefined') return 350;
		const raw = getComputedStyle(document.documentElement)
			.getPropertyValue('--md-comp-side-sheet-exit-duration')
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
				: 350;
		return base * scale;
	}

	// ---------------------------------------------------------------------------
	// Open / close
	// ---------------------------------------------------------------------------

	/** Watch `open` prop — when it flips to false, run the exit animation. */
	let prevOpen = $state(open);

	$effect(() => {
		if (prevOpen && !open) {
			// Started closing
			closing = true;
			setTimeout(() => {
				closing = false;
				triggerEl?.focus();
				triggerEl = null;
			}, exitDurationMs());
		}

		if (!prevOpen && open) {
			// Opened — store focused element & move focus into sheet
			triggerEl = document.activeElement as HTMLElement | null;
			if (variant === 'modal') {
				Promise.resolve().then(() => closeButtonEl?.focus());
			}
		}

		prevOpen = open;
	});

	function requestClose() {
		onclose?.();
		// If consumer doesn't bind open, close it ourselves
		if (open) open = false;
	}

	// ---------------------------------------------------------------------------
	// Keyboard handling
	// ---------------------------------------------------------------------------

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			event.preventDefault();
			requestClose();
		}
	}

	// ---------------------------------------------------------------------------
	// Scrim click
	// ---------------------------------------------------------------------------

	function handleScrimClick() {
		requestClose();
	}
</script>

<!--
  Usage — Modal:

    <SideSheet bind:open={detailOpen} title="Details" onclose={() => detailOpen = false}>
      {#snippet children()}
        <p>Sheet body content goes here.</p>
      {/snippet}
    </SideSheet>

  Usage — Standard (placed alongside main content in a flex row):

    <div style="display:flex; height:100vh;">
      <main style="flex:1; overflow:auto;">…</main>
      <SideSheet variant="standard" bind:open={filterOpen} title="Filters" onclose={() => filterOpen = false}>
        {#snippet children()}
          …filter controls…
        {/snippet}
      </SideSheet>
    </div>

  The standard sheet is position:relative and sits in document flow.
  The modal sheet is position:fixed and renders above everything.

  Dismiss methods (modal):
    - Click the scrim
    - Press Escape
    - Click the close button
    - Set open = false programmatically

  The component fires onclose() when any of the above happen.
  The consumer is responsible for setting open = false in response.
  If open is used with bind:open, the component will also update it directly.
-->

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={rootClasses} onkeydown={handleKeydown}>
	<!-- Scrim — modal only, click to close -->
	<div class="md-side-sheet-scrim" aria-hidden="true" onclick={handleScrimClick}></div>

	<!-- Sheet surface -->
	<div
		class={sheetClasses}
		role={variant === 'modal' ? 'dialog' : 'complementary'}
		aria-label={title}
		aria-modal={variant === 'modal' ? 'true' : undefined}
	>
		<!-- Header -->
		<div class="md-side-sheet__header">
			<!-- Close button -->
			<button
				class="md-side-sheet__close"
				type="button"
				aria-label="Close"
				onclick={requestClose}
				bind:this={closeButtonEl}
			>
				<!-- Close icon (✕) -->
				<svg
					class="md-side-sheet__close-icon"
					viewBox="0 0 24 24"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
					/>
				</svg>
			</button>

			{#if title}
				<span class="md-side-sheet__title">{title}</span>
			{/if}

			{#if headerActions}
				<div class="md-side-sheet__header-actions">
					{@render headerActions()}
				</div>
			{/if}
		</div>

		<!-- Divider -->
		<hr class="md-side-sheet__divider" aria-hidden="true" />

		<!-- Body content -->
		<div class="md-side-sheet__content">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
</div>
