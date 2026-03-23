<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['elevated', 'filled', 'tonal', 'outlined', 'text']
			},
			type: {
				control: { type: 'select' },
				options: ['button', 'submit', 'reset']
			},
			disabled: { control: 'boolean' },
			softDisabled: { control: 'boolean' },
			href: { control: 'text' },
			target: { control: 'text' }
		}
	});
</script>

<!-- Variants -->

<Story name="Filled">
	<Button variant="filled">Save</Button>
</Story>

<Story name="Elevated">
	<Button variant="elevated">Save</Button>
</Story>

<Story name="Tonal">
	<Button variant="tonal">Save</Button>
</Story>

<Story name="Outlined">
	<Button variant="outlined">Save</Button>
</Story>

<Story name="Text">
	<Button variant="text">Save</Button>
</Story>

<!-- Disabled states -->

<Story name="Disabled">
	<Button variant="filled" disabled>Save</Button>
</Story>

<Story name="SoftDisabled">
	<Button variant="filled" softDisabled>Save</Button>
</Story>

<!-- With icons -->

<Story name="With Leading Icon">
	<Button variant="filled">
		{#snippet icon()}
			<svg class="md-btn__icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
				<path d="M17 3H5a2 2 0 0 0-2 2v14l7-3 7 3V5a2 2 0 0 0-2-2z" />
			</svg>
		{/snippet}
		Save
	</Button>
</Story>

<Story name="With Trailing Icon">
	<Button variant="text">
		Open
		{#snippet trailingIcon()}
			<svg
				class="md-btn__icon md-btn__icon--trailing"
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z" />
				<path d="M14 3v2h3.59L8.76 13.83l1.41 1.41L19 6.41V10h2V3h-7z" />
			</svg>
		{/snippet}
	</Button>
</Story>

<!-- As a link -->

<Story name="As Link">
	<Button variant="outlined" href="/dashboard">Dashboard</Button>
</Story>

<Story name="As Link (Disabled)">
	<Button variant="outlined" href="/dashboard" disabled>Dashboard</Button>
</Story>

<!-- All variants at a glance -->

<Story name="All Variants">
	<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
		<Button variant="elevated">Elevated</Button>
		<Button variant="filled">Filled</Button>
		<Button variant="tonal">Tonal</Button>
		<Button variant="outlined">Outlined</Button>
		<Button variant="text">Text</Button>
	</div>
</Story>

<Story name="All Variants Disabled">
	<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
		<Button variant="elevated" disabled>Elevated</Button>
		<Button variant="filled" disabled>Filled</Button>
		<Button variant="tonal" disabled>Tonal</Button>
		<Button variant="outlined" disabled>Outlined</Button>
		<Button variant="text" disabled>Text</Button>
	</div>
</Story>
