<script lang="ts">
	import TextField from './ui/text-field/TextField.svelte';
	import StarRating from './ui/star-rating/StarRating.svelte';
	import ChipSet from './ui/chip/ChipSet.svelte';
	import { Chip } from './ui/chip';
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { VisitInsertSchema } from '$lib/schemas/visit';
	import { z } from 'zod';

	import type { ComponentProps } from 'svelte';
	import Icon from './ui/icon/Icon.svelte';
	import { untrack } from 'svelte';

	const savedPlaceTypeMap: Record<
		SavedPlaceType,
		{
			iconName: Extract<
				ComponentProps<typeof Icon>['name'],
				'restaurant' | 'bar' | 'bakery' | 'deli' | 'foodTruck' | 'dessert' | 'otherDestination'
			>;
			label: string;
		}
	> = {
		[SavedPlaceType.Restaurant]: { iconName: 'restaurant', label: 'Restaurant' },
		[SavedPlaceType.Bar]: { iconName: 'bar', label: 'Bar' },
		[SavedPlaceType.Bakery]: { iconName: 'bakery', label: 'Bakery' },
		[SavedPlaceType.Deli]: { iconName: 'deli', label: 'Deli' },
		[SavedPlaceType.FoodTruck]: { iconName: 'foodTruck', label: 'Food Truck' },
		[SavedPlaceType.Dessert]: { iconName: 'dessert', label: 'Dessert' },
		[SavedPlaceType.OtherDestination]: { iconName: 'otherDestination', label: 'Other Destination' }
	};

	const AddVisitClientSchema = VisitInsertSchema.omit({ place_id: true, user_id: true }).extend({
		rating: z.coerce.number().min(1).max(5)
	});

	const formatter = Intl.DateTimeFormat('en-CA');

	const today = (): string => formatter.format(new Date());

	type Props = {
		googlePlaceId: string;
		isSavedPlace: boolean;
		onsuccess?: () => void;
	};

	let { googlePlaceId, isSavedPlace, onsuccess }: Props = $props();

	let formEl = $state<HTMLFormElement | null>(null);

	let rating = $state(0);
	let review = $state('');
	let visitDate = $state<string>(untrack(today));
	let selectedType = $state<SavedPlaceType | null>(null);
	let submitted = $state(false);

	const MAX_REVIEW_LENGTH = 2000;

	const validationResult = $derived.by(() => {
		if (!submitted) return null;
		return AddVisitClientSchema.safeParse({ rating, summary: review, visited_at: visitDate });
	});

	const fieldErrors = $derived(
		validationResult && !validationResult.success
			? z.flattenError(validationResult.error).fieldErrors
			: {}
	);

	function reset() {
		submitted = false;
		rating = 0;
		review = '';
		visitDate = today();
		selectedType = null;
	}

	const enhanceVisit: SubmitFunction = ({ cancel }) => {
		submitted = true;
		const result = AddVisitClientSchema.safeParse({
			rating,
			summary: review,
			visited_at: visitDate
		});
		if (!result.success) {
			cancel();
			return;
		}
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			if (result.type === 'success') {
				reset();
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
	<input type="hidden" name="rating" value={rating} />
	<input type="hidden" name="selectedType" value={selectedType} />

	<div class="rating-field">
		<StarRating bind:value={rating} />
		{#if fieldErrors.rating?.[0]}
			<p class="field-error" role="alert">{fieldErrors.rating[0]}</p>
		{/if}
	</div>

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
		<div class="field-row">
			<ChipSet>
				{#each Object.values(SavedPlaceType) as savedPlaceType (savedPlaceType)}
					<Chip
						type="filter"
						label={savedPlaceTypeMap[savedPlaceType].label}
						onchange={() => (selectedType = savedPlaceType)}
						selected={selectedType === savedPlaceType}
					>
						{#snippet icon()}
							<Icon name={savedPlaceTypeMap[savedPlaceType].iconName} />
						{/snippet}
					</Chip>
				{/each}
			</ChipSet>
		</div>
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

	.rating-field {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.field-error {
		margin: 0;
		font-size: 0.75rem;
		color: var(--md-sys-color-error, #b3261e);
	}

	:global(.type-toggle) {
		width: 100%;
	}
</style>
