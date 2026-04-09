/**
 * MultiDatePicker — forked from @wordpress/components DatePicker
 * with minimal changes to support multi-day selection (toggle).
 */
import type { KeyboardEventHandler } from 'react';
import { Button } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { useState, useRef, useEffect } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { arrowLeft, arrowRight } from '@wordpress/icons';
import {
	isSameDay,
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
import styles from './MultiDatePicker.module.css';

type MultiDatePickerProps = {
	selectedDates: Date[];
	onChange: (dates: Date[]) => void;
	isInvalidDate?: (date: Date) => boolean;
	startOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export default function MultiDatePicker({
	selectedDates,
	onChange,
	isInvalidDate,
	startOfWeek: weekStartsOn = 0,
}: MultiDatePickerProps) {
	const { calendar, viewing, setViewing, viewPreviousMonth, viewNextMonth } =
		useLilius({
			selected: selectedDates.map(startOfDay),
			viewing: selectedDates[0]
				? startOfDay(selectedDates[0])
				: startOfDay(new Date()),
			weekStartsOn,
		});

	const [focusable, setFocusable] = useState(startOfDay(new Date()));
	const [isFocusWithinCalendar, setIsFocusWithinCalendar] = useState(false);

	const isSelected = (day: Date) =>
		selectedDates.some((d) => isSameDay(d, day));

	const toggleDay = (day: Date) => {
		const normalized = startOfDay(day);
		if (isSelected(normalized)) {
			onChange(selectedDates.filter((d) => !isSameDay(d, normalized)));
		} else {
			onChange([...selectedDates, normalized]);
		}
	};

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
								isSelected={isSelected(day)}
								isFocusable={isEqual(day, focusable)}
								isFocusAllowed={isFocusWithinCalendar}
								isToday={isSameDay(day, new Date())}
								isInvalid={
									isInvalidDate ? isInvalidDate(day) : false
								}
								onClick={() => {
									toggleDay(day);
									setFocusable(day);
								}}
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
										if (!(isInvalidDate && isInvalidDate(nextFocusable))) {
											setFocusable(nextFocusable);
											if (!isSameMonth(nextFocusable, viewing)) {
												setViewing(nextFocusable);
											}
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
	isSelected: boolean;
	isFocusable: boolean;
	isFocusAllowed: boolean;
	isToday: boolean;
	isInvalid: boolean;
	onClick: () => void;
	onKeyDown: KeyboardEventHandler;
};

function DayCell({
	day,
	isSelected,
	isFocusable,
	isFocusAllowed,
	isToday,
	isInvalid,
	onClick,
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
		isSelected && styles.dayButtonSelected,
		isToday && !isSelected && styles.dayButtonToday,
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
			onKeyDown={onKeyDown}
		>
			{dateI18n('j', day, -day.getTimezoneOffset())}
		</button>
	);
}
