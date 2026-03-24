<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AddPlaceDialog from './AddPlaceDialog.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' },
			placeName: { control: 'text' }
		}
	});
</script>

<!-- Default: open with a place name -->

<Story name="Default">
	<AddPlaceDialog open={true} placeName="Franklin Barbecue" />
</Story>

<!-- Long place name -->

<Story name="Long Place Name">
	<AddPlaceDialog open={true} placeName="The Salt Lick BBQ – Driftwood, Texas" />
</Story>
