import { Button } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { FormFieldSet, SlideOut } from '@wpappointments/components';
import { WPDatePicker } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { addDays, addMinutes } from 'date-fns';
import { formatTimeForPicker } from '~/backend/utils/format';
import { MonthIndex } from '~/backend/store/slideout/appointment/appointment.types';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import { type AppointmentFormFields } from '../AppointmentForm/AppointmentForm';
import TimeFinder from '../TimeFinder/TimeFinder';
import Summary from './Summary/Summary';
import TimePicker from './TimePicker/TimePicker';
import styles from './TimeSelector.module.css';
import { useStateContext } from '~/backend/admin/context/StateContext';

export type TimeSelectorProps = {
	mode: 'edit' | 'create';
	appointment?: Appointment;
	formData: AppointmentFormFields;
	setField: <K extends keyof AppointmentFormFields>(
		field: K,
		value: AppointmentFormFields[K]
	) => void;
};

export default function TimeSelector({
	mode,
	appointment,
	formData,
	setField,
}: TimeSelectorProps) {
	const { openSlideOut, isSlideoutOpen, closeCurrentSlideOut } =
		useSlideout();
	const dispatch = useDispatch(store);
	const { getSelector } = useStateContext();

	const { currentMonth, currentYear } = useSelect((select) => {
		return {
			currentMonth: select(store).getCurrentMonth(),
			currentYear: select(store).getCurrentYear(),
		};
	}, []);

	const { coreEntityId } = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	const availability = useSelect(
		(select) => {
			return select(store).getAvailability(
				coreEntityId || 0,
				currentMonth,
				currentYear,
				Intl.DateTimeFormat().resolvedOptions().timeZone,
				getSelector('getAvailability')
			);
		},
		[coreEntityId, currentMonth, currentYear]
	);

	const { date, timeHourStart, timeMinuteStart, duration, available } =
		formData;

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
		<SlideOut
			title={__('Select Time', 'appointments-booking')}
			id="select-time"
		>
			<div className={styles.formGroup}>
				<FormFieldSet
					horizontal
					horizontalCenter
					fieldsClassName={styles.findTime}
				>
					{__(
						'Having trouble finding available time slot?',
						'appointments-booking'
					)}{' '}
					<Button
						icon={calendar}
						onClick={() => {
							openSlideOut({
								id: `find-time-${mode}`,
								data: formData,
							});
						}}
					>
						{__('Find time', 'appointments-booking')}
					</Button>
				</FormFieldSet>

				<FormFieldSet
					legend={__('Select day', 'appointments-booking')}
					style={{ maxWidth: '300px' }}
				>
					<WPDatePicker
						currentDate={
							date ||
							(mode === 'edit' && appointment
								? new Date(
										appointment.timestamp * 1000
									).toISOString()
								: new Date().toISOString())
						}
						onChange={(newDate) => {
							if (newDate) {
								setField('date', newDate);
							}
						}}
						isInvalidDate={(d) => {
							if (addDays(new Date(), -1) > d) {
								return true;
							}

							const dayData = availability.month.find(
								(day) =>
									new Date(day.date).toDateString() ===
									d.toDateString()
							);

							if (dayData) {
								return !dayData.available;
							}

							return false;
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
						events={[]}
						onMonthPreviewed={(date) => {
							const _date = new Date(date);
							const month = _date.getMonth() as MonthIndex;
							const year = _date.getFullYear();
							dispatch.setCurrentMonth(month);
							dispatch.setCurrentYear(year);
						}}
					/>
				</FormFieldSet>

				{date && (
					<TimePicker
						date={new Date(date)}
						formData={formData}
						setField={setField}
					/>
				)}

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
							setField(
								'datetime',
								new Date(date).getTime().toString()
							);
							setField('date', new Date(date).toISOString());
							closeCurrentSlideOut();
						}}
					>
						{available === '0'
							? __('Select time anyway', 'appointments-booking')
							: __('Select time', 'appointments-booking')}
					</Button>
				</div>

				{isSlideoutOpen(`find-time-${mode}`) && (
					<TimeFinder
						mode={mode}
						formData={formData}
						setField={setField}
					/>
				)}
			</div>
		</SlideOut>
	);
}
