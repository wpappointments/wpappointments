import { execSync } from 'child_process';

const ROOT_DIR = process.env.WP_ENV_ROOT ?? `${__dirname}/../../../`;

/**
 * Escape a string for safe use in a single-quoted shell argument.
 */
function shellEscape(value: string): string {
	return `'${value.replace(/'/g, "'\\''")}'`;
}

/**
 * Run a WP-CLI command inside the wp-env container.
 */
export function wpCli(command: string): string {
	return execSync(`npx wp-env run cli wp ${command}`, {
		cwd: ROOT_DIR,
		encoding: 'utf-8',
		timeout: 60_000,
	}).trim();
}

/**
 * Enable a schedule day with default 09:00–17:00 hours.
 */
export function enableScheduleDay(
	scheduleId: number,
	day: string,
	startHour = '09',
	startMinute = '00',
	endHour = '17',
	endMinute = '00'
): void {
	const meta = JSON.stringify({
		day,
		enabled: true,
		allDay: false,
		slots: {
			list: [
				{
					start: { hour: startHour, minute: startMinute },
					end: { hour: endHour, minute: endMinute },
				},
			],
		},
	});

	wpCli(
		`post meta update ${scheduleId} wpappointments_schedule_${day} ${shellEscape(meta)}`
	);
}

/**
 * Create a WordPress page with the booking flow Gutenberg block via WP-CLI.
 */
export function createBookingPage(
	flowType: 'OneStep' | 'MultiStep' = 'OneStep'
): number {
	const blockAttributes = JSON.stringify({
		flowType,
		alignment: 'Left',
		width: 'Full',
		trimUnavailable: true,
		slotsAsButtons: true,
	});

	const blockComment = `<!-- wp:wpappointments/booking-flow ${blockAttributes} /-->`;

	const result = wpCli(
		`post create --post_type=page --post_title=${shellEscape(
			`Booking ${flowType}`
		)} --post_status=publish --post_content=${shellEscape(
			blockComment
		)} --porcelain`
	);

	return parseInt(result, 10);
}

/**
 * Delete a WordPress post.
 */
export function deletePost(postId: number): void {
	wpCli(`post delete ${postId} --force`);
}
