import { test, expect } from '@playwright/test';

test('WordPress login page loads', async ({ page }) => {
	await page.goto('http://localhost:8888/wp-login.php');
	await expect(page).toHaveTitle(/Log In/);
});

test('WordPress admin is accessible after login', async ({ page }) => {
	await page.goto('http://localhost:8888/wp-login.php');
	await page.fill('#user_login', 'admin');
	await page.fill('#user_pass', 'password');
	await page.click('#wp-submit');
	await page.waitForURL('**/wp-admin/**');
	await expect(page).toHaveTitle(/Dashboard/);
});
