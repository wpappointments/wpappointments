import {
	getRangeAvailableSlots,
	getDayRanges,
	isTimeRangeInAvailableRange,
	getDayRange,
	getRangesAvailableSlots,
} from '~/utils/appointments';
import { createAppointmentRange } from './helpers/appointment';
import { createTimeSlot } from './helpers/schedule';

describe('isTimeRangeInAvailableRange() util', () => {
	test('one date range fully inside the other range', () => {
		const date8am = new Date(2021, 1, 1, 8, 0); // 8:00
		const date10am = new Date(2021, 1, 1, 10, 0); // 10:00
		const date12pm = new Date(2021, 1, 1, 12, 0); // 12:00
		const date2pm = new Date(2021, 1, 1, 14, 0); // 14:00

		const inRange = isTimeRangeInAvailableRange(
			[date10am, date12pm],
			[date8am, date2pm]
		);

		expect(inRange).toBe(true);
	});

	test('one date range fully outside of the other range', () => {
		const date8am = new Date(2021, 1, 1, 8, 0); // 8:00
		const date10am = new Date(2021, 1, 1, 10, 0); // 10:00
		const date12pm = new Date(2021, 1, 1, 12, 0); // 12:00
		const date2pm = new Date(2021, 1, 1, 14, 0); // 14:00

		const range1 = [date8am, date10am] as const; // 8:00 - 10:00
		const range2 = [date12pm, date2pm] as const; // 12:00 - 14:00

		const inRange = isTimeRangeInAvailableRange(range1, range2);

		expect(inRange).toBe(false);
	});

	test('one date range partially inside the other range', () => {
		const date8am = new Date(2021, 1, 1, 8, 0); // 8:00
		const date10am = new Date(2021, 1, 1, 10, 0); // 10:00
		const date12pm = new Date(2021, 1, 1, 12, 0); // 12:00
		const date2pm = new Date(2021, 1, 1, 14, 0); // 14:00

		const range1 = [date8am, date12pm] as const; // 10:00 - 12:00
		const range2 = [date10am, date2pm] as const; // 8:00 - 14:00

		const inRange = isTimeRangeInAvailableRange(range1, range2);

		expect(inRange).toBe(false);
	});

	test('one date range fully inside the other range, touching start', () => {
		const date8am = new Date(2021, 1, 1, 8, 0); // 8:00
		const date10am = new Date(2021, 1, 1, 10, 0); // 10:00
		const date2pm = new Date(2021, 1, 1, 14, 0); // 14:00

		const range1 = [date8am, date10am] as const; // 8:00 - 10:00
		const range2 = [date8am, date2pm] as const; // 8:00 - 14:00

		const inRange = isTimeRangeInAvailableRange(range1, range2);

		expect(inRange).toBe(true);
	});

	test('one date range fully inside the other range, touching end', () => {
		const date8am = new Date(2021, 1, 1, 8, 0); // 8:00
		const date10am = new Date(2021, 1, 1, 10, 0); // 10:00
		const date2pm = new Date(2021, 1, 1, 14, 0); // 14:00

		const range1 = [date10am, date2pm] as const; // 10:00 - 14:00
		const range2 = [date8am, date2pm] as const; // 8:00 - 14:00

		const inRange = isTimeRangeInAvailableRange(range1, range2);

		expect(inRange).toBe(true);
	});

	test('one date range fully inside the other range, touching start and end = equal ranges', () => {
		const date10am = new Date(2021, 1, 1, 10, 0); // 10:00
		const date2pm = new Date(2021, 1, 1, 14, 0); // 14:00

		const range1 = [date10am, date2pm] as const; // 10:00 - 14:00
		const range2 = [date10am, date2pm] as const; // 8:00 - 14:00

		const inRange = isTimeRangeInAvailableRange(range1, range2);

		expect(inRange).toBe(true);
	});

	test('one date range inside the other, but with different dates', () => {
		const date8am = new Date(2021, 1, 1, 8, 0); // 8:00
		const date10am = new Date(2021, 1, 2, 10, 0); // 10:00
		const date12pm = new Date(2021, 1, 1, 12, 0); // 12:00
		const date2pm = new Date(2021, 1, 2, 14, 0); // 14:00

		const range1 = [date8am, date12pm] as const; // 10:00 - 12:00
		const range2 = [date10am, date2pm] as const; // 8:00 - 14:00

		const inRange = isTimeRangeInAvailableRange(range1, range2);

		expect(inRange).toBe(false);
	});
});

