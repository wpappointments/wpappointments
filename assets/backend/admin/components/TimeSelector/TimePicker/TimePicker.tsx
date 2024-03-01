import { useFormContext } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addHours, addMinutes } from 'date-fns';
import { getRangesAvailableSlots, timeRangesContainAnother } from '~/backend/utils/appointments';
import { createTimeRange, createTimeRangeFromMinutes } from '~/backend/utils/datetime';
import { formatTimeForPicker } from '~/backend/utils/format';
import useSlideout from '~/backend/hooks/useSlideout';
import { SettingsSchedule } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import Number from '../../FormField/Number/Number';
import Select from '../../FormField/Select/Select';
import FormFieldSet from '../../FormFieldSet/FormFieldSet';
import Summary from '../Summary/Summary';


export type StartEndTimePickerProps = {
	date: Date;
};

type Fields = {
	timeHourStart: string;
	timeMinuteStart: string;
	duration: number;
	datetime: string;
	date: string;
};

// TODO: use dat-fns locale for this
const daysOfWeek = new Map<number, keyof SettingsSchedule>([
	[0, 'sunday'],
	[1, 'monday'],
	[2, 'tuesday'],
	[3, 'wednesday'],
	[4, 'thursday'],
	[5, 'friday'],
	[6, 'saturday'],
]);

function test(date: Date, schedule: SettingsSchedule, length: number) {
	const daySchedule = daysOfWeek.get(date.getDay());

	if (!daySchedule) {
		return;
	}

	const daySlots = schedule[daySchedule].slots.list;
	const availableSlots = getRangesAvailableSlots(
		daySlots,
		date,
		createTimeRangeFromMinutes(length),
		true
	);

	const hours = new Set<string>();
	const minutes = new Map<string, string[]>();
	const availableRanges: [Date, Date][] = [];

	for (const slots of availableSlots) {
		slots.forEach((date, i) => {
			const hour = formatTimeForPicker(date.getHours());
			const minute = formatTimeForPicker(date.getMinutes());

			if (i < slots.length - 1) {
				hours.add(hour);

				if (!minutes.has(hour)) {
					minutes.set(hour, []);
				}

				minutes.get(hour)?.push(minute);
			}

			if (i === slots.length - 1) {
				availableRanges.push([slots[0], slots[slots.length - 1]]);
			}
		});
	}

	return {
		availableHours: hours,
		availableMinutes: minutes,
		availableRanges,
	};
}

export default function TimePicker({ date }: StartEndTimePickerProps) {
	const { setValue, watch } = useFormContext<Fields>();
	const { closeCurrentSlideOut } = useSlideout();

	const { appointments, general, schedule } = useSelect(() => {
		return select(store).getAllSettings();
	}, []);

	const duration = watch('duration');
	const timeHourStart = watch('timeHourStart');
	const timeMinuteStart = watch('timeMinuteStart');

	const start = new Date(date);
	start.setHours(parseInt(timeHourStart));
	start.setMinutes(parseInt(timeMinuteStart));
	start.setSeconds(0);
	start.setMilliseconds(0);

	const timeHourEnd = formatTimeForPicker(
		addMinutes(start, duration).getHours()
	);
	const timeMinuteEnd = formatTimeForPicker(
		addMinutes(start, duration).getMinutes()
	);

	const { timePickerPrecision, defaultLength } = appointments;
	const { clockType } = general;

	const precision = timePickerPrecision || 15;
	const length = defaultLength || 30;
	const type = clockType || 24;

	const { availableHours, availableMinutes, availableRanges } =
		test(date, schedule, duration || length) || {};

	const end = addMinutes(start, duration);

	const isOutside = !timeRangesContainAnother(
		availableRanges || [],
		createTimeRange(start, end)
	);

	const defaultStart = addHours(new Date(), 1);
	defaultStart.setMinutes(0);
	defaultStart.setSeconds(0);
	defaultStart.setMilliseconds(0);

	const defaultTimeHourEnd = formatTimeForPicker(
		addMinutes(defaultStart, length).getHours()
	);
	const defaultTimeMinuteEnd = formatTimeForPicker(
		addMinutes(defaultStart, length).getMinutes()
	);

	return (
		<FormFieldSet>
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
						options={createHourOptions(availableHours, type)}
						fullWidth
					/>

					<Select
						name="timeMinuteStart"
						label="Minute"
						defaultValue="00"
						rules={{
							required: true,
						}}
						options={createMinuteOptions(
							availableMinutes,
							timeHourStart,
							precision
						)}
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

			{timeHourStart && timeMinuteStart && (
				<Summary
					date={date}
					timeHourStart={timeHourStart}
					timeMinuteStart={timeMinuteStart}
					timeHourEnd={timeHourEnd || defaultTimeHourEnd}
					timeMinuteEnd={timeMinuteEnd || defaultTimeMinuteEnd}
					duration={duration || length}
					isDateOutsideWorkingHours={isOutside}
				/>
			)}

			<div style={{ marginTop: '20px' }}>
				<Button
					type="button"
					variant="primary"
					style={{
						width: '100%',
						justifyContent: 'center',
						padding: '22px 0px',
					}}
					onClick={() => {
						setValue('datetime', start.getTime().toString());
						setValue('date', start.toISOString());
						closeCurrentSlideOut();
					}}
				>
					{isOutside
						? __('Select time anyway', 'wpappointments')
						: __('Select time', 'wpappointments')}
				</Button>
			</div>
		</FormFieldSet>
	);
}

export function createHourOptions(
	availableHours: Set<string> | undefined,
	clockType: '12' | '24' = '24',
	minHour = 0
) {
	const hours: {
		label: string;
		value: string;
	}[] = [];

	if (!availableHours) {
		return hours;
	}

	const is24 = clockType === '24';

	for (let i = minHour; i < 24; i++) {
		let hour = i.toString().padStart(2, '0');
		let label = hour;

		if (!is24) {
			if (i <= 12) {
				label = i + ' am';
			}

			if (i > 12) {
				label = i - 12 + ' pm';
			}

			if (i === 0) {
				label = '12 pm';
			}
		}

		hours.push({
			label: availableHours.has(hour.toString())
				? `⚈ ${label}`
				: `⚆ ${label}`,
			value: hour,
		});
	}

	if (!is24) {
		hours.push(hours[0]);
		hours.shift();
	}

	return hours;
}

export function createMinuteOptions(
	availableMinutes: Map<string, string[]> | undefined,
	currentHour: string,
	precision: number = 30,
	minMinute = 0
) {
	const minutes = [];

	for (let i = minMinute; i < 60; i += precision) {
		const minute = i.toString().padStart(2, '0');

		minutes.push({
			label:
				availableMinutes?.has(currentHour) &&
				availableMinutes.get(currentHour)?.includes(minute)
					? `⚈ ${minute}`
					: `⚆ ${minute}`,
			value: minute,
		});
	}

	return minutes;
}