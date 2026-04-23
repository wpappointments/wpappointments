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

	const [focusable, setFocusable] = useState(startOfDay(initialViewing));
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

	// Compute effective range (committed or hover preview).
	const getEffectiveRange = (): {
		start: Date | null;
		end: Date | null;
	} => {
		if (startDate && endDate) {
			return { start: startDate, end: endDate };
		}

		if (startDate && !endDate && hoveredDay) {
			if (isBefore(hoveredDay, startDate)) {
				return { start: hoveredDay, end: startDate };
			}
			return { start: startDate, end: hoveredDay };
		}

		return { start: startDate, end: null };
	};

	const effectiveRange = getEffectiveRange();

	const isInRange = (day: Date): boolean => {
		if (!effectiveRange.start || !effectiveRange.end) return false;
		const d = startOfDay(day);

		return (
			(isAfter(d, effectiveRange.start) ||
				isSameDay(d, effectiveRange.start)) &&
			(isBefore(d, effectiveRange.end) ||
				isSameDay(d, effectiveRange.end))
		);
	};

	const isRangeStart = (day: Date): boolean =>
		!!effectiveRange.start && isSameDay(day, effectiveRange.start);

	const isRangeEnd = (day: Date): boolean =>
		!!effectiveRange.end && isSameDay(day, effectiveRange.end);

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
								isStart={isRangeStart(day)}
								isEnd={isRangeEnd(day)}
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

	const isSingle = isStart && isEnd;
	const wrapperClassNames = [
		styles.dayWrapper,
		isInRange && !isStart && !isEnd && styles.dayWrapperInRange,
		isStart && !isSingle && styles.dayWrapperRangeStart,
		isEnd && !isSingle && styles.dayWrapperRangeEnd,
		isSingle && styles.dayWrapperSingleDay,
	]
		.filter(Boolean)
		.join(' ');

	const buttonClassNames = [
		styles.dayButton,
		(isStart || isEnd) && styles.dayButtonSelected,
		isInRange && !isStart && !isEnd && styles.dayButtonInRange,
		isToday && !isStart && !isEnd && !isInRange && styles.dayButtonToday,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<span className={wrapperClassNames}>
			<button
				ref={ref}
				type="button"
				className={buttonClassNames}
				disabled={isInvalid}
				tabIndex={isFocusable ? 0 : -1}
				aria-label={dateI18n('F j, Y', day, -day.getTimezoneOffset())}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
				onKeyDown={onKeyDown}
			>
				{dateI18n('j', day, -day.getTimezoneOffset())}
			</button>
		</span>
	);
}
