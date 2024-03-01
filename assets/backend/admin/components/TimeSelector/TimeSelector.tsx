import { useFormContext } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { addDays } from 'date-fns';
import useSlideout from '~/backend/hooks/useSlideout';
import { MonthIndex } from '~/backend/store/slideout/appointment/appointment.types';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import { type AppointmentFormFields } from '../AppointmentForm/AppointmentForm';
import DatePicker from '../FormField/DatePicker/DatePicker';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import TimeFinder from '../TimeFinder/TimeFinder';
import TimePicker from './TimePicker/TimePicker';
import styles from './TimeSelector.module.css';

export type TimeSelectorProps = {
	mode: 'edit' | 'create';
	appointment?: Appointment;
};

export default function TimeSelector({ mode, appointment }: TimeSelectorProps) {
	const { getValues, watch } = useFormContext<AppointmentFormFields>();

	const { openSlideOut, isSlideoutOpen } = useSlideout();
	const dispatch = useDispatch(store);

	const date = watch('date');

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
						startOfWeek={1} // TODO: get from settings
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

				<TimePicker date={new Date(date)} />

				{isSlideoutOpen(`find-time-${mode}`) && (
					<TimeFinder mode={mode} />
				)}
			</div>
		</SlideOut>
	);
}
