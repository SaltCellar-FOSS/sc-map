<script lang="ts">
	/**
	 * Material 3 TextField — Svelte-native, SSR-safe
	 *
	 * Props:
	 *   variant     — 'filled' | 'outlined'
	 *   label       — floating label text
	 *   value       — bindable string value
	 *   type        — input type
	 *   placeholder — shown when focused without value
	 *   supportingText — helper text below field
	 *   errorText   — overrides supportingText with error styling
	 *   disabled    — boolean
	 *   readonly    — boolean
	 *   required    — boolean
	 *   maxlength   — character counter trigger
	 *   leadingIcon — snippet for a leading icon
	 *   trailingIcon— snippet for a trailing icon
	 */

	interface Props {
		variant?: 'filled' | 'outlined';
		label?: string;
		value?: string;
		type?: string;
		placeholder?: string;
		supportingText?: string;
		errorText?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		maxlength?: number;
		id?: string;
		name?: string;
		autocomplete?: AutoFill | null;
		leadingIcon?: import('svelte').Snippet;
		trailingIcon?: import('svelte').Snippet;
		class?: string;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
	}

	let {
		variant = 'filled',
		label = '',
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		supportingText = '',
		errorText = '',
		disabled = false,
		readonly = false,
		required = false,
		maxlength,
		id,
		name,
		autocomplete,
		leadingIcon,
		trailingIcon,
		class: extraClass = '',
		oninput,
		onchange,
		onfocus: externalFocus,
		onblur: externalBlur
	}: Props = $props();

	let focused = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	const populated = $derived(value !== '' && value !== undefined);
	const hasError = $derived(errorText !== '');
	const labelFloat = $derived(focused || populated || placeholder !== '');
	const charCount = $derived(value?.length ?? 0);
	const subText = $derived(hasError ? errorText : supportingText);

	// Unique ID for label association
	const generatedId = `tf-${Math.random().toString(36).slice(2, 7)}`;
	const fieldId = $derived(id ?? generatedId);

	function handleFocus(e: FocusEvent) {
		focused = true;
		externalFocus?.(e);
	}
	function handleBlur(e: FocusEvent) {
		focused = false;
		externalBlur?.(e);
	}
</script>

<div
	class="tf tf--{variant} {extraClass}"
	class:tf--focused={focused}
	class:tf--populated={populated}
	class:tf--error={hasError}
	class:tf--disabled={disabled}
	class:tf--has-leading={!!leadingIcon}
	class:tf--has-trailing={!!trailingIcon}
