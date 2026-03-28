<script lang="ts">
	import ChipSelector from './ChipSelector.svelte';
	import TextField from './ui/text-field/TextField.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import type { Place } from '$lib/schemas/place';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { isSavedPlace } from '$lib/schemas/place';
	import { untrack } from 'svelte';

	const formatter = Intl.DateTimeFormat('en-CA');

	const today = (): string => formatter.format(new Date());

	type BaseProps = {
		onsuccess?: () => void;
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

	let { mode, place, visit, onsuccess }: Props = $props();

	let formEl = $state<HTMLFormElement | null>(null);

	const isAddMode = $derived(mode === 'add');
	const isEditMode = $derived(mode === 'edit');

	const googlePlaceId = $derived(place ? (place as Place).google_place_id : undefined);
	const showChipSelector = $derived(place && !isSavedPlace(place as Place));

	let summary = $state(untrack(() => (visit && visit.summary) ?? ''));
	let visitDate = $state<string>(
		untrack(() => (visit && formatter.format(visit.visited_at)) ?? today())
	);
	let selectedType = $state<SavedPlaceType | undefined>();
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

	const enhanceForm: SubmitFunction = ({ cancel }) => {
		submitted = true;
		formError = '';
		const errors = validate(summary, visitDate);
		if (Object.keys(errors).length > 0) {
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
	use:enhance={enhanceForm}
	class="form-body"
	method="POST"
	action="/map?/{isAddMode ? 'addVisit' : 'editVisit'}"
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
</style>
