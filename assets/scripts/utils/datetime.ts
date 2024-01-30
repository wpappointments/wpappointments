import { differenceInMinutes } from 'date-fns';
import { union, literal, Output, parse } from 'valibot';

const TimeRangeHourSchema = union(
	[
		literal('00'),
		literal('01'),
		literal('02'),
		literal('03'),
		literal('04'),
		literal('05'),
		literal('06'),
		literal('07'),
		literal('08'),
		literal('09'),
		literal('10'),
		literal('11'),
		literal('12'),
		literal('13'),
		literal('14'),
		literal('15'),
		literal('16'),
		literal('17'),
		literal('18'),
		literal('19'),
		literal('20'),
		literal('21'),
		literal('22'),
		literal('23'),
		literal('24'),
	],
	'Range hour must be a string between 00 and 24 with leading zeros'
);

const TimeRangeMinuteSchema = union(
	[
		literal('00'),
		literal('01'),
		literal('02'),
		literal('03'),
		literal('04'),
		literal('05'),
		literal('06'),
		literal('07'),
		literal('08'),
		literal('09'),
		literal('10'),
		literal('11'),
		literal('12'),
		literal('13'),
		literal('14'),
		literal('15'),
		literal('16'),
		literal('17'),
		literal('18'),
		literal('19'),
		literal('20'),
		literal('21'),
		literal('22'),
		literal('23'),
		literal('24'),
		literal('25'),
		literal('26'),
		literal('27'),
		literal('28'),
		literal('29'),
		literal('30'),
		literal('31'),
		literal('32'),
		literal('33'),
		literal('34'),
		literal('35'),
		literal('36'),
		literal('37'),
		literal('38'),
		literal('39'),
		literal('40'),
		literal('41'),
		literal('42'),
		literal('43'),
		literal('44'),
		literal('45'),
		literal('46'),
		literal('47'),
		literal('48'),
		literal('49'),
		literal('50'),
		literal('51'),
		literal('52'),
		literal('53'),
		literal('54'),
		literal('55'),
		literal('56'),
		literal('57'),
		literal('58'),
		literal('59'),
	],
	'Range minute must be a string between 00 and 59 with leading zeros'
);

type TimeRangeHour = Output<typeof TimeRangeHourSchema>;
type TimeRangeMinute = Output<typeof TimeRangeMinuteSchema>;

type TimeRange = `${TimeRangeHour}:${TimeRangeMinute}`;

export function createTimeRange(
	start: TimeRange | Date,
	end: TimeRange | Date
) {
	if (start instanceof Date && end instanceof Date) {
		return createTimeRangeFromDates(start, end);
	}

	if (typeof start === 'string' && typeof end === 'string') {
		return createTimeRangeFromStrings(start, end);
	}

	throw new Error(
		'Invalid arguments. Must be either two date objects or two strings in TimeRange format for example (10:15).'
	);
}

export function createTimeRangeFromDates(start: Date, end: Date) {
	const startDate = new Date(start);
	const endDate = new Date(end);

	startDate.setSeconds(0);
	startDate.setMilliseconds(0);

	endDate.setSeconds(0);
	endDate.setMilliseconds(0);

	const dateTimeRange: [Date, Date] = [startDate, endDate];

	return dateTimeRange;
}

export function createTimeRangeFromStrings(start: TimeRange, end: TimeRange) {
	const startTime = start.split(':');

	const startHour = parse(TimeRangeHourSchema, startTime[0]);
	const startMinute = parse(TimeRangeMinuteSchema, startTime[1]);

	const endTime = end.split(':');

	const endHour = parse(TimeRangeHourSchema, endTime[0]);
	const endMinute = parse(TimeRangeMinuteSchema, endTime[1]);

	const dateTimeRange: [Date, Date] = [
		new Date(2024, 1, 1, parseInt(startHour), parseInt(startMinute), 0, 0),
		new Date(2024, 1, 1, parseInt(endHour), parseInt(endMinute), 0, 0),
	];

	return dateTimeRange;
}

export function createTimeRangeFromMinutes(duration: number): [Date, Date] {
	const start = new Date();
	const end = new Date();

	start.setHours(0);
	start.setMinutes(0);
	start.setSeconds(0);
	start.setMilliseconds(0);

	end.setHours(0);
	end.setMinutes(duration);
	end.setSeconds(0);
	end.setMilliseconds(0);

	return [start, end];
}

export function timeRangeMinutes(range: [Date, Date]) {
	return differenceInMinutes(range[1], range[0]);
}

export function getNextRoundHourDate() {
	const nextRoundHourDate = new Date();
	nextRoundHourDate.setMinutes(0);
	nextRoundHourDate.setSeconds(0);
	nextRoundHourDate.setMilliseconds(0);
	nextRoundHourDate.setHours(nextRoundHourDate.getHours() + 1);

	return nextRoundHourDate;
}

export function parseDateFromString(dateString: string) {
	const date = new Date(dateString);
	return date;
}
