<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BottomSheet from './BottomSheet.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			variant: { control: 'radio', options: ['modal', 'standard'] },
			open: { control: 'boolean' },
			showDragHandle: { control: 'boolean' },
			title: { control: 'text' }
		}
	});
</script>

<Story name="Modal Open">
	<BottomSheet open={true}>
		{#snippet title()}Share{/snippet}
		<p style="padding: 0 1rem 1rem;">This is a modal bottom sheet.</p>
	</BottomSheet>
</Story>

<Story name="Modal No Title">
	<BottomSheet open={true}>
		<p style="padding: 0 1rem 1rem;">Bottom sheet without a title.</p>
	</BottomSheet>
</Story>

<Story name="Modal No Drag Handle">
	<BottomSheet open={true} showDragHandle={false}>
		{#snippet title()}No Handle{/snippet}
		<p style="padding: 0 1rem 1rem;">This sheet has no drag handle.</p>
	</BottomSheet>
</Story>

<Story name="Standard">
	<div
		style="display:flex; flex-direction:column; height:300px; border:1px solid #ccc; border-radius:8px; overflow:hidden;"
	>
		<main style="flex:1; padding:1rem; overflow:auto;">
			<p>Main content area above the sheet.</p>
		</main>
		<BottomSheet variant="standard" open={true}>
			{#snippet title()}Now Playing{/snippet}
			<p style="padding: 0 1rem 1rem;">Playback controls go here.</p>
		</BottomSheet>
	</div>
</Story>
