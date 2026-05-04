/**
 * Appstip Booking — wp.org listing screenshots.
 *
 * Captures the 3 admin views referenced in `readme.txt` Screenshots section.
 * Output: `tests/e2e/results/appstip-booking/screenshot-{1,2,3}.png`.
 *
 * Run on CI; locally only when Playwright resolves cleanly (some monorepo
 * setups conflict with a global `~/node_modules/@playwright`). Gated behind
 * `WPORG_SCREENSHOTS=1` so it does not run in default e2e CI.
 */
import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { loginAsAdmin } from '../helpers';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'results', 'appstip-booking');

async function capture(page: Page, name: string) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	await page.screenshot({
		path: path.join(OUTPUT_DIR, `${name}.png`),
		fullPage: false,
	});
}

test.describe('Appstip Booking listing screenshots', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test.beforeEach(() => {
		test.skip(
			!process.env.WPORG_SCREENSHOTS,
			'Listing screenshots are opt-in. Set WPORG_SCREENSHOTS=1 to enable.'
		);
	});

	test('screenshot-1 — appointments list', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto(
			'http://localhost:8888/wp-admin/edit.php?post_type=appstip_appointment'
		);
		await expect(page.locator('h1.wp-heading-inline')).toBeVisible();
		await page.waitForTimeout(750);
		await capture(page, 'screenshot-1');
	});

	test('screenshot-2 — add new appointment', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto(
			'http://localhost:8888/wp-admin/post-new.php?post_type=appstip_appointment'
		);
		// Editor mounts → wait for the title input.
		await page
			.locator('.editor-post-title__input, input[name="post_title"]')
			.first()
			.waitFor({ timeout: 15_000 });
		// Dismiss welcome modal if present.
		const welcomeClose = page.locator(
			'.components-modal__header button[aria-label="Close"]'
		);
		if (
			await welcomeClose
				.first()
				.isVisible({ timeout: 1500 })
				.catch(() => false)
		) {
			await welcomeClose.first().click();
		}
		await page.waitForTimeout(1000);
		await capture(page, 'screenshot-2');
	});

	test('screenshot-3 — settings page', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto(
			'http://localhost:8888/wp-admin/edit.php?post_type=appstip_appointment&page=appstip-booking-settings'
		);
		await expect(page.locator('h1.wp-heading-inline')).toBeVisible();
		await page.waitForTimeout(500);
		await capture(page, 'screenshot-3');
	});
});
