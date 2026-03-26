import { format } from 'date-fns';
import styles from './BookingFlowCalendar.module.css';
import CalendarDay from './CalendarDay';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function CalendarGrid() {
	const {
		lilius,
		calendarWithAvailability,
		dayNotices,
		weekDays,
		availabilityLoading,
	} = useBookingFlowContext();

	const {
		inRange,
		isSelected,
		select,
		setSelected,
		viewing,
		viewNextMonth,
		viewPreviousMonth,
	} = lilius;

	const currentMonth = format(viewing, 'LLLL');
	const currentYear = viewing.getFullYear();

	return (
		<div className={styles.calendar}>
			<div className={styles.calendarControls}>
				<button
					onClick={() => {
						viewPreviousMonth();
						setSelected([]);
					}}
					type="button"
					disabled={
						viewing.getMonth() === new Date().getMonth() &&
						viewing.getFullYear() === new Date().getFullYear()
					}
					className={styles.calendarControlButton}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						aria-hidden="true"
					>
						<path d="M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z" />
					</svg>
				</button>
				<h5 className={styles.calendarMonthHeader}>
					{currentMonth} {currentYear}
				</h5>
				<button
					onClick={() => {
						viewNextMonth();
						setSelected([]);
					}}
					type="button"
					className={styles.calendarControlButton}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						aria-hidden="true"
					>
						<path d="M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1L16 12z" />
					</svg>
				</button>
			</div>
			<div className={styles.calendarHeader}>
				{weekDays.map((day, i) => (
					<div key={i} className={styles.calendarHeaderDay}>
						{day.label}
					</div>
				))}
			</div>
			{availabilityLoading && <CalendarSkeleton />}
			{calendarWithAvailability &&
				!availabilityLoading &&
				calendarWithAvailability.map((month, i) => (
					<div key={i}>
						{month.map((week, j) => (
							<div
								className={styles.calendarRow}
								key={`week-${j}`}
							>
								{week.map((day, k) => {
									const d = new Date(day.date);
									const dateKey = day.date
										? day.date.split('T')[0]
										: '';

									return (
										<CalendarDay
											key={`day-${k}`}
											day={day}
											date={d}
											notices={dayNotices[dateKey] || []}
											isSelected={isSelected(d)}
											isInCurrentMonth={
												d.getMonth() ===
												viewing.getMonth()
											}
											inRange={inRange}
											onSelect={() => select(d, true)}
										/>
									);
								})}
							</div>
						))}
					</div>
				))}
		</div>
	);
}

function CalendarSkeleton() {
	return (
		<div>
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className={styles.calendarRow}>
					{Array.from({ length: 7 }).map((_, j) => (
						<button
							key={j}
							disabled={true}
							className={styles.calendarDay}
						/>
					))}
				</div>
			))}
		</div>
	);
}
