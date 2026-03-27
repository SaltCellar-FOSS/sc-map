<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PlaceSheet from './PlaceSheet.svelte';
	import type { VisitWithUser } from '$lib/schemas/visit';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' },
			placeName: { control: 'text' }
		}
	});

	const now = new Date('2026-03-20T12:00:00Z');

	const baseVisit = {
		user_id: 1n,
		place_id: 1n,
		created_at: now,
		updated_at: now
	};

	const visits: VisitWithUser[] = [
		{
			...baseVisit,
			id: 1n,
			discord_handle: '@netshaq',
			avatar_url: null,
			summary: 'If you pee pee when you poo poo, why do you not poo poo when you pee pee',
			visited_at: now,
			photo_urls: [
				'https://picsum.photos/seed/v1a/400/400',
				'https://picsum.photos/seed/v1b/400/400'
			]
		},
		{
			...baseVisit,
			id: 2n,
			discord_handle: '@smokes',
			avatar_url: null,
			summary: 'Best brisket in Austin. The line was worth every minute.',
			visited_at: new Date('2026-03-15T12:00:00Z'),
			photo_urls: ['https://picsum.photos/seed/v2a/400/400']
		},
		{
			...baseVisit,
			id: 3n,
			discord_handle: '@pitmaster',
			avatar_url: null,
			summary: 'Sold out by 11am. Arrived at 9 and barely made it.',
			visited_at: new Date('2026-02-28T12:00:00Z'),
			photo_urls: []
		}
	];

	const manyVisits: VisitWithUser[] = Array.from({ length: 8 }, (_, i) => ({
		...baseVisit,
		id: BigInt(i + 10),
		discord_handle: `@user${i + 1}`,
		avatar_url: null,
		summary: `Visit number ${i + 1}. Great food as always.`,
		visited_at: new Date(2026, 2, 20 - i),
		photo_urls: []
	}));
</script>

<!-- Default: open with visits -->

<Story name="With Visits">
	<PlaceSheet
		open={true}
		placeName="Franklin Barbecue"
		visits={Promise.resolve(visits)}
		onaddvisit={() => {}}
	/>
</Story>

<!-- Empty state -->

<Story name="No Visits">
	<PlaceSheet
		open={true}
		placeName="Franklin Barbecue"
		visits={Promise.resolve([])}
		onaddvisit={() => {}}
	/>
</Story>

<!-- Many visits to demonstrate scrolling -->

<Story name="Many Visits">
	<PlaceSheet
		open={true}
		placeName="Franklin Barbecue"
		visits={Promise.resolve(manyVisits)}
		onaddvisit={() => {}}
	/>
</Story>

<!-- Long place name -->

<Story name="Long Place Name">
	<PlaceSheet
		open={true}
		placeName="The Salt Lick BBQ – Driftwood, Texas"
		visits={Promise.resolve(visits)}
		onaddvisit={() => {}}
	/>
</Story>
