import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSelect, select } from '@wordpress/data';
import { differenceInMinutes, addMinutes } from 'date-fns';
import { store } from '~/store/store';
import Select from '../FormField/Select/Select';
import FormFieldSet from '../FormFieldSet/FormFieldSet';

export default function StartEndTimePicker() {
	const { getValues, setValue, watch } = useFormContext();

	const { appointments, general } = useSelect(() => {
		return select(store).getAllSettings();
	}, []);

	const { timePickerPrecision, defaultLength } = appointments;
	const { clockType } = general;

	const precision = timePickerPrecision || 15;
	const length = defaultLength || 30;
	const type = clockType || 24;

	const [duration, setDuration] = useState(length);
	const [endMinuteMinValue, setEndMinuteMinValue] = useState(0);

	useEffect(() => {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		const day = now.getDate();
		const hour = now.getHours();

		const start = new Date(year, month, day, hour + 1, 0);
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

			const hourStart = parseInt(value['timeHourStart']) || 0;
			const minuteStart = parseInt(value['timeMinuteStart']) || 0;
			const hourEnd = parseInt(value['timeHourEnd']) || 0;
			const minuteEnd = parseInt(value['timeMinuteEnd']) || 0;

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
				}
			}

			if (type === 'change' && editingEndDate) {
				const startDate = new Date(
					year,
					month,
					day,
					hourStart,
					minuteStart
				);

				const endDate = new Date(year, month, day, hourEnd, minuteEnd);

				if (!isNaN(endDate.getTime()) && !isNaN(startDate.getTime())) {
					setDuration(differenceInMinutes(endDate, startDate));
				}
			}

			if (minuteStart + duration >= 60) {
				setEndMinuteMinValue(0);
			} else {
				setEndMinuteMinValue(minuteStart + precision);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [watch, duration]);

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
						options={createHourOptions(type)}
						fullWidth
					/>

					<Select
						name="timeMinuteStart"
						label="Minute"
						rules={{
							required: true,
						}}
						options={createMinuteOptions(precision)}
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
							type,
							parseInt(getValues('timeHourStart'))
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
							precision,
							endMinuteMinValue
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

function createHourOptions(clockType: 12 | 24 = 24, minHour = 0) {
	const hours = [];

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
			label: i > 7 ? `⚈ ${hour}` : `⚆ ${hour}`,
			value: hour,
		});
	}

	if (!is24) {
		hours.push(hours[0]);
		hours.shift();
	}

	return hours;
}

function createMinuteOptions(precision: number = 30, minMinute = 0) {
	const minutes = [];

	for (let i = minMinute; i < 60; i += precision) {
		const minute = i.toString().padStart(2, '0');

		minutes.push({
			label: i > 7 ? `⚈ ${minute}` : `⚆ ${minute}`,
			value: minute,
		});
	}

	return minutes;
}
