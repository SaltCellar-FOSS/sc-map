<script lang="ts">
	import TextField from './ui/text-field/TextField.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { VisitUpdateSchema } from '$lib/schemas/visit';
	import { z } from 'zod';
	import { untrack } from 'svelte';

	const EditClientSchema = VisitUpdateSchema.pick({
		summary: true,
		visited_at: true
	});

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

	const validationResult = $derived.by(() => {
		if (!submitted) return null;
		return EditClientSchema.safeParse({ summary, visited_at: visitDate });
	});

	const fieldErrors = $derived(
		validationResult && !validationResult.success
			? z.flattenError(validationResult.error).fieldErrors
			: {}
	);

	function enhanceEdit({ cancel }: { cancel: () => void }) {
		submitted = true;
		formError = '';
		const result = EditClientSchema.safeParse({ summary, visited_at: visitDate });
		if (!result.success) {
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
