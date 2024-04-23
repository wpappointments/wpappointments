import { useFormContext } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { addDays, addMinutes } from 'date-fns';
import { formatTimeForPicker } from '~/backend/utils/format';
import useSlideout from '~/backend/hooks/useSlideout';
import { MonthIndex } from '~/backend/store/slideout/appointment/appointment.types';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import { type AppointmentFormFields } from '../AppointmentForm/AppointmentForm';
import DatePicker from '../FormField/DatePicker/DatePicker';
import Input from '../FormField/Input/Input';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import TimeFinder from '../TimeFinder/TimeFinder';
import Summary from './Summary/Summary';
import TimePicker from './TimePicker/TimePicker';
import styles from './TimeSelector.module.css';

export type TimeSelectorProps = {
	mode: 'edit' | 'create';
	appointment?: Appointment;
};

export default function TimeSelector({ mode, appointment }: TimeSelectorProps) {
	const { getValues, setValue, watch } =
		useFormContext<AppointmentFormFields>();

	const { openSlideOut, isSlideoutOpen, closeCurrentSlideOut } =
		useSlideout();
	const dispatch = useDispatch(store);

	const date = watch('date');
	const timeHourStart = watch('timeHourStart');
	const timeMinuteStart = watch('timeMinuteStart');
	const duration = watch('duration');
	const available = watch('available');

	const start = new Date(date);

	if (timeHourStart && timeMinuteStart) {
		start.setHours(parseInt(timeHourStart));
		start.setMinutes(parseInt(timeMinuteStart));
		start.setSeconds(0);
		start.setMilliseconds(0);
	}

	const timeHourEnd = formatTimeForPicker(
		addMinutes(start, duration).getHours()
	);
	const timeMinuteEnd = formatTimeForPicker(
		addMinutes(start, duration).getMinutes()
	);

	return (
		<SlideOut title={__('Select Time', 'wpappointments')} id="select-time">
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
								data: getValues(),
							});
						}}
					>
						{__('Find time', 'wpappointments')}
					</Button>
				</FormFieldSet>

				<FormFieldSet legend="Select day" style={{ maxWidth: '300px' }}>
					<DatePicker
						name="date"
						label="Date"
						defaultValue={
							mode === 'edit' && appointment
								? new Date(
										appointment.timestamp * 1000
									).toISOString()
								: new Date().toISOString()
						}
						isInvalidDate={(date) => {
							// TODO: make week days dynamic (from settings)
							return (
								addDays(new Date(), -1) > date ||
								date.getDay() === 0 ||
								date.getDay() === 6
							);
						}}
						startOfWeek={
							window.wpappointments.date.startOfWeek as
								| 0
								| 1
								| 2
								| 3
								| 4
								| 5
								| 6
						}
						events={[]} // TODO: add days with available spots to events
						onMonthPreviewed={(date) => {
							const _date = new Date(date);
							const month = _date.getMonth() as MonthIndex;
							const year = _date.getFullYear();
							dispatch.setCurrentMonth(month);
							dispatch.setCurrentYear(year);
						}}
					/>
				</FormFieldSet>

				{date && <TimePicker date={new Date(date)} />}

				{timeHourStart &&
					timeMinuteStart &&
					timeHourEnd &&
					timeMinuteEnd &&
					date && (
						<Summary
							date={new Date(date)}
							timeHourStart={timeHourStart}
							timeMinuteStart={timeMinuteStart}
							timeHourEnd={timeHourEnd}
							timeMinuteEnd={timeMinuteEnd}
							duration={duration}
							showAvailabilityWarning={available === '0'}
						/>
					)}

				<Input type="hidden" name="available" defaultValue="1" />

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
							setValue(
								'datetime',
								new Date(date).getTime().toString()
							);
							setValue('date', new Date(date).toISOString());
							closeCurrentSlideOut();
						}}
					>
						{available === '0'
							? __('Select time anyway', 'wpappointments')
							: __('Select time', 'wpappointments')}
					</Button>
				</div>

				{isSlideoutOpen(`find-time-${mode}`) && (
					<TimeFinder mode={mode} />
				)}
			</div>
		</SlideOut>
	);
}
