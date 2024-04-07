import { Button, ButtonGroup } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import cn from '~/backend/utils/cn';
import { applyFilters } from '~/backend/utils/hooks';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import styles from './Calendar.module.css';
import AppointmentDetails from '~/backend/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/backend/admin/components/AppointmentForm/AppointmentForm';
import { StateContextProvider } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';


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

function getCalendarMonth(month: number = 0, year: number = 0) {
	const monthIndex = month;
	const nextMonthIndex = month + 1;
	const firstDayOfCurrentMonthDate = new Date(year, monthIndex, 1);
	const firstDayOfCurrentMonth = firstDayOfCurrentMonthDate.getDay();
	const daysInCurrentMonth = new Date(year, nextMonthIndex, 0).getDate();
	const settings = useSelect(() => {
		return select(store).getScheduleSettings();
	}, []);

	const days = [];

	for (
		let i = 2 - firstDayOfCurrentMonth;
		i < 44 - firstDayOfCurrentMonth;
		i++
	) {
		const dayOfWeek = new Date(year, monthIndex, i)
			.toLocaleDateString('en-US', { weekday: 'long' })
			.toLowerCase();

		let startHour = 0;
		let startMinute = 0;

		// todo: fix this TS error
		if (settings[dayOfWeek]) {
			startHour = settings[dayOfWeek].slots.list[0].start.hour;
			startMinute = settings[dayOfWeek].slots.list[0].start.minute;
		}

		days.push({
			index: i,
			start: new Date(year, monthIndex, i, startHour, startMinute),
			end: new Date(
				new Date(year, monthIndex, i).setHours(23, 59, 59, 999)
			),
			isPreviousMonth: i < 1,
			isNextMonth: i > daysInCurrentMonth,
			isToday:
				i === getTodayDayInMonth() &&
				isCurrentMonth(new Date(year, monthIndex, i)) &&
				isCurrentYear(new Date(year, monthIndex, i)),
		});
	}

	return days;
}

function applyAppointmentsToCalendar(
	calendar: ReturnType<typeof getCalendarMonth>,
	appointments: Appointment[]
) {
	return calendar.map((day) => {
		return {
			...day,
			appointments: appointments.filter((appointment) => {
				const timestamp = appointment.timestamp.toString();
				const start = day.start.getTime() / 1000;
				const end = day.end.getTime() / 1000;

				return (
					parseInt(timestamp) >= start && parseInt(timestamp) <= end
				);
			}),
		};
	});
}

export default function Calendar() {
	const { openSlideOut, isSlideoutOpen } = useSlideout();
	const { appointments } = useSelect(() => {
		return select(store).getAppointments({
			posts_per_page: -1,
		});
	}, []);

	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth());
	const currentMonth = applyAppointmentsToCalendar(
		getCalendarMonth(month, year),
		appointments
	);
	const [defaultDate, setDefaultDate] = useState(new Date());
	const daysOfWeek = [
		__('Mon', 'wpappointments'),
		__('Tue', 'wpappointments'),
		__('Wed', 'wpappointments'),
		__('Thu', 'wpappointments'),
		__('Fri', 'wpappointments'),
		__('Sat', 'wpappointments'),
		__('Sun', 'wpappointments'),
	];

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

	const dayClasses = (day: ReturnType<typeof getCalendarMonth>[0]) => {
		if (day.isPreviousMonth) {
			return styles.previousMonthDay + ' ' + styles.dayTileContent;
		}

		if (day.isNextMonth) {
			return styles.nextMonthDay + ' ' + styles.dayTileContent;
		}

		if (day.isToday) {
			return styles.isToday + ' ' + styles.dayTileContent;
		}

		return styles.dayTileContent;
	};

	const dayLabel = (day: number) => {
		return new Date(year, month, day).getDate();
	};

	const calendarActions = applyFilters<React.JSX.Element[]>(
		'calendar.actions',
		[
			<div className={styles.pagination}>
				<Button variant="secondary" onClick={switchToPreviousMonth}>
					&lsaquo;
				</Button>
				<Button variant="secondary" onClick={switchToToday}>
					{__('today', 'wpappointments')}
				</Button>
				<Button variant="secondary" onClick={switchToNextMonth}>
					&rsaquo;
				</Button>
			</div>,
		]
	);

	return (
		<StateContextProvider>
			<LayoutDefault title="Calendar">
				<h1>
					<strong>{getMonthName(month)}</strong> {year}
				</h1>
				<div className={styles.topBar}>
					<ButtonGroup>
						<Button
							variant="secondary"
							size="compact"
							disabled
							className={styles.disabled}
							title={__(
								'Currently not available',
								'wpappointments'
							)}
						>
							{__('Day', 'wpappointments')}
						</Button>
						<Button
							variant="secondary"
							size="compact"
							disabled
							className={styles.disabled}
							title={__(
								'Currently not available',
								'wpappointments'
							)}
						>
							{__('Week', 'wpappointments')}
						</Button>
						<Button variant="primary" size="compact">
							{__('Month', 'wpappointments')}
						</Button>
					</ButtonGroup>
					<div className={styles.actions}>
						{calendarActions.map((action, i) => (
							<Fragment key={i}>{action}</Fragment>
						))}
						<Button
							variant="primary"
							onClick={() => {
								openSlideOut({
									id: 'appointment',
									data: {
										mode: 'create',
									},
								});
							}}
						>
							{__('Create New Appointment', 'wpappointments')}
						</Button>
					</div>
				</div>
				<div className={styles.calendarContainer}>
					<div className={styles.header}>
						{daysOfWeek.map((dayName) => (
							<div key={dayName} className={styles.day}>
								{dayName}
							</div>
						))}
					</div>
					<div className={styles.calendar}>
						{currentMonth.map((day) => (
							<div key={day.index} className={styles.dayTile}>
								<div className={dayClasses(day)}>
									<div className={styles.dayTileLabel}>
										<div
											className={styles.dayTileLabelText}
										>
											{dayLabel(day.index)}
										</div>
									</div>
									<div className={styles.events}>
										{day.appointments.map((appointment) => (
											<div
												key={appointment.id}
												className={cn({
													[styles.event]: true,
													[styles.status]: true,
													[styles[
														appointment.status
													]]: true,
												})}
												onClick={() => {
													openSlideOut({
														id: 'view-appointment',
														data: {
															selectedAppointment:
																appointment.id,
														},
													});
												}}
											>
												{appointment.service}
											</div>
										))}
										<Button
											onClick={() => {
												setDefaultDate(day.start);
												openSlideOut({
													id: 'appointment',
													data: {
														mode: 'create',
													},
												});
											}}
										>
											+ {__('Add', 'wpappointments')}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{isSlideoutOpen('view-appointment') && <AppointmentDetails />}
				{isSlideoutOpen('appointment') && <AppointmentForm defaultDate={defaultDate}/>}
			</LayoutDefault>
		</StateContextProvider>
	);
}
