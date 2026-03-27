import { addDays, addYears } from 'date-fns';
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
	const percentage = (totalAvailable / totalSlots) * 100;
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
