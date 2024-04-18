import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addHours, format } from 'date-fns';
import { formatTimeForPicker } from '~/backend/utils/format';
import { AvailabilityState } from '~/backend/store/availability/availability.types';
import { store } from '~/backend/store/store';
import { AppointmentFormFields } from '../../AppointmentForm/AppointmentForm';
import Number from '../../FormField/Number/Number';
import Select from '../../FormField/Select/Select';
import FormFieldSet from '../../FormFieldSet/FormFieldSet';
import { useStateContext } from '~/backend/admin/context/StateContext';

export type StartEndTimePickerProps = {
	date: Date;
};

type Fields = {
	timeHourStart: string;
	timeMinuteStart: string;
	duration: number;
	datetime: string;
	date: string;
	available: string;
};

export default function TimePicker({ date }: StartEndTimePickerProps) {
	const { watch } = useFormContext<AppointmentFormFields>();

	const timeHourStart = watch('timeHourStart');
	const timeMinuteStart = watch('timeMinuteStart');
	const duration = watch('duration');

	const defaultStart = addHours(new Date(), 1);
	defaultStart.setMinutes(0);
	defaultStart.setSeconds(0);
	defaultStart.setMilliseconds(0);

	const { setValue } = useFormContext<Fields>();
	const defaultHour = formatTimeForPicker(defaultStart.getHours());

	useEffect(() => {
		setValue('timeHourStart', defaultHour);
		setValue('timeMinuteStart', '00');
	}, []);

	const { getSelector } = useStateContext();
	const { currentMonth, currentYear } = useSelect((select) => {
		return {
			currentMonth: select(store).getCurrentMonth(),
			currentYear: select(store).getCurrentYear(),
		};
	}, []);

	const availability = useSelect(
		(select) => {
			return select(store).getAvailability(
				currentMonth,
				currentYear,
				Intl.DateTimeFormat().resolvedOptions().timeZone,
				getSelector('getAvailability')
			);
		},
		[currentMonth, currentYear, date]
	);

	const { month } = availability;
	const monthDay = month.find(
		(day) => new Date(day.date).getDate() === date.getDate()
	);

	const day = monthDay?.day;
	const hoursMap = createHoursMap(day);
	const hours = createHourOptions(hoursMap);
	const minutes = createMinuteOptions(hoursMap, timeHourStart);

	const appointments = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	const { timePickerPrecision, defaultLength } = appointments;

	const precision = timePickerPrecision || 30;
	const length = defaultLength || 30;

	useEffect(() => {
		const start = new Date(date);
		start.setHours(parseInt(timeHourStart));
		start.setMinutes(parseInt(timeMinuteStart));
		start.setSeconds(0);
		start.setMilliseconds(0);

		const available = checkAvailability(day, start, duration, precision);

		setValue('available', available ? '1' : '0');
	}, [day, date, timeHourStart, timeMinuteStart, duration, precision]);

	return (
		<div>
			<FormFieldSet horizontal>
				<FormFieldSet horizontal legend="Start time">
					<Select
						name="timeHourStart"
						label="Hour"
						defaultValue={formatTimeForPicker(
							defaultStart.getHours()
						)}
						rules={{
							required: true,
						}}
						options={hours}
						fullWidth
					/>

					<Select
						name="timeMinuteStart"
						label="Minute"
						defaultValue="00"
						rules={{
							required: true,
						}}
						options={minutes}
						fullWidth
					/>
				</FormFieldSet>
				<FormFieldSet horizontal={true} legend="Duration">
					<Number
						name="duration"
						label="Minutes"
						defaultValue={length}
						min={precision}
						step={precision}
						rules={{
							required: true,
						}}
					/>
				</FormFieldSet>
			</FormFieldSet>
		</div>
	)
}

type Hour = AvailabilityState['month'][0]['day'][0];

function checkAvailability(
	day: AvailabilityState['month'][0]['day'] | undefined,
	date: Date,
	duration: number,
	precision: number
) {
	if (!day) {
		return false;
	}

	let slotCounter = 0;
	let available = false;

	const iterations = duration / precision;

	for (const slot of day) {
		const slotDate = new Date(slot.dateString);
		const slotDateTime = slotDate.getTime();
		const dateTime = date.getTime();

		if (slotDateTime < dateTime) {
			continue;
		}

		slotCounter++;

		if (slotCounter > iterations) {
			break;
		}

		if (!slot.available || !slot.inSchedule) {
			available = false;
			break;
		}

		available = true;
	}

	return available;
}

function createHoursMap(day: AvailabilityState['month'][0]['day'] | undefined) {
	const hoursMap = new Map<string, Hour[]>();

	if (!day) {
		return hoursMap;
	}

	for (const hour of day) {
		const key = format(new Date(hour.dateString), 'HH');

		if (!hoursMap.has(key)) {
			hoursMap.set(key, []);
		}

		hoursMap.get(key)?.push(hour);
	}

	return hoursMap;
}

function createHourOptions(hoursMap: Map<string, Hour[]>) {
	const hours: {
		label: string;
		value: string;
	}[] = [];

	for (const [hourLabel, hour] of hoursMap) {
		const available = hour.some((hour) => hour.available);

		hours.push({
			label: available ? `⚈ ${hourLabel}` : `⚆ ${hourLabel}`,
			value: hourLabel,
		});
	}

	return hours;
}

function createMinuteOptions(hoursMap: Map<string, Hour[]>, currentHour: string) {
	const minutes: {
		label: string;
		value: string;
	}[] = [];

	const hour = hoursMap.get(currentHour);

	if (!hour) {
		return minutes;
	}

	for (const minute of hour) {
		const minuteLabel = format(new Date(minute.dateString), 'mm');
		const available = minute.available;

		minutes.push({
			label: available ? `⚈ ${minuteLabel}` : `⚆ ${minuteLabel}`,
			value: minuteLabel,
		});
	}

	return minutes;

}