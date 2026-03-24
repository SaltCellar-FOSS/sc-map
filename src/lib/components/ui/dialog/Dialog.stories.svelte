<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Dialog from './Dialog.svelte';
	import Button from '../button/Button.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' },
			type: { control: 'radio', options: ['dialog', 'alertdialog'] }
		}
	});
</script>

<!-- Basic dialog with headline and body -->

<Story name="Basic">
	<Dialog open={true}>
		{#snippet headline()}Delete file?{/snippet}
		<p>This action cannot be undone. The file will be permanently removed.</p>
		{#snippet actions()}
			<Button onclick={() => {}} variant="text">Cancel</Button>
			<Button onclick={() => {}} variant="text">Delete</Button>
		{/snippet}
	</Dialog>
</Story>

<!-- Headline only, no body -->

<Story name="Headline Only">
	<Dialog open={true}>
		{#snippet headline()}Confirm action{/snippet}
		{#snippet actions()}
			<Button onclick={() => {}} variant="text">Cancel</Button>
			<Button onclick={() => {}} variant="text">Confirm</Button>
		{/snippet}
	</Dialog>
</Story>

<!-- Body only, no headline -->

<Story name="Body Only">
	<Dialog open={true}>
		<p>Are you sure you want to proceed?</p>
		{#snippet actions()}
			<Button onclick={() => {}} variant="text">No</Button>
			<Button onclick={() => {}} variant="text">Yes</Button>
		{/snippet}
	</Dialog>
</Story>

<!-- Alert dialog with icon -->

<Story name="Alert With Icon">
	<Dialog open={true} type="alertdialog">
		{#snippet icon()}
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
				/>
			</svg>
		{/snippet}
		{#snippet headline()}Error{/snippet}
		Something went wrong. Please try again.
		{#snippet actions()}
			<Button onclick={() => {}} variant="text">OK</Button>
		{/snippet}
	</Dialog>
</Story>

<!-- Long scrollable body -->

<Story name="Scrollable Body">
	<Dialog open={true}>
		{#snippet headline()}Terms of Service{/snippet}
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua.
		</p>
		<p>
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
			commodo consequat.
		</p>
		<p>
			Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
			pariatur.
		</p>
		<p>
			Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
			id est laborum.
		</p>
		<p>
			Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
			laudantium.
		</p>
		<p>
			Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
			consequuntur magni dolores.
		</p>
		{#snippet actions()}
			<Button onclick={() => {}} variant="text">Decline</Button>
			<Button onclick={() => {}} variant="text">Accept</Button>
		{/snippet}
	</Dialog>
</Story>

<!-- No actions -->

<Story name="No Actions">
	<Dialog open={true}>
		{#snippet headline()}Information{/snippet}
		<p>This dialog has no action buttons.</p>
	</Dialog>
</Story>
