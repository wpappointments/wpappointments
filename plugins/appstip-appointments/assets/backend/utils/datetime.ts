import { getSettings } from '@wordpress/date';

export function timeZoneOffsetInMinutes(ianaTimeZone: string) {
	const now = new Date();
	now.setSeconds(0, 0);

	// Format current time in `ianaTimeZone` as `M/DD/YYYY, HH:MM:SS`:
	const tzDateString = now.toLocaleString('en-US', {
		timeZone: ianaTimeZone,
		hourCycle: 'h23',
	});

	// Parse formatted date string:
	const match = /(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/.exec(tzDateString);

	if (!match) {
		throw new Error('Invalid date string');
	}

	const [_, month, day, year, hour, min] = match.map(Number);
	_.toString();

	// Change date string's time zone to UTC and get timestamp:
	const tzTime = Date.UTC(year, month - 1, day, hour, min);

	// Return the offset between UTC and target time zone:
	return Math.floor((tzTime - now.getTime()) / (1000 * 60));
}

export function userSiteTimezoneMatch() {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const siteTimezone =
		(getSettings().timezone.offset as unknown as number) * 60;
	const userTimezone = timeZoneOffsetInMinutes(timezone);

	if (siteTimezone === userTimezone) {
		return false;
	}

	return timezone;
}
