<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import AddVisitForm from './AddVisitForm.svelte';

	type Props = {
		open: boolean;
		placeName: string;
		googlePlaceId: string;
		isSavedPlace: boolean;
		onclose?: () => void;
		onsuccess?: () => void;
	};

	let {
		open = $bindable(false),
		placeName,
		googlePlaceId,
		isSavedPlace,
		onclose,
		onsuccess
	}: Props = $props();

	let formRef = $state<AddVisitForm | null>(null);

	function handleClose() {
		onclose?.();
		open = false;
	}

	function handleSuccess() {
		handleClose();
		onsuccess?.();
	}
</script>

<Dialog {open} onclose={handleClose}>
	{#snippet headline()}<span class="headline-centered">{placeName}</span>{/snippet}
	<div class="dialog-body">
		{#key googlePlaceId}
			<AddVisitForm bind:this={formRef} {googlePlaceId} {isSavedPlace} onsuccess={handleSuccess} />
		{/key}
		<div class="md-dialog__actions">
			<Button variant="text" onclick={handleClose}>Cancel</Button>
			<Button variant="text" onclick={() => formRef?.submit()}>Post</Button>
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
