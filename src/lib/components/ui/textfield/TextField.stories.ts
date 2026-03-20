import type { Meta, StoryObj } from '@storybook/svelte';
import TextField from './TextField.svelte';

const meta = {
	title: 'UI/TextField',
	component: TextField,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	},
	argTypes: {
		variant: { control: 'select', options: ['filled', 'outlined'] },
		label: { control: 'text' },
		value: { control: 'text' },
		placeholder: { control: 'text' },
		supportingText: { control: 'text' },
		errorText: { control: 'text' },
		disabled: { control: 'boolean' },
		readonly: { control: 'boolean' },
		required: { control: 'boolean' },
		maxlength: { control: 'number' },
		type: { control: 'text' }
	}
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
	args: { variant: 'filled', label: 'Email address' }
};

export const Outlined: Story = {
	args: { variant: 'outlined', label: 'Email address' }
};

export const FilledWithValue: Story = {
	args: { variant: 'filled', label: 'Email address', value: 'user@example.com' }
};

export const OutlinedWithValue: Story = {
	args: { variant: 'outlined', label: 'Search', value: 'pizza near me' }
};

export const WithSupportingText: Story = {
	args: {
		variant: 'filled',
		label: 'Username',
		supportingText: 'Must be 3–20 characters'
	}
};

export const WithError: Story = {
	args: {
		variant: 'filled',
		label: 'Email address',
		value: 'not-an-email',
		errorText: 'Enter a valid email address'
	}
};

export const WithCharCounter: Story = {
	args: {
		variant: 'outlined',
		label: 'Bio',
		maxlength: 150,
		value: 'Hello world'
	}
};

export const Required: Story = {
	args: { variant: 'outlined', label: 'Full name', required: true }
};

export const Disabled: Story = {
	args: {
		variant: 'filled',
		label: 'Email address',
		value: 'user@example.com',
		disabled: true
	}
};

export const Readonly: Story = {
	args: {
		variant: 'outlined',
		label: 'Account ID',
		value: 'acc-8472-xyz',
		readonly: true
	}
};

export const WithPlaceholder: Story = {
	args: {
		variant: 'filled',
		label: 'Search',
		placeholder: 'e.g. pizza, sushi, coffee…'
	}
};

export const Password: Story = {
	args: {
		variant: 'outlined',
		label: 'Password',
		type: 'password',
		value: 'secret123'
	}
};
