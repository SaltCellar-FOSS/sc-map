<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import EditVisitForm from './EditVisitForm.svelte';
	import type { VisitWithUser } from '$lib/schemas/visit';

	type Props = {
		open: boolean;
		placeName: string;
		visit: VisitWithUser;
		onclose?: () => void;
		onsuccess?: () => void;
	};

	let { open = $bindable(false), placeName, visit, onclose, onsuccess }: Props = $props();

	let formRef = $state<EditVisitForm | null>(null);

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
		{#key visit.id}
			<EditVisitForm bind:this={formRef} {visit} onsuccess={handleSuccess} />
		{/key}
		<div class="md-dialog__actions">
			<Button variant="text" onclick={handleClose}>Cancel</Button>
			<Button variant="text" onclick={() => formRef?.submit()}>Save</Button>
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
