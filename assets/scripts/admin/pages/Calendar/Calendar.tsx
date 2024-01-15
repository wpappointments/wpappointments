import { Button, ButtonGroup } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '~/utils/hooks';
import useSlideout from '~/hooks/useSlideout';
import { store } from '~/store/store';
import { Appointment } from '~/types';
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
	dayTileLabelText,
} from './Calendar.module.css';
import AppointmentDetails from '~/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/admin/components/AppointmentForm/AppoitmentForm';
import SlideOut from '~/admin/components/SlideOut/SlideOut';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';

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

	let days = [];

	for (
		let i = 2 - firstDayOfCurrentMonth;
		i < 44 - firstDayOfCurrentMonth;
		i++
	) {
		days.push({
			index: i,
			start: new Date(year, monthIndex, i),
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
				return (
					parseInt(appointment.timestamp) >=
						day.start.getTime() / 1000 &&
					parseInt(appointment.timestamp) <= day.end.getTime() / 1000
				);
			}),
		};
	});
}

export default function Calendar() {
	const { openSlideOut, closeCurrentSlideOut } = useSlideout();
	const appointments = useSelect(() => {
		return select(store).getAppointments({
			posts_per_page: 100,
		});
	}, []);

	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth());
	const currentMonth = applyAppointmentsToCalendar(
		getCalendarMonth(month, year),
		appointments
	);

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
			return previousMonthDay + ' ' + dayTileContent;
		}

		if (day.isNextMonth) {
			return nextMonthDay + ' ' + dayTileContent;
		}

		if (day.isToday) {
			return isToday + ' ' + dayTileContent;
		}

		return dayTileContent;
	};

	const dayLabel = (day: number) => {
		return new Date(year, month, day).getDate();
	};

	const calendarActions = applyFilters<React.JSX.Element[]>(
		'calendar.actions',
		[
			<div className={pagination}>
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
					<Button
						variant="primary"
						onClick={() => {
							openSlideOut({ id: 'add-appointment' });
						}}
					>
						{__('Create New Appointment', 'wpappointments')}
					</Button>
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
					{currentMonth.map((day) => (
						<div key={day.index} className={dayTile}>
							<div className={dayClasses(day)}>
								<div className={dayTileLabel}>
									<div className={dayTileLabelText}>
										{dayLabel(day.index)}
									</div>
								</div>
								<div className={events}>
									{day.appointments.map((appointment) => (
										<div
											key={appointment.id}
											className={event}
											onClick={() => {
												openSlideOut({
													id: 'view-appointment',
												});
											}}
										>
											{appointment.title || 'Untitled'}
										</div>
									))}
									<Button
										onClick={() => {
											openSlideOut({
												id: 'add-appointment',
												data: day,
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
			<SlideOut title={__('Appointment')} id="view-appointment">
				<AppointmentDetails />
			</SlideOut>
			<SlideOut title={__('Edit Appointment')} id="edit-appointment">
				<AppointmentForm
					mode="edit"
					onSubmitComplete={closeCurrentSlideOut}
				/>
			</SlideOut>
			<SlideOut title={__('Create Appointment')} id="add-appointment">
				<AppointmentForm
					mode="create"
					onSubmitComplete={closeCurrentSlideOut}
				/>
			</SlideOut>
		</LayoutDefault>
	);
}
