<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import AddVisitForm from './AddVisitForm.svelte';
	import EditVisitForm from './EditVisitForm.svelte';
	import type { Place } from '$lib/schemas/place';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { isSavedPlace } from '$lib/schemas/place';

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

	let formRef = $state<AddVisitForm | EditVisitForm | null>(null);

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
				<AddVisitForm
					bind:this={formRef}
					googlePlaceId={place.google_place_id}
					isSavedPlace={isSavedPlace(place)}
					onsuccess={handleSuccess}
				/>
			{/key}
		{:else if mode === 'edit' && visit}
			{#key visit.id}
				<EditVisitForm bind:this={formRef} {visit} onsuccess={handleSuccess} />
			{/key}
		{/if}
		<div class="md-dialog__actions">
			<Button variant="text" onclick={handleClose}>Cancel</Button>
			<Button variant="text" onclick={() => formRef?.submit()}>
				{mode === 'add' ? 'Post' : 'Save'}
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
