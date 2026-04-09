import { useEffect } from 'react';
import {
	SelectControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	FormField,
	formFieldStyles,
	FormFieldSet,
} from '@wpappointments/components';
import { addHours, format } from 'date-fns';
import { formatTimeForPicker } from '~/backend/utils/format';
import { AvailabilityState } from '~/backend/store/availability/availability.types';
import { store } from '~/backend/store/store';
import { AppointmentFormFields } from '../../AppointmentForm/AppointmentForm';
import { useStateContext } from '~/backend/admin/context/StateContext';

export type StartEndTimePickerProps = {
	date: Date;
	formData: AppointmentFormFields;
	setField: <K extends keyof AppointmentFormFields>(
		field: K,
		value: AppointmentFormFields[K]
	) => void;
};

export default function TimePicker({
	date,
	formData,
	setField,
}: StartEndTimePickerProps) {
	const { timeHourStart, timeMinuteStart, duration } = formData;

	const defaultStart = addHours(new Date(), 1);
	defaultStart.setMinutes(0);
	defaultStart.setSeconds(0);
	defaultStart.setMilliseconds(0);

	const defaultHour = formatTimeForPicker(defaultStart.getHours());

	useEffect(() => {
		if (!timeHourStart) {
			setField('timeHourStart', defaultHour);
		}
		if (!timeMinuteStart) {
			setField('timeMinuteStart', '00');
		}
	}, []);

	const { getSelector } = useStateContext();
	const { currentMonth, currentYear } = useSelect((select) => {
		return {
			currentMonth: select(store).getCurrentMonth(),
			currentYear: select(store).getCurrentYear(),
		};
	}, []);

	const appointments = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	const { timePickerPrecision, defaultLength, coreEntityId } = appointments;

	const availability = useSelect(
		(select) => {
			return select(store).getAvailability(
				coreEntityId || 0,
				currentMonth,
				currentYear,
				Intl.DateTimeFormat().resolvedOptions().timeZone,
				getSelector('getAvailability')
			);
		},
		[coreEntityId, currentMonth, currentYear, date]
	);

	const { month } = availability;
	const monthDay = month.find(
		(day) => new Date(day.date).getDate() === date.getDate()
	);

	const day = monthDay?.day;
	const hoursMap = createHoursMap(day);
	const hours = createHourOptions(hoursMap);
	const minutes = createMinuteOptions(hoursMap, timeHourStart);

	const precision = timePickerPrecision || 30;
	const length = defaultLength || 30;
	const start = new Date(date);
	start.setSeconds(0);
	start.setMilliseconds(0);

	useEffect(() => {
		start.setHours(parseInt(timeHourStart));
		start.setMinutes(parseInt(timeMinuteStart));

		const available = checkAvailability(day, start, duration, precision);

		setField('available', available ? '1' : '0');
	}, [day, timeHourStart, timeMinuteStart, duration, precision]);

	return (
		<div>
			<FormFieldSet horizontal>
				<FormFieldSet
					horizontal
					legend={__('Start time', 'wpappointments')}
				>
					<FormField>
						<label
							className={formFieldStyles.fieldLabel}
							htmlFor="timeHourStart"
						>
							{__('Hour', 'wpappointments')}
						</label>
						<SelectControl
							id="timeHourStart"
							value={
								timeHourStart ||
								formatTimeForPicker(defaultStart.getHours())
							}
							options={hours}
							onChange={(value) =>
								setField('timeHourStart', value)
							}
							size="__unstable-large"
							hideLabelFromVision
							label={__('Hour', 'wpappointments')}
						/>
					</FormField>

					<FormField>
						<label
							className={formFieldStyles.fieldLabel}
							htmlFor="timeMinuteStart"
						>
							{__('Minute', 'wpappointments')}
						</label>
						<SelectControl
							id="timeMinuteStart"
							value={timeMinuteStart || '00'}
							options={minutes}
							onChange={(value) =>
								setField('timeMinuteStart', value)
							}
							size="__unstable-large"
							hideLabelFromVision
							label={__('Minute', 'wpappointments')}
						/>
					</FormField>
				</FormFieldSet>
				<FormFieldSet
					horizontal={true}
					legend={__('Duration', 'wpappointments')}
				>
					<FormField>
						<label
							className={formFieldStyles.fieldLabel}
							htmlFor="duration"
						>
							{__('Minutes', 'wpappointments')}
						</label>
						<NumberControl
							id="duration"
							value={duration || length}
							min={precision}
							step={precision}
							size="__unstable-large"
							onChange={(value) =>
								setField('duration', value ? +value : length)
							}
						/>
					</FormField>
				</FormFieldSet>
			</FormFieldSet>
		</div>
	);
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

	const iterations = Math.ceil(duration / precision);

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

function createMinuteOptions(
	hoursMap: Map<string, Hour[]>,
	currentHour: string
) {
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
