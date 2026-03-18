import type { Meta, StoryObj } from '@storybook/svelte';
import SearchSuggestionList from './SearchSuggestionList.svelte';

const meta = {
	title: 'Search/SearchSuggestionList',
	component: SearchSuggestionList,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	}
} satisfies Meta<typeof SearchSuggestionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mixedSuggestions = [
	{ id: '1', icon: 'pin' as const, primary: 'New York, NY', secondary: 'New York, United States' },
	{
		id: '2',
		icon: 'pin' as const,
		primary: 'Los Angeles, CA',
		secondary: 'California, United States'
	},
	{
		id: '3',
		icon: 'history' as const,
		primary: 'Chicago, IL',
		secondary: 'Illinois, United States'
	},
	{ id: '4', icon: 'history' as const, primary: 'Houston, TX', secondary: 'Texas, United States' },
	{
		id: '5',
		icon: 'pin' as const,
		primary: 'Philadelphia, PA',
		secondary: 'Pennsylvania, United States'
	}
];

export const Default: Story = {
	args: {
		suggestions: mixedSuggestions
	}
};

export const AllPins: Story = {
	args: {
		suggestions: [
			{ id: '1', icon: 'pin', primary: 'Times Square', secondary: 'Manhattan, New York, NY' },
			{ id: '2', icon: 'pin', primary: 'Central Park', secondary: 'Manhattan, New York, NY' },
			{ id: '3', icon: 'pin', primary: 'Brooklyn Bridge', secondary: 'Brooklyn, New York, NY' },
			{
				id: '4',
				icon: 'pin',
				primary: 'Statue of Liberty',
				secondary: 'Liberty Island, New York, NY'
			}
		]
	}
};

export const AllHistory: Story = {
	args: {
		suggestions: [
			{ id: '1', icon: 'history', primary: 'Nobu', secondary: '105 Hudson St, New York, NY' },
			{
				id: '2',
				icon: 'history',
				primary: 'Le Bernardin',
				secondary: '155 W 51st St, New York, NY'
			},
			{ id: '3', icon: 'history', primary: 'Per Se', secondary: '10 Columbus Cir, New York, NY' }
		]
	}
};

export const SingleItem: Story = {
	args: {
		suggestions: [
			{ id: '1', icon: 'pin', primary: 'San Francisco, CA', secondary: 'California, United States' }
		]
	}
};

export const ManyItems: Story = {
	args: {
		suggestions: [
			{ id: '1', icon: 'pin', primary: 'New York, NY', secondary: 'New York, United States' },
			{
				id: '2',
				icon: 'history',
				primary: 'Los Angeles, CA',
				secondary: 'California, United States'
			},
			{ id: '3', icon: 'pin', primary: 'Chicago, IL', secondary: 'Illinois, United States' },
			{ id: '4', icon: 'history', primary: 'Houston, TX', secondary: 'Texas, United States' },
			{ id: '5', icon: 'pin', primary: 'Phoenix, AZ', secondary: 'Arizona, United States' },
			{
				id: '6',
				icon: 'history',
				primary: 'Philadelphia, PA',
				secondary: 'Pennsylvania, United States'
			},
			{ id: '7', icon: 'pin', primary: 'San Antonio, TX', secondary: 'Texas, United States' },
			{ id: '8', icon: 'history', primary: 'San Diego, CA', secondary: 'California, United States' }
		]
	}
};

export const LongText: Story = {
	args: {
		suggestions: [
			{
				id: '1',
				icon: 'pin',
				primary: "Rao's Restaurant - East Harlem, Manhattan, New York City",
				secondary: '455 E 114th St, New York, NY 10029, United States of America'
			},
			{
				id: '2',
				icon: 'history',
				primary: 'The French Laundry by Thomas Keller',
				secondary: '6640 Washington St, Yountville, Napa Valley, CA 94599'
			}
		]
	}
};

export const Empty: Story = {
	args: {
		suggestions: []
	}
};