describe('getDayRanges() util', () => {
	test('should return two ranges from two opening hour slots', () => {
		const schedule = [
			createTimeSlot([8, 10], [16, 20]),
			createTimeSlot([21, 45], [23, 11]),
		];

		const ranges = getDayRanges(schedule);

		expect(ranges).toHaveLength(2);

		// First slot starting time
		expect(ranges[0][0].getHours()).toBe(8);
		expect(ranges[0][0].getMinutes()).toBe(10);

		// First slot ending time
		expect(ranges[0][1].getHours()).toBe(16);
		expect(ranges[0][1].getMinutes()).toBe(20);

		// Second slot starting time
		expect(ranges[1][0].getHours()).toBe(21);
		expect(ranges[1][0].getMinutes()).toBe(45);

		// Second slot ending time
		expect(ranges[1][1].getHours()).toBe(23);
		expect(ranges[1][1].getMinutes()).toBe(11);
	});
});

describe('getDayRange() util', () => {
	test('should return range for the day', () => {
		const schedule = createTimeSlot([8, 0], [16, 30]);

		const range = getDayRange(schedule);

		// Starting time
		expect(range[0].getHours()).toBe(8);
		expect(range[0].getMinutes()).toBe(0);

		// Ending time
		expect(range[1].getHours()).toBe(16);
		expect(range[1].getMinutes()).toBe(30);
	});
});

