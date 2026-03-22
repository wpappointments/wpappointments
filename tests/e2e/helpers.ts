import { Page } from '@playwright/test';

const BASE_URL = 'http://localhost:8888';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';

/**
 * Log in to WordPress admin
 */
export async function loginAsAdmin(page: Page) {
	await page.goto(`${BASE_URL}/wp-login.php`);
	await page.fill('#user_login', ADMIN_USER);
	await page.fill('#user_pass', ADMIN_PASS);
	await page.click('#wp-submit');
	await page.waitForURL('**/wp-admin/**');
}

/**
 * Navigate to a WP Appointments admin page
 */
export async function goToAdminPage(
	page: Page,
	slug:
		| 'wpappointments'
		| 'wpappointments-calendar'
		| 'wpappointments-customers'
		| 'wpappointments-settings'
) {
	await page.goto(`${BASE_URL}/wp-admin/admin.php?page=${slug}`);
	await page.waitForSelector('#wpappointments-admin', { timeout: 10000 });
}

/**
 * Create a page with the booking flow shortcode and return its URL
 */
export async function createBookingPage(page: Page): Promise<string> {
	await page.goto(`${BASE_URL}/wp-admin/post-new.php?post_type=page`);

	// Dismiss any welcome modals
	const closeButton = page.locator(
		'button[aria-label="Close"], .components-modal__header button'
	);
	if (
		await closeButton
			.first()
			.isVisible({ timeout: 2000 })
			.catch(() => false)
	) {
		await closeButton.first().click();
	}

	// Switch to code editor if available
	const moreMenu = page.locator(
		'button[aria-label="Options"], button[aria-label="More options"]'
	);
	if (await moreMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
		await moreMenu.click();
		const codeEditor = page.locator(
			'button:has-text("Code editor"), [role="menuitemradio"]:has-text("Code editor")'
		);
		if (await codeEditor.isVisible({ timeout: 1000 }).catch(() => false)) {
			await codeEditor.click();
		}
	}

	// Try to use the code editor textarea
	const codeTextarea = page.locator('.editor-post-text-editor');
	if (await codeTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
		await codeTextarea.fill(
			'<!-- wp:shortcode -->[wpappointments]<!-- /wp:shortcode -->'
		);
	}

	// Set title
	const titleField = page.locator(
		'.editor-post-title__input, input[name="post_title"]'
	);
	if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
		await titleField.fill('Booking Flow E2E Test');
	}

	// Publish
	const publishButton = page.locator(
		'button:has-text("Publish"), .editor-post-publish-button'
	);
	await publishButton.first().click();

	// Confirm publish if dialog appears
	const confirmPublish = page.locator(
		'.editor-post-publish-panel button:has-text("Publish")'
	);
	if (await confirmPublish.isVisible({ timeout: 2000 }).catch(() => false)) {
		await confirmPublish.click();
	}

	await page.waitForTimeout(1000);

	// Get the published page URL
	const viewLink = page.locator('a:has-text("View Page")');
	if (await viewLink.isVisible({ timeout: 3000 }).catch(() => false)) {
		const href = await viewLink.getAttribute('href');
		return href || `${BASE_URL}/?page_id=999`;
	}

	return `${BASE_URL}/?p=999`;
}

/**
 * Take a named screenshot and save to results directory
 */
export async function screenshot(page: Page, name: string) {
	await page.screenshot({
		path: `tests/e2e/results/screenshots/${name}.png`,
		fullPage: false,
	});
}
