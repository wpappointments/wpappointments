/**
 * Block markup validation.
 *
 * Validates that the `wpappointments/booking-flow` block parses cleanly
 * through `@wordpress/blocks`, the same parser the editor uses to detect
 * "block invalid" warnings. AI agents (Studio Code, Cursor, etc.) and the
 * wp.org block validator both rely on this round-trip producing a valid block.
 *
 * Strategy: open the post editor (which exposes `window.wp.blocks`), feed
 * representative markup variations through `parse()`, assert isValid + name.
 *
 * Why this matters: the booking-flow block is server-rendered (no `save()`),
 * but the editor still parses the saved HTML on load. Invalid markup → users
 * see a "block contains unexpected content" warning, with the only fix being
 * "Convert to HTML" (which loses block attributes).
 */
import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin } from './helpers';

type ParseResult = {
	count: number;
	name: string | null;
	isValid: boolean | null;
	attributes: Record<string, unknown> | null;
	innerBlocks: number;
};

async function parseInEditor(page: Page, html: string): Promise<ParseResult> {
	return page.evaluate((markup) => {
		// @ts-expect-error — wp.blocks is provided by WordPress in the editor.
		const blocks = window.wp.blocks.parse(markup);
		const first = blocks[0];
		return {
			count: blocks.length,
			name: first?.name ?? null,
			isValid: first?.isValid ?? null,
			attributes: first?.attributes ?? null,
			innerBlocks: first?.innerBlocks?.length ?? 0,
		};
	}, html);
}

test.describe('booking-flow block markup validation', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		// Post editor loads @wordpress/blocks and registers the booking-flow block.
		await page.goto(
			'http://localhost:8888/wp-admin/post-new.php?post_type=page'
		);
		// Wait for wp.blocks + the booking-flow block to be registered.
		await page.waitForFunction(
			() =>
				// @ts-expect-error — wp.blocks injected by editor.
				typeof window.wp?.blocks?.parse === 'function' &&
				// @ts-expect-error — same.
				!!window.wp.blocks.getBlockType('wpappointments/booking-flow'),
			null,
			{ timeout: 30_000 }
		);
	});

	test('default attributes round-trip cleanly', async ({ page }) => {
		const html = '<!-- wp:wpappointments/booking-flow /-->';
		const result = await parseInEditor(page, html);
		expect(result.count).toBe(1);
		expect(result.name).toBe('wpappointments/booking-flow');
		expect(result.isValid).toBe(true);
	});

	test('all known attributes round-trip cleanly', async ({ page }) => {
		const html =
			'<!-- wp:wpappointments/booking-flow {"flowType":"MultiStep","alignment":"Center","width":"Wide","trimUnavailable":false,"slotsAsButtons":true,"inlineTimePicker":true,"hideProgressBar":true,"hideStepTitles":true,"entityId":42} /-->';
		const result = await parseInEditor(page, html);
		expect(result.count).toBe(1);
		expect(result.name).toBe('wpappointments/booking-flow');
		expect(result.isValid).toBe(true);
		expect(result.attributes).toMatchObject({
			flowType: 'MultiStep',
			alignment: 'Center',
			width: 'Wide',
			trimUnavailable: false,
			slotsAsButtons: true,
			inlineTimePicker: true,
			hideProgressBar: true,
			hideStepTitles: true,
			entityId: 42,
		});
	});

	test('block with inner button blocks round-trips', async ({ page }) => {
		const html = [
			'<!-- wp:wpappointments/booking-flow -->',
			'<!-- wp:button -->',
			'<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Book now</a></div>',
			'<!-- /wp:button -->',
			'<!-- /wp:wpappointments/booking-flow -->',
		].join('\n');
		const result = await parseInEditor(page, html);
		expect(result.count).toBe(1);
		expect(result.name).toBe('wpappointments/booking-flow');
		expect(result.isValid).toBe(true);
		expect(result.innerBlocks).toBe(1);
	});
});
