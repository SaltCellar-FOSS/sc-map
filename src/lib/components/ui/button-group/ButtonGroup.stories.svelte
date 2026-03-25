<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ButtonGroup from './ButtonGroup.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['connected', 'standard']
			},
			buttonVariant: {
				control: { type: 'select' },
				options: ['filled', 'tonal', 'outlined', 'elevated']
			},
			toggleMode: {
				control: { type: 'select' },
				options: ['none', 'single', 'multi']
			}
		}
	});
</script>

<!-- Button variants -->

<Story name="Tonal Connected">
	<ButtonGroup
		items={[
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' }
		]}
		toggleMode="single"
		aria-label="Calendar view"
	/>
</Story>

<Story name="Filled Connected">
	<ButtonGroup
		items={[
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' }
		]}
		buttonVariant="filled"
		toggleMode="single"
		aria-label="Calendar view"
	/>
</Story>

<Story name="Outlined Connected">
	<ButtonGroup
		items={[
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' }
		]}
		buttonVariant="outlined"
		toggleMode="single"
		aria-label="Calendar view"
	/>
</Story>

<Story name="Elevated Connected">
	<ButtonGroup
		items={[
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' }
		]}
		buttonVariant="elevated"
		toggleMode="single"
		aria-label="Calendar view"
	/>
</Story>

<!-- Standard variant -->

<Story name="Standard Outlined Multi">
	<ButtonGroup
		items={[
			{ value: 'bold', label: 'B' },
			{ value: 'italic', label: 'I' },
			{ value: 'underline', label: 'U' }
		]}
		variant="standard"
		buttonVariant="outlined"
		toggleMode="multi"
		aria-label="Text formatting"
	/>
</Story>

<Story name="Standard Tonal Single">
	<ButtonGroup
		items={[
			{ value: 'left', label: 'Left' },
			{ value: 'center', label: 'Center' },
			{ value: 'right', label: 'Right' }
		]}
		variant="standard"
		toggleMode="single"
		aria-label="Text alignment"
	/>
</Story>

<!-- No toggle (action buttons) -->

<Story name="Action Group (No Toggle)">
	<ButtonGroup
		items={[
			{ value: 'share', label: 'Share' },
			{ value: 'copy', label: 'Copy' },
			{ value: 'print', label: 'Print' }
		]}
		toggleMode="none"
		buttonVariant="filled"
		aria-label="Document actions"
	/>
</Story>

<!-- With icons -->

<Story name="With Icons">
	<ButtonGroup
		items={[
			{
				value: 'map',
				label: 'Map',
				icon: mapIcon
			},
			{
				value: 'list',
				label: 'List',
				icon: listIcon
			},
			{
				value: 'grid',
				label: 'Grid',
				icon: gridIcon
			}
		]}
		toggleMode="single"
		aria-label="View mode"
	/>
</Story>

{#snippet mapIcon()}
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path
			d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"
		/>
	</svg>
{/snippet}

{#snippet listIcon()}
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path
			d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
		/>
	</svg>
{/snippet}

{#snippet gridIcon()}
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path
			d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"
		/>
	</svg>
{/snippet}

<!-- Disabled items -->

<Story name="With Disabled Item">
	<ButtonGroup
		items={[
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month', disabled: true }
		]}
		toggleMode="single"
		aria-label="Calendar view"
	/>
</Story>

<!-- Single item -->

<Story name="Single Item">
	<ButtonGroup
		items={[{ value: 'only', label: 'Only' }]}
		toggleMode="none"
		aria-label="Single action"
	/>
</Story>

<!-- All button variants at a glance -->

<Story name="All Button Variants">
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<ButtonGroup
			items={[
				{ value: 'a', label: 'Filled' },
				{ value: 'b', label: 'Group' },
				{ value: 'c', label: 'Buttons' }
			]}
			buttonVariant="filled"
			toggleMode="single"
			aria-label="Filled group"
		/>
		<ButtonGroup
			items={[
				{ value: 'a', label: 'Tonal' },
				{ value: 'b', label: 'Group' },
				{ value: 'c', label: 'Buttons' }
			]}
			buttonVariant="tonal"
			toggleMode="single"
			aria-label="Tonal group"
		/>
		<ButtonGroup
			items={[
				{ value: 'a', label: 'Outlined' },
				{ value: 'b', label: 'Group' },
				{ value: 'c', label: 'Buttons' }
			]}
			buttonVariant="outlined"
			toggleMode="single"
			aria-label="Outlined group"
		/>
		<ButtonGroup
			items={[
				{ value: 'a', label: 'Elevated' },
				{ value: 'b', label: 'Group' },
				{ value: 'c', label: 'Buttons' }
			]}
			buttonVariant="elevated"
			toggleMode="single"
			aria-label="Elevated group"
		/>
	</div>
</Story>
