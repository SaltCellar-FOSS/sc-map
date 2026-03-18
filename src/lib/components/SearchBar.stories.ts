import type { Meta, StoryObj } from '@storybook/svelte';
import SearchBar from './SearchBar.svelte';

const meta = {
	title: 'Search/SearchBar',
	component: SearchBar,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		backgrounds: {
			default: 'map',
			values: [{ name: 'map', value: '#e5e3df' }]
		}
	}
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomPlaceholder: Story = {
	args: {
		placeholder: 'Search for something yummy'
	}
};

export const FoodFocused: Story = {
	args: {
		placeholder: 'Find restaurants, bars, bakeries…'
	}
};

export const ShortPlaceholder: Story = {
	args: {
		placeholder: 'Search'
	}
};

export const LongPlaceholder: Story = {
	args: {
		placeholder: 'Search for restaurants, bars, bakeries, cafes, and more near you'
	}
};
