import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonGroup, HeaderActionsFill } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import cn from 'obj-str';
import { applyFilters } from '~/backend/utils/hooks';
import type { Schedule } from '~/backend/store/schedules/schedules.types';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import styles from './Calendar.module.css';
import AppointmentDetails from '~/backend/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/backend/admin/components/AppointmentForm/AppointmentForm';
import { StateContextProvider } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';

function getMonthName(month: number) {
	const months = [
		__('January', 'appointments-booking'),
		__('February', 'appointments-booking'),
		__('March', 'appointments-booking'),
		__('April', 'appointments-booking'),
		__('May', 'appointments-booking'),
		__('June', 'appointments-booking'),
		__('July', 'appointments-booking'),
		__('August', 'appointments-booking'),
		__('September', 'appointments-booking'),
		__('October', 'appointments-booking'),
		__('November', 'appointments-booking'),
		__('December', 'appointments-booking'),
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

function getCalendarMonth(
	month: number = 0,
	year: number = 0,
	defaultSchedule?: Schedule
) {
	const monthIndex = month;
	const nextMonthIndex = month + 1;
	const firstDayOfCurrentMonthDate = new Date(year, monthIndex, 1);
	const firstDayOfCurrentMonth = firstDayOfCurrentMonthDate.getDay();
	const daysInCurrentMonth = new Date(year, nextMonthIndex, 0).getDate();

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

		const dayData = defaultSchedule?.days?.[dayOfWeek];
		if (dayData?.enabled && dayData?.slots?.list?.[0]) {
			startHour = parseInt(dayData.slots.list[0].start.hour || '0', 10);
			startMinute = parseInt(
				dayData.slots.list[0].start.minute || '0',
				10
			);
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
	const { appointments } = useSelect(
		(select) =>
			select(store).getAppointments({
				posts_per_page: -1,
			}),
		[]
	);
	const defaultSchedule = useSelect(
		(select) => select(store).getDefaultSchedule(),
		[]
	);

	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth());
	const currentMonth = applyAppointmentsToCalendar(
		getCalendarMonth(month, year, defaultSchedule),
		appointments
	);
	const [defaultDate, setDefaultDate] = useState(new Date());
	const daysOfWeek = [
		__('Mon', 'appointments-booking'),
		__('Tue', 'appointments-booking'),
		__('Wed', 'appointments-booking'),
		__('Thu', 'appointments-booking'),
		__('Fri', 'appointments-booking'),
		__('Sat', 'appointments-booking'),
		__('Sun', 'appointments-booking'),
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
				<Button
					variant="secondary"
					size="compact"
					onClick={switchToPreviousMonth}
					aria-label={__('Previous month', 'appointments-booking')}
				>
					&lsaquo;
				</Button>
				<Button
					variant="secondary"
					size="compact"
					onClick={switchToToday}
				>
					{__('today', 'appointments-booking')}
				</Button>
				<Button
					variant="secondary"
					size="compact"
					onClick={switchToNextMonth}
					aria-label={__('Next month', 'appointments-booking')}
				>
					&rsaquo;
				</Button>
			</div>,
		]
	);

	return (
		<StateContextProvider>
			<LayoutDefault
				title={__('Calendar', 'appointments-booking')}
				fullWidth
			>
				<HeaderActionsFill>
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
						{__('Create New Appointment', 'appointments-booking')}
					</Button>
				</HeaderActionsFill>
				<div className={styles.topBar}>
					<h1 className={styles.monthYear}>
						<strong>{getMonthName(month)}</strong> {year}
					</h1>
					<div className={styles.actions}>
						{calendarActions.map((action, i) => (
							<Fragment key={i}>{action}</Fragment>
						))}
					</div>
					<ButtonGroup className={styles.viewSwitcher}>
						<Button
							variant="secondary"
							size="compact"
							disabled
							className={styles.disabled}
							title={__(
								'Currently not available',
								'appointments-booking'
							)}
						>
							{__('Day', 'appointments-booking')}
						</Button>
						<Button
							variant="secondary"
							size="compact"
							disabled
							className={styles.disabled}
							title={__(
								'Currently not available',
								'appointments-booking'
							)}
						>
							{__('Week', 'appointments-booking')}
						</Button>
						<Button variant="primary" size="compact">
							{__('Month', 'appointments-booking')}
						</Button>
					</ButtonGroup>
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
											<button
												type="button"
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
												<span className="screen-reader-text">
													{` (${appointment.status})`}
												</span>
											</button>
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
											+{' '}
											{__('Add', 'appointments-booking')}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{isSlideoutOpen('view-appointment') && <AppointmentDetails />}
				{isSlideoutOpen('appointment') && (
					<AppointmentForm defaultDate={defaultDate} />
				)}
			</LayoutDefault>
		</StateContextProvider>
	);
}
