<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';

	interface Props {
		images: string[];
		visitId: string;
		canDelete?: boolean;
		action: string;
	}

	let { images, visitId, canDelete = true, action }: Props = $props();

	let deletingImages = $state<Set<string>>(new Set());
	let lightboxImage = $state<string | null>(null);

	function openLightbox(imageUrl: string) {
		lightboxImage = imageUrl;
	}

	function closeLightbox() {
		lightboxImage = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeLightbox();
	}

	function handleDelete(imageUrl: string) {
		deletingImages.add(imageUrl);
	}

	const handleDeleteSubmit: SubmitFunction = () => {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			if (result.type === 'success') {
				// The server action will handle removing the image from the list
				// by triggering a page reload or updating the data
			}
			await update();
		};
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if lightboxImage}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="lightbox-overlay" onclick={closeLightbox}>
		<button class="lightbox-close" onclick={closeLightbox} aria-label="Close">✕</button>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
		<img class="lightbox-img" src={lightboxImage} alt="" onclick={(e) => e.stopPropagation()} />
	</div>
{/if}

{#if images.length > 0}
	<div class="image-preview">
		<h4>Uploaded Images</h4>
		<div class="images-grid">
			{#each images as imageUrl (imageUrl)}
				<div class="image-item">
					<button
						class="image-button"
						onclick={() => openLightbox(imageUrl)}
						aria-label="View image"
					>
						<img src={imageUrl} alt="" loading="lazy" />
					</button>

					{#if canDelete && !deletingImages.has(imageUrl)}
						<form
							use:enhance={handleDeleteSubmit}
							method="POST"
							{action}
							onsubmit={() => handleDelete(imageUrl)}
						>
							<input type="hidden" name="visitId" value={visitId} />
							<input type="hidden" name="imageUrl" value={imageUrl} />

							<button
								type="submit"
								class="delete-button"
								title="Delete image"
								disabled={deletingImages.has(imageUrl)}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
									/>
								</svg>
							</button>
						</form>
					{/if}

					{#if deletingImages.has(imageUrl)}
						<div class="deleting-overlay">
							<div class="spinner"></div>
							<span>Deleting...</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* Lightbox */
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.lightbox-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
		color: white;
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
		z-index: 10000;
	}

	.lightbox-close:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.lightbox-img {
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
		border-radius: 0.5rem;
		cursor: default;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}

	/* Image grid */
	.image-preview {
		margin-top: 1rem;
	}

	.image-preview h4 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text, #333);
	}

	.images-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.75rem;
	}

	.image-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid #e1e5e9;
		background: #f8f9fa;
	}

	.image-button {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: none;
		background: none;
		cursor: zoom-in;
	}

	.image-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.2s ease;
		display: block;
	}

	.image-item:hover img {
		transform: scale(1.05);
	}

	.delete-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: 50%;
		background: rgba(220, 53, 69, 0.9);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.image-item:hover .delete-button {
		opacity: 1;
	}

	.delete-button:hover {
		background: rgba(220, 53, 69, 1);
		transform: scale(1.1);
	}

	.delete-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.deleting-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.875rem;
		gap: 0.5rem;
	}

	.spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.images-grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 0.5rem;
		}

		.image-preview h4 {
			font-size: 0.875rem;
		}
	}
</style>
