<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EditVisitDialog from './EditVisitDialog.svelte';

	const sampleVisit = {
		id: 1n,
		user_id: 42n,
		place_id: 7n,
		rating: 4,
		summary: 'Amazing brisket. The line was long but absolutely worth it.',
		visited_at: new Date('2024-06-15'),
		created_at: new Date('2024-06-15'),
		updated_at: new Date('2024-06-15'),
		discord_handle: '@foodie',
		avatar_url: null,
		photo_urls: []
	};

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' }
		}
	});
</script>

<Story name="Default">
	<EditVisitDialog open={true} placeName="Franklin Barbecue" visit={sampleVisit} />
</Story>

<Story name="Long Place Name">
	<EditVisitDialog
		open={true}
		placeName="The Salt Lick BBQ – Driftwood, Texas"
		visit={sampleVisit}
	/>
</Story>
