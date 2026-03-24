<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextField from './TextField.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['filled', 'outlined']
			},
			type: {
				control: { type: 'select' },
				options: [
					'text',
					'email',
					'number',
					'password',
					'search',
					'tel',
					'url',
					'date',
					'time',
					'datetime-local',
					'month',
					'week',
					'textarea'
				]
			},
			disabled: { control: 'boolean' },
			required: { control: 'boolean' },
			readonly: { control: 'boolean' },
			error: { control: 'boolean' },
			label: { control: 'text' },
			supportingText: { control: 'text' },
			errorText: { control: 'text' },
			prefixText: { control: 'text' },
			suffixText: { control: 'text' },
			placeholder: { control: 'text' },
			maxlength: { control: 'number' },
			rows: { control: 'number' }
		}
	});
</script>

<!-- Variants -->

<Story name="Filled">
	<TextField label="Label" variant="filled" />
</Story>

<Story name="Outlined">
	<TextField label="Label" variant="outlined" />
</Story>

<!-- States -->

<Story name="Populated">
	<TextField label="Email" type="email" value="user@example.com" />
</Story>

<Story name="With Supporting Text">
	<TextField label="Email" type="email" supportingText="We'll never share your email." />
</Story>

<Story name="Error">
	<TextField label="Username" errorText="Username is already taken." value="john_doe" />
</Story>

<Story name="Disabled">
	<TextField label="Label" disabled value="Disabled value" />
</Story>

<Story name="Read Only">
	<TextField label="Label" readonly value="Read-only value" />
</Story>

<Story name="Required">
	<TextField label="Label" required />
</Story>

<!-- Prefix / Suffix -->

<Story name="With Prefix">
	<TextField label="Amount" type="number" prefixText="$" />
</Story>

<Story name="With Suffix">
	<TextField label="Domain" suffixText=".com" />
</Story>

<Story name="With Prefix and Suffix">
	<TextField label="Amount" type="number" prefixText="$" suffixText=".00" />
</Story>

<!-- Icons -->

<Story name="With Leading Icon">
	<TextField label="Search" type="search">
		{#snippet leadingIcon()}
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path
					d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
				/>
			</svg>
		{/snippet}
	</TextField>
</Story>

<Story name="With Trailing Icon">
	<TextField label="Password" type="password" value="secret">
		{#snippet trailingIcon()}
			<button
				type="button"
				aria-label="Toggle visibility"
				style="background:none;border:none;cursor:pointer;display:flex;padding:0;color:inherit;"
			>
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path
						d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
					/>
				</svg>
			</button>
		{/snippet}
	</TextField>
</Story>

<!-- Character counter -->

<Story name="With Character Counter">
	<TextField label="Bio" maxlength={150} supportingText="Tell us about yourself." />
</Story>

<!-- Textarea -->

<Story name="Textarea">
	<TextField label="Description" type="textarea" rows={4} />
</Story>

<Story name="Textarea with Counter">
	<TextField label="Description" type="textarea" rows={4} maxlength={500} />
</Story>

<!-- No label -->

<Story name="No Label">
	<TextField placeholder="Search…" type="search" />
</Story>

<!-- All variants at a glance -->

<Story name="All Variants">
	<div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;">
		<TextField label="Filled" variant="filled" />
		<TextField label="Outlined" variant="outlined" />
	</div>
</Story>

<Story name="All States">
	<div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;">
		<TextField label="Default" />
		<TextField label="Populated" value="Some value" />
		<TextField label="Error" errorText="Something went wrong." value="bad input" />
		<TextField label="Disabled" disabled value="Disabled" />
	</div>
</Story>
