import { useState } from 'react';
import { useSelect, select } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
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

	const { schedule, general } = settings;
	const { clockType } = general;
	const [selectedHour, setSelectedHour] = useState<number>(0);
	const [availableMinutes, setAvailableMinutes] = useState({
		label: '00',
		value: '00',
	});

	const allDayOptions = createAllDayOptions(
		timePickerPrecision,
		clockType || '24'
	);

	useEffect(() => {
		setAvailableMinutes(allDayOptions[selectedHour]?.hours ?? []);
	}, [selectedHour]);

	const handleMinuteChange = useCallback(
		(value: string) => {
			setSelectedHour(parseInt(value, 10));
		},
		[setSelectedHour]
	);

	return (
		<div className={styles.timePicker}>
			<div className={styles.timePickerControl}>
				<Select
					key={`${day}.slots.list.${index}.${type}.hour`}
					name={`${day}.slots.list.${index}.${type}.hour`}
					onChange={handleMinuteChange}
					options={allDayOptions}
					defaultValue={'00'}
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
					options={availableMinutes}
					defaultValue={'00'}
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

function createHourOptions(
	type: 'start' | 'end',
	minHour: string | null,
	clockType: '12' | '24' = '24'
) {
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
			label: format(date, clockType === '24' ? 'HH' : 'h aaa'),
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

function createAllDayOptions(
	precision: number = 60,
	clockType: '12' | '24' = '24'
) {
	const options = [];

	const range = new DateRange(
		new Date(0, 0, 0, 0, 0),
		new Date(0, 0, 0, 24, 0),
		precision
	);

	for (const date of range) {
		if (!date) {
			continue;
		}

		const index = format(date, 'H');

		if (!options[index]) {
			options[index] = {
				label: format(date, clockType === '24' ? 'HH' : 'h aa'),
				value: format(date, 'H'),
				hours: [],
			};
		}

		options[index].hours.push({
			label: format(date, 'mm'),
			value: format(date, 'mm'),
		});
	}

	return options;
}
