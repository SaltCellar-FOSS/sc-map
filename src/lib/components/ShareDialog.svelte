<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import Icon from './ui/icon/Icon.svelte';
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import { isAppleDevice } from '$lib/platform';
	import { getAppleMapsUrl, getGoogleMapsUrl } from '$lib/share';

	type Props = {
		open?: boolean;
		place: SavedPlace;
		onclose?: () => void;
	};

	let { open = $bindable(false), place, onclose }: Props = $props();

	const isApple = isAppleDevice();

	function handleClose() {
		onclose?.();
		open = false;
	}
</script>

<Dialog {open} onclose={handleClose}>
	{#snippet headline()}{place.name}{/snippet}

	<div class="map-options">
		{#if isApple}
			<div class="map-option">
				<Button
					variant="text"
					class="map-btn"
					href={getAppleMapsUrl(place)}
					target="_blank"
					onclick={handleClose}
				>
					{#snippet icon()}<Icon name="apple" size={28} />{/snippet}
				</Button>
				<span class="map-label">Apple Maps</span>
			</div>
		{/if}
		<div class="map-option">
			<Button
				variant="text"
				class="map-btn"
				href={getGoogleMapsUrl(place)}
				target="_blank"
				onclick={handleClose}
			>
				{#snippet icon()}<Icon name="pin" size={28} />{/snippet}
			</Button>
			<span class="map-label">Google Maps</span>
		</div>
	</div>
</Dialog>

<style>
	.map-options {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 24px;
		padding: 8px 0 4px;
	}

	.map-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.map-option :global(.map-btn) {
		width: 52px;
		height: 52px;
		min-width: 52px;
		border-radius: 50%;
		padding: 0;
	}

	.map-label {
		font-size: 0.75rem;
		line-height: 1;
		color: var(--md-sys-color-on-surface-variant);
	}
</style>
