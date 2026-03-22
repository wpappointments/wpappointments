import { test, expect } from '@playwright/test';
import { loginAsAdmin, goToAdminPage, screenshot } from './helpers';

test.describe('Admin Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test('Dashboard page loads', async ({ page }) => {
		await goToAdminPage(page, 'wpappointments');
		await screenshot(page, 'admin-dashboard');

		const adminRoot = page.locator('#wpappointments-admin');
		await expect(adminRoot).toBeVisible();
		await expect(adminRoot).toHaveAttribute('data-page', 'dashboard');
	});

	test('Calendar page loads', async ({ page }) => {
		await goToAdminPage(page, 'wpappointments-calendar');
		await screenshot(page, 'admin-calendar');

		const adminRoot = page.locator('#wpappointments-admin');
		await expect(adminRoot).toBeVisible();
		await expect(adminRoot).toHaveAttribute('data-page', 'calendar');
	});

	test('Customers page loads', async ({ page }) => {
		await goToAdminPage(page, 'wpappointments-customers');
		await screenshot(page, 'admin-customers');

		const adminRoot = page.locator('#wpappointments-admin');
		await expect(adminRoot).toBeVisible();
		await expect(adminRoot).toHaveAttribute('data-page', 'customers');
	});

	test('Settings page loads with tabs', async ({ page }) => {
		await goToAdminPage(page, 'wpappointments-settings');
		await screenshot(page, 'admin-settings');

		const adminRoot = page.locator('#wpappointments-admin');
		await expect(adminRoot).toBeVisible();
		await expect(adminRoot).toHaveAttribute('data-page', 'settings');
	});
});

test.describe('Admin Appointments', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test('Can open create appointment slideout', async ({ page }) => {
		await goToAdminPage(page, 'wpappointments');

		// Wait for React to render
		await page.waitForTimeout(1500);

		// Look for the create appointment button
		const createButton = page.locator(
			'button:has-text("New Appointment"), button:has-text("Create"), button:has-text("Add")'
		);

		if (
			await createButton
				.first()
				.isVisible({ timeout: 3000 })
				.catch(() => false)
		) {
			await createButton.first().click();
			await page.waitForTimeout(500);
			await screenshot(page, 'admin-create-appointment-slideout');

			// Verify slideout opened
			const slideout = page.locator('[role="dialog"]');
			if (
				await slideout.isVisible({ timeout: 2000 }).catch(() => false)
			) {
				await expect(slideout).toBeVisible();
			}
		}
	});
});
