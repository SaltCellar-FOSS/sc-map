import type { Meta, StoryObj } from '@storybook/svelte';
import Modal from './Modal.svelte';

const meta = {
	title: 'UI/Modal',
	component: Modal,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen'
	},
	argTypes: {
		open: { control: 'boolean' },
		headline: { control: 'text' },
		supportingText: { control: 'text' },
		closeOnScrim: { control: 'boolean' }
	}
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const actionButtons = `
	<button style="background:none;border:none;color:var(--md-sys-color-primary,#6750a4);font-size:14px;font-weight:500;cursor:pointer;padding:10px 16px;border-radius:20px;">Cancel</button>
	<button style="background:none;border:none;color:var(--md-sys-color-primary,#6750a4);font-size:14px;font-weight:500;cursor:pointer;padding:10px 16px;border-radius:20px;">Confirm</button>
`;

export const Default: Story = {
	render: (args) => ({
		Component: Modal,
		props: args,
		slots: { actions: actionButtons }
	}),
	args: {
		open: true,
		headline: 'Discard draft?',
		supportingText: 'Your draft will be permanently deleted.'
	}
};

export const WithBodyContent: Story = {
	render: (args) => ({
		Component: Modal,
		props: args,
		slots: {
			default: `<p style="font-family:system-ui;font-size:14px;line-height:1.6;margin:0;">This will remove the place from all your saved lists. This action cannot be undone.</p>`,
			actions: actionButtons
		}
	}),
	args: { open: true, headline: 'Delete place?' }
};

export const WithIcon: Story = {
	render: (args) => ({
		Component: Modal,
		props: args,
		slots: {
			icon: `<span style="font-size:24px;">🗑️</span>`,
			actions: actionButtons
		}
	}),
	args: {
		open: true,
		headline: 'Delete permanently?',
		supportingText: 'This place will be removed from all your lists.'
	}
};

export const LongContent: Story = {
	render: (args) => ({
		Component: Modal,
		props: args,
		slots: {
			default: `
				<div style="font-family:system-ui;font-size:14px;line-height:1.6;">
					<p style="margin:0 0 12px;">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
					<p style="margin:0 0 12px;">We collect location data to provide place recommendations. Your data is encrypted and never sold to third parties.</p>
					<p style="margin:0;">You can revoke permissions at any time from Settings.</p>
				</div>
			`,
			actions: actionButtons
		}
	}),
	args: { open: true, headline: 'Privacy notice' }
};

export const Closed: Story = {
	args: {
		open: false,
		headline: 'Modal',
		supportingText: 'This modal is closed and not visible.'
	}
};
