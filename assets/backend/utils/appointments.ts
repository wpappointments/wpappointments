import { addMinutes, differenceInMinutes } from 'date-fns';
import { OpeningHoursSlot } from '~/backend/store/settings/settings.types';

export function timeRangeContainsAnother(
	timeRange: [Date, Date],
	anotherRange: [Date, Date]
): boolean {
	const [timeStart, timeEnd] = timeRange;
	const [compareStart, compareEnd] = anotherRange;

	const rangeStartInside = timeStart.getTime() <= compareStart.getTime();
	const rangeEndInside = timeEnd.getTime() >= compareEnd.getTime();

	return rangeStartInside && rangeEndInside;
}

export function timeRangesContainAnother(
	timeRanges: [Date, Date][],
	anotherRange: [Date, Date]
): boolean {
	return timeRanges.some((timeRange) =>
		timeRangeContainsAnother(timeRange, anotherRange)
	);
}

export function getDayRange(day: OpeningHoursSlot, date?: Date): [Date, Date] {
	const start = new Date(date || Date.now());
	const end = new Date(date || Date.now());

	const startHour = day.start.hour ? +day.start.hour : 0;
	const endHour = day.end.hour ? +day.end.hour : 0;
	const startMinute = day.start.minute ? +day.start.minute : 0;
	const endMinute = day.end.minute ? +day.end.minute : 0;

	start.setHours(startHour, startMinute);
	start.setSeconds(0);
	start.setMilliseconds(0);

	end.setHours(endHour, endMinute);
	end.setSeconds(0);
	end.setMilliseconds(0);

	return [start, end];
}

export function getDayRanges(
	schedule: OpeningHoursSlot[],
	date?: Date
): [Date, Date][] {
	return schedule.map((day) => getDayRange(day, date));
}

export function getRangeAvailableSlots(
	day: OpeningHoursSlot,
	date: Date,
	appointmentRange?: [Date, Date],
	extended?: boolean
) {
	const availableSlots = [];
	const hourLongRange = [new Date(), addMinutes(new Date(), 60)];
	const range = appointmentRange || hourLongRange;
	const appoinmentLengthInMinutes = differenceInMinutes(range[1], range[0], {
		roundingMethod: 'ceil',
	});

	const slot = getDayRange(day, date);
	const slotStart = slot[0];
	const slotEnd = slot[1];
	const midnightDate = new Date(date);
	midnightDate.setHours(0);
	midnightDate.setMinutes(0);

	const slotLenghtInMinutes = differenceInMinutes(slotEnd, slotStart, {
		roundingMethod: 'ceil',
	});

	const slotStartMinutesFromMidnight = differenceInMinutes(
		slotStart,
		midnightDate,
		{
			roundingMethod: 'ceil',
		}
	);

	for (
		let i = slotStartMinutesFromMidnight;
		i <= slotStartMinutesFromMidnight + slotLenghtInMinutes;
		i += appoinmentLengthInMinutes
	) {
		const hour = Math.floor(i / 60);
		const minutes = Math.floor(i % 60);

		const dateHour = new Date(date);
		const dateHourNext = new Date(date);

		dateHour.setHours(hour);
		dateHour.setMinutes(minutes);
		dateHour.setSeconds(0);
		dateHour.setMilliseconds(0);

		dateHourNext.setHours(hour);
		dateHourNext.setMinutes(minutes + appoinmentLengthInMinutes);
		dateHourNext.setSeconds(0);
		dateHourNext.setMilliseconds(0);

		if (timeRangeContainsAnother(slot, [dateHour, dateHourNext])) {
			availableSlots.push(dateHour);
		}
	}

	if (extended) {
		return maybeExtendSlotsToNextHour(
			availableSlots,
			appoinmentLengthInMinutes
		);
	}

	return availableSlots;
}

export function getRangesAvailableSlots(
	schedule: OpeningHoursSlot[],
	date: Date,
	appointmentRange?: [Date, Date],
	extended?: boolean
) {
	return schedule.map((day) =>
		getRangeAvailableSlots(day, date, appointmentRange, extended)
	);
}

export function maybeExtendSlotsToNextHour(
	slots: Date[],
	duration: number
): Date[] {
	if (slots.length === 0) {
		return slots;
	}

	const lastSlot = slots[slots.length - 1];
	const newSlot = addMinutes(lastSlot, duration);

	if (lastSlot.getHours() === newSlot.getHours()) {
		return slots;
	}

	if (newSlot.getMinutes() !== 0) {
		return slots;
	}

	const newSlots = [...slots, newSlot];

	return newSlots;
}
