<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StarRating from './StarRating.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			value: { control: { type: 'number', min: 0, max: 10 } },
			count: { control: { type: 'number', min: 1, max: 10 } },
			label: { control: 'text' }
		}
	});
</script>

<!-- Empty (no selection) -->

<Story name="Empty">
	<StarRating />
</Story>

<!-- Partially filled -->

<Story name="Three Stars">
	<StarRating value={3} />
</Story>

<!-- Fully filled -->

<Story name="Five Stars">
	<StarRating value={5} />
</Story>

<!-- Custom count -->

<Story name="Ten Stars">
	<StarRating count={10} value={7} />
</Story>
