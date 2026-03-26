import { __ } from '@wordpress/i18n';
import { format } from 'date-fns';
import styles from './BookingFlowCalendar.module.css';
import CalendarGrid from './CalendarGrid';
import DayNoticePanel from './DayNoticePanel';
import TimeSlotPicker from './TimeSlotPicker';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowCalendar() {
	const { lilius, form, dayAvailability, dayNotices, attributes } =
		useBookingFlowContext();

	const { selected } = lilius;
	const {
		setValue,
		clearErrors,
		register,
		watch,
		formState: { errors },
	} = form;
	const { alignment, slotsAsButtons } = attributes;
	const { settings } = window.wpappointments;
	const defaultLength = settings?.appointments?.defaultLength || 30;
	const datetime = watch('datetime');

	const selectedDate = selected?.[0];
	const selectedDateKey = selectedDate
		? format(selectedDate, 'yyyy-MM-dd')
		: '';
	const selectedNotices = dayNotices[selectedDateKey] || [];
	const hasNotices = selectedNotices.length > 0;

	return (
		<>
			<CalendarGrid />

			{selectedDate && hasNotices && (
				<DayNoticePanel notices={selectedNotices} />
			)}

			{selectedDate && !hasNotices && dayAvailability && (
				<TimeSlotPicker
					date={selectedDate}
					slots={dayAvailability}
					datetime={datetime}
					alignment={alignment}
					slotsAsButtons={slotsAsButtons}
					defaultLength={defaultLength}
					onSelectSlot={(iso) => {
						setValue('datetime', iso);
						clearErrors('datetime');
					}}
				/>
			)}

			<div>
				<input
					type="hidden"
					{...register('datetime', { required: true })}
				/>
				{errors.datetime && (
					<p className={styles.error}>
						{__('Please select a date and time', 'wpappointments')}
					</p>
				)}
			</div>
		</>
	);
}
