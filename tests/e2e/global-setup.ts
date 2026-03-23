import fs from 'fs';
import path from 'path';
import { enableScheduleDay, createBookingPage, wpCli } from './utils/wp-env';

const TEST_DATA_PATH = path.resolve(__dirname, 'results', '.test-data.json');

const WEEKDAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
] as const;

async function globalSetup() {
	// 0. Ensure plain permalinks (wp-env Apache has no .htaccess rewrite support)
	wpCli("option update permalink_structure ''");

	// 1. Enable weekday schedule (Mon–Fri, 09:00–17:00)
	const scheduleId = parseInt(
		wpCli('option get wpappointments_default_scheduleId'),
		10
	);

	for (const day of WEEKDAYS) {
		enableScheduleDay(scheduleId, day);
	}

	// 2. Create booking pages (OneStep + MultiStep) if they don't exist
	const existingPages = wpCli(
		'post list --post_type=page --post_status=publish --field=post_title'
	);

	if (!existingPages.includes('Booking OneStep')) {
		createBookingPage('OneStep');
	}

	if (!existingPages.includes('Booking MultiStep')) {
		createBookingPage('MultiStep');
	}

	// 3. Resolve page IDs and write to file for test workers
	const oneStepId = wpCli(
		"post list --post_type=page --post_status=publish --title='Booking OneStep' --field=ID"
	)
		.split('\n')[0]
		.trim();

	const multiStepId = wpCli(
		"post list --post_type=page --post_status=publish --title='Booking MultiStep' --field=ID"
	)
		.split('\n')[0]
		.trim();

	fs.mkdirSync(path.dirname(TEST_DATA_PATH), { recursive: true });
	fs.writeFileSync(
		TEST_DATA_PATH,
		JSON.stringify({
			bookingOneStepId: oneStepId,
			bookingMultiStepId: multiStepId,
		})
	);
}

export default globalSetup;
