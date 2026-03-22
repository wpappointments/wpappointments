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

	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'on',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
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
