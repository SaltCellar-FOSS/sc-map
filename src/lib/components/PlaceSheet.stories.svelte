<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PlaceSheet from './PlaceSheet.svelte';
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { SavedPlaceType, type SavedPlace } from '$lib/schemas/saved-place';
	import { Temporal } from '@js-temporal/polyfill';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' }
		}
	});

	const today = Temporal.PlainDate.from('2026-03-20');
	const now = new Date('2026-03-20T12:00:00Z');

	const baseSavedPlace: SavedPlace = {
		id: 1n,
		name: 'Franklin Barbecue',
		lat: 30.2702,
		lng: -97.7312,
		formatted_address: '900 E 11th St, Austin, TX 78702',
		google_place_id: 'ChIJ_place_franklin',
		type: SavedPlaceType.Restaurant,
		submitted_by: 1n,
		created_at: now
	};

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
			visited_at: today,
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
			visited_at: today,
			photo_urls: ['https://picsum.photos/seed/v2a/400/400']
		},
		{
			...baseVisit,
			id: 3n,
			discord_handle: '@pitmaster',
			avatar_url: null,
			summary: 'Sold out by 11am. Arrived at 9 and barely made it.',
			visited_at: today,
			photo_urls: []
		}
	];

	const manyVisits: VisitWithUser[] = Array.from({ length: 8 }, (_, i) => ({
		...baseVisit,
		id: BigInt(i + 10),
		discord_handle: `@user${i + 1}`,
		avatar_url: null,
		summary: `Visit number ${i + 1}. Great food as always.`,
		visited_at: Temporal.PlainDate.from({ year: 2026, month: 2, day: 20 - i }),
		photo_urls: []
	}));
</script>

<!-- Default: open with visits -->

<Story name="With Visits">
	<PlaceSheet
		open={true}
		place={baseSavedPlace}
		visits={Promise.resolve(visits)}
		onaddvisit={() => {}}
	/>
</Story>

<!-- Empty state -->

<Story name="No Visits">
	<PlaceSheet
		open={true}
		place={baseSavedPlace}
		visits={Promise.resolve([])}
		onaddvisit={() => {}}
	/>
</Story>

<!-- Many visits to demonstrate scrolling -->

<Story name="Many Visits">
	<PlaceSheet
		open={true}
		place={baseSavedPlace}
		visits={Promise.resolve(manyVisits)}
		onaddvisit={() => {}}
	/>
</Story>

<!-- Long place name -->

<Story name="Long Place Name">
	<PlaceSheet
		open={true}
		place={{ ...baseSavedPlace, name: 'The Salt Lick BBQ – Driftwood, Texas' }}
		visits={Promise.resolve(visits)}
		onaddvisit={() => {}}
	/>
</Story>
