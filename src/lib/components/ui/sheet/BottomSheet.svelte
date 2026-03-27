<script lang="ts">
	import type { SheetProps } from '$lib/components/ui/sheet';

	type Props = SheetProps & {
		/**
		 * When true, renders the drag handle pill at the top of the sheet.
		 * Default: true.
		 */
		showDragHandle?: boolean;
	};

	let {
		variant = 'modal',
		open = $bindable(false),
		showDragHandle = true,
		title,
		onclose,
		headerActions,
		children,
		class: extraClass
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Internal state
	// ---------------------------------------------------------------------------

	let closing = $state(false);
	let prevOpen = $state(open);

	let triggerEl = $state<HTMLElement | null>(null);
	let sheetEl = $state<HTMLElement | null>(null);

	// ---------------------------------------------------------------------------
	// Drag state (plain variables — no reactivity needed)
	// ---------------------------------------------------------------------------

	let dragging = false;
	let dragStartY = 0;
	let dragStartH = 0; // sheet clientHeight at drag start
	let lastY = 0; // for velocity calculation
	let lastT = 0; // timestamp of last move
	let velocityPxMs = 0; // positive = moving down (dismissing)

	// Snap thresholds
	const DISMISS_VELOCITY = 0.5; // px/ms downward = dismiss regardless of position
	const EXPAND_VELOCITY = -0.5; // px/ms upward   = expand regardless of position
	const DISMISS_RATIO = 0.4; // < 40% of max-height = dismiss on release
	const EXPAND_RATIO = 0.75; // > 75% of max-height = expand to max on release

	// ---------------------------------------------------------------------------
	// CSS token readers
	// ---------------------------------------------------------------------------

	function readDurationMs(prop: string, fallback: number): number {
		if (typeof document === 'undefined') return fallback;
		const raw = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
		const scale = parseFloat(
			getComputedStyle(document.documentElement)
				.getPropertyValue('--md-sys-motion-duration-scale')
				.trim() || '1'
		);
		const base = raw.endsWith('ms')
			? parseFloat(raw)
			: raw.endsWith('s')
				? parseFloat(raw) * 1000
				: fallback;
		return base * scale;
	}

	function exitDurationMs() {
		return readDurationMs('--md-comp-bottom-sheet-exit-duration', 300);
	}

	/** Returns the current max-height of the sheet in px. */
	function maxHeightPx(): number {
		if (!sheetEl) return window.innerHeight;
		// Read --md-comp-bottom-sheet-max-height from the sheet element itself
		const raw = getComputedStyle(sheetEl)
			.getPropertyValue('--md-comp-bottom-sheet-max-height')
			.trim();
		if (raw.endsWith('vh')) {
			return (parseFloat(raw) / 100) * window.innerHeight;
		}
		if (raw.endsWith('px')) {
			return parseFloat(raw);
		}
		// Fallback: measure the actual max-height CSS value
		const cs = getComputedStyle(sheetEl).maxHeight;
		return cs === 'none' ? window.innerHeight : parseFloat(cs) || window.innerHeight;
	}

	// ---------------------------------------------------------------------------
	// Smooth snap animation (drives max-height via inline style)
	// ---------------------------------------------------------------------------

	let snapRaf: number | null = null;

	function snapTo(targetH: number, durationMs: number, onDone?: () => void) {
		if (!sheetEl) {
			onDone?.();
			return;
		}

		if (snapRaf !== null) cancelAnimationFrame(snapRaf);

		const startH = sheetEl.getBoundingClientRect().height;
		const startT = performance.now();
		const easing = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

		function frame(now: number) {
			if (!sheetEl) return;
			const elapsed = now - startT;
			const t = Math.min(elapsed / durationMs, 1);
			const h = startH + (targetH - startH) * easing(t);
			sheetEl.style.maxHeight = `${h}px`;
			if (t < 1) {
				snapRaf = requestAnimationFrame(frame);
			} else {
				sheetEl.style.maxHeight = `${targetH}px`;
				snapRaf = null;
				onDone?.();
			}
		}

		snapRaf = requestAnimationFrame(frame);
	}

	// ---------------------------------------------------------------------------
	// Open / close lifecycle
	// ---------------------------------------------------------------------------

	$effect(() => {
		if (!prevOpen && open) {
			triggerEl = document.activeElement as HTMLElement | null;
			if (variant === 'modal') {
				document.body.style.overflow = 'hidden';
				Promise.resolve().then(() => {
					if (!sheetEl) return;
					const focusable = sheetEl.querySelector<HTMLElement>(
						'button:not([disabled]), [href], input:not([disabled]), ' +
							'select:not([disabled]), textarea:not([disabled]), ' +
							'[tabindex]:not([tabindex="-1"])'
					);
					(focusable ?? sheetEl)?.focus();
				});
			}
		}

		if (prevOpen && !open) {
			closing = true;
			if (variant === 'modal') document.body.style.overflow = '';
			// Clear any inline max-height set by dragging so CSS animation takes over
			if (sheetEl) sheetEl.style.maxHeight = '';
			setTimeout(() => {
				closing = false;
				triggerEl?.focus();
				triggerEl = null;
			}, exitDurationMs());
		}

		prevOpen = open;
	});

	// ---------------------------------------------------------------------------
	// Focus trap (modal only)
	// ---------------------------------------------------------------------------

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			event.preventDefault();
			requestClose();
			return;
		}

		if (variant !== 'modal' || event.key !== 'Tab' || !sheetEl) return;

		const focusable = Array.from(
			sheetEl.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
					'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	// ---------------------------------------------------------------------------
	// Drag handle — bidirectional resize + dismiss
	//
	// How it works:
	//   The sheet is bottom-anchored (position: fixed; bottom: 0).
	//   Its visible height is governed by max-height.
	//   Dragging UP  → increase max-height (sheet grows upward from the bottom).
	//   Dragging DOWN → decrease max-height (sheet shrinks from the top).
	//   On release, snap to: full max-height, natural content height, or dismiss.
	// ---------------------------------------------------------------------------

	function onDragHandlePointerDown(event: PointerEvent) {
		if (!open || !sheetEl) return;
		dragging = true;
		dragStartY = event.clientY;
		dragStartH = sheetEl.getBoundingClientRect().height;
		lastY = event.clientY;
		lastT = event.timeStamp;
		velocityPxMs = 0;
		// Disable CSS transitions while dragging so movement is instant
		sheetEl.style.transition = 'none';
		sheetEl.style.maxHeight = `${dragStartH}px`;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onDragHandlePointerMove(event: PointerEvent) {
		if (!dragging || !sheetEl) return;

		const delta = event.clientY - dragStartY; // positive = dragged down
		const newH = Math.max(80, Math.min(maxHeightPx(), dragStartH - delta));
		sheetEl.style.maxHeight = `${newH}px`;

		// Rolling velocity (px/ms, positive = downward)
		const dt = event.timeStamp - lastT;
		if (dt > 0) {
			velocityPxMs = (event.clientY - lastY) / dt;
		}
		lastY = event.clientY;
		lastT = event.timeStamp;
	}

	function onDragHandlePointerUp() {
		if (!dragging || !sheetEl) return;
		dragging = false;

		// Re-enable transitions
		sheetEl.style.transition = '';

		const currentH = sheetEl.getBoundingClientRect().height;
		const maxH = maxHeightPx();
		const ratio = currentH / maxH;
		const snapDur = 250; // ms for snap animation

		if (velocityPxMs > DISMISS_VELOCITY || ratio < DISMISS_RATIO) {
			// Fast downward flick or sheet mostly collapsed → dismiss
			sheetEl.style.maxHeight = '';
			requestClose();
		} else if (velocityPxMs < EXPAND_VELOCITY || ratio > EXPAND_RATIO) {
			// Fast upward flick or sheet mostly expanded → snap to full height
			snapTo(maxH, snapDur, () => {
				if (sheetEl) sheetEl.style.maxHeight = ''; // hand back to CSS token
			});
		} else {
			// Middle zone → snap back to natural content height
			const naturalH = Math.min(sheetEl.scrollHeight, maxH);
			snapTo(naturalH, snapDur);
		}
	}

	// ---------------------------------------------------------------------------
	// Close
	// ---------------------------------------------------------------------------

	function requestClose() {
		if (sheetEl) sheetEl.style.maxHeight = '';
		onclose?.();
		if (open) open = false;
	}

	function handleScrimClick() {
		requestClose();
	}

	// ---------------------------------------------------------------------------
	// Derived classes
	// ---------------------------------------------------------------------------

	const rootClasses = $derived(
		[
			'md-bottom-sheet-root',
			variant === 'modal' && 'md-bottom-sheet-root--modal',
			open && 'md-bottom-sheet-root--open',
			closing && 'md-bottom-sheet-root--closing',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);

	const sheetClasses = $derived(
		[
			'md-bottom-sheet',
			variant === 'modal' && 'md-bottom-sheet--modal',
			variant === 'standard' && 'md-bottom-sheet--standard'
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<!--
  Usage — Modal:

    <BottomSheet bind:open={open} title="Share" onclose={() => open = false}>
      {#snippet children()}
        <p>Share sheet content</p>
      {/snippet}
    </BottomSheet>

  Usage — Standard (placed at the bottom of a flex column):

    <div style="display:flex; flex-direction:column; height:100vh;">
      <main style="flex:1; overflow:auto;">…</main>
      <BottomSheet variant="standard" bind:open={open} title="Now Playing">
        {#snippet children()}…playback controls…{/snippet}
      </BottomSheet>
    </div>

  Dismiss methods (modal):
    - Click the scrim
    - Press Escape
    - Swipe the drag handle downward ≥80px
    - Set open = false programmatically (fires onclose)

  For modal sheets without a title, add aria-label to the component.
-->

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={rootClasses} onkeydown={handleKeydown}>
	<!-- Scrim (modal only) -->
	<div class="md-bottom-sheet-scrim" aria-hidden="true" onclick={handleScrimClick}></div>

	<!-- Sheet surface -->
	<div
		class={sheetClasses}
		role={variant === 'modal' ? 'dialog' : 'complementary'}
		aria-modal={variant === 'modal' ? 'true' : undefined}
		tabindex="-1"
		bind:this={sheetEl}
	>
		<!-- Drag handle -->
		{#if showDragHandle}
			<div
				class="md-bottom-sheet__drag-handle-wrap"
				role="button"
				tabindex="0"
				aria-label="Drag to resize, or press Space to close"
				onpointerdown={onDragHandlePointerDown}
				onpointermove={onDragHandlePointerMove}
				onpointerup={onDragHandlePointerUp}
				onpointercancel={onDragHandlePointerUp}
				onkeydown={(e) => {
					if (e.key === ' ' || e.key === 'Enter') {
						e.preventDefault();
						requestClose();
					}
				}}
			>
				<div class="md-bottom-sheet__drag-handle" aria-hidden="true"></div>
			</div>
		{/if}

		<!-- Optional header with title -->
		{#if title || headerActions}
			<div class="md-bottom-sheet__header">
				{#if title}
					<span class="md-bottom-sheet__title">{@render title()}</span>
				{/if}
				{#if headerActions}
					{@render headerActions()}
				{/if}
			</div>
			<hr class="md-bottom-sheet__divider" aria-hidden="true" />
		{/if}

		<!-- Body content -->
		<div class="md-bottom-sheet__content">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
</div>
