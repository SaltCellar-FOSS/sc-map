<script lang="ts">
	type Props = {
		/** Current rating value. Bind with bind:value. */
		value?: number;
		/** Total number of stars. Defaults to 5. */
		count?: number;
		/** Accessible label for the group. */
		label?: string;
	};

	let { value = $bindable(0), count = 5, label = 'Rating' }: Props = $props();

	let hoverRating = $state(0);
</script>

<div class="star-rating" role="radiogroup" aria-label={label}>
	{#each Array.from({ length: count }, (_, i) => i + 1) as star (star)}
		<button
			type="button"
			role="radio"
			aria-checked={value === star}
			aria-label="{star} star{star !== 1 ? 's' : ''}"
			class="star-btn"
			onmouseenter={() => (hoverRating = star)}
			onmouseleave={() => (hoverRating = 0)}
			onclick={() => (value = star)}
		>
			{#if star <= (hoverRating || value)}
				<svg viewBox="0 0 24 24" aria-hidden="true" class="star-icon">
					<path
						d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
					/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" aria-hidden="true" class="star-icon">
					<path
						d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
					/>
				</svg>
			{/if}
		</button>
	{/each}
</div>

<style>
	.star-rating {
		display: flex;
		justify-content: center;
		gap: 8px;
	}

	.star-btn {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		color: inherit;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.1s;
	}

	.star-btn:hover {
		transform: scale(1.1);
	}

	.star-icon {
		width: 40px;
		height: 40px;
		fill: currentColor;
	}
</style>
