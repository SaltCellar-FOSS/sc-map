<script lang="ts">
	/**
	 * Material 3 Modal — Svelte-native, SSR-safe
	 *
	 * Props:
	 *   open        — bindable boolean to control visibility
	 *   headline    — modal title string
	 *   icon        — optional snippet for an icon above the headline
	 *   supportingText — body text (alternative to default slot)
	 *   onclose     — called when modal requests close (Escape or scrim click)
	 *   closeOnScrim — close when clicking the scrim (default: true)
	 *
	 * Slots:
	 *   default  — modal body content
	 *   actions  — footer action buttons
	 *
	 * Accessibility:
	 *   - Uses role="dialog" + aria-modal="true"
	 *   - Focus is trapped inside the modal while open
	 *   - Escape key closes the modal
	 *   - Returns focus to the trigger element on close
	 */

	import { tick } from 'svelte';

	interface Props {
		open?: boolean;
		headline?: string;
		supportingText?: string;
		closeOnScrim?: boolean;
		icon?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
		onclose?: () => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		headline = '',
		supportingText = '',
		closeOnScrim = true,
		icon,
		children,
		actions,
		onclose,
		class: extraClass = ''
	}: Props = $props();

	let modalEl = $state<HTMLDivElement | null>(null);
	let previousFocus = $state<HTMLElement | null>(null);

	// Focusable elements query
	const FOCUSABLE = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	].join(',');

	$effect(() => {
		if (open) {
			previousFocus = document.activeElement as HTMLElement;
			tick().then(() => {
				const first = modalEl?.querySelector<HTMLElement>(FOCUSABLE);
				first?.focus();
			});
		} else {
			tick().then(() => {
				previousFocus?.focus();
				previousFocus = null;
			});
		}
	});

	function close() {
		open = false;
		onclose?.();
	}

	function handleScrimClick() {
		if (closeOnScrim) close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			return;
		}

		// Trap focus
		if (e.key === 'Tab' && modalEl) {
			const focusable = Array.from(modalEl.querySelectorAll<HTMLElement>(FOCUSABLE));
			if (focusable.length === 0) {
				e.preventDefault();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	// Unique ID for accessibility
	const headlineId = `modal-headline-${Math.random().toString(36).slice(2, 7)}`;
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Scrim -->
	<div
		class="modal-scrim"
		class:modal-scrim--visible={open}
		onclick={handleScrimClick}
		aria-hidden="true"
	></div>

	<!-- Modal surface -->
	<div
		bind:this={modalEl}
		role="dialog"
		aria-modal="true"
		aria-labelledby={headline ? headlineId : undefined}
		class="modal {extraClass}"
		class:modal--open={open}
	>
		<!-- Optional icon -->
		{#if icon}
			<div class="modal-icon" aria-hidden="true">
				{@render icon()}
			</div>
		{/if}

		<!-- Headline -->
		{#if headline}
			<h2 class="modal-headline" id={headlineId}>
				{headline}
			</h2>
		{/if}

		<!-- Body -->
		<div class="modal-body">
			{#if supportingText}
				<p class="modal-supporting-text">{supportingText}</p>
			{/if}
			{#if children}
				{@render children()}
			{/if}
		</div>

		<!-- Actions -->
		{#if actions}
			<div class="modal-actions">
				{@render actions()}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* ---- Scrim ---- */
	.modal-scrim {
		position: fixed;
		inset: 0;
		background-color: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent);
		z-index: 1000;
		animation: scrim-in var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)
			forwards;
	}

	@keyframes scrim-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ---- Modal surface ---- */
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1001;

		display: flex;
		flex-direction: column;

		width: min(560px, calc(100vw - var(--md-sys-spacing-3xl)));
		max-height: calc(100dvh - calc(var(--md-sys-spacing-3xl) * 2));

		background-color: var(--md-sys-color-surface-container-high);
		border-radius: var(--md-comp-dialog-border-radius);
		box-shadow: var(--md-sys-elevation-3);

		overflow: hidden;

		animation: modal-in var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized)
			forwards;
	}

	@keyframes modal-in {
		from {
			opacity: 0;
			transform: translate(-50%, calc(-50% + var(--md-sys-spacing-lg))) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	/* ---- Icon ---- */
	.modal-icon {
		display: flex;
		justify-content: center;
		padding: var(--md-comp-dialog-padding) var(--md-comp-dialog-padding) 0;
		color: var(--md-sys-color-secondary);
	}

	/* ---- Headline ---- */
	.modal-headline {
		font-family: var(--md-sys-typescale-display-font);
		font-size: var(--md-sys-typescale-title-large-size);
		font-weight: 400;
		color: var(--md-sys-color-on-surface);
		margin: 0;
		padding: var(--md-comp-dialog-padding) var(--md-comp-dialog-padding) 0;
		line-height: 1.4;
	}

	/* Center headline when there's an icon */
	.modal:has(.modal-icon) .modal-headline {
		text-align: center;
		padding-top: var(--md-comp-dialog-gap);
	}

	/* ---- Body ---- */
	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--md-comp-dialog-gap) var(--md-comp-dialog-padding);

		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: var(--md-sys-color-outline-variant) transparent;
	}
	.modal-body::-webkit-scrollbar {
		width: var(--md-sys-spacing-sm);
	}
	.modal-body::-webkit-scrollbar-thumb {
		background-color: var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-extra-small);
	}

	.modal-supporting-text {
		font-size: var(--md-sys-typescale-body-medium-size);
		color: var(--md-sys-color-on-surface-variant);
		line-height: 1.6;
		margin: 0;
	}

	/* ---- Actions ---- */
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--md-comp-dialog-actions-gap);
		padding: var(--md-comp-dialog-gap) var(--md-comp-dialog-padding);
		padding-top: var(--md-sys-spacing-sm);
		flex-wrap: wrap;
	}
</style>
