import type { Meta, StoryObj } from '@storybook/svelte';
import ListItem from './ListItem.svelte';

const meta = {
	title: 'UI/ListItem',
	component: ListItem,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	},
	argTypes: {
		headline: { control: 'text' },
		supportingText: { control: 'text' },
		trailingSupportingText: { control: 'text' },
		lines: { control: 'select', options: ['one', 'two', 'three'] },
		interactive: { control: 'boolean' },
		selected: { control: 'boolean' },
		disabled: { control: 'boolean' }
	}
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneLine: Story = {
	args: { headline: 'Inbox' }
};

export const TwoLine: Story = {
	args: {
		headline: "Rao's Restaurant",
		supportingText: '455 E 114th St, New York'
	}
};

export const ThreeLine: Story = {
	args: {
		headline: 'The French Laundry',
		supportingText: '6640 Washington St, Yountville, CA 94599, United States of America',
		lines: 'three'
	}
};

export const WithTrailingText: Story = {
	args: {
		headline: 'Message from Alex',
		supportingText: 'Hey, are you free tonight?',
		trailingSupportingText: '2:45 PM'
	}
};

export const Interactive: Story = {
	args: { headline: 'Settings', interactive: true }
};

export const Selected: Story = {
	args: { headline: 'Restaurants', selected: true }
};

export const Disabled: Story = {
	args: { headline: 'Unavailable option', disabled: true }
};

export const WithLeadingIcon: Story = {
	render: (args) => ({
		Component: ListItem,
		props: args,
		slots: { leadingIcon: '📍' }
	}),
	args: { headline: 'Location', supportingText: 'New York, NY' }
};

export const WithTrailingIcon: Story = {
	render: (args) => ({
		Component: ListItem,
		props: args,
		slots: { trailingIcon: '›' }
	}),
	args: { headline: 'Account settings', interactive: true }
};

export const FullExample: Story = {
	render: (args) => ({
		Component: ListItem,
		props: args,
		slots: { leadingIcon: '⭐', trailingIcon: '›' }
	}),
	args: {
		headline: 'Saved places',
		supportingText: '12 places saved',
		interactive: true
	}
};
