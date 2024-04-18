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
	minHour?: string | null;
};

type Option = {
	label: string;
	value: string;
	minutes?: { label: string; value: string }[];
};

export default function ScheduleTimePicker({
	day,
	index,
	timePickerPrecision,
	type,
	updateWorkingHoursTime,
	minHour,
}: Props) {
	const settings = useSelect(() => {
		return select(store).getAllSettings();
	}, []);

	const { schedule, general } = settings;
	const { clockType } = general;

	const options = createOptions(
		timePickerPrecision,
		clockType || '24',
		minHour || '0'
	);

	if (options.length === 0) {
		return null;
	}

	const hour = schedule[day].slots.list[index][type].hour;
	const hourIndex = parseInt(hour || minHour || '0');
	const minutes = options[hourIndex]?.minutes;

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
					options={options}
					defaultValue={hour}
					noArrow
				/>
				<span className={styles.timePickerSeparator}>:</span>
				{minutes && (
					<Select
						key={`${day}.slots.list.${index}.${type}.minute`}
						name={`${day}.slots.list.${index}.${type}.minute`}
						onChange={(value) => {
							updateWorkingHoursTime({
								values: schedule[day],
								value,
								index,
								type,
								time: 'minute',
							});
						}}
						options={minutes}
						defaultValue={schedule[day].slots.list[index][type].minute}
						noArrow
					/>
				)}
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

function createOptions(
	precision: number = 60,
	clockType: '12' | '24' = '24',
	minHour: string
) {
	const options: Option[] = [];
	const minHourInt = parseInt(minHour);

	const range = new DateRange(
		new Date(0, 0, 0, minHourInt, 0),
		new Date(0, 0, 0, 24, 0),
		precision
	);

	for (const date of range) {
		if (!date) {
			continue;
		}

		const index = parseInt(format(date, 'H'));

		if (!options[index]) {
			options[index] = {
				label: format(date, clockType === '24' ? 'HH' : 'h aaa'),
				value: format(date, 'HH'),
				minutes: [],
			};
		}

		const minutes = options[index].minutes;

		if (!minutes) {
			return [];
		}

		minutes.push({
			label: format(date, 'mm'),
			value: format(date, 'mm'),
		});
	}

	return options;
}