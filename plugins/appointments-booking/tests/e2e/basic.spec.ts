import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
	await page.goto('http://localhost:8889/wp-login.php'); // Assuming default wp-env port

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Log In/);
});
