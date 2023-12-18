import { Button, ButtonGroup } from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import { applyFilters } from '~/utils/hooks';
import {
	header,
	calendar,
	day,
	dayTile,
	dayTileLabel,
	previousMonthDay,
	nextMonthDay,
	event,
	events,
	isToday,
	dayTileContent,
	calendarContainer,
	pagination,
	actions,
	topBar,
} from './Calendar.module.css';

function getDaysInMonth(month: number, year: number) {
	return new Date(year, month, 0).getDate();
}

function getWeekDayNumber(day: number) {
	if (day === 0) {
		return 7;
	}

	return day;
}

function getMonthName(month: number) {
	const months = [
		__('January', 'wpappointments'),
		__('February', 'wpappointments'),
		__('March', 'wpappointments'),
		__('April', 'wpappointments'),
		__('May', 'wpappointments'),
		__('June', 'wpappointments'),
		__('July', 'wpappointments'),
		__('August', 'wpappointments'),
		__('September', 'wpappointments'),
		__('October', 'wpappointments'),
		__('November', 'wpappointments'),
		__('Decemeber', 'wpappointments'),
	];

	return months[month];
}

function getTodayDayInMonth() {
	return new Date().getDate();
}

function isCurrentMonth(date: Date) {
	return date.getMonth() === new Date().getMonth();
}

function isCurrentYear(date: Date) {
	return date.getFullYear() === new Date().getFullYear();
}

export default function Calendar() {
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth());

	const days = [...Array(42)];
	const daysOfWeek = [
		__('Mon', 'wpappointments'),
		__('Tue', 'wpappointments'),
		__('Wed', 'wpappointments'),
		__('Thu', 'wpappointments'),
		__('Fri', 'wpappointments'),
		__('Sat', 'wpappointments'),
		__('Sun', 'wpappointments'),
	];
	const dayToday = new Date(year, month, 1).getDay();
	const weekDay = getWeekDayNumber(dayToday);

	const switchToPreviousMonth = () => {
		setMonth((current) => {
			if (month === 0) {
				setYear(year - 1);
				return 11;
			}

			return current - 1;
		});
	};

	const switchToNextMonth = () => {
		setMonth((current) => {
			if (month === 11) {
				setYear(year + 1);
				return 0;
			}

			return current + 1;
		});
	};

	const switchToToday = () => {
		setMonth(new Date().getMonth());
		setYear(new Date().getFullYear());
	};

	const dayClasses = (day: number) => {
		if (day - weekDay + 2 <= 0) {
			return previousMonthDay + ' ' + dayTileContent;
		}

		if (day - weekDay + 2 > getDaysInMonth(month + 1, year)) {
			return nextMonthDay + ' ' + dayTileContent;
		}

		const today = new Date(year, month, day - weekDay + 2);

		if (
			day - weekDay + 2 === getTodayDayInMonth() &&
			isCurrentMonth(today) &&
			isCurrentYear(today)
		) {
			return isToday + ' ' + dayTileContent;
		}

		return dayTileContent;
	};

	const dayLabel = (day: number) => {
		return new Date(year, month, day - weekDay + 2).getDate();
	};

	const calendarActions = applyFilters<React.JSX.Element[]>(
		'calendar.actions',
		[
			<div className={pagination}>
				<Button
					size="small"
					variant="secondary"
					onClick={switchToPreviousMonth}
				>
					&lsaquo;
				</Button>
				<Button
					size="small"
					variant="secondary"
					onClick={switchToToday}
				>
					{__('today', 'wpappointments')}
				</Button>
				<Button
					size="small"
					variant="secondary"
					onClick={switchToNextMonth}
				>
					&rsaquo;
				</Button>
			</div>,
			<Button variant="primary">
				{__('Create new appointment', 'wpappointments')}
			</Button>,
		]
	);

	return (
		<LayoutDefault title="Calendar">
			<h1>
				<strong>{getMonthName(month)}</strong> {year}
			</h1>
			<div className={topBar}>
				<ButtonGroup>
					<Button variant="secondary" size="compact">
						{__('Day', 'wpappointments')}
					</Button>
					<Button variant="secondary" size="compact">
						{__('Week', 'wpappointments')}
					</Button>
					<Button variant="primary" size="compact">
						{__('Month', 'wpappointments')}
					</Button>
				</ButtonGroup>
				<div className={actions}>
					{calendarActions.map((action, i) => (
						<Fragment key={i}>{action}</Fragment>
					))}
				</div>
			</div>
			<div className={calendarContainer}>
				<div className={header}>
					{daysOfWeek.map((dayName) => (
						<div key={dayName} className={day}>
							{dayName}
						</div>
					))}
				</div>
				<div className={calendar}>
					{days.map((_, i) => (
						<div key={i} className={dayTile}>
							<div className={dayClasses(i)}>
								<div className={dayTileLabel}>
									{dayLabel(i)}
								</div>
								<div className={events}>
									<div className={event}>Hello 1</div>
									<div className={event}>Hello 2</div>
									<div className={event}>Hello 2</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</LayoutDefault>
	);
}
