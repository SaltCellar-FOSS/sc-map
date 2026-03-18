import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	}
};

export default config;
