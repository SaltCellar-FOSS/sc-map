<script lang="ts">
	import ChipSelector from './ChipSelector.svelte';

	import TextField from './ui/text-field/TextField.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { VisitInsertSchema } from '$lib/schemas/visit';
	import { z } from 'zod';

	const AddVisitClientSchema = VisitInsertSchema.omit({ place_id: true, user_id: true });

	const formatter = Intl.DateTimeFormat('en-CA');

	const today = (): string => formatter.format(new Date());

	type Props = {
		googlePlaceId: string;
		isSavedPlace: boolean;
		onsuccess?: () => void;
	};

	let { googlePlaceId, isSavedPlace, onsuccess }: Props = $props();

	let formEl = $state<HTMLFormElement | null>(null);

	let review = $state('');
	let visitDate = $state<string>(today());
	let selectedType = $state<SavedPlaceType | undefined>();
	let submitted = $state(false);

	const MAX_REVIEW_LENGTH = 2000;

	const validationResult = $derived.by(() => {
		if (!submitted) return null;
		return AddVisitClientSchema.safeParse({ summary: review, visited_at: visitDate });
	});

	const fieldErrors = $derived(
		validationResult && !validationResult.success
			? z.flattenError(validationResult.error).fieldErrors
			: {}
	);

	const enhanceVisit: SubmitFunction = ({ cancel }) => {
		submitted = true;
		const result = AddVisitClientSchema.safeParse({
			summary: review,
			visited_at: visitDate
		});
		if (!result.success) {
			cancel();
			return;
		}
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			if (result.type === 'success') {
				onsuccess?.();
			}
			await update();
		};
	};

	export function submit() {
		formEl?.requestSubmit();
	}
</script>

<form
	bind:this={formEl}
	use:enhance={enhanceVisit}
	class="form-body"
	method="POST"
	action="/map?/addVisit"
>
	<input type="hidden" name="googlePlaceId" value={googlePlaceId} />
	<input type="hidden" name="selectedType" value={selectedType} />

	<div class="field-row">
		<TextField
			variant="outlined"
			type="textarea"
			name="review"
			placeholder="Tell others about your experience"
			rows={6}
			bind:value={review}
			errorText={fieldErrors.summary?.[0] ?? ''}
			maxlength={MAX_REVIEW_LENGTH}
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

	{#if !isSavedPlace}
		<ChipSelector bind:selectedType></ChipSelector>
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

	:global(.type-toggle) {
		width: 100%;
	}
</style>
