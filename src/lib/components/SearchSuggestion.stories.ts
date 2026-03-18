import type { Meta, StoryObj } from '@storybook/svelte';
import { fn } from 'storybook/test';
import SearchSuggestion from './SearchSuggestion.svelte';

const meta = {
	title: 'Search/SearchSuggestion',
	component: SearchSuggestion,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	},
	args: {
		onclick: fn()
	}
} satisfies Meta<typeof SearchSuggestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlacePin: Story = {
	args: {
		icon: 'pin',
		primary: 'New York, NY',
		secondary: 'New York, United States'
	}
};

export const RecentHistory: Story = {
	args: {
		icon: 'history',
		primary: 'Chicago, IL',
		secondary: 'Illinois, United States'
	}
};

export const LongPrimaryText: Story = {
	args: {
		icon: 'pin',
		primary: "Rao's Restaurant - East Harlem, Manhattan, New York City",
		secondary: '455 E 114th St, New York, NY 10029'
	}
};

export const LongSecondaryText: Story = {
	args: {
		icon: 'history',
		primary: 'The French Laundry',
		secondary: '6640 Washington St, Yountville, CA 94599, United States of America'
	}
};

export const ShortName: Story = {
	args: {
		icon: 'pin',
		primary: "Joe's",
		secondary: 'Bar'
	}
};
