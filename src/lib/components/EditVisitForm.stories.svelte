<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EditVisitForm from './EditVisitForm.svelte';

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

	const { Story } = defineMeta({
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<EditVisitForm visit={sampleVisit} />
</Story>

<Story name="No Summary">
	<EditVisitForm visit={{ ...sampleVisit, summary: '' }} />
</Story>
