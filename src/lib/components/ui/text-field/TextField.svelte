<script lang="ts">
	import type { Snippet } from 'svelte';

	// ---------------------------------------------------------------------------
	// Types
	// ---------------------------------------------------------------------------

	type InputType =
		| 'text'
		| 'email'
		| 'number'
		| 'password'
		| 'search'
		| 'tel'
		| 'url'
		| 'date'
		| 'time'
		| 'datetime-local'
		| 'month'
		| 'week';

	type Props = {
		/**
		 * Visual variant:
		 *   'filled'   — surface-container-highest background with bottom indicator
		 *   'outlined' — transparent with full border outline
		 */
		variant?: 'filled' | 'outlined';

		/**
		 * Floating label text. Required for accessibility unless aria-label is
		 * provided directly on the field. Animates from resting to floating
		 * position on focus or when a value is present.
		 */
		label?: string;

		/**
		 * The current value of the field. Bind with bind:value.
		 */
		value?: string;

		/**
		 * HTML input type. Use 'textarea' for multiline input.
		 * Defaults to 'text'.
		 */
		type?: InputType | 'textarea';

		/** Placeholder shown inside the input when focused and empty. */
		placeholder?: string;

		/** Helper text shown below the field. Replaced by errorText when in error. */
		supportingText?: string;

		/**
		 * Error message. When set (non-empty string), the field enters error state:
		 * outline/indicator turns error color, supporting text is replaced by this.
		 */
		errorText?: string;

		/**
		 * Whether the field is in an error state. If errorText is provided this is
		 * set automatically, but you can also set it manually for external validation.
		 */
		error?: boolean;

		/** Disables the field entirely. */
		disabled?: boolean;

		/** Marks the field as required (adds asterisk to label). */
		required?: boolean;

		/** Makes the field read-only. */
		readonly?: boolean;

		/**
		 * Maximum character count. When set, a counter is shown in the footer.
		 * Does NOT apply a maxlength attribute — consumer uses this for display only
		 * unless maxlength is also passed via restProps.
		 */
		maxlength?: number;

		/**
		 * Optional prefix text shown before the input value (e.g. "$").
		 * Only visible when the field is focused or populated.
		 */
		prefixText?: string;

		/**
		 * Optional suffix text shown after the input value (e.g. ".00").
		 * Only visible when the field is focused or populated.
		 */
		suffixText?: string;

		/** Number of rows for textarea. Default: 3. */
		rows?: number;

		/**
		 * Leading icon snippet. Icon should be 24px and use fill: currentColor.
		 *
		 *   {#snippet leadingIcon()}
		 *     <svg viewBox="0 0 24 24"><path d="…"/></svg>
		 *   {/snippet}
		 */
		leadingIcon?: Snippet;

		/**
		 * Trailing icon snippet. For interactive icons (e.g. clear, visibility
		 * toggle), include the button element inside this snippet.
		 *
		 *   {#snippet trailingIcon()}
		 *     <button type="button" onclick={clear} aria-label="Clear">
		 *       <svg viewBox="0 0 24 24">…</svg>
		 *     </button>
		 *   {/snippet}
		 */
		trailingIcon?: Snippet;

		/** Additional classes on the root element. */
		class?: string;

		/** Called when the value changes. */
		oninput?: (event: Event) => void;

		/** Called when the field loses focus. */
		onblur?: (event: FocusEvent) => void;

		/** Called when the field gains focus. */
		onfocus?: (event: FocusEvent) => void;

		// Passthrough attrs onto the <input> / <textarea>
		[key: string]: unknown;
	};

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------

	let {
		variant = 'filled',
		label,
		value = $bindable(''),
		type = 'text',
		placeholder,
		supportingText,
		errorText,
		error: errorProp = false,
		disabled = false,
		required = false,
		readonly = false,
		maxlength,
		prefixText,
		suffixText,
		rows = 3,
		leadingIcon,
		trailingIcon,
		class: extraClass,
		oninput,
		onblur,
		onfocus,
		...restProps
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// State
	// ---------------------------------------------------------------------------

	/** Whether the input has a non-empty value (controls label float + prefix/suffix). */
	const isPopulated = $derived(value !== '' && value !== null && value !== undefined);

	/** Actual error state — either from errorText or the error prop. */
	const isError = $derived(errorProp || (!!errorText && errorText.length > 0));

	/** The text shown in the footer supporting slot. */
	const footerText = $derived(isError && errorText ? errorText : supportingText);

	/** Character counter string. */
	const counter = $derived(
		maxlength !== undefined ? `${String(value).length} / ${maxlength}` : undefined
	);

	/** Whether the label is in the floating position. */
	const populated = $derived(isPopulated);

	// Label width tracking for the outlined notch
	let labelEl = $state<HTMLElement | null>(null);
	let labelWidth = $state(0);

	$effect(() => {
		if (!labelEl || variant !== 'outlined') return;

		// Observe label element width so the notch can match it
		const ro = new ResizeObserver(() => {
			if (labelEl) {
				// In floating state the label is scaled down
				const scale =
					parseFloat(
						getComputedStyle(document.documentElement).getPropertyValue(
							'--md-sys-typescale-body-small-size'
						) || '12'
					) /
					parseFloat(
						getComputedStyle(document.documentElement).getPropertyValue(
							'--md-sys-typescale-body-large-size'
						) || '16'
					);
				labelWidth = labelEl.offsetWidth * scale;
			}
		});
		ro.observe(labelEl);
		return () => ro.disconnect();
	});

	// ---------------------------------------------------------------------------
	// Derived classes
	// ---------------------------------------------------------------------------

	const rootClasses = $derived(
		[
			'md-tf',
			`md-tf--${variant}`,
			isError && 'md-tf--error',
			disabled && 'md-tf--disabled',
			populated && 'md-tf--populated',
			!label && 'md-tf--no-label',
			leadingIcon && 'md-tf--has-leading',
			trailingIcon && 'md-tf--has-trailing',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);

	// Native input id for label association
	const inputId = $derived(`md-tf-${Math.random().toString(36).slice(2, 8)}`);
</script>

<!--
  Usage — Filled text field:

    <TextField
      label="Email address"
      type="email"
      bind:value={email}
      supportingText="We'll never share your email"
    />

  Usage — Outlined with leading icon and error:

    <TextField
      variant="outlined"
      label="Username"
      bind:value={username}
      errorText={usernameError}
    >
      {#snippet leadingIcon()}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      {/snippet}
    </TextField>

  Usage — Textarea:

    <TextField
      variant="outlined"
      label="Description"
      type="textarea"
      rows={4}
      bind:value={description}
      maxlength={500}
    />

  Usage — With prefix and suffix:

    <TextField
      label="Amount"
      type="number"
      bind:value={amount}
      prefixText="$"
      suffixText=".00"
    />
-->

<div
	class={rootClasses}
	style={variant === 'outlined' ? `--_label-float-width: ${labelWidth}px` : undefined}
>
	<!-- Container (the 56px box) -->
	<div class="md-tf__container">
		<!-- Leading icon -->
		{#if leadingIcon}
			<span class="md-tf__leading-icon" aria-hidden="true">
				{@render leadingIcon()}
			</span>
		{/if}

		<!-- Field wrap: label + input row -->
		<div class="md-tf__field-wrap">
			<!-- Floating label -->
			{#if label}
				<label
					class="md-tf__label"
					class:md-tf__label--required={required}
					for={inputId}
					bind:this={labelEl}
				>
					{label}
				</label>
			{/if}

			<!-- Input row: prefix + input/textarea + suffix -->
			<div class="md-tf__input-row">
				{#if prefixText}
					<span class="md-tf__prefix" aria-hidden="true">{prefixText}</span>
				{/if}

				{#if type === 'textarea'}
					<textarea
						id={inputId}
						class="md-tf__input"
						bind:value
						{placeholder}
						{disabled}
						{required}
						{readonly}
						{rows}
						{maxlength}
						aria-describedby={footerText ? `${inputId}-support` : undefined}
						aria-invalid={isError ? 'true' : undefined}
						{oninput}
						{onblur}
						{onfocus}
						{...restProps}
					></textarea>
				{:else}
					<input
						id={inputId}
						class="md-tf__input"
						type={type as InputType}
						bind:value
						{placeholder}
						{disabled}
						{required}
						{readonly}
						{maxlength}
						aria-describedby={footerText ? `${inputId}-support` : undefined}
						aria-invalid={isError ? 'true' : undefined}
						{oninput}
						{onblur}
						{onfocus}
						{...restProps}
					/>
				{/if}

				{#if suffixText}
					<span class="md-tf__suffix" aria-hidden="true">{suffixText}</span>
				{/if}
			</div>
		</div>

		<!-- Trailing icon -->
		{#if trailingIcon}
			<span class="md-tf__trailing-icon">
				{@render trailingIcon()}
			</span>
		{/if}

		<!-- Filled: bottom indicator line -->
		{#if variant === 'filled'}
			<div class="md-tf__indicator" aria-hidden="true"></div>
		{/if}

		<!-- Outlined: border + notch -->
		{#if variant === 'outlined'}
			<div class="md-tf__outline" aria-hidden="true">
				<div class="md-tf__outline-notch"></div>
			</div>
		{/if}
	</div>
	<!-- /.md-tf__container -->

	<!-- Footer: supporting text + counter -->
	{#if footerText || counter !== undefined}
		<div class="md-tf__footer">
			{#if footerText}
				<span
					class="md-tf__supporting"
					id="{inputId}-support"
					role={isError ? 'alert' : undefined}
					aria-live={isError ? 'polite' : undefined}
				>
					{footerText}
				</span>
			{:else}
				<span></span><!-- spacer so counter stays trailing -->
			{/if}

			{#if counter !== undefined}
				<span class="md-tf__counter" aria-label="Character count">
					{counter}
				</span>
			{/if}
		</div>
	{/if}
</div>
