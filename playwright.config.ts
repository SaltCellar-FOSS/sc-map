import { defineConfig } from '@playwright/test';
/// <reference types="node" />

export default defineConfig({
	globalSetup: './src/test/global-setup.ts',
	testDir: './src/test/e2e',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [
		{ name: 'chromium', use: { browserName: 'chromium' } },
		{ name: 'firefox', use: { browserName: 'firefox' } },
		{ name: 'webkit', use: { browserName: 'webkit' } }
	],
	webServer: [
		{
			command: 'docker compose -f docker-compose.dev.yml up -d db',
			port: 5432,
			reuseExistingServer: true,
			timeout: 120 * 1000
		},
		{
			command: 'bun run dev',
			url: 'http://localhost:5173',
			reuseExistingServer: true,
			timeout: 120 * 1000
		}
	]
});
