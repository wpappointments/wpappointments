import { useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { format } from 'date-fns';
import styles from './BookingFlowCalendar.module.css';
import CalendarDay from './CalendarDay';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';
import type { DayCalendar } from '~/frontend/frontend';

export default function CalendarGrid() {
	const {
		lilius,
		calendarWithAvailability,
		dayNotices,
		weekDays,
		availabilityLoading,
	} = useBookingFlowContext();

	const {
		calendar,
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

	const hasAvailability = calendarWithAvailability.length > 0;
	const pendingAutoSelect = useRef(false);

	// Auto-select the first available day after month navigation.
	useEffect(() => {
		if (
			!pendingAutoSelect.current ||
			availabilityLoading ||
			!hasAvailability
		) {
			return;
		}
		pendingAutoSelect.current = false;

		for (const month of calendarWithAvailability) {
			for (const week of month) {
				for (const day of week) {
					if (day.available) {
						const d = new Date(day.date);
						if (
							d.getMonth() === viewing.getMonth() &&
							d.getFullYear() === viewing.getFullYear()
						) {
							setSelected([d]);
							return;
						}
					}
				}
			}
		}
	}, [
		availabilityLoading,
		calendarWithAvailability,
		hasAvailability,
		viewing,
		setSelected,
	]);

	return (
		<div className={styles.calendar}>
			<div className={styles.calendarControls}>
				<button
					onClick={() => {
						pendingAutoSelect.current = true;
						viewPreviousMonth();
						setSelected([]);
					}}
					type="button"
					aria-label={__('Previous month', 'wpappointments')}
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
						pendingAutoSelect.current = true;
						viewNextMonth();
						setSelected([]);
					}}
					type="button"
					aria-label={__('Next month', 'wpappointments')}
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
			{!availabilityLoading &&
				hasAvailability &&
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
			{!availabilityLoading &&
				!hasAvailability &&
				calendar[0]?.map((week, j) => (
					<div className={styles.calendarRow} key={`week-${j}`}>
						{week.map((date, k) => {
							const emptyDay: DayCalendar = {
								date: date.toISOString(),
								day: [],
								available: false,
								totalAvailable: 0,
								totalSlots: 0,
							};

							return (
								<CalendarDay
									key={`day-${k}`}
									day={emptyDay}
									date={date}
									notices={[]}
									isSelected={isSelected(date)}
									isInCurrentMonth={
										date.getMonth() === viewing.getMonth()
									}
									inRange={inRange}
									onSelect={() => select(date, true)}
								/>
							);
						})}
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
