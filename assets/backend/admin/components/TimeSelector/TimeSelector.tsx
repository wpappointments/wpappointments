import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { addDays } from 'date-fns';
import { date, number, object, optional, safeParse } from 'valibot';
import { formatTimeForPicker } from '~/utils/format';
import useSlideout from '~/hooks/useSlideout';
import { MonthIndex } from '~/store/slideout/appointment/appointment.types';
import { store } from '~/store/store';
import { AppointmentFormFields } from '../AppointmentForm/AppoitmentForm';
import DatePicker from '../FormField/DatePicker/DatePicker';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import TimeFinder from '../TimeFinder/TimeFinder';
import TimePicker from './TimePicker/TimePicker';
import styles from './TimeSelector.module.css';

const TimeSelectorDataSchema = object({
	defaultDate: optional(date()),
	defaultDateToday: optional(date()),
	duration: optional(number()),
});

export type TimeSelectorProps = {
	mode: 'create' | 'edit' | 'view';
};

export default function TimeSelector({ mode }: TimeSelectorProps) {
	const dispatch = useDispatch(store);
	const { getValues, setValue, watch } =
		useFormContext<AppointmentFormFields>();
	const { currentSlideout, openSlideOut } = useSlideout();
	const parsedData = safeParse(TimeSelectorDataSchema, currentSlideout?.data);

	const { appointments } = useSelect(() => {
		return select(store).getAllSettings();
	}, []);

	const { defaultLength } = appointments;
	const defaultDuration = defaultLength || 30;

	const { output, success } = parsedData;

	const date = watch('date');

	useEffect(() => {
		if (!success) {
			return;
		}

		const { defaultDate, defaultDateToday, duration } = output;
		const _duration = duration || defaultDuration;

		const defaultStart = defaultDate || defaultDateToday;
		defaultStart?.setHours(defaultStart.getHours() + 1);
		defaultStart?.setMinutes(0);
		defaultStart?.setSeconds(0);
		defaultStart?.setMilliseconds(0);

		const defaultStartHour = defaultStart?.getHours() || 0;
		const defaultStartMinute = defaultStart?.getMinutes() || 0;

		setValue('date', defaultStart?.toISOString() || '');
		setValue('timeHourStart', formatTimeForPicker(defaultStartHour));
		setValue('timeMinuteStart', formatTimeForPicker(defaultStartMinute));
		setValue('duration', _duration);
	}, [success]);

	if (!success) {
		return __('Error: invalid slideout data.', 'wpappointments');
	}

	return (
		<div className={styles.formGroup}>
			<FormFieldSet
				horizontal
				horizontalCenter
				fieldsClassName={styles.findTime}
			>
				Having trouble finding available time slot?{' '}
				<Button
					icon={calendar}
					onClick={() => {
						openSlideOut({
							id: `find-time-${mode}`,
							parentId: 'add-appointment',
							data: getValues(),
						});
					}}
				>
					Find time
				</Button>
			</FormFieldSet>

			<FormFieldSet legend="Select day" style={{ maxWidth: '300px' }}>
				<DatePicker
					name="date"
					label="Date"
					isInvalidDate={(date) => {
						// TODO:
						return (
							addDays(new Date(), -1) > date ||
							date.getDay() === 0 ||
							date.getDay() === 6
						);
					}}
					startOfWeek={1}
					events={[
						{
							date: new Date('2024-01-22T21:22:50.694Z'),
						},
						{
							date: new Date('2024-01-24T21:22:50.694Z'),
						},
						{
							date: new Date('2024-01-26T21:22:50.694Z'),
						},
						{
							date: new Date('2024-01-28T21:22:50.694Z'),
						},
					]}
					onMonthPreviewed={(date) => {
						const _date = new Date(date);
						dispatch.setCurrentMonth(
							_date.getMonth() as MonthIndex
						);
						dispatch.setCurrentYear(_date.getFullYear());
					}}
				/>
			</FormFieldSet>

			<TimePicker date={new Date(date)} />

			<SlideOut title={__('Find time')} id={`find-time-${mode}`}>
				<TimeFinder />
			</SlideOut>
		</div>
	);
}
