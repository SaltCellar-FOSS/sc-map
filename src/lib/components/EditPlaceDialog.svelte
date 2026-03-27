<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import ChipSelector from './ChipSelector.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { SavedPlace, SavedPlaceType } from '$lib/schemas/saved-place';
	import { untrack } from 'svelte';

	type Props = {
		open: boolean;
		savedPlace: SavedPlace;
		onclose?: () => void;
		onsuccess?: () => void;
	};

	let { open = $bindable(false), savedPlace, onclose, onsuccess }: Props = $props();

	let formEl = $state<HTMLFormElement | null>(null);
	let selectedType = $state<SavedPlaceType>(untrack(() => savedPlace.type));
	let formError = $state('');

	function handleClose() {
		onclose?.();
		open = false;
	}

	function enhanceEdit({ cancel }: { cancel: () => void }) {
		formError = '';
		if (!selectedType) {
			cancel();
			return;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				handleClose();
				onsuccess?.();
			} else if (result.type === 'failure') {
				formError = (result.data as { error?: string })?.error ?? 'Something went wrong';
			}
		};
	}
</script>

<Dialog {open} onclose={handleClose}>
	{#snippet headline()}<span class="headline-centered">{savedPlace.name}</span>{/snippet}
	<div class="dialog-body">
		{#key savedPlace.id}
			<form bind:this={formEl} use:enhance={enhanceEdit} method="POST" action="/map?/editPlace">
				<input type="hidden" name="placeId" value={savedPlace.id.toString()} />
				<input type="hidden" name="type" value={selectedType} />

				<ChipSelector bind:selectedType />

				{#if formError}
					<p class="field-error" role="alert">{formError}</p>
				{/if}
			</form>
		{/key}
		<div class="md-dialog__actions">
			<Button variant="text" onclick={handleClose}>Cancel</Button>
			<Button variant="text" onclick={() => formEl?.requestSubmit()}>Save</Button>
		</div>
	</div>
</Dialog>

<style>
	.headline-centered {
		display: block;
		text-align: center;
	}

	.dialog-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
