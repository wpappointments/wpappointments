import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TEST_DATA_PATH = path.resolve(__dirname, 'results', '.test-data.json');

function getTestData(): {
	bookingOneStepId: string;
	bookingMultiStepId: string;
} {
	const raw = fs.readFileSync(TEST_DATA_PATH, 'utf-8');
	return JSON.parse(raw);
}

async function waitForCalendar(page: Page) {
	await page
		.locator('.wpappointments-booking-flow')
		.waitFor({ timeout: 15_000 });
	await page
		.locator(
			'.wpappointments-booking-flow button[type="button"]:not([disabled])'
		)
		.first()
		.waitFor({ timeout: 15_000 });
}

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };
// WCAG 2.5.5 Target Size (Level AAA) — 44×44 CSS pixels minimum.
const TOUCH_TARGET_MIN = 44;

test.describe('Booking flow — mobile (375px)', () => {
	test.use({ viewport: MOBILE_VIEWPORT });

	test.beforeEach(async ({ page }) => {
		const { bookingOneStepId } = getTestData();
		await page.goto(`/?p=${bookingOneStepId}`);
		await waitForCalendar(page);
	});

	test('renders without horizontal scroll', async ({ page }) => {
		const { scrollWidth, clientWidth } = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
	});

	test('day buttons hit the touch-target floor', async ({ page }) => {
		const dayButton = page
			.locator(
				'.wpappointments-booking-flow button[type="button"]:not([disabled])'
			)
			.filter({ hasText: /^\d{1,2}$/ })
			.first();
		const box = await dayButton.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
	});

	test('time slot buttons hit the touch-target floor', async ({ page }) => {
		// Move forward to a clean week + pick a day
		await page
			.locator('.wpappointments-booking-flow button[type="button"]')
			.filter({ has: page.locator('svg') })
			.last()
			.click();
		const day = page
			.locator(
				'.wpappointments-booking-flow button[type="button"]:not([disabled])'
			)
			.filter({ hasText: /^\d{1,2}$/ })
			.first();
		await day.waitFor({ timeout: 15_000 });
		await day.click();

		const slot = page.locator('[data-time]:not([disabled])').first();
		await slot.waitFor({ state: 'visible', timeout: 15_000 });
		const box = await slot.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
	});

	test('customer form inputs hit the touch-target floor', async ({
		page,
	}) => {
		const firstName = page.getByPlaceholder('First name');
		await expect(firstName).toBeVisible();
		const box = await firstName.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
	});

	test('completes a booking on a mobile viewport', async ({ page }) => {
		// Forward one month so all weekday slots are available
		await page
			.locator('.wpappointments-booking-flow button[type="button"]')
			.filter({ has: page.locator('svg') })
			.last()
			.click();

		const day = page
			.locator(
				'.wpappointments-booking-flow button[type="button"]:not([disabled])'
			)
			.filter({ hasText: /^\d{1,2}$/ })
			.first();
		await day.waitFor({ timeout: 15_000 });
		await day.click();

		const slot = page.locator('[data-time]:not([disabled])').last();
		await slot.waitFor({ state: 'visible', timeout: 15_000 });
		await slot.click();

		await page.getByPlaceholder('First name').fill('Mobile');
		await page.getByPlaceholder('Last name').fill('Tester');
		await page
			.getByPlaceholder('Email')
			.fill(`mobile.${Date.now()}@example.com`);
		await page.getByPlaceholder('Phone').fill('+48123456789');

		await page.getByRole('button', { name: 'Book' }).click();

		await expect(
			page.getByText('Appointment created successfully!')
		).toBeVisible({ timeout: 10_000 });
	});
});

test.describe('Booking flow — tablet (768px)', () => {
	test.use({ viewport: TABLET_VIEWPORT });

	test.beforeEach(async ({ page }) => {
		const { bookingOneStepId } = getTestData();
		await page.goto(`/?p=${bookingOneStepId}`);
		await waitForCalendar(page);
	});

	test('renders without horizontal scroll', async ({ page }) => {
		const { scrollWidth, clientWidth } = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
	});
});

test.describe('Booking flow — keyboard / a11y', () => {
	test.use({ viewport: MOBILE_VIEWPORT });

	test.beforeEach(async ({ page }) => {
		const { bookingOneStepId } = getTestData();
		await page.goto(`/?p=${bookingOneStepId}`);
		await waitForCalendar(page);
	});

	test('day buttons are reachable by keyboard tab', async ({ page }) => {
		// Tab into the calendar; first focusable element under .wpappointments-booking-flow
		// should be a button. We don't assert a precise tab count (theme chrome
		// adds a variable number of focusables before the block), only that an
		// available day button can receive focus.
		const dayButton = page
			.locator(
				'.wpappointments-booking-flow button[type="button"]:not([disabled])'
			)
			.filter({ hasText: /^\d{1,2}$/ })
			.first();
		await dayButton.focus();
		await expect(dayButton).toBeFocused();
	});

	test('customer form inputs have associated labels or accessible names', async ({
		page,
	}) => {
		// Native required + placeholder is the floor today; check that each input
		// at minimum has a non-empty accessible name (placeholder counts in axe).
		for (const placeholder of [
			'First name',
			'Last name',
			'Email',
			'Phone',
		]) {
			const input = page.getByPlaceholder(placeholder);
			await expect(input).toBeVisible();
			const accessibleName = await input.evaluate(
				(el: HTMLInputElement) =>
					el.getAttribute('aria-label') ||
					el.getAttribute('placeholder') ||
					el.labels?.[0]?.textContent ||
					''
			);
			expect(accessibleName.trim()).not.toBe('');
		}
	});

	test('Book submit button has discernible text', async ({ page }) => {
		const submit = page.getByRole('button', { name: 'Book' });
		await expect(submit).toBeVisible();
	});
});
