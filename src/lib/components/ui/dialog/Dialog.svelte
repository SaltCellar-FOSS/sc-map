<script lang="ts">
	import type { Snippet } from 'svelte';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	type Props = {
		/**
		 * Whether the dialog is open. Bind with bind:open for two-way control.
		 */
		open?: boolean;

		/**
		 * ARIA role. Use 'alertdialog' for urgent confirmations (deletions, errors)
		 * that require a response. Default is 'dialog'.
		 */
		type?: 'dialog' | 'alertdialog';

		/** Accessible label when there is no visible headline. */
		'aria-label'?: string;

		/**
		 * Called when the dialog requests to close (scrim click, Escape).
		 * Consumer is responsible for setting open = false.
		 */
		onclose?: () => void;

		/**
		 * Optional icon above the headline (centered). Use an SVG or img.
		 *
		 *   {#snippet icon()}
		 *     <svg viewBox="0 0 24 24"><path d="…"/></svg>
		 *   {/snippet}
		 */
		icon?: Snippet;

		/**
		 * Optional headline (title). Renders as headline-small above the body.
		 *
		 *   {#snippet headline()}Delete item?{/snippet}
		 */
		headline?: Snippet;

		/**
		 * Body / supporting text. This region is scrollable when content overflows.
		 *
		 *   {#snippet children()}
		 *     <p>This action cannot be undone.</p>
		 *   {/snippet}
		 */
		children?: Snippet;

		/**
		 * Action buttons (text buttons, right-aligned).
		 * Rendered in the actions row at the bottom.
		 *
		 *   {#snippet actions()}
		 *     <Button variant="text" onclick={handleCancel}>Cancel</Button>
		 *     <Button variant="text" onclick={handleConfirm}>Delete</Button>
		 *   {/snippet}
		 */
		actions?: Snippet;

		/** Additional classes on the dialog surface element. */
		class?: string;
	};

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		open = $bindable(false),
		type = 'dialog',
		'aria-label': ariaLabel,
		onclose,
		icon,
		headline,
		children,
		actions,
		class: extraClass
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Internal state
	// ---------------------------------------------------------------------------

	let closing = $state(false);
	let prevOpen = $state(open);

	/** The element that had focus before open — restored on close. */
	let triggerEl = $state<HTMLElement | null>(null);

	/** First focusable element inside the dialog — focused on open. */
	let dialogEl = $state<HTMLElement | null>(null);

	/** Body element for scroll-divider observation. */
	let bodyEl = $state<HTMLElement | null>(null);
	let bodyScrolledTop = $state(false);
	let bodyScrolledBottom = $state(false);

	// ---------------------------------------------------------------------------
	// Animation duration from CSS token
	// ---------------------------------------------------------------------------

	function exitDurationMs(): number {
		if (typeof document === 'undefined') return 200;
		const raw = getComputedStyle(document.documentElement)
			.getPropertyValue('--md-comp-dialog-exit-duration')
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
				: 200;
		return base * scale;
	}

	// ---------------------------------------------------------------------------
	// Open / close lifecycle
	// ---------------------------------------------------------------------------

	$effect(() => {
		if (!prevOpen && open) {
			// Opening: store trigger, lock body scroll, move focus
			triggerEl = document.activeElement as HTMLElement | null;
			document.body.style.overflow = 'hidden';

			// Move focus to the first focusable element inside the dialog
			Promise.resolve().then(() => {
				if (!dialogEl) return;
				const focusable = dialogEl.querySelector<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				(focusable ?? dialogEl)?.focus();
			});
		}

		if (prevOpen && !open) {
			// Closing: run exit animation then clean up
			closing = true;
			document.body.style.overflow = '';

			setTimeout(() => {
				closing = false;
				triggerEl?.focus();
				triggerEl = null;
			}, exitDurationMs());
		}

		prevOpen = open;
	});

	// ---------------------------------------------------------------------------
	// Scroll dividers
	// ---------------------------------------------------------------------------

	$effect(() => {
		if (!bodyEl) return;

		function checkScroll() {
			if (!bodyEl) return;
			bodyScrolledTop = bodyEl.scrollTop > 0;
			bodyScrolledBottom = bodyEl.scrollTop + bodyEl.clientHeight < bodyEl.scrollHeight - 1;
		}

		checkScroll();
		bodyEl.addEventListener('scroll', checkScroll, { passive: true });
		const ro = new ResizeObserver(checkScroll);
		ro.observe(bodyEl);

		return () => {
			bodyEl?.removeEventListener('scroll', checkScroll);
			ro.disconnect();
		};
	});

	// ---------------------------------------------------------------------------
	// Focus trap (Tab / Shift-Tab cycles within dialog)
	// ---------------------------------------------------------------------------

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			requestClose();
			return;
		}

		if (event.key !== 'Tab' || !dialogEl) return;

		const focusableSelectors =
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
			'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
		const focusable = Array.from(dialogEl.querySelectorAll<HTMLElement>(focusableSelectors));
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === first) {
				event.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	// ---------------------------------------------------------------------------
	// Close helpers
	// ---------------------------------------------------------------------------

	function requestClose() {
		onclose?.();
		if (open) open = false;
	}

	function handleScrimClick() {
		requestClose();
	}

	// ---------------------------------------------------------------------------
	// Derived classes
	// ---------------------------------------------------------------------------

	const backdropClasses = $derived(
		[
			'md-dialog-backdrop',
			open && 'md-dialog-backdrop--open',
			closing && 'md-dialog-backdrop--closing'
		]
			.filter(Boolean)
			.join(' ')
	);

	const dialogClasses = $derived(
		[
			'md-dialog',
			icon && 'md-dialog--icon',
			type === 'alertdialog' && 'md-dialog--alert',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);

	const bodyClasses = $derived(
		[
			'md-dialog__body',
			bodyScrolledTop && 'md-dialog__body--scrolled-top',
			bodyScrolledBottom && 'md-dialog__body--scrolled-bottom'
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<!--
  Usage — Basic dialog:

    <Dialog bind:open={dialogOpen} onclose={() => dialogOpen = false}>
      {#snippet headline()}Delete file?{/snippet}
      {#snippet children()}
        <p>This action cannot be undone. The file will be permanently removed.</p>
      {/snippet}
      {#snippet actions()}
        <Button variant="text" onclick={() => dialogOpen = false}>Cancel</Button>
        <Button variant="text" onclick={handleDelete}>Delete</Button>
      {/snippet}
    </Dialog>

  Usage — Alert dialog with icon:

    <Dialog bind:open={open} type="alertdialog" onclose={() => open = false}>
      {#snippet icon()}
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      {/snippet}
      {#snippet headline()}Error{/snippet}
      {#snippet children()}Something went wrong. Please try again.{/snippet}
      {#snippet actions()}
        <Button variant="text" onclick={() => open = false}>OK</Button>
      {/snippet}
    </Dialog>

  Close methods: Escape key, scrim click, calling onclose, setting open = false.
  Focus is automatically moved into the dialog on open and restored on close.
  Tab/Shift-Tab are trapped within the dialog while it is open.
  Body scroll dividers appear automatically when content overflows.
-->

<div class={backdropClasses} onclick={handleScrimClick} aria-hidden="true">
	<!-- Dialog surface — stops click propagation to prevent scrim close -->
	<div
		class={dialogClasses}
		role={type}
		aria-modal="true"
		aria-label={ariaLabel}
		aria-labelledby={headline ? 'md-dialog-headline' : undefined}
		tabindex="-1"
		bind:this={dialogEl}
		onclick={(e) => e.stopPropagation()}
		onkeydown={handleKeydown}
	>
		{#if icon}
			<div class="md-dialog__icon" aria-hidden="true">
				{@render icon()}
			</div>
		{/if}

		{#if headline}
			<h2 class="md-dialog__headline" id="md-dialog-headline">
				{@render headline()}
			</h2>
		{/if}

		{#if children}
			<div class={bodyClasses} bind:this={bodyEl}>
				{@render children()}
			</div>
		{/if}

		{#if actions}
			<div class="md-dialog__actions">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>
