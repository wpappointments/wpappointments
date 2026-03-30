import { useFormContext } from 'react-hook-form';
import { useSelect, select } from '@wordpress/data';
import { Select } from '@wpappointments/components';
import { addMinutes, format } from 'date-fns';
import type { Day } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import styles from './ScheduleTimePicker.module.css';

type Props = {
	day: Day;
	index: number;
	timePickerPrecision?: number;
	type: 'start' | 'end';
	onTimeChange: (args: {
		value: string;
		index: number;
		type: 'start' | 'end';
		time: 'hour' | 'minute';
	}) => void;
	minHour?: string | null;
};

type HourOption = {
	label: string;
	value: string;
	minutes: { label: string; value: string }[];
};

export default function ScheduleTimePicker({
	day,
	index,
	timePickerPrecision,
	type,
	onTimeChange,
	minHour,
}: Props) {
	const { watch } = useFormContext();
	const generalSettings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const rawClockType: string = generalSettings?.clockType || '24';
	const clockType: '12' | '24' = rawClockType.startsWith('12') ? '12' : '24';

	const allHours = createHourOptions(
		timePickerPrecision,
		clockType,
		minHour || '0'
	);

	// Hour 24 only available for end pickers
	const hourOptions =
		type === 'start' ? allHours.filter((h) => h.value !== '24') : allHours;

	if (hourOptions.length === 0) {
		return null;
	}

	const currentHour = watch(`${day}.slots.list.${index}.${type}.hour`);
	const currentHourOption = allHours.find(
		(h) => h.value === (currentHour || minHour || '00')
	);
	const minutes = currentHourOption?.minutes || allHours[0]?.minutes || [];

	return (
		<div className={styles.timePicker}>
			<div className={styles.timePickerControl}>
				<Select
					key={`${day}.slots.list.${index}.${type}.hour`}
					name={`${day}.slots.list.${index}.${type}.hour`}
					onChange={(value) => {
						onTimeChange({
							value,
							index,
							type,
							time: 'hour',
						});

						// When selecting hour 24, force minute to 00
						if (value === '24') {
							onTimeChange({
								value: '00',
								index,
								type,
								time: 'minute',
							});
						}
					}}
					options={hourOptions}
					noArrow
				/>
				<span className={styles.timePickerSeparator}>:</span>
				<Select
					key={`${day}.slots.list.${index}.${type}.minute-${currentHour}`}
					name={`${day}.slots.list.${index}.${type}.minute`}
					onChange={(value) => {
						onTimeChange({
							value,
							index,
							type,
							time: 'minute',
						});
					}}
					options={minutes}
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
		const end = this.end;
		const interval = this.interval;
		let current = this.start;

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

function createHourOptions(
	precision: number = 60,
	clockType: '12' | '24' = '24',
	minHour: string
): HourOption[] {
	const byIndex: Record<number, HourOption> = {};
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

		const hourNum = parseInt(format(date, 'H'));

		if (!byIndex[hourNum]) {
			byIndex[hourNum] = {
				label: format(date, clockType === '24' ? 'HH' : 'h aaa'),
				value: format(date, 'HH'),
				minutes: [],
			};
		}

		byIndex[hourNum].minutes.push({
			label: format(date, 'mm'),
			value: format(date, 'mm'),
		});
	}

	// Add hour 24 (end of day) as the last option
	byIndex[24] = {
		label: clockType === '24' ? '24' : '12 am',
		value: '24',
		minutes: [{ label: '00', value: '00' }],
	};

	// Return as a flat sorted array (no sparse gaps)
	return Object.keys(byIndex)
		.map(Number)
		.sort((a, b) => a - b)
		.map((k) => byIndex[k]);
}
