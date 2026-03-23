/**
 * MATERIAL DESIGN 3 — RIPPLE ATTACHMENT
 *
 * Implements the pointer-origin press wave using Svelte's {@attach} API.
 *
 * The attachment is a factory: ripple(options) returns an Attachment function.
 * Because {@attach ripple(options)} runs inside a Svelte effect, the attachment
 * is automatically destroyed and recreated whenever reactive state referenced
 * in `options` changes — no manual `update()` hook needed.
 *
 * Usage in a template:
 *   {@attach ripple()}
 *   {@attach ripple({ disabled: isDisabled })}
 *   {@attach ripple({ color: 'var(--md-sys-color-primary)', opacity: 0.12 })}
 *
 * The CSS state layer (button.css) handles hover/focus/active flat overlays.
 * This attachment handles only the expanding circle from the pointer origin.
 */

import type { Attachment } from 'svelte/attachments';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RippleOptions {
	/** Suppress the ripple entirely. Pass a reactive expression for reactivity. */
	disabled?: boolean;

	/**
	 * Ripple wave colour.
	 * Defaults to 'currentColor' — inherits the element's text colour, which
	 * is the on-* token as specified by M3.
	 */
	color?: string;

	/**
	 * Peak opacity of the ripple wave.
	 * Defaults to 0.12 — the M3 pressed-state-layer opacity.
	 */
	opacity?: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const DURATION_TOKEN = '--md-sys-motion-duration-medium2';
const SCALE_TOKEN = '--md-sys-motion-duration-scale';
const EASING = 'cubic-bezier(0.2, 0, 0, 1)'; // --md-sys-motion-easing-standard

function readDurationMs(el: HTMLElement, prop: string, fallback: number): number {
	const raw = getComputedStyle(el).getPropertyValue(prop).trim();
	if (!raw) return fallback;
	if (raw.endsWith('ms')) return parseFloat(raw);
	if (raw.endsWith('s')) return parseFloat(raw) * 1000;
	return parseFloat(raw) || fallback;
}

function spawnRipple(
	el: HTMLElement,
	clientX: number,
	clientY: number,
	color: string,
	opacity: number
): void {
	const rect = el.getBoundingClientRect();
	const relX = clientX - rect.left;
	const relY = clientY - rect.top;
	const dx = Math.max(relX, rect.width - relX);
	const dy = Math.max(relY, rect.height - relY);
	const radius = Math.ceil(Math.sqrt(dx * dx + dy * dy));
	const diam = radius * 2;

	// Read duration tokens at event time — honours prefers-reduced-motion
	// because --md-sys-motion-duration-scale is already 0 in the cascade.
	const base = readDurationMs(el, DURATION_TOKEN, 300);
	const scale = readDurationMs(el, SCALE_TOKEN, 1);
	const duration = base * scale;

	const span = document.createElement('span');
	Object.assign(span.style, {
		position: 'absolute',
		pointerEvents: 'none',
		borderRadius: '50%',
		width: `${diam}px`,
		height: `${diam}px`,
		top: `${relY - radius}px`,
		left: `${relX - radius}px`,
		backgroundColor: color,
		opacity: '0',
		transform: 'scale(0)',
		zIndex: '1'
	});

	el.appendChild(span);

	const animation = span.animate(
		[
			{ transform: 'scale(0)', opacity },
			{ transform: 'scale(1)', opacity: 0 }
		],
		{ duration, easing: EASING, fill: 'forwards' }
	);

	const remove = () => span.remove();
	animation.addEventListener('finish', remove, { once: true });
	animation.addEventListener('cancel', remove, { once: true });
}

// ---------------------------------------------------------------------------
// Attachment factory
// ---------------------------------------------------------------------------

/**
 * Returns an Attachment that adds a press-ripple to the host element.
 *
 * Call inside {@attach ...} with reactive options to get automatic re-runs:
 *   {@attach ripple({ disabled: isDisabled })}
 */
export function ripple(options: RippleOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		// Ensure the host is a positioned container so ripple spans are relative to it.
		if (getComputedStyle(el).position === 'static') {
			el.style.position = 'relative';
		}
		// Clip the expanding circle to the element's shape.
		el.style.overflow = 'hidden';

		function onPointerDown(event: PointerEvent): void {
			if (options.disabled) return;
			// Primary pointer only (left mouse button / first touch / first pen contact).
			if (event.pointerType === 'mouse' && event.button !== 0) return;

			spawnRipple(
				el,
				event.clientX,
				event.clientY,
				options.color ?? 'currentColor',
				options.opacity ?? 0.12
			);
		}

		el.addEventListener('pointerdown', onPointerDown);

		// Cleanup — called before re-run or on element removal.
		return () => {
			el.removeEventListener('pointerdown', onPointerDown);
		};
	};
}
