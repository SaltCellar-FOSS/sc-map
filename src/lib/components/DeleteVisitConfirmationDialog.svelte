<script lang="ts">
	import Dialog from './ui/dialog/Dialog.svelte';
	import Button from './ui/button/Button.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	type Props = {
		open: boolean;
		visitId: bigint;
		onclose?: () => void;
		onsuccess?: () => void;
	};

	let { open = $bindable(false), visitId, onclose, onsuccess }: Props = $props();

	let formEl = $state<HTMLFormElement | null>(null);
	let formError = $state('');

	function handleClose() {
		onclose?.();
		open = false;
	}

	function enhanceDelete() {
		formError = '';
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

<Dialog type="alertdialog" {open} onclose={handleClose}>
	{#snippet headline()}Are you sure?{/snippet}

	<p>This review will be permanently deleted.</p>
	{#if formError}
		<p class="form-error" role="alert">{formError}</p>
	{/if}
	<form bind:this={formEl} use:enhance={enhanceDelete} method="POST" action="/map?/deleteVisit">
		<input type="hidden" name="visitId" value={visitId.toString()} />
	</form>

	{#snippet actions()}
		<Button variant="text" onclick={handleClose}>Cancel</Button>
		<Button variant="text" onclick={() => formEl?.requestSubmit()}>Delete</Button>
	{/snippet}
</Dialog>

<style>
	p {
		margin: 0;
	}

	.form-error {
		color: var(--md-sys-color-error);
		margin-top: 8px;
	}
</style>
