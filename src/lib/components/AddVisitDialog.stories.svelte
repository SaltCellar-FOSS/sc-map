<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AddVisitDialog from './AddVisitDialog.svelte';

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
	<AddVisitDialog
		open={true}
		placeName="Franklin Barbecue"
		googlePlaceId="ChIJ24EDAYllToYR34yWOv_et-A"
		isSavedPlace={false}
	/>
</Story>

<!-- Long place name -->

<Story name="Long Place Name">
	<AddVisitDialog
		open={true}
		placeName="The Salt Lick BBQ – Driftwood, Texas"
		googlePlaceId="ChIJN1t_tDeuEmsRUsoyG83frY4"
		isSavedPlace={false}
	/>
</Story>
