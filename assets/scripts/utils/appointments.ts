import { addMinutes, differenceInMinutes } from 'date-fns';
import { OpeningHoursSlot } from '~/store/settings/settings.types';

export function isTimeRangeInAvailableRange(
	timeRange: readonly [Date, Date],
	availableRange: readonly [Date, Date]
): boolean {
	const [start, end] = timeRange;
	const [availableStart, availableEnd] = availableRange;

	return (
		start.getTime() >= availableStart.getTime() &&
		end.getTime() <= availableEnd.getTime()
	);
}

export function getDayRange(day: OpeningHoursSlot): [Date, Date] {
	const start = new Date();
	const end = new Date();

	start.setHours(+day.start.hour, +day.start.minute);
	start.setSeconds(0);
	start.setMilliseconds(0);

	end.setHours(+day.end.hour, +day.end.minute);
	end.setSeconds(0);
	end.setMilliseconds(0);

	return [start, end];
}

export function getDayRanges(schedule: OpeningHoursSlot[]): [Date, Date][] {
	return schedule.map(getDayRange);
}

export function getRangeAvailableSlots(
	day: OpeningHoursSlot,
	appointmentRange?: [Date, Date]
) {
	const availableSlots = [];
	const hourLongRange = [new Date(), addMinutes(new Date(), 60)];
	const range = appointmentRange || hourLongRange;
	const appoinmentLengthInMinutes = differenceInMinutes(range[1], range[0], {
		roundingMethod: 'ceil',
	});

	const slot = getDayRange(day);
	const slotStart = slot[0];
	const slotEnd = slot[1];
	const midnightDate = new Date();
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

		const dateHour = new Date();
		const dateHourNext = new Date();

		dateHour.setHours(hour);
		dateHour.setMinutes(minutes);
		dateHour.setSeconds(0);
		dateHour.setMilliseconds(0);

		dateHourNext.setHours(hour);
		dateHourNext.setMinutes(minutes + appoinmentLengthInMinutes);
		dateHourNext.setSeconds(0);
		dateHourNext.setMilliseconds(0);

		if (isTimeRangeInAvailableRange([dateHour, dateHourNext], slot)) {
			availableSlots.push(dateHour);
		}
	}

	return availableSlots;
}

export function getRangesAvailableSlots(
	schedule: OpeningHoursSlot[],
	appointmentRange?: [Date, Date]
) {
	return schedule.map((day) => getRangeAvailableSlots(day, appointmentRange));
}
