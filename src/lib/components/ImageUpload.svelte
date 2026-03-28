<script lang="ts">
	interface Props {
		maxImages?: number;
		currentImages?: string[];
		onFilesChange?: (files: File[]) => void;
	}

	let {
		maxImages = 3,
		currentImages = [],
		onFilesChange
	}: Props = $props();

	let files: File[] = $state([]);
	let previews: string[] = $state([]);
	let errors: string[] = $state([]);

	const remainingSlots = $derived(maxImages - currentImages.length - files.length);

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const selectedFiles = Array.from(input.files || []);

		// Reset previous state
		files = [];
		previews = [];
		errors = [];

		// Validate file count
		const totalImages = currentImages.length + selectedFiles.length;
		if (totalImages > maxImages) {
			errors = [`You can only upload up to ${maxImages} images total. You currently have ${currentImages.length} images.`];
			input.value = '';
			return;
		}

		// Validate each file
		const validFiles: File[] = [];
		const fileErrors: string[] = [];

		selectedFiles.forEach((file, index) => {
			// Check file type
			if (!file.type.startsWith('image/')) {
				fileErrors.push(`File ${index + 1}: Only image files are allowed`);
				return;
			}

			// Check file size (10MB limit)
			if (file.size > 10 * 1024 * 1024) {
				fileErrors.push(`File ${index + 1}: File size must be less than 10MB`);
				return;
			}

			validFiles.push(file);
		});

		if (fileErrors.length > 0) {
			errors = fileErrors;
			input.value = '';
			return;
		}

		files = validFiles;

		// Create previews
		previews = validFiles.map(file => URL.createObjectURL(file));

		// Notify parent component
		onFilesChange?.(files);
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		previews = previews.filter((_, i) => i !== index);
		onFilesChange?.(files);
	}

	// Expose files to parent component
	$effect(() => {
		onFilesChange?.(files);
	});
</script>

<div class="image-upload">
	{#if remainingSlots > 0}
		<div class="upload-section">
			<label for="image-input" class="upload-button">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
				</svg>
				Choose Images ({remainingSlots} remaining)
			</label>
			<input
				id="image-input"
				type="file"
				accept="image/*"
				multiple
				onchange={handleFileSelect}
				style="display: none"
			/>
		</div>
	{/if}

	{#if errors.length > 0}
		<div class="errors">
			{#each errors as error, i (i)}
				<p class="error">{error}</p>
			{/each}
		</div>
	{/if}

	{#if previews.length > 0}
		<div class="previews">
			{#each previews as preview, index (index)}
				<div class="preview-item">
					<img src={preview} alt="Preview {index + 1}" />
					<button
						type="button"
						class="remove-button"
						onclick={() => removeFile(index)}
					>
						✕
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.image-upload {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.upload-section {
		display: flex;
		align-items: center;
	}

	.upload-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--color-primary, #007bff);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.upload-button:hover:not(:disabled) {
		background: var(--color-primary-dark, #0056b3);
	}

	.upload-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.errors {
		padding: 0.75rem;
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 0.375rem;
	}

	.error {
		margin: 0;
		color: #c33;
		font-size: 0.875rem;
	}

	.previews {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.75rem;
	}

	.preview-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 0.375rem;
		overflow: hidden;
		border: 1px solid #ddd;
	}

	.preview-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-button {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		line-height: 1;
	}

	.remove-button:hover:not(:disabled) {
		background: rgba(0, 0, 0, 0.9);
	}

	.remove-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

</style>