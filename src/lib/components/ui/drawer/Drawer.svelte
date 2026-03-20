<script lang="ts">
	/**
	 * Material 3 Navigation Drawer — Svelte-native, SSR-safe
	 *
	 * Supports two M3 drawer patterns:
	 *
	 *   'modal'    — overlays content with a scrim; controlled by `open`
	 *   'standard' — sits beside content; always visible (no scrim)
	 *
	 * Props:
	 *   open        — bindable; controls modal drawer visibility (standard ignores it)
	 *   variant     — 'modal' | 'standard'
	 *   onclose     — called when modal drawer requests close
	 *
	 * Snippets:
	 *   header      — optional top area (app logo, account switcher, etc.)
	 *   default     — nav items; compose with DrawerItem
	 *   footer      — optional bottom area
	 *
	 * Accessibility:
	 *   - Modal drawer uses role="dialog" + aria-modal + focus trap
	 *   - Escape key closes modal drawer
	 *   - Returns focus to trigger on close
	 */

	import { tick } from 'svelte';

	interface Props {
		open?: boolean;
		variant?: 'modal' | 'standard';
		onclose?: () => void;
		header?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		variant = 'modal',
		onclose,
		header,
		children,
		footer,
		class: extraClass = ''
	}: Props = $props();

	const isModal = $derived(variant === 'modal');

	let drawerEl = $state<HTMLElement | null>(null);
	let previousFocus = $state<HTMLElement | null>(null);

	const FOCUSABLE = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	].join(',');

	$effect(() => {
		if (!isModal) return;
		if (open) {
			previousFocus = document.activeElement as HTMLElement;
			tick().then(() => {
				const first = drawerEl?.querySelector<HTMLElement>(FOCUSABLE);
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

	function handleKeydown(e: KeyboardEvent) {
		if (!isModal || !open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			return;
		}
		if (e.key === 'Tab' && drawerEl) {
			const focusable = Array.from(drawerEl.querySelectorAll<HTMLElement>(FOCUSABLE));
			if (!focusable.length) {
				e.preventDefault();
				return;
			}
			const first = focusable[0],
				last = focusable[focusable.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Modal scrim -->
{#if isModal}
	<div
		class="drawer-scrim"
		class:drawer-scrim--visible={open}
		onclick={close}
		aria-hidden="true"
	></div>
{/if}

<!-- Drawer surface -->
<nav
	bind:this={drawerEl}
	class="drawer drawer--{variant} {extraClass}"
	class:drawer--open={open || !isModal}
	role={isModal ? 'dialog' : undefined}
	aria-modal={isModal ? 'true' : undefined}
	aria-label="Navigation"
>
	{#if header}
		<div class="drawer-header">
			{@render header()}
		</div>
	{/if}

	<div class="drawer-content">
		{#if children}{@render children()}{/if}
	</div>

	{#if footer}
		<div class="drawer-footer">
			{@render footer()}
		</div>
	{/if}
</nav>

<style>
	/* ---- Scrim ---- */
	.drawer-scrim {
		position: fixed;
		inset: 0;
		background-color: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent);
		z-index: 200;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
	}
	.drawer-scrim--visible {
		opacity: 1;
		pointer-events: auto;
	}

	/* ---- Drawer surface ---- */
	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		z-index: 201;
		width: var(--md-comp-drawer-width);
		max-width: calc(100vw - var(--md-sys-spacing-3xl));

		display: flex;
		flex-direction: column;

		background-color: var(--md-sys-color-surface-container-low);
		border-radius: 0 var(--md-comp-drawer-border-radius) var(--md-comp-drawer-border-radius) 0;
		box-shadow: var(--md-sys-elevation-1);

		overflow: hidden;
		overscroll-behavior: contain;

		/* Slide in from left */
		transform: translateX(-100%);
		transition: transform var(--md-sys-motion-duration-medium2)
			var(--md-sys-motion-easing-emphasized);
	}

	.drawer--open {
		transform: translateX(0);
	}

	/* Standard drawer: relative, no transform needed */
	.drawer--standard {
		position: relative;
		top: auto;
		left: auto;
		bottom: auto;
		transform: none;
		box-shadow: none;
		border-radius: var(--md-sys-shape-corner-extra-large);
		flex-shrink: 0;
		height: 100%;
	}

	/* ---- Header ---- */
	.drawer-header {
		padding: var(--md-comp-drawer-padding-v) var(--md-comp-drawer-padding-h);
		padding-top: var(--md-sys-spacing-xl);
		flex-shrink: 0;
	}

	/* ---- Scrollable content ---- */
	.drawer-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--md-comp-drawer-section-gap) var(--md-comp-drawer-padding-h);
		scrollbar-width: thin;
		scrollbar-color: var(--md-sys-color-outline-variant) transparent;
	}
	.drawer-content::-webkit-scrollbar {
		width: var(--md-sys-spacing-sm);
	}
	.drawer-content::-webkit-scrollbar-thumb {
		background-color: var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-extra-small);
	}

	/* ---- Footer ---- */
	.drawer-footer {
		padding: var(--md-comp-drawer-padding-v) var(--md-comp-drawer-padding-h);
		padding-bottom: var(--md-sys-spacing-xl);
		flex-shrink: 0;
		border-top: 1px solid var(--md-sys-color-outline-variant);
	}
</style>
