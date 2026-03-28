<script lang="ts">
	import TextField from './ui/text-field/TextField.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { untrack } from 'svelte';

	type Props = {
		visit: VisitWithUser;
		onsuccess?: () => void;
	};

	const formatter = Intl.DateTimeFormat('en-CA');

	function toDateString(date: Date): string {
		return formatter.format(date);
	}

	let { visit, onsuccess }: Props = $props();

	let formEl = $state<HTMLFormElement | null>(null);

	let summary = $state(untrack(() => visit.summary ?? ''));
	let visitDate = $state<string>(toDateString(untrack(() => visit.visited_at)));
	let submitted = $state(false);
	let formError = $state('');

	type FieldErrors = { summary?: string[]; visited_at?: string[] };

	function validate(s: string, visitedAt: string): FieldErrors {
		const errors: FieldErrors = {};
		if (s.length > 2000) {
			errors.summary = ['Must be 2000 characters or less'];
		}
		if (!visitedAt || !/^\d{4}-\d{2}-\d{2}$/.test(visitedAt)) {
			errors.visited_at = ['Must be a valid date'];
		}
		return errors;
	}

	const fieldErrors = $derived.by((): FieldErrors => {
		if (!submitted) return {};
		return validate(summary, visitDate);
	});

	function enhanceEdit({ cancel }: { cancel: () => void }) {
		submitted = true;
		formError = '';
		const errors = validate(summary, visitDate);
		if (Object.keys(errors).length > 0) {
			cancel();
			return;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				onsuccess?.();
			} else if (result.type === 'failure') {
				formError = (result.data as { error?: string })?.error ?? 'Something went wrong';
			}
		};
	}

	export function submit() {
		formEl?.requestSubmit();
	}
</script>

<form
	bind:this={formEl}
	use:enhance={enhanceEdit}
	class="form-body"
	method="POST"
	action="/map?/editVisit"
>
	<input type="hidden" name="visitId" value={visit.id.toString()} />

	<div class="field-row">
		<TextField
			variant="outlined"
			type="textarea"
			name="summary"
			placeholder="Tell others about your experience"
			rows={6}
			bind:value={summary}
			errorText={fieldErrors.summary?.[0] ?? ''}
			maxlength={2000}
		/>
	</div>

	<div class="field-row">
		<TextField
			variant="outlined"
			type="date"
			name="visitDate"
			supportingText="Date visited"
			aria-label="Date visited"
			bind:value={visitDate}
			errorText={fieldErrors.visited_at?.[0] ?? ''}
		/>
	</div>

	{#if formError}
		<p class="field-error" role="alert">{formError}</p>
	{/if}
</form>

<style>
	.form-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-row {
		width: 100%;
	}
</style>
