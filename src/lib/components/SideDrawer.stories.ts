import type { Meta, StoryObj } from '@storybook/svelte';
import SideDrawer from './SideDrawer.svelte';

const meta = {
	title: 'UI/SideDrawer',
	component: SideDrawer,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		backgrounds: {
			default: 'map',
			values: [
				{ name: 'map', value: '#e5e3df' },
				{ name: 'light', value: '#ffffff' },
				{ name: 'dark', value: '#202124' }
			]
		}
	},
	argTypes: {
		open: { control: 'boolean' },
		title: { control: 'text' },
		width: { control: 'text' }
	}
} satisfies Meta<typeof SideDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
	args: {
		open: false,
		title: ''
	}
};

export const Expanded: Story = {
	args: {
		open: true,
		title: 'Place Details'
	}
};

export const WithTitle: Story = {
	args: {
		open: true,
		title: 'Moonlight Musicals Amphitheatre'
	}
};

export const CustomWidth: Story = {
	args: {
		open: true,
		title: 'Custom Width Drawer',
		width: '500px'
	}
};

export const WithContent: Story = {
	args: {
		open: true,
		title: 'Place Details'
	},
	render: () => ({
		Component: SideDrawer,
		props: {
			open: true,
			title: 'Place Details'
		},
		slots: {
			default: `
				<div style="padding: 20px; font-family: Roboto, Arial, sans-serif;">
					<div style="margin-bottom: 16px;">
						<span style="font-size: 13px; color: #70757a;">Address</span>
						<p style="margin: 4px 0 0; font-size: 14px; color: #202124;">123 Music Lane, Austin, TX</p>
					</div>
					<div style="margin-bottom: 16px;">
						<span style="font-size: 13px; color: #70757a;">Rating</span>
						<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
							<span style="font-size: 20px; color: #202124; font-weight: 400;">4.7</span>
							<div style="color: #fbbc04; font-size: 16px;">★★★★½</div>
							<span style="font-size: 13px; color: #70757a;">(175 reviews)</span>
						</div>
					</div>
					<div style="margin-bottom: 16px;">
						<span style="font-size: 13px; color: #70757a;">Hours</span>
						<p style="margin: 4px 0 0; font-size: 14px; color: #202124;">Open until 10:00 PM</p>
					</div>
					<button style="width: 100%; padding: 10px 24px; background: #1a73e8; color: white; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">
						Add to List
					</button>
				</div>
			`
		}
	})
};

export const DarkMode: Story = {
	parameters: {
		backgrounds: { default: 'dark' }
	},
	args: {
		open: true,
		title: 'Place Details'
	}
};
