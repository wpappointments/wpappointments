import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { addDays, addYears, format } from 'date-fns';
import cn from '~/backend/utils/cn';
import styles from './BookingFlowCalendar.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowCalendar() {
	const {
		lilius,
		form,
		calendarWithAvailability,
		dayAvailability,
		attributes,
	} = useBookingFlowContext();

	const {
		selected,
		inRange,
		isSelected,
		select,
		viewing,
		viewNextMonth,
		viewPreviousMonth,
	} = lilius;

	const {
		setValue,
		clearErrors,
		register,
		watch,
		formState: { errors },
	} = form;

	const { alignment } = attributes;

	const datetime = watch('datetime');
	const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const currentMonth = format(viewing, 'LLLL');
	const currentYear = viewing.getFullYear();

	return (
		<>
			<div className={styles.calendar}>
				<div className={styles.calendarControls}>
					<button
						onClick={viewPreviousMonth}
						type="button"
						disabled={
							viewing.getMonth() === new Date().getMonth() &&
							viewing.getFullYear() === new Date().getFullYear()
						}
						className={styles.calendarControlButton}
					>
						<Icon icon={chevronLeft} />
					</button>
					<h5 className={styles.calendarMonthHeader}>
						{currentMonth} {currentYear}
					</h5>
					<button
						onClick={viewNextMonth}
						type="button"
						className={styles.calendarControlButton}
					>
						<Icon icon={chevronRight} />
					</button>
				</div>
				<div className={styles.calendarHeader}>
					{week.map((day, i) => (
						<div key={i} className={styles.calendarHeaderDay}>
							{day}
						</div>
					))}
				</div>
				{calendarWithAvailability &&
					calendarWithAvailability.map((month, i) => (
						<div key={i}>
							{month.map((week, j) => (
								<div
									className={styles.calendarRow}
									key={`week-${j}`}
								>
									{week.map((day, k) => {
										const d = new Date(day.date);

										return (
											<button
												key={`day-${k}`}
												onClick={() => {
													select(d, true);
												}}
												className={cn({
													[styles.calendarDay]: true,
													[styles.calendarDaySelected]:
														isSelected(d),
													[styles.calendarDayInCurrentMonth]:
														d.getMonth() ===
														viewing.getMonth(),
													[styles.calendarDayUnavailable]:
														!day.available,
												})}
												type="button"
												disabled={
													!inRange(
														d,
														addDays(new Date(), -1),
														addYears(
															new Date(),
															500
														)
													) || !day.available
												}
											>
												{d.getDate()}
												{inRange(
													d,
													addDays(new Date(), -1),
													addYears(new Date(), 500)
												) &&
													day.available && (
														<span
															className={
																styles.calendarDayAvailability
															}
														></span>
													)}
											</button>
										);
									})}
								</div>
							))}
						</div>
					))}
			</div>
			{selected && selected[0] && dayAvailability && (
				<>
					<h5 className={styles.timeSlotHeader}>
						{__('Select a time slot for', 'wpappointments')}{' '}
						{format(selected[0], 'LLLL do')}
					</h5>
					<div className={cn({
						[styles.daySlots]: true,
						[styles.center]: alignment === 'Center'
					})}>
						{dayAvailability.map((slot, i) => (
							<button
								key={i}
								onClick={() => {
									setValue(
										'datetime',
										new Date(slot.timestamp).toISOString()
									);
									clearErrors('datetime');
								}}
								type="button"
								className={cn({
									[styles.daySlot]: true,
									[styles.daySlotAvailable]: slot.available,
								})}
								data-time={slot.time}
							></button>
						))}
					</div>
					{datetime && (
						<div>
							<strong>Selected time:</strong>{' '}
							<span>
								{format(new Date(datetime), 'LLLL do, HH:mm')}
							</span>
						</div>
					)}
				</>
			)}
			<div>
				<input
					type="hidden"
					{...register('datetime', {
						required: true,
					})}
				/>
				{errors.datetime && (
					<p className={styles.error}>
						{__('Please select a date and time', 'wpappointments')}
					</p>
				)}
			</div>
		</>
	);
}
