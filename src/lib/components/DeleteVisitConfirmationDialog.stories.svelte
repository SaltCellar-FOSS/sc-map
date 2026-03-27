<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DeleteVisitConfirmationDialog from './DeleteVisitConfirmationDialog.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' }
		}
	});
</script>

<Story name="Default">
	<DeleteVisitConfirmationDialog open={true} visitId={1n} />
</Story>
