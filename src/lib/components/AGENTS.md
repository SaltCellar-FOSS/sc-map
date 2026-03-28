# Components

## Two-layer architecture

- **`ui/`** — reusable primitives (Button, Dialog, TextField, etc.). No app-specific logic.
- **Root level** — feature components (PlaceSheet, AddVisitForm, etc.) that compose UI primitives and contain app logic.

Never implement a bespoke `<button>`, `<input>`, or other interactive element when a UI primitive already exists. Reach for the primitive first.

## Svelte 5 conventions

All components use Svelte 5 runes. Never use the legacy Options API or `export let`.

- **`$props()`** — declare props via a `type Props = { ... }` block, then destructure
- **`$state()`** — local reactive state
- **`$derived()`** — values computed from state or props
- **`$effect()`** — side effects; always return a cleanup function when registering listeners
- **`$bindable()`** — two-way bindable props (e.g. `open`)
- **`{@attach ...}`** — behavior attachments (e.g. ripple); prefer over `use:` actions

## Props pattern

```svelte
<script lang="ts">
	type Props = {
		/** JSDoc on every prop. */
		open?: boolean;
		onclose?: () => void;
		children: Snippet;
	};

	let { open = $bindable(false), onclose, children }: Props = $props();
</script>
```

- Document every prop with a JSDoc comment.
- Accept a `class` prop (`class?: string`) on all UI primitives and merge it onto the root element.
- Spread `...restProps` onto the root element of UI primitives so consumers can pass `aria-*`, `data-*`, `form`, etc. without explicit forwarding.

## Snippets

Use Svelte 5 `Snippet` for flexible composition slots (icon, headline, actions, children). Prefer snippets over string props whenever the content may contain markup.

```svelte
{#snippet actions()}
	<Button variant="text" onclick={handleCancel}>Cancel</Button>
	<Button variant="text" onclick={handleConfirm}>Confirm</Button>
{/snippet}
```

## CSS system

The design system is Material Design 3, structured as three token layers. Each layer builds on the one below it. **Components only ever read from layer 2.**

### Layer 1 — Reference tokens (`tokens/reference.css`)

Raw tonal palette values. The only place literal hex codes appear in the codebase.

```
--md-ref-palette-primary40: #6750a4;
--md-ref-palette-primary80: #d0bcff;
```

Naming: `--md-ref-palette-{key-color}{tone}`. Tones run 0–100 in steps (0, 10, 20 … 90, 95, 98, 99, 100). Key colors: `primary`, `secondary`, `tertiary`, `error`, `neutral`, `neutral-variant`.

**Never read `--md-ref-*` in component CSS.** These are implementation details of the palette; their meaning changes between light and dark mode.

### Layer 2 — System tokens (`tokens/system.css`)

Semantic roles that map palette tones to their purpose. This is where light/dark theming is resolved — dark mode overrides are defined here, not in components.

```
--md-sys-color-primary:            /* main brand color */
--md-sys-color-on-primary:         /* text/icons on top of primary */
--md-sys-color-primary-container:  /* lower-emphasis primary surface */
--md-sys-color-surface:            /* default background surface */
--md-sys-color-on-surface:         /* default text color */
--md-sys-color-outline:            /* borders and dividers */
```

Token groups: `--md-sys-color-*`, `--md-sys-typescale-*`, `--md-sys-shape-*`, `--md-sys-elevation-*`, `--md-sys-motion-*`.

**This is the only layer components read from.**

### Layer 3 — Component tokens (`--md-comp-*`)

Per-component overrides of system values (e.g. `--md-comp-dialog-exit-duration`). Defined inside individual component CSS files. Only used when a component needs to deviate from the system default for a specific property.

---

All token files live in `src/lib/styles/`:

| File                   | Contents                                            |
| ---------------------- | --------------------------------------------------- |
| `tokens/reference.css` | Layer 1 — raw palette                               |
| `tokens/system.css`    | Layer 2 — semantic roles + dark mode                |
| `elevation.css`        | Utility classes `.md-elevation-{0–5}`               |
| `typography.css`       | Utility classes `.md-typescale-{role}-{size}`       |
| `motion.css`           | Keyframes + `.md-motion-*` classes; duration tokens |

**Rules:**

- Components always read `--md-sys-*` tokens. Never read `--md-ref-*` directly, and never hard-code raw hex, px, or duration values when a system token exists.
- All transition durations must use the scale multiplier so reduced-motion is handled automatically:
  ```css
  transition: opacity
  	calc(var(--md-sys-motion-duration-scale) * var(--md-sys-motion-duration-short3)) ease;
  ```
- Each UI primitive owns a sibling `.css` file (e.g. `button.css`). That file is imported once via `src/lib/styles/theme.css` — do not import component CSS anywhere else.
- CSS class names follow BEM-like `md-{component}`, `md-{component}__{element}`, `md-{component}--{modifier}`.

## Responsive design — mobile first

**All components must be responsive.** Design for the smallest screen first, then layer in desktop enhancements with `min-width` media queries. Never design desktop-first and patch mobile.

```css
/* mobile — default */
.md-my-component {
	padding: 1rem;
}

/* desktop */
@media (min-width: 768px) {
	.md-my-component {
		padding: 2rem;
	}
}
```

- The canonical breakpoint for "desktop" in this codebase is `768px` (`md`). See `PlaceSheet.svelte` for the pattern of rendering a different component variant at that breakpoint (BottomSheet on mobile, SideSheet on desktop).
- Touch targets must be at least 48×48 px on mobile.
- Avoid fixed pixel widths on containers that must reflow.

## Icon system

Use `<Icon name="..." />` from `./ui/icon/Icon.svelte`. Do not render SVGs inline in feature components.

To add a new icon:

1. Drop the SVG into `src/lib/icons/`.
2. Import it in `Icon.svelte` with `?url`.
3. Add the name to the `IconName` union type and the `ICONS` record.

## Storybook stories

**Every component** — UI primitive or feature component — must have a corresponding `.stories.svelte` file in the same directory.

- Use `defineMeta` from `@storybook/addon-svelte-csf` with `tags: ['autodocs']`.
- Cover every meaningful prop combination and visual state.
- Stories are the primary way to develop and review components in isolation.

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MyComponent from './MyComponent.svelte';

	const { Story } = defineMeta({ tags: ['autodocs'] });
</script>

<Story name="Default">
	<MyComponent />
</Story>
```

## New UI primitive checklist

When adding a component to `ui/`:

- [ ] `ComponentName.svelte` — component logic and markup
- [ ] `component-name.css` — styles using `--md-sys-*` tokens only
- [ ] `ComponentName.stories.svelte` — Storybook stories
- [ ] Add `@import` to `src/lib/styles/theme.css`

## Accessibility

- Use semantic HTML elements (`<button>`, `<a>`, `<dialog>`) before reaching for ARIA.
- Interactive components must manage focus: move focus in on open, restore it on close.
- Trap Tab/Shift-Tab within modal surfaces (dialogs, bottom sheets) while open.
- Use `type="alertdialog"` for urgent confirmations that require a response.
- Decorative images and icons must have `aria-hidden="true"` or `alt=""`. Functional icons need a descriptive `aria-label`.
