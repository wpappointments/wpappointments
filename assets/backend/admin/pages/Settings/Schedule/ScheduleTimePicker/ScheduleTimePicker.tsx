import { useSelect, select } from '@wordpress/data';
import { addMinutes, format } from 'date-fns';
import { DayOpeningHours, SettingsSchedule } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import styles from './ScheduleTimePicker.module.css';
import Select from '~/backend/admin/components/FormField/Select/Select';

type Props = {
	day: keyof SettingsSchedule;
	index: number;
	timePickerPrecision?: number;
	type: 'start' | 'end';
	updateWorkingHoursTime: (args: {
		values: DayOpeningHours;
		value: string;
		index: number;
		type: 'start' | 'end';
		time: 'hour' | 'minute';
	}) => void;
};

export default function ScheduleTimePicker({
	day,
	index,
	timePickerPrecision,
	type,
	updateWorkingHoursTime,
}: Props) {
	const settings = useSelect(() => {
		return select(store).getAllSettings();
	}, []);

	const { schedule, appointments, general } = settings;
	const { clockType } = general;

	return (
		<div className={styles.timePicker}>
			<div className={styles.timePickerControl}>
				<Select
					key={`${day}.slots.list.${index}.${type}.hour`}
					name={`${day}.slots.list.${index}.${type}.hour`}
					onChange={(value) => {
						updateWorkingHoursTime({
							values: schedule[day],
							value,
							index,
							type,
							time: 'hour',
						});
					}}
					options={createHourOptions(
						type,
						schedule[day].slots.list[index].start.hour,
						clockType || 24
					)}
					defaultValue={
						schedule[day].slots.list[index][type].hour ?? '00'
					}
					noArrow
				/>
				<span className={styles.timePickerSeparator}>:</span>
				<Select
					key={`${day}.slots.list.${index}.${type}.minute`}
					name={`${day}.slots.list.${index}.${type}.minute`}
					onChange={(value) => {
						updateWorkingHoursTime({
							values: schedule[day],
							value: value,
							index,
							type,
							time: 'minute',
						});
					}}
					options={createMinuteOptions(
						appointments.timePickerPrecision
					)}
					defaultValue={
						schedule[day].slots.list[index][type].minute ?? '00'
					}
					noArrow
				/>
			</div>
		</div>
	);
}

class DateRange {
	start: Date;
	end: Date;
	interval: number;

	constructor(start: Date, end: Date, interval: number) {
		this.start = start;
		this.end = end;
		this.interval = interval;
	}

	[Symbol.iterator]() {
		const start = this.start;
		const end = this.end;
		const interval = this.interval;

		let current = start;

		return {
			next() {
				if (current < end) {
					const value = current;
					current = addMinutes(current, interval);
					return { value, done: false };
				}

				return { done: true };
			},
		};
	}
}

function createHourOptions(type: 'start' | 'end', minHour: string | null, clockType: number) {
	const options = [];
	let min = 0;

	if (minHour && type === 'end') {
		min = parseInt(minHour, 10);
	}

	const range = new DateRange(
		new Date(0, 0, 0, min, 0),
		new Date(0, 0, 0, 24, 0),
		60
	);

	for (const date of range) {
		if (!date) {
			continue;
		}

		options.push({
			label: format(date, clockType === 24 ? 'HH' : 'h aaa'),
			value: format(date, 'HH'),
		});
	}

	return options;
}

function createMinuteOptions(precision = 30) {
	const options = [];

	const range = new DateRange(
		new Date(0, 0, 0, 0, 0),
		new Date(0, 0, 0, 0, 60),
		precision
	);

	for (const date of range) {
		if (!date) {
			continue;
		}

		options.push({
			label: format(date, 'mm'),
			value: format(date, 'mm'),
		});
	}

	return options;
}