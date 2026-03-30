<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import VisitForm from './VisitForm.svelte';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { Temporal } from '@js-temporal/polyfill';

	const sampleVisit = {
		id: 1n,
		user_id: 42n,
		place_id: 7n,
		summary: 'Amazing brisket. The line was long but absolutely worth it.',
		visited_at: Temporal.PlainDate.from('2024-06-15'),
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
			mode: { control: { type: 'select', options: ['add', 'edit'] } }
		}
	});
</script>

<Story name="Add">
	<VisitForm mode="add" place={samplePlace} />
</Story>

<Story name="Add Saved Place">
	<VisitForm mode="add" place={{ ...samplePlace, id: 1n, type: SavedPlaceType.Restaurant }} />
</Story>

<Story name="Edit">
	<VisitForm mode="edit" visit={sampleVisit} />
</Story>

<Story name="Edit No Summary">
	<VisitForm mode="edit" visit={{ ...sampleVisit, summary: '' }} />
</Story>
