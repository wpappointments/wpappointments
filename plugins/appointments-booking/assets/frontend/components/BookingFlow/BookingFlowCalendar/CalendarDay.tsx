import { __, _n, sprintf } from '@wordpress/i18n';
import { addDays, addYears, format } from 'date-fns';
import cn from 'obj-str';
import styles from './BookingFlowCalendar.module.css';
import type { DayCalendar, DayNotice } from '~/frontend/frontend';

type Threshold = 'High' | 'Medium' | 'Low' | 'Limited';

type Props = {
	day: DayCalendar;
	date: Date;
	notices: DayNotice[];
	isSelected: boolean;
	isInCurrentMonth: boolean;
	inRange: (d: Date, min: Date, max: Date) => boolean;
	onSelect: () => void;
};

function getThreshold(totalAvailable: number, totalSlots: number): Threshold {
	if (totalSlots <= 0) return 'Limited';

	const percentage = (totalAvailable / totalSlots) * 100;

	if (percentage < 15 || totalAvailable === 1) return 'Limited';
	if (percentage < 30) return 'Low';
	if (percentage < 50) return 'Medium';
	return 'High';
}

export default function CalendarDay({
	day,
	date,
	notices,
	isSelected,
	isInCurrentMonth,
	inRange,
	onSelect,
}: Props) {
	const totalSlots = day.totalSlots || 0;
	const totalAvailable = day.totalAvailable || 0;
	const percentage = totalSlots > 0 ? (totalAvailable / totalSlots) * 100 : 0;
	const threshold = getThreshold(totalAvailable, totalSlots);
	const hasNotices = notices.length > 0;
	const isInFutureRange = inRange(
		date,
		addDays(new Date(), -1),
		addYears(new Date(), 500)
	);

	const noticeTitle = hasNotices
		? notices
				.map((n) => n.note || '')
				.filter(Boolean)
				.join(', ')
		: undefined;

	// Screen-reader-friendly label: "Wednesday, March 12 — 5 of 8 slots available"
	// or "Monday, March 11 — unavailable" / "… — has notice: vacation".
	const dateLabel = format(date, 'EEEE, MMMM d');
	let availabilityLabel: string;
	if (hasNotices) {
		availabilityLabel = sprintf(
			/* translators: %s: comma-separated list of day notices (e.g. "Vacation"). */
			__('has notice: %s', 'appointments-booking'),
			noticeTitle ?? __('unavailable', 'appointments-booking')
		);
	} else if (!isInFutureRange) {
		availabilityLabel = __('past date', 'appointments-booking');
	} else if (!day.available || totalAvailable === 0) {
		availabilityLabel = __('no slots available', 'appointments-booking');
	} else {
		availabilityLabel = sprintf(
			/* translators: 1: number of available slots, 2: total number of slots */
			_n(
				'%1$d of %2$d slot available',
				'%1$d of %2$d slots available',
				totalAvailable,
				'appointments-booking'
			),
			totalAvailable,
			totalSlots
		);
	}
	const ariaLabel = `${dateLabel} — ${availabilityLabel}`;

	return (
		<button
			onClick={() => {
				if (hasNotices) {
					onSelect();
					return;
				}

				if (!day.available) return;
				onSelect();
			}}
			title={noticeTitle}
			aria-label={ariaLabel}
			aria-pressed={isSelected}
			className={cn({
				[styles.calendarDay]: true,
				[styles.calendarDaySelected]: isSelected,
				[styles.calendarDayInCurrentMonth]: isInCurrentMonth,
				[styles.calendarDayUnavailable]: !day.available,
				[styles.calendarDayHasNotice]: hasNotices,
				[styles[`calendarDayThreshold${threshold}`]]: true,
			})}
			type="button"
			disabled={!isInFutureRange || (!day.available && !hasNotices)}
		>
			{date.getDate()}
			{isInFutureRange && day.available && (
				<span className={styles.calendarDayAvailability}>
					<span style={{ width: `${percentage}%` }} />
				</span>
			)}
			{hasNotices && (
				<span className={styles.calendarDayNoticeIndicator} />
			)}
		</button>
	);
}
