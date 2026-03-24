import type { Preview } from '@storybook/sveltekit';
import '$lib/styles/theme.css';

const preview: Preview = {
	parameters: {
		controls: { matchers: { color: /(background|color)$/i, date: /date/i } },
		layout: 'fullscreen'
	}
};

export default preview;
