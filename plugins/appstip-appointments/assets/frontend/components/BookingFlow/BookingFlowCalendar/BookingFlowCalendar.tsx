import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import cn from 'obj-str';
import styles from './BookingFlowCalendar.module.css';
import CalendarGrid from './CalendarGrid';
import DayNoticePanel from './DayNoticePanel';
import TimeSlotPicker from './TimeSlotPicker';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

type Props = {
	onSlotSelected?: () => void;
};

export default function BookingFlowCalendar({ onSlotSelected }: Props = {}) {
	const {
		lilius,
		formData,
		setField,
		dayAvailability,
		dayNotices,
		attributes,
	} = useBookingFlowContext();

	const { selected } = lilius;
	const { alignment, slotsAsButtons, inlineTimePicker } = attributes;
	const { settings } = window.wpappointments;
	const defaultLength = settings?.appointments?.defaultLength || 30;
	const datetime = formData.datetime;

	const selectedDate = selected?.[0];
	const selectedDateKey = selectedDate
		? format(selectedDate, 'yyyy-MM-dd')
		: '';
	const selectedNotices = dayNotices[selectedDateKey] || [];
	const hasNotices = selectedNotices.length > 0;

	const [noticeDismissed, setNoticeDismissed] = useState(false);
	const showNotice = hasNotices && !noticeDismissed;

	useEffect(() => {
		setNoticeDismissed(false);
	}, [selectedDateKey]);

	// Clear any previously-picked time slot if it doesn't belong to the
	// newly-selected day/month. Prevents form submission with a stale ISO.
	useEffect(() => {
		if (!datetime) return;
		// Compare in local time (selectedDateKey is produced with local format).
		const datetimeDateKey = format(new Date(datetime), 'yyyy-MM-dd');
		if (selectedDateKey && datetimeDateKey !== selectedDateKey) {
			setField('datetime', '');
		}
	}, [selectedDateKey, datetime, setField]);

	const onDismiss = useCallback(() => {
		setNoticeDismissed(true);
	}, []);

	const onCalendarDayClick = useCallback(() => {
		setNoticeDismissed(false);
	}, []);

	const showTimeSlots =
		selectedDate &&
		!showNotice &&
		dayAvailability &&
		dayAvailability.length > 0;

	const timePicker = showTimeSlots && (
		<TimeSlotPicker
			date={selectedDate}
			slots={dayAvailability}
			datetime={datetime}
			alignment={alignment}
			slotsAsButtons={slotsAsButtons}
			inline={inlineTimePicker}
			defaultLength={defaultLength}
			onSelectSlot={(iso) => {
				setField('datetime', iso);
				onSlotSelected?.();
			}}
		/>
	);

	return (
		<>
			{inlineTimePicker ? (
				<div
					className={cn({
						[styles.inlineLayout]: true,
						[styles.inlineLayoutWithSlots]: !!showTimeSlots,
						[styles.inlineLayoutCenter]: alignment === 'Center',
						[styles.inlineLayoutRight]: alignment === 'Right',
					})}
				>
					<div
						className={styles.calendarWrapper}
						onClick={onCalendarDayClick}
					>
						<CalendarGrid />
						{showNotice && (
							<DayNoticePanel
								notices={selectedNotices}
								onDismiss={onDismiss}
							/>
						)}
					</div>
					<div
						className={cn({
							[styles.inlineTimeSlots]: true,
							[styles.inlineTimeSlotsVisible]: !!showTimeSlots,
						})}
					>
						{showTimeSlots && timePicker}
					</div>
				</div>
			) : (
				<>
					<div
						className={styles.calendarWrapper}
						onClick={onCalendarDayClick}
					>
						<CalendarGrid />
						{showNotice && (
							<DayNoticePanel
								notices={selectedNotices}
								onDismiss={onDismiss}
							/>
						)}
					</div>
					{timePicker}
				</>
			)}
		</>
	);
}
