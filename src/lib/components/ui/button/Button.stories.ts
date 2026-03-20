import type { Meta, StoryObj } from '@storybook/svelte';
import Button from './Button.svelte';

const meta = {
	title: 'UI/Button',
	component: Button,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		backgrounds: {
			default: 'light',
			values: [
				{ name: 'light', value: '#ffffff' },
				{ name: 'dark', value: '#202124' }
			]
		}
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['filled', 'outlined', 'text', 'elevated', 'tonal']
		},
		disabled: { control: 'boolean' },
		type: { control: 'select', options: ['button', 'submit', 'reset'] }
	}
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
	render: (args) => ({
		Component: Button,
		props: args,
		slots: { default: 'Save' }
	}),
	args: { variant: 'filled' }
};

export const Outlined: Story = {
	render: (args) => ({
		Component: Button,
		props: args,
		slots: { default: 'Cancel' }
	}),
	args: { variant: 'outlined' }
};

export const Text: Story = {
	render: (args) => ({
		Component: Button,
		props: args,
		slots: { default: 'Learn more' }
	}),
	args: { variant: 'text' }
};

export const Elevated: Story = {
	render: (args) => ({
		Component: Button,
		props: args,
		slots: { default: 'Elevated' }
	}),
	args: { variant: 'elevated' }
};

export const Tonal: Story = {
	render: (args) => ({
		Component: Button,
		props: args,
		slots: { default: 'Add to list' }
	}),
	args: { variant: 'tonal' }
};

export const Disabled: Story = {
	render: (args) => ({
		Component: Button,
		props: args,
		slots: { default: 'Disabled' }
	}),
	args: { variant: 'filled', disabled: true }
};

export const WithLeadingIcon: Story = {
	render: (args) => ({
		Component: Button,
		props: args,
		slots: { default: 'Add', leadingIcon: '+' }
	}),
	args: { variant: 'filled' }
};
