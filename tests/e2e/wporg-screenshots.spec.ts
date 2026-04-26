/**
 * wp.org listing screenshots.
 *
 * Opt-in spec — not part of the normal CI run. Produces the five PNGs
 * referenced in readme.txt's Screenshots section. Output lands in
 * tests/e2e/results/wporg/ and can be copied into
 * plugins/appointments-booking/assets/ for the wp.org submission.
 *
 * Run with:
 *   pnpm -C plugins/appointments-booking test:e2e -- tests/e2e/wporg-screenshots.spec.ts
 *
 * Prereqs: seeded booking pages from global-setup; clean MailHog not needed.
 */
import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { goToAdminPage, loginAsAdmin } from './helpers';

const OUTPUT_DIR = path.resolve(__dirname, 'results', 'wporg');

const TEST_DATA_PATH = path.resolve(__dirname, 'results', '.test-data.json');

function getTestData(): { bookingOneStepId: string } {
	const raw = fs.readFileSync(TEST_DATA_PATH, 'utf-8');
	return JSON.parse(raw);
}

async function capture(page: Page, name: string) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	await page.screenshot({
		path: path.join(OUTPUT_DIR, `${name}.png`),
		// fullPage false → listing shots expect a consistent viewport-sized image
		fullPage: false,
	});
}

test.describe('wp.org listing screenshots', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('01 — admin dashboard', async ({ page }) => {
		await loginAsAdmin(page);
		await goToAdminPage(page, 'wpappointments');
		await expect(page.locator('#wpappointments-admin')).toBeVisible();
		// Let React finish mounting + initial fetches settle
		await page.waitForTimeout(1500);
		await capture(page, '01-dashboard');
	});

	test('02 — admin calendar', async ({ page }) => {
		await loginAsAdmin(page);
		await goToAdminPage(page, 'wpappointments-calendar');
		await expect(page.locator('#wpappointments-admin')).toBeVisible();
		await page.waitForTimeout(1500);
		await capture(page, '02-calendar');
	});

	test('03 — settings', async ({ page }) => {
		await loginAsAdmin(page);
		await goToAdminPage(page, 'wpappointments-settings');
		await expect(page.locator('#wpappointments-admin')).toBeVisible();
		await page.waitForTimeout(1500);
		await capture(page, '03-settings');
	});

	test('04 — customers', async ({ page }) => {
		await loginAsAdmin(page);
		await goToAdminPage(page, 'wpappointments-customers');
		await expect(page.locator('#wpappointments-admin')).toBeVisible();
		await page.waitForTimeout(1500);
		await capture(page, '04-customers');
	});

	test('05 — customer booking flow (public)', async ({ page }) => {
		const { bookingOneStepId } = getTestData();
		await page.goto(`/?p=${bookingOneStepId}`);
		await page
			.locator('.wpappointments-booking-flow')
			.waitFor({ timeout: 15_000 });
		// Wait for availability to load so the calendar has enabled day buttons
		await page
			.locator(
				'.wpappointments-booking-flow button[type="button"]:not([disabled])'
			)
			.first()
			.waitFor({ timeout: 15_000 });
		await page.waitForTimeout(1000);
		await capture(page, '05-booking-flow');
	});
});
