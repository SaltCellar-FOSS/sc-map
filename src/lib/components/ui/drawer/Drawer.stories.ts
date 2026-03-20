import type { Meta, StoryObj } from '@storybook/svelte';
import Drawer from './Drawer.svelte';

const meta = {
	title: 'UI/Drawer',
	component: Drawer,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen'
	},
	argTypes: {
		open: { control: 'boolean' },
		variant: { control: 'select', options: ['modal', 'standard'] }
	}
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = `
	<div style="display:flex;flex-direction:column;gap:4px;">
		<div style="padding:12px 16px;font-family:system-ui;font-size:14px;border-radius:28px;">Home</div>
		<div style="padding:12px 16px;font-family:system-ui;font-size:14px;border-radius:28px;">Search</div>
		<div style="padding:12px 16px;font-family:system-ui;font-size:14px;border-radius:28px;background:var(--md-sys-color-secondary-container,#e8def8);">Saved</div>
		<div style="padding:12px 16px;font-family:system-ui;font-size:14px;border-radius:28px;">Settings</div>
	</div>
`;

export const ModalOpen: Story = {
	render: (args) => ({
		Component: Drawer,
		props: args,
		slots: { default: navItems }
	}),
	args: { variant: 'modal', open: true }
};

export const ModalClosed: Story = {
	args: { variant: 'modal', open: false }
};

export const Standard: Story = {
	render: (args) => ({
		Component: Drawer,
		props: args,
		slots: { default: navItems }
	}),
	args: { variant: 'standard' }
};

export const WithHeader: Story = {
	render: (args) => ({
		Component: Drawer,
		props: args,
		slots: {
			header: `<span style="font-family:system-ui;font-size:18px;font-weight:500;">sc-map</span>`,
			default: navItems
		}
	}),
	args: { variant: 'modal', open: true }
};

export const WithHeaderAndFooter: Story = {
	render: (args) => ({
		Component: Drawer,
		props: args,
		slots: {
			header: `<span style="font-family:system-ui;font-size:18px;font-weight:500;">sc-map</span>`,
			default: navItems,
			footer: `<div style="font-family:system-ui;font-size:13px;color:var(--md-sys-color-on-surface-variant,#49454f);">Version 1.0.0</div>`
		}
	}),
	args: { variant: 'modal', open: true }
};
