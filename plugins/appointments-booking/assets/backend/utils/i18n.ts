import { __, sprintf } from '@wordpress/i18n';
import { FormatRelativeToken, format, formatRelative } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function formatDate(date: Date | string | number) {
	let _date = date;

	const dateSettings = window.wpappointments.date;
	const { formatsJs } = dateSettings;

	if (typeof date === 'string') {
		_date = new Date(date);
	} else if (typeof date === 'number') {
		_date = new Date(date * 1000);
	}

	return format(_date, formatsJs.date);
}

export function formatTime(date: Date | string | number) {
	let _date = date;

	const dateSettings = window.wpappointments.date;
	const { formatsJs } = dateSettings;

	if (typeof date === 'string') {
		_date = new Date(date);
	} else if (typeof date === 'number') {
		_date = new Date(date * 1000);
	}

	return format(_date, formatsJs.time);
}

export function formatDateRelative(
	date: Date | string | number,
	baseDate: Date | string | number
) {
	let _date = date;
	let _baseDate = baseDate;

	const dateSettings = window.wpappointments.date;
	const { formatsJs } = dateSettings;

	const formatRelativeLocale = {
		/* translators: %s: time, eeee: day of week name */
		lastWeek: sprintf(
			__("'last' eeee 'at' %s", 'appointments-booking'),
			formatsJs.time
		),
		/* translators: %s: time */
		yesterday: sprintf(
			__("'yesterday at' %s", 'appointments-booking'),
			formatsJs.time
		),
		/* translators: %s: time */
		today: sprintf(
			__("'today at' %s", 'appointments-booking'),
			formatsJs.time
		),
		/* translators: %s: time */
		tomorrow: sprintf(
			__("'tomorrow at' %s", 'appointments-booking'),
			formatsJs.time
		),
		/* translators: %s: time, eeee: day of week name */
		nextWeek: sprintf(
			__("eeee 'at' %s", 'appointments-booking'),
			formatsJs.time
		),
		/* translators: %s: date */
		other: formatsJs.date,
	};

	const locale = {
		...enUS,
		formatRelative: (token: FormatRelativeToken) =>
			formatRelativeLocale[token],
	};

	if (typeof date === 'string') {
		_date = new Date(date);
	} else if (typeof date === 'number') {
		_date = new Date(date * 1000);
	}

	if (typeof baseDate === 'string') {
		_baseDate = new Date(baseDate);
	} else if (typeof baseDate === 'number') {
		_baseDate = new Date(baseDate);
	}

	return formatRelative(_date, _baseDate, { locale });
}

export function getWeekDays(format: 'short' | 'long' = 'short') {
	const dateSettings = window.wpappointments.date;
	const { startOfWeek } = dateSettings;

	const weekDaysLong = [
		__('Sunday', 'appointments-booking'),
		__('Monday', 'appointments-booking'),
		__('Tuesday', 'appointments-booking'),
		__('Wednesday', 'appointments-booking'),
		__('Thursday', 'appointments-booking'),
		__('Friday', 'appointments-booking'),
		__('Saturday', 'appointments-booking'),
	];

	const weekDaysShort = [
		__('Sun', 'appointments-booking'),
		__('Mon', 'appointments-booking'),
		__('Tue', 'appointments-booking'),
		__('Wed', 'appointments-booking'),
		__('Thu', 'appointments-booking'),
		__('Fri', 'appointments-booking'),
		__('Sat', 'appointments-booking'),
	];

	const weekDays = format === 'short' ? weekDaysShort : weekDaysLong;

	// Shift the array to start from the correct day
	const shiftedWeekDays = [
		...weekDays.slice(startOfWeek),
		...weekDays.slice(0, startOfWeek),
	];

	return shiftedWeekDays.map((day, index) => {
		return {
			label: day,
			value: index,
		};
	});
}

export const dateFormatMap = new Map<string, string>([
	['F j, Y', 'MMMM d, yyyy'],
	['Y-m-d', 'yyyy-MM-dd'],
	['m/d/Y', 'MM/dd/yyyy'],
	['d/m/Y', 'dd/MM/yyyy'],
]);

export const timeFormatMap = new Map<string, string>([
	['g:i a', 'h:mm aaa'],
	['g:i A', 'h:mm aa'],
	['H:i', 'HH:mm'],
]);
