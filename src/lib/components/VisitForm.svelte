<script lang="ts">
	import ChipSelector from './ChipSelector.svelte';
	import Button from './ui/button/Button.svelte';
	import Icon from './ui/icon/Icon.svelte';
	import TextField from './ui/text-field/TextField.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import type { Place } from '$lib/schemas/place';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { isSavedPlace } from '$lib/schemas/place';
	import { untrack } from 'svelte';
	import { Temporal } from '@js-temporal/polyfill';
	import { MAX_PHOTOS, MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from '$lib/photo-constants';

	type BaseProps = {
		onsuccess?: () => void;
		submitting?: boolean;
	};

	type AddModeProps = BaseProps & {
		mode: 'add';
		place: Place;
		visit?: never;
	};

	type EditModeProps = BaseProps & {
		mode: 'edit';
		place?: never;
		visit: VisitWithUser;
	};

	type Props = AddModeProps | EditModeProps;

	let { mode, place, visit, onsuccess, submitting = $bindable(false) }: Props = $props();

	let formEl = $state<HTMLFormElement | null>(null);

	const isAddMode = $derived(mode === 'add');
	const isEditMode = $derived(mode === 'edit');

	const googlePlaceId = $derived(place ? (place as Place).google_place_id : undefined);
	const showChipSelector = $derived(place && !isSavedPlace(place as Place));

	let summary = $state(untrack(() => (visit && visit.summary) ?? ''));
	let visitDate = $state<string>(
		untrack(() => (visit ? visit.visited_at.toString() : Temporal.Now.plainDateISO().toString()))
	);
	let selectedType = $state<SavedPlaceType | undefined>();
	let selectedImages = $state<File[]>([]);
	let photoUrls = $state<string[]>([]);
	let fileInput = $state<HTMLInputElement | null>(null);
	let submitted = $state(false);
	let formError = $state('');

	const MAX_LENGTH = 2000;

	type FieldErrors = { summary?: string[]; visited_at?: string[] };

	function validate(s: string, visitedAt: string): FieldErrors {
		const errors: FieldErrors = {};
		if (s.length > MAX_LENGTH) {
			errors.summary = [`Must be ${MAX_LENGTH} characters or less`];
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

	function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		formError = '';

		const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
		const valid = files.filter((f) => f.size <= MAX_FILE_SIZE);
		const remaining = MAX_PHOTOS - selectedImages.length;
		const toAdd = valid.slice(0, remaining);

		if (oversized.length === 1) {
			formError = `The provided file exceeds the ${MAX_FILE_SIZE_LABEL} limit`;
		} else if (oversized.length > 1) {
			formError = `${oversized.length} files exceed the ${MAX_FILE_SIZE_LABEL} limit`;
		}

		selectedImages = [...selectedImages, ...toAdd];
		for (const file of toAdd) {
			photoUrls = [...photoUrls, URL.createObjectURL(file)];
		}
		input.value = '';
	}

	function removePhoto(index: number) {
		URL.revokeObjectURL(photoUrls[index]);
		selectedImages = selectedImages.filter((_, i) => i !== index);
		photoUrls = photoUrls.filter((_, i) => i !== index);
	}

	const enhanceForm: SubmitFunction = ({ cancel, formData }) => {
		submitted = true;
		formError = '';
		const errors = validate(summary, visitDate);
		if (Object.keys(errors).length > 0) {
			cancel();
			return;
		}

		submitting = true;

		// Append selected images to FormData for add mode
		if (isAddMode) {
			for (const file of selectedImages) {
				formData.append('images', file);
			}
		}

		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			submitting = false;
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
	use:enhance={enhanceForm}
	class="form-body"
	method="POST"
	action="/map?/{isAddMode ? 'addVisit' : 'editVisit'}"
	enctype="multipart/form-data"
>
	{#if isAddMode}
		<input type="hidden" name="googlePlaceId" value={googlePlaceId} />
		<input type="hidden" name="selectedType" value={selectedType} />
	{:else if isEditMode && visit}
		<input type="hidden" name="visitId" value={visit.id.toString()} />
	{/if}

	<div class="field-row">
		<TextField
			variant="outlined"
			type="textarea"
			name="summary"
			placeholder="Tell others about your experience"
			rows={6}
			bind:value={summary}
			errorText={fieldErrors.summary?.[0] ?? ''}
			maxlength={MAX_LENGTH}
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

	{#if showChipSelector}
		<ChipSelector bind:selectedType></ChipSelector>
	{/if}

	{#if isAddMode}
		<div class="photos-row">
			{#if selectedImages.length < MAX_PHOTOS}
				<Button variant="tonal" onclick={() => fileInput?.click()}>
					{#snippet icon()}
						<Icon name="photo" class="md-btn__icon" />
					{/snippet}
					Add photos
				</Button>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					multiple
					style="display:none"
					onchange={handleFileChange}
				/>
			{/if}
		</div>

		{#if photoUrls.length > 0}
			<div class="photo-strip" role="list" aria-label="Added photos">
				{#each photoUrls as url, i (url)}
					<div class="photo-thumb" role="listitem">
						<img src={url} alt="Photo {i + 1}" />
						<button
							type="button"
							class="photo-remove"
							aria-label="Remove photo {i + 1}"
							onclick={() => removePhoto(i)}
						>
							<Icon name="close" size={16} />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

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

	:global(.type-toggle) {
		width: 100%;
	}

	.photos-row {
		display: grid;
	}

	.photo-strip {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 4px;
		scrollbar-width: none;
	}

	.photo-strip::-webkit-scrollbar {
		display: none;
	}

	.photo-thumb {
		flex: 0 0 140px;
		height: 140px;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
		position: relative;
	}

	.photo-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.photo-remove {
		position: absolute;
		top: 6px;
		right: 6px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.55);
		color: #fff;
		padding: 0;
	}
</style>
