import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:8888';

export default defineConfig({
	testDir: '../../tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: 'html',
	outputDir: '../../tests/e2e/results',
	globalSetup: '../../tests/e2e/global-setup.ts',

	timeout: 60_000,

	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'off',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'mobile',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'demo',
			use: {
				...devices['Desktop Chrome'],
				video: 'on',
				viewport: { width: 1280, height: 720 },
			},
		},
	],
});