>
	<!-- ---- Filled variant structure ---- -->
	{#if variant === 'filled'}
		<div class="tf-container">
			{#if leadingIcon}
				<span class="tf-icon tf-icon--leading" aria-hidden="true">
					{@render leadingIcon()}
				</span>
			{/if}

			<div class="tf-inner">
				{#if label}
					<label class="tf-label" class:tf-label--float={labelFloat} for={fieldId}>
						{label}{#if required}<span aria-hidden="true"> *</span>{/if}
					</label>
				{/if}
				<input
					bind:this={inputEl}
					bind:value
					{id}
					{name}
					{type}
					{disabled}
					{readonly}
					{required}
					{maxlength}
					{autocomplete}
					placeholder={focused ? placeholder : ''}
					class="tf-input"
					onfocus={handleFocus}
					onblur={handleBlur}
					{oninput}
					{onchange}
					aria-invalid={hasError}
					aria-describedby={subText ? `${fieldId}-supporting` : undefined}
				/>
			</div>

			{#if trailingIcon}
				<span class="tf-icon tf-icon--trailing" aria-hidden="true">
					{@render trailingIcon()}
				</span>
			{/if}

			<!-- Active indicator line -->
			<div class="tf-active-indicator" aria-hidden="true"></div>
		</div>

		<!-- ---- Outlined variant structure ---- -->
	{:else}
		<div class="tf-container">
			{#if leadingIcon}
				<span class="tf-icon tf-icon--leading" aria-hidden="true">
					{@render leadingIcon()}
				</span>
			{/if}

			<div class="tf-inner">
				{#if label}
					<label class="tf-label" class:tf-label--float={labelFloat} for={fieldId}>
						{label}{#if required}<span aria-hidden="true"> *</span>{/if}
					</label>
				{/if}
				<input
					bind:this={inputEl}
					bind:value
					id={fieldId}
					{name}
					{type}
					{disabled}
					{readonly}
					{required}
					{maxlength}
					{autocomplete}
					placeholder={focused ? placeholder : ''}
					class="tf-input"
					onfocus={handleFocus}
					onblur={handleBlur}
					{oninput}
					{onchange}
					aria-invalid={hasError}
					aria-describedby={subText ? `${fieldId}-supporting` : undefined}
				/>
			</div>

			{#if trailingIcon}
				<span class="tf-icon tf-icon--trailing" aria-hidden="true">
					{@render trailingIcon()}
				</span>
			{/if}

			<!-- Outlined notch border -->
			<fieldset class="tf-notch" aria-hidden="true">
				<legend class="tf-notch-legend">
					<span class:tf-notch-legend--visible={labelFloat}>
						{label}{#if required}
							*{/if}
					</span>
				</legend>
			</fieldset>
		</div>
	{/if}

	<!-- Supporting / error text + char counter -->
	{#if subText || maxlength}
		<div class="tf-supporting-row">
			{#if subText}
				<span
					id="{fieldId}-supporting"
					class="tf-supporting-text"
					role={hasError ? 'alert' : undefined}>{subText}</span
				>
			{:else}
				<span></span>
			{/if}
			{#if maxlength}
				<span class="tf-counter" aria-live="polite">{charCount} / {maxlength}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ---- Shared base ---- */
	.tf {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: var(--md-sys-typescale-body-font);
		width: 100%;
	}

	.tf-container {
		position: relative;
		display: flex;
		align-items: center;
		cursor: text;
		min-height: var(--md-comp-textfield-height);
	}

	.tf-inner {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-height: var(--md-comp-textfield-height);
	}

	.tf-input {
		border: none;
		outline: none;
		background: transparent;
		width: 100%;
		font-family: inherit;
		font-size: var(--md-sys-typescale-body-large-size);
		color: var(--md-sys-color-on-surface);
		caret-color: var(--md-sys-color-primary);
		padding: 0;
		margin: 0;
		padding-bottom: var(--md-comp-textfield-padding-v);
		padding-top: 22px;
	}
	.tf--has-leading .tf-input {
		padding-top: 22px;
	}

	.tf-input::placeholder {
		color: transparent;
	}
	.tf--focused .tf-input::placeholder {
		color: var(--md-sys-color-on-surface-variant);
	}

	/* ---- Label ---- */
	.tf-label {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		transform-origin: left top;
		font-size: var(--md-sys-typescale-body-large-size);
		color: var(--md-sys-color-on-surface-variant);
		pointer-events: none;
		transition:
			transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
			font-size var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
			color var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
			top var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.tf-label--float {
		top: 14px;
		transform: translateY(0) scale(0.75);
		font-size: var(--md-sys-typescale-body-large-size); /* scale handles visual size */
	}

	.tf--focused .tf-label {
		color: var(--md-sys-color-primary);
	}
	.tf--error .tf-label {
		color: var(--md-sys-color-error);
	}

	/* ---- Icons ---- */
	.tf-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		color: var(--md-sys-color-on-surface-variant);
		flex-shrink: 0;
	}
	.tf--focused .tf-icon--leading {
		color: var(--md-sys-color-on-surface-variant);
	}
	.tf--error .tf-icon--trailing {
		color: var(--md-sys-color-error);
	}

	/* ============================
     FILLED variant
     ============================ */
	.tf--filled .tf-container {
		background-color: var(--md-sys-color-surface-container-highest);
		border-radius: var(--md-sys-shape-corner-extra-small-top);
		padding: 0 var(--md-comp-textfield-padding-h);
		gap: var(--md-comp-textfield-icon-gap);
		transition: background-color var(--md-sys-motion-duration-short2)
			var(--md-sys-motion-easing-standard);
	}
	.tf--filled .tf-container:hover {
		background-color: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) 8%,
			var(--md-sys-color-surface-container-highest)
		);
	}

	/* Active indicator */
	.tf-active-indicator {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background-color: var(--md-sys-color-on-surface-variant);
		transition:
			height var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
			background-color var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
	}
	.tf--filled .tf-container:hover .tf-active-indicator {
		background-color: var(--md-sys-color-on-surface);
	}
	.tf--focused .tf-active-indicator {
		height: 2px;
		background-color: var(--md-sys-color-primary);
	}
	.tf--error .tf-active-indicator {
		background-color: var(--md-sys-color-error);
		height: 2px;
	}

	/* ============================
     OUTLINED variant
     ============================ */
	.tf--outlined .tf-container {
		padding: 0 var(--md-comp-textfield-padding-h);
		gap: var(--md-comp-textfield-icon-gap);
		border-radius: var(--md-sys-shape-corner-extra-small);
	}
	.tf--outlined .tf-input {
		padding-top: var(--md-comp-textfield-padding-h);
		padding-bottom: var(--md-comp-textfield-padding-h);
	}
	.tf--outlined .tf-label {
		top: 50%;
		left: 0;
	}
	.tf--outlined .tf-label--float {
		top: 0;
		transform: translateY(-50%) scale(0.75);
	}

	/* Notch fieldset border */
	.tf-notch {
		position: absolute;
		inset: 0;
		border: 1px solid var(--md-sys-color-outline);
		border-radius: var(--md-sys-shape-corner-extra-small);
		margin: 0;
		padding: 0 var(--md-sys-spacing-sm);
		pointer-events: none;
		transition:
			border-color var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
			border-width var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
	}
	.tf--focused .tf-notch {
		border-color: var(--md-sys-color-primary);
		border-width: 2px;
	}
	.tf--outlined .tf-container:hover .tf-notch {
		border-color: var(--md-sys-color-on-surface);
	}
	.tf--error .tf-notch {
		border-color: var(--md-sys-color-error);
		border-width: 2px;
	}

	.tf-notch-legend {
		padding: 0;
		height: 0;
		display: block;
		white-space: nowrap;
		max-width: 0;
		transition: max-width var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
	}
	.tf-notch-legend span {
		display: inline-block;
		padding: 0 4px;
		font-size: 0.75rem;
		opacity: 0;
		visibility: hidden;
	}
	.tf-notch-legend--visible {
		opacity: 1 !important;
		visibility: visible !important;
	}
	/* Open the notch gap when label floats */
	.tf--outlined.tf--focused .tf-notch-legend,
	.tf--outlined.tf--populated .tf-notch-legend {
		max-width: 1000px; /* large enough */
	}

	/* ---- Supporting text row ---- */
	.tf-supporting-row {
		display: flex;
		justify-content: space-between;
		padding: 0 var(--md-comp-textfield-supporting-padding-h);
		gap: var(--md-comp-textfield-supporting-gap);
	}
	.tf-supporting-text {
		font-size: var(--md-sys-typescale-body-small-size);
		color: var(--md-sys-color-on-surface-variant);
		flex: 1;
	}
	.tf--error .tf-supporting-text {
		color: var(--md-sys-color-error);
	}
	.tf-counter {
		font-size: var(--md-sys-typescale-body-small-size);
		color: var(--md-sys-color-on-surface-variant);
		flex-shrink: 0;
	}

	/* ---- Disabled ---- */
	.tf--disabled {
		pointer-events: none;
		opacity: 0.38;
	}
</style>
