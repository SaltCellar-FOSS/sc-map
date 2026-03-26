<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import TextField from './ui/text-field/TextField.svelte';
	import StarRating from './ui/star-rating/StarRating.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import ChipSet from './ui/chip/ChipSet.svelte';
	import { Chip } from './ui/chip';

	import type { ComponentProps } from 'svelte';
	import Icon from './ui/icon/Icon.svelte';

	type Props = {
		open: boolean;
		placeName: string;
		googlePlaceId: string;
		isSavedPlace: boolean;
		onclose?: () => void;
		onsuccess?: () => void;
	};

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

	const formatter = Intl.DateTimeFormat('en-CA');

	const today = (): string => {
		return formatter.format(new Date());
	};

	let {
		open = $bindable(false),
		placeName,
		googlePlaceId,
		onclose,
		onsuccess,
		isSavedPlace
	}: Props = $props();

	function enhanceVisit() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await update();
			if (result.type === 'success') {
				handleClose();
				onsuccess?.();
			}
		};
	}

	let rating = $state(0);
	let review = $state('');
	let visitDate = $state<string>(today());
	// let photos = $state<File[]>([]);
	let selectedType = $state<SavedPlaceType | null>(null);
	// let photoUrls = $state<string[]>([]);
	// let fileInput = $state<HTMLInputElement | null>(null);
	let submitted = $state(false);

	const MAX_REVIEW_LENGTH = 2000;

	const ratingError = $derived(submitted && rating === 0 ? 'Please select a rating' : '');
	const reviewError = $derived(
		review.length > MAX_REVIEW_LENGTH
			? `Review must be ${MAX_REVIEW_LENGTH} characters or fewer`
			: ''
	);
	const isValid = $derived(rating > 0 && review.length <= MAX_REVIEW_LENGTH);

	function handleClose() {
		submitted = false;
		rating = 0;
		visitDate = today();
		onclose?.();
		open = false;
	}

	function handlePost() {
		submitted = true;
	}

	// function handleFileChange(event: Event) {
	// 	const input = event.currentTarget as HTMLInputElement;
	// 	const files = Array.from(input.files ?? []);
	// 	photos = [...photos, ...files];
	// 	for (const file of files) {
	// 		photoUrls = [...photoUrls, URL.createObjectURL(file)];
	// 	}
	// }

	// function removePhoto(index: number) {
	// 	URL.revokeObjectURL(photoUrls[index]);
	// 	photos = photos.filter((_, i) => i !== index);
	// 	photoUrls = photoUrls.filter((_, i) => i !== index);
	// }
</script>

<Dialog {open} onclose={handleClose}>
	{#snippet headline()}<span class="headline-centered">{placeName}</span>{/snippet}
	<form use:enhance={enhanceVisit} class="dialog-body" method="POST" action="/map?/addVisit">
		<input type="hidden" name="googlePlaceId" value={googlePlaceId} />
		<input type="hidden" name="rating" value={rating} />
		<input type="hidden" name="selectedType" value={selectedType} />
		<div class="rating-field">
			<StarRating bind:value={rating} />
			{#if ratingError}
				<p class="rating-error" role="alert">{ratingError}</p>
			{/if}
		</div>

		<!-- Review textarea -->
		<div class="field-row">
			<TextField
				variant="outlined"
				type="textarea"
				name="review"
				placeholder="Tell others about your experience"
				rows={6}
				bind:value={review}
				errorText={reviewError}
				maxlength={MAX_REVIEW_LENGTH}
			/>
		</div>

		<!-- Visit date -->
		<div class="field-row">
			<TextField
				variant="outlined"
				type="date"
				name="visitDate"
				supportingText="Date visited"
				aria-label="Date visited"
				bind:value={visitDate}
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
						>
							{#snippet icon()}
								<Icon name={savedPlaceTypeMap[savedPlaceType].iconName} />
							{/snippet}
						</Chip>
					{/each}
				</ChipSet>
			</div>
		{/if}

		<!-- Add photos button -->
		<!-- <div class="photos-row">
			<Button variant="tonal" onclick={() => fileInput?.click()}>
				{#snippet icon()}
					<svg class="md-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"
						/>
					</svg>
				{/snippet}
				Add photos &amp; videos
			</Button>
		</div> -->

		<!-- <input
			bind:this={fileInput}
			type="file"
			accept="image/*,video/*"
			multiple
			style="display:none"
			onchange={handleFileChange}
		/>

		{#if photoUrls.length > 0}
			<div class="photo-strip" role="list" aria-label="Added photos">
				{#each photoUrls as url, i (url)}
					<div class="photo-thumb" role="listitem">
						<img src={url} alt="Photo {i + 1}" />
						<button
							class="photo-remove"
							aria-label="Remove photo {i + 1}"
							onclick={() => removePhoto(i)}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
								/>
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if} -->

		<div class="md-dialog__actions">
			<Button variant="text" onclick={handleClose}>Cancel</Button>
			<Button variant="text" onclick={handlePost} disabled={submitted && !isValid} type="submit"
				>Post</Button
			>
		</div>
	</form>
</Dialog>

<style>
	.headline-centered {
		display: block;
		text-align: center;
	}

	.field-row {
		width: 100%;
	}

	/* .photos-row {
		display: grid;
	}

	 .photo-strip {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		margin-top: 12px;
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

	.photo-remove svg {
		width: 16px;
		height: 16px;
		fill: currentColor;
		display: block;
	}

	.photo-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	} */

	.dialog-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.rating-field {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.rating-error {
		margin: 0;
		font-size: 0.75rem;
		color: var(--md-sys-color-error, #b3261e);
	}

	:global(.type-toggle) {
		width: 100%;
	}
</style>
