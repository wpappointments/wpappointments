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
		weekDays,
		availabilityLoading,
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
					{weekDays.map((day, i) => (
						<div key={i} className={styles.calendarHeaderDay}>
							{day.label}
						</div>
					))}
				</div>
				{availabilityLoading && (
					<div>
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className={styles.calendarRow}>
								{Array.from({ length: 7 }).map((_, j) => (
									<button
										key={j}
										disabled={true}
										className={styles.calendarDay}
									></button>
								))}
							</div>
						))}
					</div>
				)}
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
										const totalSlots = day.totalSlots || 0;
										const totalAvailable =
											day.totalAvailable || 0;
										const percentage =
											(totalAvailable / totalSlots) * 100;

										let threshold:
											| 'High'
											| 'Medium'
											| 'Low'
											| 'Limited' = 'High';

										if (percentage < 50) {
											threshold = 'Medium';
										}

										if (percentage < 30) {
											threshold = 'Low';
										}

										if (
											percentage < 15 ||
											totalAvailable === 1
										) {
											threshold = 'Limited';
										}

										return (
											<button
												key={`day-${k}`}
												onClick={() => {
													if (!day.available) {
														return;
													}

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
													[styles[
														`calendarDayThreshold${threshold}`
													]]: true,
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
														>
															<span
																style={{
																	width: `${percentage}%`,
																}}
															></span>
														</span>
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
					<div
						className={cn({
							[styles.daySlots]: true,
							[styles.center]: alignment === 'Center',
							[styles.right]: alignment === 'Right',
						})}
					>
						{dayAvailability.map((slot, i) => (
							<button
								key={i}
								onClick={() => {
									if (!slot.available) {
										return;
									}

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
									[styles.daySlotSelected]:
										datetime &&
										new Date(
											slot.timestamp
										).toISOString() === datetime,
								})}
								data-time={slot.time}
							></button>
						))}
					</div>
					{datetime && (
						<div>
							<span>Selected time:</span>{' '}
							<strong>
								{format(new Date(datetime), 'LLLL do, HH:mm')}
							</strong>
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