describe('getRangeAvailableSlots() util', () => {
	test('should return available slots for default 60 min time range', () => {
		const schedule = createTimeSlot([8, 0], [12, 0]);

		const slots = getRangeAvailableSlots(schedule);

		expect(slots).toHaveLength(4);

		// 8:00
		expect(slots[0].getHours()).toBe(8);
		expect(slots[0].getMinutes()).toBe(0);

		// 9:00
		expect(slots[1].getHours()).toBe(9);
		expect(slots[1].getMinutes()).toBe(0);

		// 10:00
		expect(slots[2].getHours()).toBe(10);
		expect(slots[2].getMinutes()).toBe(0);

		// 11:00
		expect(slots[3].getHours()).toBe(11);
		expect(slots[3].getMinutes()).toBe(0);
	});

	test('should return available slots when time range is 30 minutes', () => {
		const schedule = createTimeSlot([8, 0], [12, 0]);
		const appointmentRange = createAppointmentRange([8, 0], [8, 30]);

		const slots = getRangeAvailableSlots(schedule, appointmentRange);

		expect(slots).toHaveLength(8);

		// 8:00
		expect(slots[0].getHours()).toBe(8);
		expect(slots[0].getMinutes()).toBe(0);

		// 8:30
		expect(slots[1].getHours()).toBe(8);
		expect(slots[1].getMinutes()).toBe(30);

		// 9:00
		expect(slots[2].getHours()).toBe(9);
		expect(slots[2].getMinutes()).toBe(0);

		// 9:30
		expect(slots[3].getHours()).toBe(9);
		expect(slots[3].getMinutes()).toBe(30);

		// 10:00
		expect(slots[4].getHours()).toBe(10);
		expect(slots[4].getMinutes()).toBe(0);

		// 10:30
		expect(slots[5].getHours()).toBe(10);
		expect(slots[5].getMinutes()).toBe(30);

		// 11:00
		expect(slots[6].getHours()).toBe(11);
		expect(slots[6].getMinutes()).toBe(0);

		// 11:30
		expect(slots[7].getHours()).toBe(11);
		expect(slots[7].getMinutes()).toBe(30);
	});

	test('should return available slots when time range is 15 minutes', () => {
		const schedule = createTimeSlot([8, 0], [12, 0]);
		const appointmentRange = createAppointmentRange([8, 0], [8, 15]);

		const slots = getRangeAvailableSlots(schedule, appointmentRange);

		expect(slots).toHaveLength(16);

		// 8:00
		expect(slots[0].getHours()).toBe(8);
		expect(slots[0].getMinutes()).toBe(0);

		// 8:15
		expect(slots[1].getHours()).toBe(8);
		expect(slots[1].getMinutes()).toBe(15);

		// 8:30
		expect(slots[2].getHours()).toBe(8);
		expect(slots[2].getMinutes()).toBe(30);

		// 8:45
		expect(slots[3].getHours()).toBe(8);
		expect(slots[3].getMinutes()).toBe(45);

		// 9:00
		expect(slots[4].getHours()).toBe(9);
		expect(slots[4].getMinutes()).toBe(0);

		// 9:15
		expect(slots[5].getHours()).toBe(9);
		expect(slots[5].getMinutes()).toBe(15);

		// 9:30
		expect(slots[6].getHours()).toBe(9);
		expect(slots[6].getMinutes()).toBe(30);

		// 9:45
		expect(slots[7].getHours()).toBe(9);
		expect(slots[7].getMinutes()).toBe(45);

		// 10:00
		expect(slots[8].getHours()).toBe(10);
		expect(slots[8].getMinutes()).toBe(0);

		// 10:15
		expect(slots[9].getHours()).toBe(10);
		expect(slots[9].getMinutes()).toBe(15);

		// 10:30
		expect(slots[10].getHours()).toBe(10);
		expect(slots[10].getMinutes()).toBe(30);

		// 10:45
		expect(slots[11].getHours()).toBe(10);
		expect(slots[11].getMinutes()).toBe(45);

		// 11:00
		expect(slots[12].getHours()).toBe(11);
		expect(slots[12].getMinutes()).toBe(0);

		// 11:15
		expect(slots[13].getHours()).toBe(11);
		expect(slots[13].getMinutes()).toBe(15);

		// 11:30
		expect(slots[14].getHours()).toBe(11);
		expect(slots[14].getMinutes()).toBe(30);

		// 11:45
		expect(slots[15].getHours()).toBe(11);
		expect(slots[15].getMinutes()).toBe(45);
	});

	test('should return available slots when time range is 45 minutes', () => {
		const schedule = createTimeSlot([8, 0], [12, 0]);
		const appointmentRange = createAppointmentRange([8, 0], [8, 45]);

		const slots = getRangeAvailableSlots(schedule, appointmentRange);

		expect(slots).toHaveLength(5);

		// 8:00
		expect(slots[0].getHours()).toBe(8);
		expect(slots[0].getMinutes()).toBe(0);

		// 8:45
		expect(slots[1].getHours()).toBe(8);
		expect(slots[1].getMinutes()).toBe(45);

		// 9:30
		expect(slots[2].getHours()).toBe(9);
		expect(slots[2].getMinutes()).toBe(30);

		// 10:15
		expect(slots[3].getHours()).toBe(10);
		expect(slots[3].getMinutes()).toBe(15);

		// 11:00
		expect(slots[4].getHours()).toBe(11);
		expect(slots[4].getMinutes()).toBe(0);
	});

	test('should return available slots when time range is 103 minutes', () => {
		const schedule = createTimeSlot([8, 0], [16, 0]);
		const appointmentRange = createAppointmentRange([8, 0], [9, 43]);

		const slots = getRangeAvailableSlots(schedule, appointmentRange);

		expect(slots).toHaveLength(4);

		// 8:00
		expect(slots[0].getHours()).toBe(8);
		expect(slots[0].getMinutes()).toBe(0);

		// 9:43
		expect(slots[1].getHours()).toBe(9);
		expect(slots[1].getMinutes()).toBe(43);

		// 11:26
		expect(slots[2].getHours()).toBe(11);
		expect(slots[2].getMinutes()).toBe(26);

		// 13:09
		expect(slots[3].getHours()).toBe(13);
		expect(slots[3].getMinutes()).toBe(9);
	});
});

describe('getRangesAvailableSlots() util', () => {
	test('should return available slots for ', () => {
		const schedule = [
			createTimeSlot([8, 0], [12, 0]),
			createTimeSlot([14, 0], [16, 0]),
		];

		const slots = getRangesAvailableSlots(schedule);

		expect(slots).toHaveLength(2);
		expect(slots[0]).toHaveLength(4);
		expect(slots[1]).toHaveLength(2);

		// 8:00
		expect(slots[0][0].getHours()).toBe(8);

		// 9:00
		expect(slots[0][1].getHours()).toBe(9);

		// 10:00
		expect(slots[0][2].getHours()).toBe(10);

		// 11:00
		expect(slots[0][3].getHours()).toBe(11);

		// 14:00
		expect(slots[1][0].getHours()).toBe(14);

		// 15:00
		expect(slots[1][1].getHours()).toBe(15);
	});
});
