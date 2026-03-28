<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import VisitDialog from './VisitDialog.svelte';

	const sampleVisit = {
		id: 1n,
		user_id: 42n,
		place_id: 7n,
		summary: 'Amazing brisket. The line was long but absolutely worth it.',
		visited_at: new Date('2024-06-15'),
		created_at: new Date('2024-06-15'),
		updated_at: new Date('2024-06-15'),
		discord_handle: '@foodie',
		avatar_url: null,
		photo_urls: []
	};

	const samplePlace = {
		name: 'Franklin Barbecue',
		google_place_id: 'ChIJ24EDAYllToYR34yWOv_et-A',
		formatted_address: '900 E 11th St, Austin, TX 78702',
		lat: 30.271,
		lng: -97.728
	};

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' },
			mode: { control: { type: 'select', options: ['add', 'edit'] } }
		}
	});
</script>

<Story name="Add">
	<VisitDialog mode="add" open={true} place={samplePlace} />
</Story>

<Story name="Add Long Place Name">
	<VisitDialog
		mode="add"
		open={true}
		place={{
			...samplePlace,
			name: 'The Salt Lick BBQ – Driftwood, Texas',
			google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
		}}
	/>
</Story>

<Story name="Edit">
	<VisitDialog mode="edit" open={true} place={samplePlace} visit={sampleVisit} />
</Story>

<Story name="Edit Long Place Name">
	<VisitDialog
		mode="edit"
		open={true}
		place={{
			...samplePlace,
			name: 'The Salt Lick BBQ – Driftwood, Texas'
		}}
		visit={sampleVisit}
	/>
</Story>
