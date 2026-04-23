/**
 * PR Screenshots — automated visual proof for every pull request
 *
 * Captures exactly 4 screenshots of the key admin views.
 * These are automatically posted to the PR comment by CI.
 *
 * To add screenshots for a specific feature, create a separate
 * *.spec.ts file and use the screenshot() helper from ./helpers.ts.
 */
import { test } from '@playwright/test';
import { loginAsAdmin, goToAdminPage, screenshot } from './helpers';

test.describe('PR Screenshots', () => {
	test('Capture admin views', async ({ page }) => {
		await loginAsAdmin(page);

		// 1. Dashboard
		await goToAdminPage(page, 'wpappointments');
		await page.waitForTimeout(1500);
		await screenshot(page, '01-dashboard');

		// 2. Calendar
		await goToAdminPage(page, 'wpappointments-calendar');
		await page.waitForTimeout(1500);
		await screenshot(page, '02-calendar');

		// 3. Settings
		await goToAdminPage(page, 'wpappointments-settings');
		await page.waitForTimeout(1500);
		await screenshot(page, '03-settings');

		// 4. Customers
		await goToAdminPage(page, 'wpappointments-customers');
		await page.waitForTimeout(1500);
		await screenshot(page, '04-customers');
	});
});
