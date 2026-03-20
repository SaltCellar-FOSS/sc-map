import type { Meta, StoryObj } from '@storybook/svelte';
import DrawerItem from './DrawerItem.svelte';

const meta = {
	title: 'UI/DrawerItem',
	component: DrawerItem,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	},
	argTypes: {
		label: { control: 'text' },
		active: { control: 'boolean' },
		disabled: { control: 'boolean' },
		badge: { control: 'number' }
	}
} satisfies Meta<typeof DrawerItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: 'Home' }
};

export const Active: Story = {
	args: { label: 'Home', active: true }
};

export const WithBadge: Story = {
	args: { label: 'Notifications', badge: 5 }
};

export const WithLargeBadge: Story = {
	args: { label: 'Messages', badge: 1200 }
};

export const Disabled: Story = {
	args: { label: 'Settings', disabled: true }
};

export const WithIcon: Story = {
	render: (args) => ({
		Component: DrawerItem,
		props: args,
		slots: { icon: '🏠' }
	}),
	args: { label: 'Home' }
};

export const ActiveWithIcon: Story = {
	render: (args) => ({
		Component: DrawerItem,
		props: args,
		slots: { icon: '🔍' }
	}),
	args: { label: 'Search', active: true }
};

export const WithIconAndBadge: Story = {
	render: (args) => ({
		Component: DrawerItem,
		props: args,
		slots: { icon: '🔔' }
	}),
	args: { label: 'Notifications', badge: 3 }
};
