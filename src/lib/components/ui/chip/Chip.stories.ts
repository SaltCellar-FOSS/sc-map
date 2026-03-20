import type { Meta, StoryObj } from '@storybook/svelte';
import Chip from './Chip.svelte';

const meta = {
	title: 'UI/Chip',
	component: Chip,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['assist', 'filter', 'input', 'suggestion']
		},
		label: { control: 'text' },
		selected: { control: 'boolean' },
		elevated: { control: 'boolean' },
		disabled: { control: 'boolean' }
	}
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Assist: Story = {
	args: { variant: 'assist', label: 'Add to calendar' }
};

export const Filter: Story = {
	args: { variant: 'filter', label: 'Restaurants' }
};

export const FilterSelected: Story = {
	args: { variant: 'filter', label: 'Restaurants', selected: true }
};

export const Input: Story = {
	args: { variant: 'input', label: 'Seafood' }
};

export const Suggestion: Story = {
	args: { variant: 'suggestion', label: 'Near me' }
};

export const Elevated: Story = {
	args: { variant: 'assist', label: 'Share', elevated: true }
};

export const ElevatedSelected: Story = {
	args: { variant: 'filter', label: 'Open now', elevated: true, selected: true }
};

export const Disabled: Story = {
	args: { variant: 'filter', label: 'Disabled', disabled: true }
};

export const WithIcon: Story = {
	render: (args) => ({
		Component: Chip,
		props: args,
		slots: { icon: '📍' }
	}),
	args: { variant: 'assist', label: 'Directions' }
};
