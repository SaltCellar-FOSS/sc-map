<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import TextField from './ui/text-field/TextField.svelte';
	import StarRating from './ui/star-rating/StarRating.svelte';

	interface Props {
		open?: boolean;
		placeName?: string;
		onclose?: () => void;
		onpost?: (data: { rating: number; review: string; photos: File[] }) => void;
	}

	let {
		open = $bindable(false),
		placeName = 'Franklin Barbecue',
		onclose,
		onpost
	}: Props = $props();

	let rating = $state(0);
	let review = $state('');
	let photos = $state<File[]>([]);
	let photoUrls = $state<string[]>([]);
	let fileInput = $state<HTMLInputElement | null>(null);

	function handleClose() {
		onclose?.();
		open = false;
	}

	function handlePost() {
		onpost?.({ rating, review, photos });
		handleClose();
	}

	function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		photos = [...photos, ...files];
		for (const file of files) {
			photoUrls = [...photoUrls, URL.createObjectURL(file)];
		}
	}

	function removePhoto(index: number) {
		URL.revokeObjectURL(photoUrls[index]);
		photos = photos.filter((_, i) => i !== index);
		photoUrls = photoUrls.filter((_, i) => i !== index);
	}
</script>

<Dialog bind:open {onclose} class="add-visit-dialog">
	{#snippet headline()}{placeName}{/snippet}
	<div class="dialog-body">
		<StarRating bind:value={rating} />

		<!-- Review textarea -->
		<TextField
			variant="outlined"
			type="textarea"
			placeholder="Tell others about your experience"
			rows={6}
			bind:value={review}
			class="review-field"
		/>

		<!-- Add photos button -->
		<Button variant="tonal" class="add-photos-btn" onclick={() => fileInput?.click()}>
			{#snippet icon()}
				<svg class="md-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"
					/>
				</svg>
			{/snippet}
			Add photos &amp; videos
		</Button>

		<input
			bind:this={fileInput}
			type="file"
			accept="image/*,video/*"
			multiple
			style="display:none"
			onchange={handleFileChange}
		/>

		<!-- Photo thumbnails -->
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
		{/if}
	</div>

	{#snippet actions()}
		<Button variant="text" onclick={handleClose}>Cancel</Button>
		<Button variant="text" onclick={handlePost}>Post</Button>
	{/snippet}
</Dialog>

<style>
	:global(.add-visit-dialog) {
		width: min(560px, 100%);
	}

	:global(.add-visit-dialog .md-dialog__headline) {
		text-align: center;
	}

	:global(.review-field) {
		width: 100%;
	}

	:global(.add-photos-btn) {
		width: 100%;
		margin-top: 12px;
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
	}

	.dialog-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
