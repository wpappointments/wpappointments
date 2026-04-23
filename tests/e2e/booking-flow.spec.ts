import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Test data from global setup
// ---------------------------------------------------------------------------

const TEST_DATA_PATH = path.resolve(__dirname, 'results', '.test-data.json');

function getTestData(): {
	bookingOneStepId: string;
	bookingMultiStepId: string;
} {
	const raw = fs.readFileSync(TEST_DATA_PATH, 'utf-8');
	return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for the booking flow calendar to finish loading. */
async function waitForCalendar(page: Page) {
	await page
		.locator('.wpappointments-booking-flow')
		.waitFor({ timeout: 15_000 });
	// Availability loading replaces skeleton with real day buttons
	await page
		.locator(
			'.wpappointments-booking-flow button[type="button"]:not([disabled])'
		)
		.first()
		.waitFor({ timeout: 15_000 });
}

/** Pick an available future day button in the calendar grid. */
async function pickAvailableFutureDay(page: Page) {
	// Navigate to next month to ensure all weekday slots are fully available
	const nextButton = page
		.locator('.wpappointments-booking-flow button[type="button"]')
		.filter({ has: page.locator('svg') })
		.last();
	await nextButton.click();

	// Wait for availability to reload — day buttons with availability bars appear
	const availableDay = page
		.locator(
			'.wpappointments-booking-flow button[type="button"]:not([disabled])'
		)
		.filter({ hasText: /^\d{1,2}$/ })
		.first();
	await availableDay.waitFor({ timeout: 15_000 });
	await availableDay.click();
}

/** Pick an available time slot. */
async function pickFirstAvailableSlot(page: Page) {
	// Wait for time slot buttons to be visible
	await page
		.locator('[data-time]')
		.first()
		.waitFor({ state: 'visible', timeout: 15_000 });

	// Pick the last enabled slot — guaranteed to be in the future regardless of
	// CI clock (past slots on "today" are disabled by the availability engine).
	const slot = page.locator('[data-time]:not([disabled])').last();
	await slot.waitFor({ state: 'visible', timeout: 15_000 });
	await slot.click({ timeout: 10_000 });

	// Wait for selection confirmation
	await expect(page.getByText('Selected time:')).toBeVisible({
		timeout: 5_000,
	});
}

/** Fill in the customer information form. */
async function fillCustomerForm(
	page: Page,
	data = {
		firstName: 'Jan',
		lastName: 'Kowalski',
		email: 'jan@example.com',
		phone: '+48123456789',
	}
) {
	await page.getByPlaceholder('First name').fill(data.firstName);
	await page.getByPlaceholder('Last name').fill(data.lastName);
	await page.getByPlaceholder('Email').fill(data.email);
	await page.getByPlaceholder('Phone').fill(data.phone);
}

// ---------------------------------------------------------------------------
// Single-step booking flow
// ---------------------------------------------------------------------------

test.describe('Single-step booking flow', () => {
	test.beforeEach(async ({ page }) => {
		const { bookingOneStepId } = getTestData();
		await page.goto(`/?p=${bookingOneStepId}`);
		await waitForCalendar(page);
	});

	test('completes a booking successfully', async ({ page }) => {
		await pickAvailableFutureDay(page);
		await pickFirstAvailableSlot(page);

		await expect(page.getByText('Selected time:')).toBeVisible();

		await fillCustomerForm(page);
		await page.getByRole('button', { name: 'Book' }).click();

		await expect(
			page.getByText('Appointment created successfully!')
		).toBeVisible({ timeout: 10_000 });

		await expect(page.getByText('Date')).toBeVisible();
		await expect(page.getByText('Time')).toBeVisible();
	});

	test('shows validation error when no date selected', async ({ page }) => {
		await fillCustomerForm(page);
		await page.getByRole('button', { name: 'Book' }).click();

		await expect(
			page.getByText('Please select a date and time')
		).toBeVisible();
	});

	test('shows validation errors for empty customer fields', async ({
		page,
	}) => {
		await pickAvailableFutureDay(page);
		await pickFirstAvailableSlot(page);

		await page.getByRole('button', { name: 'Book' }).click();

		await expect(page.getByText('First name is required')).toBeVisible();
		await expect(page.getByText('Last name is required')).toBeVisible();
		await expect(page.getByText('Email is required')).toBeVisible();
		await expect(page.getByText('Phone is required')).toBeVisible();
	});

	test('shows password field when "Create account" is checked', async ({
		page,
	}) => {
		const passwordField = page.getByPlaceholder('Password (optional)');
		await expect(passwordField).not.toBeVisible();

		await page.getByText('Create account').click();

		await expect(passwordField).toBeVisible();
		await expect(
			page.getByText('password will be generated automatically')
		).toBeVisible();
	});
});

// ---------------------------------------------------------------------------
// Multi-step booking flow
// ---------------------------------------------------------------------------

test.describe('Multi-step booking flow', () => {
	test.beforeEach(async ({ page }) => {
		const { bookingMultiStepId } = getTestData();
		await page.goto(`/?p=${bookingMultiStepId}`);
		await waitForCalendar(page);
	});

	test('completes all three steps successfully', async ({ page }) => {
		// Step 1: Select date
		await expect(page.getByText('Select date and time')).toBeVisible();

		await pickAvailableFutureDay(page);
		await pickFirstAvailableSlot(page);
		await page.getByRole('button', { name: 'Next step' }).click();

		// Step 2: Customer info
		await expect(page.getByText('Customer information')).toBeVisible();

		await fillCustomerForm(page);
		await page.getByRole('button', { name: 'Book' }).click();

		// Step 3: Confirmation
		await expect(
			page.getByText('Appointment created successfully!')
		).toBeVisible({ timeout: 10_000 });
	});

	test('shows date validation when advancing without selection', async ({
		page,
	}) => {
		await page.getByRole('button', { name: 'Next step' }).click();

		await expect(
			page.getByText('Please select a date and time')
		).toBeVisible();
	});

	test('can navigate back to date step', async ({ page }) => {
		await pickAvailableFutureDay(page);
		await pickFirstAvailableSlot(page);
		await page.getByRole('button', { name: 'Next step' }).click();

		await expect(page.getByText('Customer information')).toBeVisible();

		// Click "Select date" step header to go back
		await page.locator('[data-step="1"]').click();

		await expect(page.getByText('Select date and time')).toBeVisible();
	});

	test('step headers are visible', async ({ page }) => {
		await expect(page.locator('[data-step="1"]')).toBeVisible();
		await expect(page.locator('[data-step="2"]')).toBeVisible();
		await expect(page.locator('[data-step="3"]')).toBeVisible();
	});
});

// ---------------------------------------------------------------------------
// Calendar interaction
// ---------------------------------------------------------------------------

test.describe('Calendar interaction', () => {
	test.beforeEach(async ({ page }) => {
		const { bookingOneStepId } = getTestData();
		await page.goto(`/?p=${bookingOneStepId}`);
		await waitForCalendar(page);
	});

	test('displays current month and year', async ({ page }) => {
		const now = new Date();
		const monthName = now.toLocaleString('en-US', { month: 'long' });
		const year = now.getFullYear();

		await expect(page.getByText(`${monthName} ${year}`)).toBeVisible();
	});

	test('can navigate to next month and back', async ({ page }) => {
		const now = new Date();
		const currentMonth = now.toLocaleString('en-US', { month: 'long' });
		const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		const nextMonth = nextDate.toLocaleString('en-US', { month: 'long' });

		// Navigate forward — find the "next month" chevron button
		const navButtons = page.locator(
			'.wpappointments-booking-flow button[type="button"]'
		);
		const nextButton = navButtons
			.filter({ has: page.locator('svg') })
			.last();
		await nextButton.click();

		await expect(
			page.getByText(`${nextMonth} ${nextDate.getFullYear()}`)
		).toBeVisible({ timeout: 10_000 });

		// Navigate back
		const prevButton = navButtons
			.filter({ has: page.locator('svg') })
			.first();
		await prevButton.click();

		await expect(
			page.getByText(`${currentMonth} ${now.getFullYear()}`)
		).toBeVisible({ timeout: 10_000 });
	});

	test('shows time slots after selecting a day', async ({ page }) => {
		await pickAvailableFutureDay(page);

		await expect(page.getByText('Select a time slot for')).toBeVisible();

		const slots = page.locator('[data-time]');
		await expect(slots.first()).toBeVisible({ timeout: 10_000 });
	});

	test('shows selected time confirmation', async ({ page }) => {
		await pickAvailableFutureDay(page);
		await pickFirstAvailableSlot(page);

		await expect(page.getByText('Selected time:')).toBeVisible();
	});

	test('previous month button is disabled for current month', async ({
		page,
	}) => {
		const prevButton = page
			.locator('.wpappointments-booking-flow button[type="button"]')
			.filter({ has: page.locator('svg') })
			.first();

		await expect(prevButton).toBeDisabled();
	});
});
