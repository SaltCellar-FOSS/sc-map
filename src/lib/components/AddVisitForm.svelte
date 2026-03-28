<script lang="ts">
	import ChipSelector from './ChipSelector.svelte';
	import ImageUpload from './ImageUpload.svelte';

	import TextField from './ui/text-field/TextField.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import { SavedPlaceType } from '$lib/schemas/saved-place';

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
	let selectedImages = $state<File[]>([]);
	let submitted = $state(false);

	const MAX_REVIEW_LENGTH = 2000;

	type FieldErrors = { summary?: string[]; visited_at?: string[] };

	function validate(summary: string, visitedAt: string): FieldErrors {
		const errors: FieldErrors = {};
		if (summary.length > MAX_REVIEW_LENGTH) {
			errors.summary = [`Must be ${MAX_REVIEW_LENGTH} characters or less`];
		}
		if (!visitedAt || !/^\d{4}-\d{2}-\d{2}$/.test(visitedAt)) {
			errors.visited_at = ['Must be a valid date'];
		}
		return errors;
	}

	const fieldErrors = $derived.by((): FieldErrors => {
		if (!submitted) return {};
		return validate(review, visitDate);
	});

	function handleFilesChange(files: File[]) {
		selectedImages = files;
	}

	const enhanceVisit: SubmitFunction = ({ cancel, formData }) => {
		submitted = true;
		const errors = validate(review, visitDate);
		if (Object.keys(errors).length > 0) {
			cancel();
			return;
		}

		// Append selected images to the FormData BEFORE the form submits
		for (const file of selectedImages) {
			formData.append('images', file);
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
	action="?/addVisit"
	enctype="multipart/form-data"
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

	<div class="field-row">
		<ImageUpload
			maxImages={3}
			currentImages={[]}
			onFilesChange={handleFilesChange}
		/>
	</div>
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
