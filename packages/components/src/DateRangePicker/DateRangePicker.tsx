/**
 * DateRangePicker — forked from MultiDatePicker
 * with range selection (click start, click end, highlight range).
 */
import type { KeyboardEventHandler } from 'react';
import { Button } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { useState, useRef, useEffect } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { arrowLeft, arrowRight } from '@wordpress/icons';
import {
	isSameDay,
	isAfter,
	isBefore,
	subMonths,
	addMonths,
	startOfDay,
	isEqual,
	addDays,
	subWeeks,
	addWeeks,
	isSameMonth,
	startOfWeek,
	endOfWeek,
} from 'date-fns';
import { useLilius } from 'use-lilius';
import styles from './DateRangePicker.module.css';

type DateRangePickerProps = {
	startDate: Date | null;
	endDate: Date | null;
	onChange: (start: Date | null, end: Date | null) => void;
	isInvalidDate?: (date: Date) => boolean;
	startOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export default function DateRangePicker({
	startDate,
	endDate,
	onChange,
	isInvalidDate,
	startOfWeek: weekStartsOn = 0,
}: DateRangePickerProps) {
	const initialViewing = startDate || new Date();

	const { calendar, viewing, setViewing, viewPreviousMonth, viewNextMonth } =
		useLilius({
			selected: [],
			viewing: startOfDay(initialViewing),
			weekStartsOn,
		});

	const [focusable, setFocusable] = useState(startOfDay(new Date()));
	const [isFocusWithinCalendar, setIsFocusWithinCalendar] = useState(false);
	const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

	const handleDayClick = (day: Date) => {
		const normalized = startOfDay(day);

		if (!startDate || (startDate && endDate)) {
			// Start a new range.
			onChange(normalized, null);
		} else {
			// Complete the range.
			if (isBefore(normalized, startDate)) {
				onChange(normalized, startDate);
			} else {
				onChange(startDate, normalized);
			}
		}
	};

	const isInRange = (day: Date): boolean => {
		const d = startOfDay(day);

		if (startDate && endDate) {
			return (
				(isAfter(d, startDate) || isSameDay(d, startDate)) &&
				(isBefore(d, endDate) || isSameDay(d, endDate))
			);
		}

		// Preview range while hovering.
		if (startDate && !endDate && hoveredDay) {
			const rangeStart = isBefore(hoveredDay, startDate)
				? hoveredDay
				: startDate;
			const rangeEnd = isAfter(hoveredDay, startDate)
				? hoveredDay
				: startDate;

			return (
				(isAfter(d, rangeStart) || isSameDay(d, rangeStart)) &&
				(isBefore(d, rangeEnd) || isSameDay(d, rangeEnd))
			);
		}

		return false;
	};

	const isStart = (day: Date): boolean =>
		!!startDate && isSameDay(day, startDate);

	const isEnd = (day: Date): boolean => !!endDate && isSameDay(day, endDate);

	return (
		<div
			className={styles.wrapper}
			role="application"
			aria-label={__('Calendar', 'wpappointments')}
		>
			<div className={styles.navigator}>
				<Button
					icon={isRTL() ? arrowRight : arrowLeft}
					variant="tertiary"
					aria-label={__('View previous month', 'wpappointments')}
					onClick={() => {
						viewPreviousMonth();
						setFocusable(subMonths(focusable, 1));
					}}
				/>
				<h3 className={styles.navigatorHeading}>
					<strong>
						{dateI18n('F', viewing, -viewing.getTimezoneOffset())}
					</strong>{' '}
					{dateI18n('Y', viewing, -viewing.getTimezoneOffset())}
				</h3>
				<Button
					icon={isRTL() ? arrowLeft : arrowRight}
					variant="tertiary"
					aria-label={__('View next month', 'wpappointments')}
					onClick={() => {
						viewNextMonth();
						setFocusable(addMonths(focusable, 1));
					}}
				/>
			</div>
			<div
				className={styles.calendar}
				onFocus={() => setIsFocusWithinCalendar(true)}
				onBlur={() => setIsFocusWithinCalendar(false)}
				onMouseLeave={() => setHoveredDay(null)}
			>
				{calendar[0][0].map((day) => (
					<div key={day.toString()} className={styles.dayOfWeek}>
						{dateI18n('D', day, -day.getTimezoneOffset())}
					</div>
				))}
				{calendar[0].map((week) =>
					week.map((day) => {
						if (!isSameMonth(day, viewing)) {
							return <span key={day.toString()} />;
						}
						return (
							<DayCell
								key={day.toString()}
								day={day}
								isStart={isStart(day)}
								isEnd={isEnd(day)}
								isInRange={isInRange(day)}
								isFocusable={isEqual(day, focusable)}
								isFocusAllowed={isFocusWithinCalendar}
								isToday={isSameDay(day, new Date())}
								isInvalid={
									isInvalidDate ? isInvalidDate(day) : false
								}
								onClick={() => {
									handleDayClick(day);
									setFocusable(day);
								}}
								onMouseEnter={() =>
									setHoveredDay(startOfDay(day))
								}
								onKeyDown={(event) => {
									let nextFocusable;
									if (event.key === 'ArrowLeft') {
										nextFocusable = addDays(
											day,
											isRTL() ? 1 : -1
										);
									}
									if (event.key === 'ArrowRight') {
										nextFocusable = addDays(
											day,
											isRTL() ? -1 : 1
										);
									}
									if (event.key === 'ArrowUp') {
										nextFocusable = subWeeks(day, 1);
									}
									if (event.key === 'ArrowDown') {
										nextFocusable = addWeeks(day, 1);
									}
									if (event.key === 'PageUp') {
										nextFocusable = subMonths(day, 1);
									}
									if (event.key === 'PageDown') {
										nextFocusable = addMonths(day, 1);
									}
									if (event.key === 'Home') {
										nextFocusable = startOfWeek(day);
									}
									if (event.key === 'End') {
										nextFocusable = startOfDay(
											endOfWeek(day)
										);
									}
									if (nextFocusable) {
										event.preventDefault();
										setFocusable(nextFocusable);
										if (
											!isSameMonth(nextFocusable, viewing)
										) {
											setViewing(nextFocusable);
										}
									}
								}}
							/>
						);
					})
				)}
			</div>
		</div>
	);
}

type DayCellProps = {
	day: Date;
	isStart: boolean;
	isEnd: boolean;
	isInRange: boolean;
	isFocusable: boolean;
	isFocusAllowed: boolean;
	isToday: boolean;
	isInvalid: boolean;
	onClick: () => void;
	onMouseEnter: () => void;
	onKeyDown: KeyboardEventHandler;
};

function DayCell({
	day,
	isStart,
	isEnd,
	isInRange,
	isFocusable,
	isFocusAllowed,
	isToday,
	isInvalid,
	onClick,
	onMouseEnter,
	onKeyDown,
}: DayCellProps) {
	const ref = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (ref.current && isFocusable && isFocusAllowed) {
			ref.current.focus();
		}
	}, [isFocusable]);

	const classNames = [
		styles.dayButton,
		(isStart || isEnd) && styles.dayButtonSelected,
		isInRange && !isStart && !isEnd && styles.dayButtonInRange,
		isToday && !isStart && !isEnd && !isInRange && styles.dayButtonToday,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<button
			ref={ref}
			type="button"
			className={classNames}
			disabled={isInvalid}
			tabIndex={isFocusable ? 0 : -1}
			aria-label={dateI18n('F j, Y', day, -day.getTimezoneOffset())}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onKeyDown={onKeyDown}
		>
			{dateI18n('j', day, -day.getTimezoneOffset())}
		</button>
	);
}
