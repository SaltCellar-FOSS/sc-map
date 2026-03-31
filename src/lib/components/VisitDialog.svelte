<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import VisitForm from './VisitForm.svelte';
	import type { Place } from '$lib/schemas/place';
	import type { VisitWithUser } from '$lib/schemas/visit';

	type BaseProps = {
		open: boolean;
		place: Place;
		onclose?: () => void;
		onsuccess?: () => void;
	};

	type AddModeProps = BaseProps & {
		mode: 'add';
		visit?: never;
	};

	type EditModeProps = BaseProps & {
		mode: 'edit';
		visit: VisitWithUser;
	};

	type Props = AddModeProps | EditModeProps;

	let { open = $bindable(false), place, mode, visit, onclose, onsuccess }: Props = $props();

	let formRef = $state<VisitForm | null>(null);
	let submitting = $state(false);

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
	{#snippet headline()}<span class="headline-centered">{place.name}</span>{/snippet}
	<div class="dialog-body">
		{#if mode === 'add'}
			{#key place.google_place_id}
				<VisitForm bind:this={formRef} bind:submitting {mode} {place} onsuccess={handleSuccess} />
			{/key}
		{:else if mode === 'edit' && visit}
			{#key visit.id}
				<VisitForm bind:this={formRef} bind:submitting {mode} {visit} onsuccess={handleSuccess} />
			{/key}
		{/if}
		<div class="md-dialog__actions">
			<Button variant="text" onclick={handleClose} disabled={submitting}>Cancel</Button>
			<Button variant="text" onclick={() => formRef?.submit()} disabled={submitting}>
				{submitting ? 'Saving…' : mode === 'add' ? 'Post' : 'Save'}
			</Button>
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
