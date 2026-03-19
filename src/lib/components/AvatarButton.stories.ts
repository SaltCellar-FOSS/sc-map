import type { Meta, StoryObj } from '@storybook/svelte';
import AvatarButton from './AvatarButton.svelte';
import avatarUrl from '$lib/assets/avatar.png?url';

const meta = {
	title: 'UI/AvatarButton',
	component: AvatarButton,
	tags: ['autodocs'],
	parameters: {
		backgrounds: {
			default: 'light',
			values: [
				{ name: 'light', value: '#ffffff' },
				{ name: 'dark', value: '#202124' }
			]
		}
	},
	argTypes: {
		src: { control: 'text' },
		srcset: { control: 'text' },
		alt: { control: 'text' }
	}
} satisfies Meta<typeof AvatarButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		src: avatarUrl,
		alt: 'User avatar'
	}
};

export const WithHref: Story = {
	args: {
		src: avatarUrl,
		alt: 'User avatar'
	}
};

export const Placeholder: Story = {
	args: {
		alt: 'User avatar'
	}
};

export const DarkMode: Story = {
	parameters: {
		backgrounds: { default: 'dark' }
	},
	args: {
		src: avatarUrl,
		alt: 'User avatar'
	}
};
