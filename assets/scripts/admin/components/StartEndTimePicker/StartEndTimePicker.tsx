import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSelect, select } from '@wordpress/data';
import { differenceInMinutes, addMinutes, addHours } from 'date-fns';
import { getRangesAvailableSlots } from '~/utils/appointments';
import { createTimeRangeFromMinutes } from '~/utils/datetime';
import { formatTimeForPicker } from '~/utils/format';
import { SettingsSchedule } from '~/store/settings/settings.types';
import { store } from '~/store/store';
import Select from '../FormField/Select/Select';
import FormFieldSet from '../FormFieldSet/FormFieldSet';

export type StartEndTimePickerProps = {
	date: Date;
};

type Fields = {
	timeHourStart: string;
	timeMinuteStart: string;
	timeHourEnd: string;
	timeMinuteEnd: string;
	timeType: 'am' | 'pm';
};

const daysOfWeek = new Map<number, keyof SettingsSchedule>([
	[0, 'sunday'],
	[1, 'monday'],
	[2, 'tuesday'],
	[3, 'wednesday'],
	[4, 'thursday'],
	[5, 'friday'],
	[6, 'saturday'],
]);

export default function StartEndTimePicker({ date }: StartEndTimePickerProps) {
	const { getValues, setValue, watch } = useFormContext<Fields>();

	const { appointments, general, schedule } = useSelect(() => {
		return select(store).getAllSettings();
	}, []);

	const { timePickerPrecision, defaultLength } = appointments;
	const { clockType } = general;

	const precision = timePickerPrecision || 15;
	const length = defaultLength || 30;
	const type = clockType || 24;

	const [duration, setDuration] = useState(length);

	const [availableHours, setAvailableHours] = useState<Set<string>>();
	const [availableMinutes, setAvailableMinutes] =
		useState<Map<string, string[]>>();

	const [minEndHour, setMinEndHour] = useState(0);
	const [minEndMinute, setMinEndMinute] = useState(0);

	useEffect(() => {
		if (!date) {
			return;
		}

		if (typeof date === 'string') {
			date = new Date(date);
		}

		const daySchedule = daysOfWeek.get(date.getDay());

		if (!daySchedule) {
			return;
		}

		const monday = schedule[daySchedule].slots.list;

		const availableSlots = getRangesAvailableSlots(
			monday,
			createTimeRangeFromMinutes(30)
		);

		const hours = new Set<string>();
		const minutes = new Map<string, string[]>();

		for (const slot of availableSlots) {
			slot.forEach((date) => {
				const hour = formatTimeForPicker(date.getHours());

				hours.add(hour);

				if (!minutes.has(hour)) {
					minutes.set(hour, []);
				}

				minutes.get(hour)?.push(formatTimeForPicker(date.getMinutes()));
			});
		}

		setAvailableHours(hours);
		setAvailableMinutes(minutes);

		const startDate = date;
		const endDate = addMinutes(startDate, duration);

		if (endDate.getHours() === startDate.getHours()) {
			setMinEndMinute(startDate.getMinutes() + precision);
		} else {
			setMinEndMinute(0);
		}
	}, [schedule, date]);

	useEffect(() => {
		const now = new Date();
		now.setMinutes(0);
		now.setSeconds(0);
		now.setMilliseconds(0);

		const start = addHours(now, 1);
		const end = addMinutes(start, length);

		setDuration(length);

		setValue('timeHourStart', start.getHours().toString().padStart(2, '0'));
		setValue('timeMinuteStart', '00');
		setValue('timeHourEnd', end.getHours().toString().padStart(2, '0'));
		setValue('timeMinuteEnd', end.getMinutes().toString().padStart(2, '0'));
	}, [length]);

	useEffect(() => {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		const day = now.getDate();

		const subscription = watch((value, { name, type }) => {
			if (!name) {
				return;
			}

			const editingStartDate = [
				'timeHourStart',
				'timeMinuteStart',
			].includes(name);

			const editingEndDate = ['timeHourEnd', 'timeMinuteEnd'].includes(
				name
			);

			const hourStart = parseInt(value['timeHourStart'] || '0');
			const minuteStart = parseInt(value['timeMinuteStart'] || '0');
			const hourEnd = parseInt(value['timeHourEnd'] || '0');
			const minuteEnd = parseInt(value['timeMinuteEnd'] || '0');

			if (type === 'change' && editingStartDate) {
				const startDate = new Date(
					year,
					month,
					day,
					hourStart,
					minuteStart
				);
				const endDate = addMinutes(startDate, duration);

				if (!isNaN(endDate.getTime())) {
					setValue(
						'timeHourEnd',
						endDate.getHours().toString().padStart(2, '0')
					);
					setValue(
						'timeMinuteEnd',
						endDate.getMinutes().toString().padStart(2, '0')
					);
					setMinEndHour(hourStart);
				}

				if (endDate.getHours() === startDate.getHours()) {
					setMinEndMinute(minuteStart + precision);
				} else {
					setMinEndMinute(0);
				}
			}

			if (type === 'change' && editingEndDate) {
				const startDate = new Date(
					year,
					month,
					day,
					hourStart,
					minuteStart,
					0,
					0
				);

				const endDate = new Date(
					year,
					month,
					day,
					hourEnd,
					minuteEnd,
					0,
					0
				);

				if (!isNaN(endDate.getTime()) && !isNaN(startDate.getTime())) {
					setDuration(differenceInMinutes(endDate, startDate));
				}

				if (endDate.getHours() === startDate.getHours()) {
					setMinEndMinute(minuteStart + precision);
				} else {
					setMinEndMinute(0);
				}
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [watch, duration, precision]);

	return (
		<FormFieldSet>
			<FormFieldSet horizontal>
				<FormFieldSet horizontal legend="Start time">
					<Select
						name="timeHourStart"
						label="Hour"
						rules={{
							required: true,
						}}
						options={createHourOptions(availableHours, type)}
						fullWidth
					/>

					<Select
						name="timeMinuteStart"
						label="Minute"
						rules={{
							required: true,
						}}
						options={createMinuteOptions(
							availableMinutes,
							getValues('timeHourStart'),
							precision
						)}
						fullWidth
					/>

					{type === 12 && (
						<Select
							name="timeType"
							label="-"
							rules={{
								required: true,
							}}
							options={[
								{ label: 'a.m.', value: 'am' },
								{ label: 'p.m.', value: 'pm' },
							]}
							fullWidth
						/>
					)}
				</FormFieldSet>
				<FormFieldSet horizontal={true} legend="End time">
					<Select
						name="timeHourEnd"
						label="Hour"
						rules={{
							required: true,
						}}
						options={createHourOptions(
							availableHours,
							type,
							minEndHour
						)}
						fullWidth
					/>

					<Select
						name="timeMinuteEnd"
						label="Minute"
						rules={{
							required: true,
						}}
						options={createMinuteOptions(
							availableMinutes,
							getValues('timeHourEnd'),
							precision,
							minEndMinute
						)}
						fullWidth
					/>

					{type === 12 && (
						<Select
							name="timeType"
							label="-"
							rules={{
								required: true,
							}}
							options={[
								{ label: 'a.m.', value: 'am' },
								{ label: 'p.m.', value: 'pm' },
							]}
						/>
					)}
				</FormFieldSet>
			</FormFieldSet>
			<i>Duration: {duration} minutes</i>
		</FormFieldSet>
	);
}

function createHourOptions(
	availableHours: Set<string> | undefined,
	clockType: 12 | 24 = 24,
	minHour = 0
) {
	const hours: {
		label: string;
		value: string;
	}[] = [];

	if (!availableHours) {
		return hours;
	}

	const is24 = clockType === 24;
	const hoursLimit = is24 ? 24 : 12;

	for (let i = minHour; i < hoursLimit; i++) {
		let hour = i.toString();

		if (is24) {
			hour = hour.padStart(2, '0');
		}

		if (!is24 && i === 0) {
			hour = '12';
		}

		hours.push({
			label: availableHours.has(hour.toString())
				? `⚈ ${hour}`
				: `⚆ ${hour}`,
			value: hour,
		});
	}

	if (!is24) {
		hours.push(hours[0]);
		hours.shift();
	}

	return hours;
}

function createMinuteOptions(
	availableMinutes: Map<string, string[]> | undefined,
	currentHour: string,
	precision: number = 30,
	minMinute = 0
) {
	const minutes = [];

	for (let i = minMinute; i < 60; i += precision) {
		const minute = i.toString().padStart(2, '0');

		minutes.push({
			label: availableMinutes?.has(currentHour)
				? `⚈ ${minute}`
				: `⚆ ${minute}`,
			value: minute,
		});
	}

	return minutes;
}
