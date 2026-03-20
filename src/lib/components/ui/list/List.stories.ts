import type { Meta, StoryObj } from '@storybook/svelte';
import List from './List.svelte';

const meta = {
	title: 'UI/List',
	component: List,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	},
	argTypes: {
		subheader: { control: 'text' },
		dividers: { control: 'select', options: ['none', 'full', 'inset', 'middle'] },
		surface: { control: 'boolean' },
		elevation: { control: 'select', options: [0, 1, 2, 3, 4, 5] }
	}
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = `
	<li style="display:flex;align-items:center;padding:12px 16px;font-family:system-ui;font-size:14px;list-style:none;">Inbox</li>
	<li style="display:flex;align-items:center;padding:12px 16px;font-family:system-ui;font-size:14px;list-style:none;">Starred</li>
	<li style="display:flex;align-items:center;padding:12px 16px;font-family:system-ui;font-size:14px;list-style:none;">Sent</li>
	<li style="display:flex;align-items:center;padding:12px 16px;font-family:system-ui;font-size:14px;list-style:none;">Drafts</li>
`;

export const Default: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: {}
};

export const WithSubheader: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: { subheader: 'Recent places' }
};

export const FullDividers: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: { dividers: 'full' }
};

export const InsetDividers: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: { dividers: 'inset' }
};

export const MiddleDividers: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: { dividers: 'middle' }
};

export const Surface: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: { surface: true }
};

export const SurfaceElevated: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: { surface: true, elevation: 2 }
};

export const SubheaderWithDividers: Story = {
	render: (args) => ({ Component: List, props: args, slots: { default: sampleItems } }),
	args: { subheader: 'Labels', dividers: 'full', surface: true, elevation: 1 }
};
